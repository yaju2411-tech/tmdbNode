import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

const getUserFromToken = async (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        return user || null;
    } catch (err) {
        return null;
    }
};

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new AppError("Unauthorized", 401));
        }
        const user = await getUserFromToken(token);
        if (!user) {
            return next(new AppError("Unauthorized or user not found", 401));
        }
        req.user = user;
        next();
    } catch (err) {
        next(new AppError("Unauthorized", 401));
    }
};

export const optionalProtect = async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        const user = await getUserFromToken(token);
        if (user) {
            req.user = user;
        }
    }
    next();
};

export default protect;