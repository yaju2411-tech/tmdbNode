import cookieOptions from "../../utils/cookieOption.js";

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
};