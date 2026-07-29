import bcrypt from "bcryptjs";

import PendingUser from "../../models/PendingUser.js";

import generateOTP from "../../utils/generateOtp.js";
import { sendOTP } from "../../services/emailService.js";
import AppError from "../../utils/appError.js";

export const resendOTP = async (req, res, next) => {
  try {
    let { email } = req.body;
    // Required field
    if (!email) {
      return next(new AppError("Email is required.", 400));
    }
    // Normalize email
    email = email.trim().toLowerCase();
    // Find pending signup
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return next(new AppError("Signup session expired. Please register again.",404));
    }
    // Cooldown check
    const seconds = (Date.now() - pendingUser.lastOTPSent.getTime()) / 1000;
    if (seconds < 60) {
      return next(new AppError(`Please wait ${Math.ceil(60 - seconds)} seconds before requesting another OTP.`,429));
    }
    // Generate new OTP
    const otp = generateOTP();
    // Update pending signup
    pendingUser.otp = await bcrypt.hash(otp, 10);
    pendingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    pendingUser.lastOTPSent = new Date();
    await pendingUser.save();
    // Send email
    await sendOTP(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });

  } catch (err) {
    next(err);
  }
};