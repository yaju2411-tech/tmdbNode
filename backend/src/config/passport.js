import "./env.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import axios from "axios";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { checkIsAdminEmail } from "../utils/adminCheck.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let avatar = {
                    url: "",
                    public_id: "",
                }
                const email = profile.emails[0].value;
                let user = await User.findOne({ email });
                const photo = profile.photos?.[0]?.value;
                if (photo) {
                    const response = await axios.get(photo, {responseType: "arraybuffer",});
                    const buffer = Buffer.from(response.data);
                    const uploaded = await uploadToCloudinary(buffer,"tmdb/avatars");
                    avatar = {
                        url: uploaded.secure_url,
                        public_id: uploaded.public_id,
                    };
                }
                const isAdmin = checkIsAdminEmail(email);
                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        provider: "google",
                        role: isAdmin ? "admin" : "user",
                        isEmailVerified: true,
                        isCaptchaVerified: true,
                        avatar,
                    });
                } else if (isAdmin && user.role !== "admin") {
                    user.role = "admin";
                    await user.save();
                }
        const token = generateToken(user._id);
        done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;