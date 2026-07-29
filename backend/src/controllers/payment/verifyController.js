import AppError from "../../utils/appError.js";
import verifySignature from "../../utils/verifySignature.js";
import Purchase from "../../models/Purchase.js";
import Receipt from "../../models/Receipt.js";
import generateReceiptNumber from "../../utils/generateReceiptNumber.js";
import { sendPaymentEmail, sendPaymentFailedEmail } from "../../services/paymentEmailService.js";
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
        const notes = order.notes;
        //already purchased
        const alreadyPurchased = await Purchase.findOne({
            user: notes.userId,
            contentId: Number(notes.contentId),
            contentType: notes.contentType,
            status: "paid"
        });
        if (alreadyPurchased) {
            return next(new AppError("You already purchased this content.", 409));
        }
        // Save or update purchase
        const purchase = await Purchase.findOneAndUpdate(
            {
                user: req.user._id,
                contentId: Number(notes.contentId),
                contentType: notes.contentType
            },
            {
                user: req.user._id,
                contentId: Number(notes.contentId),
                title: notes.title,
                poster: notes.poster,
                contentType: notes.contentType,
                amount: Number(notes.amount),
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                status: "paid"
            },
            { upsert: true, new: true }
        );
        //add receipt no
        const receipt = await Receipt.create({
            purchase: purchase._id,
            user: req.user._id,

            receiptNumber: generateReceiptNumber(),

            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,

            contentId: notes.contentId,
            title: notes.title,
            contentType: notes.contentType,

            amount: notes.amount
        });
        //send payment email
        await sendPaymentEmail({ user: req.user, purchase, receipt });
        return res.json({
            success: true,
            message: "Payment verified successfully.",
            purchase, receipt, receiptNumber: receipt.receiptNumber
        });
    } catch (err) {
        next(err);
    }
};