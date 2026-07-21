import AppError from "../utils/appError.js";

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return next(new AppError("Access denied: Admins only", 403));
};

export default adminOnly;
