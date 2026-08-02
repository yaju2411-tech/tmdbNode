import bcrypt from "bcryptjs";

import PasswordReset from "../../models/PasswordReset.js";

import generateOTP from "../../utils/generateOtp.js";
import { sendOTP } from "../../services/emailService.js";

import AppError from "../../utils/appError.js";

export const resendResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError("Email is required.", 400));
    }
    const user = await User.findOne({ email });
    if (!user || user.provider !== "local") {
      return next(new AppError("Password reset is not available for this account.", 400));
    }
    const reset = await PasswordReset.findOne({ email });
    if (!reset) {
      return next(new AppError("Password reset session expired.", 404));
    }
    const seconds = (Date.now() - reset.lastOTPSent.getTime()) / 1000;
    if (seconds < 60) {
      return next(new AppError(`Please wait ${Math.ceil(60 - seconds)} seconds.`,429));
    }
    const otp = generateOTP();
    reset.otp = await bcrypt.hash(otp, 10);
    reset.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );
    reset.lastOTPSent = new Date();
    await reset.save();
    await sendOTP(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (err) {
    next(err);
  }
};