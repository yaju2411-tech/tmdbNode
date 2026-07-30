import express from "express";
import {
    getAdmins, getUsers, getMoviePurchases, getStats, updateUserByAdmin, updateAdmin,
    deleteUserByAdmin, forceVerifyUser, getTickets, updateTicketStatus, deleteTicket,
    grantManualAccess, resetPayment, draftEmail, sendEmail, checkRazorpayStatus,
    updateUserSubscription, getSubscriptionAnalytics, verifyTicketUser,
    resendUserOtpFromAdmin, sendPasswordResetFromAdmin
} from "../controllers/admin/adminController.js";
import protect from "../middleware/authMiddlware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Secure all admin routes
router.use(protect);
router.use(adminOnly);

// Profile & stats management
router.get("/admins", getAdmins);
router.get("/users", getUsers);
router.get("/purchases", getMoviePurchases);
router.get("/stats", getStats);
router.get("/subscription-analytics", getSubscriptionAnalytics);
router.put("/users/:userId/subscription", updateUserSubscription);

router.post("/user/force-verify", forceVerifyUser);
router.put("/user/:id", upload.single("avatar"), updateUserByAdmin);
router.put("/profile/:id", upload.single("avatar"), updateAdmin);
router.delete("/user/:id", deleteUserByAdmin);

// Payment ticket management & verifications
router.post("/tickets/:id/grant-access", grantManualAccess);
router.post("/tickets/:id/reset-payment", resetPayment);
router.post("/tickets/:id/check-razorpay", checkRazorpayStatus);

// Account ticket resolution routes
router.post("/tickets/:id/verify-user", verifyTicketUser);
router.post("/tickets/:id/resend-otp", resendUserOtpFromAdmin);
router.post("/tickets/:id/send-password-reset", sendPasswordResetFromAdmin);

// AI Assistant & Email
router.post("/tickets/:id/draft-email", draftEmail);
router.post("/tickets/:id/send-email", sendEmail);

// General customer support ticketing & notifications
router.get("/tickets", getTickets);
router.put("/tickets/:id/status", updateTicketStatus);
router.delete("/tickets/:id", deleteTicket);

export default router;
