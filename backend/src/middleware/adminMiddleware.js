import AppError from "../utils/appError.js";
import { checkIsAdminEmail } from "../utils/adminCheck.js";

const adminOnly = async (req, res, next) => {
  if (req.user) {
    if (req.user.role === "admin") {
      return next();
    }
    if (checkIsAdminEmail(req.user.email)) {
      req.user.role = "admin";
      try {
        await req.user.save();
      } catch (e) {}
      return next();
    }
  }
  return next(new AppError("Access denied: Admins only", 403));
};

export default adminOnly;
