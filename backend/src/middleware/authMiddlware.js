import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new AppError("Unauthorized", 401));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new AppError("User not found", 404));
        }
        req.user = user;
        next();
    } catch (err) {
        next(new AppError("Unauthorized", 401));
    }
};

export const optionalProtect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (user) {
                req.user = user;
            }
        }
    } catch (err) {
        // Silently ignore token verification failure for public endpoints
    }
    next();
};

export default protect;