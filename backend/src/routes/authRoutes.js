import express from "express";
import passport from "passport";

import { register } from "../controllers/auth/signupController.js";
import { verifyOTP } from "../controllers/auth/verifyOtp.js";
import { resendOTP } from "../controllers/auth/resendOtp.js";
import { login } from "../controllers/auth/loginController.js";
import { forgotPassword } from "../controllers/auth/forgotPassword.js";
import { resendResetOTP } from "../controllers/auth/resendResetOtp.js";
import { verifyResetOTP } from "../controllers/auth/verifyResetOtp.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import { updateProfile } from "../controllers/auth/updateProfile.js";
import { getMe } from "../controllers/auth/getMe.js";
import { logout } from "../controllers/auth/logout.js";
import protect from "../middleware/authMiddlware.js"
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/google",passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/google/callback",passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/loginPage`,
  }),
  (req, res) => {
    const { token } = req.user;
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.CLIENT_URL}/app`);
  }
);
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/resend-reset-otp", resendResetOTP);
router.post("/reset-password", resetPassword);
router.get("/me",protect,getMe);
router.put("/update-profile",protect,upload.single("avatar"),updateProfile);
router.get("/logout",logout);

export default router;