import Purchase from "../../models/Purchase.js";
import User from "../../models/User.js";
import { sendPaymentFailedEmail } from "../../services/paymentEmailService.js";

export const getPurchases = async (req, res, next) => {
    try {
        const purchases = await Purchase.find({
            user: req.user._id,
            status: "paid",
        })
        .sort({
            createdAt: -1,
        });
        return res.json({
            success: true,
            purchases,
        });
    } catch (err) {
        next(err);
    }
};

export const checkPurchase = async (req, res, next) => {
    try {
        const user = req.user;
        const now = new Date();

        // Check if user has an active subscription that hasn't expired
        const isSubscribed = user.subscription && 
                             user.subscription.status === "active" && 
                             user.subscription.expiresAt && 
                             new Date(user.subscription.expiresAt) > now;

        if (isSubscribed) {
            return res.json({
                success: true,
                status: "success",
                isSubscribed: true,
                subscription: user.subscription
            });
        }

        const { contentId, contentType } = req.query;

        // Check individual purchases as legacy fallback
        if (contentId && contentType) {
            const purchase = await Purchase.findOne({
                user: req.user._id,
                contentId: Number(contentId),
                contentType: contentType
            }).sort({ createdAt: -1 });

            if (purchase && (purchase.status === "paid" || purchase.status === "success")) {
                return res.json({
                    success: true,
                    status: "success",
                    isSubscribed: false
                });
            }
        }

        return res.json({
            success: true,
            status: null,
            isSubscribed: false,
            subscription: user.subscription || null
        });
    } catch (err) {
        next(err);
    }
};

export const updatePurchaseStatus = async (req, res, next) => {
    try {
        const { orderId, paymentId, status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "orderId and status are required" });
        }

        // Ensure status is valid
        if (!["pending", "paid", "failed", "cancelled", "verification_failed", "gateway_failed"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const updateData = { status };
        if (paymentId) updateData.razorpayPaymentId = paymentId;

        const purchase = await Purchase.findOneAndUpdate(
            { razorpayOrderId: orderId, user: req.user._id },
            updateData,
            { new: true }
        );

        if ((status === "failed" || status === "cancelled" || status === "verification_failed") && purchase) {
            const user = await User.findById(req.user._id);
            if (user) {
                await sendPaymentFailedEmail({ user, purchase });
            }
        }

        return res.json({
            success: true,
            purchase
        });
    } catch (err) {
        next(err);
    }
};