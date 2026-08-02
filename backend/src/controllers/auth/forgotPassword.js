import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../../models/User.js";
import PasswordReset from "../../models/PasswordReset.js";
import generateOTP from "../../utils/generateOtp.js";
import { sendOTP } from "../../services/emailService.js";
import AppError from "../../utils/appError.js";

export const forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;
    if (!email) {
      return next(new AppError("Email is required.", 400));
    }
    email = email.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      return next(new AppError("Invalid email.", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found.", 404));
    }
    if (user.provider !== "local") {
      return next(
        new AppError("This account uses Google Sign-In. Password reset is not available for Google accounts.", 400)
      );
    }
    // Remove previous reset request
    await PasswordReset.deleteOne({ email });
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    await PasswordReset.create({
      email,
      otp: hashedOTP,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      lastOTPSent: new Date(),
    });
    await sendOTP(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (err) {
    next(err);
  }
};