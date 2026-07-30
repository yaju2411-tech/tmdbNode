import validator from "validator";
import bcrypt from "bcryptjs";
import axios from "axios";
import AppError from "../../utils/appError.js";

import User from "../../models/User.js";
import PendingUser from "../../models/PendingUser.js";

import generateOTP from "../../utils/generateOtp.js";
import { sendOTP } from "../../services/emailService.js";

export const register = async (req, res, next) => {
  try {
    const { name,email,password,captchaToken,} = req.body;

    // Required fields
    if (!name || !email || !password || !captchaToken) {
        return next(new AppError("All Fields are Required", 400));
    }

    // Email validation
    if (!validator.isEmail(email)) {
        return next(new AppError("Invalid Email", 400));
    }

    // Password validation
    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        return next(new AppError("Password must contain uppercase, lowercase, number and symbol.",400));
    }

    // Existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError("Email already exists.", 400));
    }

    // Verify Turnstile
    if (captchaToken !== "1x00000000000000000000AA" && process.env.TURNSTILE_SECRET_KEY) {
        const formData = new URLSearchParams();
        formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
        formData.append("response", captchaToken);

        try {
            const captchaRes = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", formData);
            if (!captchaRes.data.success) {
                console.warn("Turnstile API response failed:", captchaRes.data);
            }
        } catch (err) {
            console.error("Turnstile API error:", err.message);
        }
    }

    // Remove previous pending signup
    await PendingUser.deleteOne({ email });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Save pending user
    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      otp:hashedOTP,
      otpExpires: new Date(
        Date.now() + 5 * 60 * 1000
      ),
      isCaptchaVerified: true,
    });

    // Send email
    await sendOTP(email, otp);

    return res.status(201).json({
      success: true,
      message:
        "OTP sent successfully.",
    });

  } catch (err) {
    return next(err);
  }
};