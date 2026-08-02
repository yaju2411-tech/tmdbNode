import AppError from "../../utils/appError.js";
import verifySignature from "../../utils/verifySignature.js";
import Purchase from "../../models/Purchase.js";
import Receipt from "../../models/Receipt.js";
import generateReceiptNumber from "../../utils/generateReceiptNumber.js";
import { sendPaymentEmail, sendPaymentFailedEmail } from "../../services/paymentEmailService.js";
import { broadcastEvent } from "../../config/socket.js";
import razorpay from "../../config/razorpay.js";

export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return next(new AppError("Missing payment details", 400));
        }

        // Verify Razorpay HMAC signature
        const isValid = verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );
        if (!isValid) {
            const purchase = await Purchase.findOneAndUpdate(
                {
                    razorpayOrderId: razorpay_order_id,
                    user: req.user._id,
                    status: { $nin: ["paid", "success", "manual_access"] }
                },
                { status: "verification_failed" },
                { new: true }
            );
            if (purchase) {
                await sendPaymentFailedEmail({ user: req.user, purchase });
            }
            return next(new AppError("Payment verification failed", 400));
        }
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const notes = order.notes || {};
        const plan = notes.plan || "monthly";
        const amount = Number(notes.amount) || (plan === "yearly" ? 1499 : plan === "quarterly" ? 399 : 199);
        const planTitle = notes.title || (plan === "yearly" ? "TMDB VIP Annual Pass" : plan === "quarterly" ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass");

        // Calculate subscription dates
        const startDate = new Date();
        const expiresAt = new Date();

        if (plan === "monthly") {
            expiresAt.setDate(expiresAt.getDate() + 30);
        } else if (plan === "quarterly") {
            expiresAt.setDate(expiresAt.getDate() + 90);
        } else if (plan === "yearly") {
            expiresAt.setDate(expiresAt.getDate() + 365);
        } else {
            expiresAt.setDate(expiresAt.getDate() + 30);
        }

        // Save or update purchase record
        const purchase = await Purchase.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                user: req.user._id,
                title: planTitle,
                poster: notes.poster || "",
                contentType: "subscription",
                plan,
                startDate,
                expiresAt,
                amount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: "paid"
            },
            { upsert: true, new: true }
        );

        // Update User Subscription State
        req.user.subscription = {
            status: "active",
            plan,
            startDate,
            expiresAt,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        };
        await req.user.save();

        // Create Tax Receipt
        const receipt = await Receipt.create({
            purchase: purchase._id,
            user: req.user._id,
            receiptNumber: generateReceiptNumber(),
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            contentId: 0,
            title: planTitle,
            contentType: "subscription",
            amount
        });

        // Send confirmation email
        try {
            await sendPaymentEmail({ user: req.user, purchase, receipt });
        } catch (emailErr) {
            console.error("Failed to send subscription confirmation email:", emailErr);
        }

        broadcastEvent("payment_success", { userId: req.user._id, subscription: req.user.subscription, purchase });
        broadcastEvent("subscription_updated", { userId: req.user._id, subscription: req.user.subscription });
        broadcastEvent("purchase_created", { purchase });
        broadcastEvent("stats_updated", {});

        return res.json({
            success: true,
            message: "Subscription activated successfully!",
            subscription: req.user.subscription,
            purchase,
            receipt,
            receiptNumber: receipt.receiptNumber
        });
    } catch (err) {
        next(err);
    }
};