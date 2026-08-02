import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../../models/User.js";
import PasswordReset from "../../models/PasswordReset.js";
import AppError from "../../utils/appError.js";

export const resetPassword = async (req, res, next) => {
  try {
    let { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return next(new AppError("Email, OTP and password are required.",400)
      );
    }
    email = email.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      return next(new AppError("Invalid email.", 400));
    }
    if (password.length < 8) {
      return next(new AppError("Password must be at least 8 characters.",400));
    }
    const user = await User.findOne({ email });
    if (!user || user.provider !== "local") {
      return next(new AppError("This account uses Google Sign-In and cannot change password.", 400));
    }
    const reset = await PasswordReset.findOne({ email });
    if (!reset) {
      return next(new AppError("Password reset session expired.",404));
    }
    if (reset.otpExpires < new Date()) {
      await PasswordReset.deleteOne({ email });
      return next(new AppError("OTP has expired.", 400));
    }
    const matched = await bcrypt.compare(otp,reset.otp);
    if (!matched) {
      return next(new AppError("Invalid OTP.", 400));
    }
    const hashedPassword = await bcrypt.hash(password,12);
    await User.findOneAndUpdate({ email },{password: hashedPassword,});
    await PasswordReset.deleteOne({ email });
    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};