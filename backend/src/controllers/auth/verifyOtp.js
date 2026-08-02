import bcrypt from "bcryptjs";

import User from "../../models/User.js";
import PendingUser from "../../models/PendingUser.js";

import AppError from "../../utils/appError.js";

export const verifyOTP = async (req, res, next) => {
  try {
    let { email, otp } = req.body;

    // Required fields
    if (!email || !otp) {
      return next(
        new AppError("Email and OTP are required.", 400)
      );
    }

    // Normalize email
    email = email.trim().toLowerCase();

    // Find pending user
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return next(
        new AppError(
          "OTP expired or signup session not found.",
          404
        )
      );
    }

    // Check OTP expiration
    if (pendingUser.otpExpires < new Date()) {
      await PendingUser.deleteOne({ email });

      return next(
        new AppError("OTP has expired.", 400)
      );
    }

    // Compare OTP
    const otpMatched = await bcrypt.compare(
      otp,
      pendingUser.otp
    );

    if (!otpMatched) {
      return next(
        new AppError("Invalid OTP.", 400)
      );
    }

    // Double-check user doesn't already exist
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      await PendingUser.deleteOne({ email });

      return next(
        new AppError("User already exists.", 400)
      );
    }

    // Create verified user
    await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      provider: "local",
      role: "user",
      isEmailVerified: true,
      isCaptchaVerified: true,
    });

    // Remove pending signup
    await PendingUser.deleteOne({ email });

    return res.status(201).json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (err) {
    next(err);
  }
};