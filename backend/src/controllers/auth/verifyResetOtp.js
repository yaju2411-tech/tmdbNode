import bcrypt from "bcryptjs";
import validator from "validator";
import PasswordReset from "../../models/PasswordReset.js";
import AppError from "../../utils/appError.js";

export const verifyResetOTP = async (req, res, next) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return next(new AppError("Email and OTP are required.", 400));
    }
    email = email.trim().toLowerCase();
    
    const reset = await PasswordReset.findOne({ email });
    if (!reset) {
      return next(new AppError("Password reset session expired.", 404));
    }
    if (reset.otpExpires < new Date()) {
      await PasswordReset.deleteOne({ email });
      return next(new AppError("OTP has expired.", 400));
    }
    const matched = await bcrypt.compare(otp, reset.otp);
    if (!matched) {
      return next(new AppError("Invalid OTP.", 400));
    }
    
    return res.status(200).json({
      success: true,
      message: "OTP is valid.",
    });
  } catch (err) {
    next(err);
  }
};
