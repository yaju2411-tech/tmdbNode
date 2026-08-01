import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import razorpay from "../config/razorpay.js";

// Check and expire/verify pending payments (corresponds to Deno's expire-pending)
export const checkPendingPayments = async (req, res, next) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find pending purchases older than 1 hour
        const pendingPurchases = await Purchase.find({
            status: "pending",
            createdAt: { $lt: oneHourAgo }
        });

        const results = {
            scanned: pendingPurchases.length,
            markedPaid: 0,
            markedFailed: 0
        };

        for (const purchase of pendingPurchases) {
            if (!purchase.razorpayOrderId) {
                purchase.status = "failed";
                await purchase.save();
                results.markedFailed++;
                continue;
            }

            try {
                // Query Razorpay for payments made under this order ID
                const paymentsResponse = await razorpay.orders.fetchPayments(purchase.razorpayOrderId);
                const payments = paymentsResponse.items || [];

                if (payments.length === 0) {
                    purchase.status = "failed";
                    await purchase.save();
                    results.markedFailed++;
                    continue;
                }

                const payment = payments[0];

                if (payment.status === "captured") {
                    purchase.status = "paid";
                    purchase.razorpayPaymentId = payment.id;
                    await purchase.save();

                    // Create user notification
                    await Notification.create({
                        user: purchase.user,
                        title: "Payment Verified",
                        message: `Your payment for "${purchase.title}" was automatically verified.`,
                        type: "user"
                    });

                    results.markedPaid++;
                } else {
                    // Includes failed, authorized, and created statuses
                    purchase.status = "failed";
                    await purchase.save();
                    results.markedFailed++;
                }
            } catch (rErr) {
                console.error(`Razorpay status lookup failed for order ${purchase.razorpayOrderId}:`, rErr);
            }
        }

        return res.json({
            success: true,
            message: "Successfully synchronized pending payments with Razorpay.",
            results
        });
    } catch (err) {
        next(err);
    }
};

// Automatically expire user subscriptions whose expiresAt date has passed
export const expireSubscriptions = async (req, res, next) => {
    try {
        const now = new Date();
        const updateResult = await User.updateMany(
            {
                "subscription.status": "active",
                "subscription.expiresAt": { $lte: now }
            },
            {
                $set: { "subscription.status": "expired" }
            }
        );

        return res.json({
            success: true,
            message: `Successfully expired ${updateResult.modifiedCount || 0} subscription(s).`,
            expiredCount: updateResult.modifiedCount || 0
        });
    } catch (err) {
        next(err);
    }
};
