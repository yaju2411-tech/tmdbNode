import validator from "validator";
import bcrypt from "bcryptjs";

import User from "../../models/User.js";

import AppError from "../../utils/appError.js";
import generateToken from "../../utils/generateToken.js";
import cookieOptions from "../../utils/cookieOption.js";

export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    // Required fields
    if (!email || !password) {
      return next(new AppError("Email and password are required.",400));
    }
    // Normalize email
    email = email.trim().toLowerCase();
    // Validate email
    if (!validator.isEmail(email)) {
      return next(new AppError("Invalid email.", 400));
    }
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("Invalid email or password.",401));
    }
    // Local login only
    if (user.provider !== "local") {
      return next(new AppError("Please login using Google.",400));
    }
    // Email verification
    if (!user.isEmailVerified) {
      return next(new AppError("Please verify your email.",401));
    }
    // Password check
    const matched = await bcrypt.compare(password,user.password);

    if (!matched) {
        return next(new AppError("Invalid email or password.",401));
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Cookie
    res.cookie("token", token,cookieOptions);
    // Success
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        provider: user.provider,
      },
    });

  } catch (err) {
    next(err);
  }
};