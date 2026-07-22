import Receipt from "../../models/Receipt.js";
import Purchase from "../../models/Purchase.js";
import AppError from "../../utils/appError.js";

export const getReceipt = async (req, res, next) => {
    try {
        const { receiptNumber } = req.params;
        const receipt = await Receipt.findOne({ receiptNumber })
            .populate("user", "name email avatar")
            .populate("purchase");
        if (!receipt) {
            return next(new AppError("Receipt not found", 404));
        }

        // Map to format expected by frontend
        const mappedReceipt = {
            receipt_number: receipt.receiptNumber,
            uname: receipt.user?.name || "Customer",
            uemail: receipt.user?.email || "",
            payment_id: receipt.razorpayPaymentId,
            paid_at: receipt.paidAt,
            status: receipt.status,
            content_title: receipt.title,
            order_id: receipt.razorpayOrderId,
            content_type: receipt.contentType,
            amount: receipt.amount
        };

        return res.json({
            success: true,
            receipt: mappedReceipt,
        });
    } catch (err) {
        next(err);
    }
};

export const getPaymentIdAndReceipt = async (req, res, next) => {
    try {
        const { contentId, contentType } = req.query;
        if (!contentId || !contentType) {
            return res.status(400).json({
                success: false,
                message: "contentId and contentType are required"
            });
        }

        const purchase = await Purchase.findOne({
            user: req.user._id,
            contentId: Number(contentId),
            contentType: contentType
        }).sort({ createdAt: -1 });

        if (!purchase) {
            return res.json({
                success: true,
                orderId: null,
                paymentId: null,
                receiptNumber: null
            });
        }

        const receipt = await Receipt.findOne({
            purchase: purchase._id,
            user: req.user._id
        });

        return res.json({
            success: true,
            orderId: purchase.razorpayOrderId || null,
            paymentId: receipt?.razorpayPaymentId || purchase.razorpayPaymentId || null,
            receiptNumber: receipt?.receiptNumber || null
        });
    } catch (err) {
        next(err);
    }
};