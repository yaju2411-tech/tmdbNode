import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

// Helper to decode valid JWT token; returns null for invalid/missing token
const getDecodedToken = (token) => {
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null; // Invalid or expired token
    }
};

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new AppError("Unauthorized", 401));
        }

        const decoded = getDecodedToken(token);
        if (!decoded) {
            return next(new AppError("Unauthorized", 401));
        }

        // Database lookup: errors here will propagate to next(err) as 500 Internal Server Error
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

export const optionalProtect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const decoded = getDecodedToken(token);
            if (decoded) {
                const user = await User.findById(decoded.id).select("-password");
                if (user) {
                    req.user = user;
                }
            }
        }
    } catch (err) {
        // Fail-open for public routes: ignore errors and proceed without req.user
    }
    next();
};

export default protect;