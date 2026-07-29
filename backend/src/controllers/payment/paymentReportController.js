import PaymentReport from "../../models/PaymentReport.js";
import Purchase from "../../models/Purchase.js";
import Receipt from "../../models/Receipt.js";
import AppError from "../../utils/appError.js";
import razorpay from "../../config/razorpay.js";
import { getIO } from "../../config/socket.js";
import { reciptGenerator } from "../../utils/receiptNoGenerator.js";
// User submits payment issue report
export const submitPaymentReport = async (req, res, next) => {
    try {
        const { purchase_id, movie_id, movie_name, content_type, order_id,
            payment_id, amount, current_payment_status, issue_type, subject,
            description } = req.body;

        if (!issue_type || !description) {
            return next(new AppError("Issue type and description are required", 400));
        }

        const report = await PaymentReport.create({
            user: req.user._id,
            purchase: purchase_id || null,
            user_email: req.user.email,
            movie_id,
            movie_name,
            content_type,
            order_id,
            payment_id,
            amount,
            current_payment_status,
            issue_type,
            subject,
            description
        });

        return res.status(201).json({
            success: true,
            report
        });
    } catch (err) {
        next(err);
    }
};

// Admin gets all payment reports
export const getPaymentReports = async (req, res, next) => {
    try {
        const reports = await PaymentReport.find()
            .populate("user", "name email avatar")
            .populate("purchase")
            .sort({ created_at: -1 });

        return res.json({
            success: true,
            reports
        });
    } catch (err) {
        next(err);
    }
};

// Admin updates payment report fields
export const updatePaymentReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const report = await PaymentReport.findByIdAndUpdate(id, updateData, { new: true });
        if (!report) {
            return next(new AppError("Payment report not found", 404));
        }

        // Notify client
        try {
            getIO().emit("payment-status-updated", { reportId: id, ...updateData });
        } catch (socketErr) {
            console.error("Socket emit failed:", socketErr);
        }

        return res.json({ success: true, report });
    } catch (err) {
        next(err);
    }
};

// Admin forces pending payment to success
export const resolveManualPayment = async (req, res, next) => {
    try {
        const { id } = req.params; // report_id

        const report = await PaymentReport.findById(id);
        if (!report) {
            return next(new AppError("Payment report not found", 404));
        }

        // Update associated purchase status to paid
        let purchase;
        if (report.purchase) {
            purchase = await Purchase.findByIdAndUpdate(report.purchase, { status: "paid" }, { new: true });
        } else if (report.order_id) {
            purchase = await Purchase.findOneAndUpdate({ razorpayOrderId: report.order_id }, { status: "paid" }, { new: true });
        }

        // Create receipt if it doesn't exist
        if (purchase) {
            const existingReceipt = await Receipt.findOne({ purchase: purchase._id });
            if (!existingReceipt) {
                await Receipt.create({
                    receiptNumber: reciptGenerator(),
                    purchase: purchase._id,
                    user: purchase.user,
                    orderId: purchase.razorpayOrderId,
                    paymentId: purchase.razorpayPaymentId || report.payment_id,
                    contentId: purchase.movie_id,
                    title: purchase.movie_name,
                    contentType: purchase.content_type,
                    amount: purchase.amount,
                    status: "paid"
                });
            }
        }

        // Update report status
        report.status = "resolved";
        report.resolved = true;
        report.current_payment_status = "success";
        report.resolved_at = new Date();
        report.admin_reply = "Pending payment resolved manually by admin";
        report.admin = req.user._id;

        await report.save();

        // Emit real-time notification
        try {
            getIO().emit("payment-status-updated", {
                reportId: id,
                status: "resolved",
                current_payment_status: "success"
            });
        } catch (socketErr) {
            console.error("Socket emit failed for resolveManualPayment:", socketErr);
        }

        return res.json({
            success: true,
            message: "Payment resolved manually successfully."
        });
    } catch (err) {
        next(err);
    }
};

// Admin retries verification against Razorpay API
export const retryPaymentVerification = async (req, res, next) => {
    try {
        const { id } = req.params; // report_id

        const report = await PaymentReport.findById(id);
        if (!report) {
            return next(new AppError("Payment report not found", 404));
        }

        const paymentId = report.payment_id;
        if (!paymentId) {
            return next(new AppError("No payment ID associated with this report", 400));
        }

        // Fetch payment details from Razorpay
        let payment;
        try {
            payment = await razorpay.payments.fetch(paymentId);
        } catch (rErr) {
            return next(new AppError(`Razorpay fetch failed: ${rErr.message}`, 400));
        }

        const validStatuses = ["captured", "authorized"];
        const verified = validStatuses.includes(payment.status);

        if (!verified) {
            report.status = "investigating";
            report.admin_reply = "Retry verification failed. Manual investigation required.";
            report.failure_stage = "retry_verification_failed";
            await report.save();

            return res.json({
                success: false,
                message: `Payment status verification failed. Razorpay status: ${payment.status}`
            });
        }

        // Purchase success
        let purchase;
        if (report.purchase) {
            purchase = await Purchase.findByIdAndUpdate(report.purchase, { status: "paid", razorpayPaymentId: paymentId }, { new: true });
        } else if (report.order_id) {
            purchase = await Purchase.findOneAndUpdate(
                { razorpayOrderId: report.order_id },
                { status: "paid", razorpayPaymentId: paymentId },
                { new: true }
            );
        }

        // Create receipt if it doesn't exist
        if (purchase) {
            const existingReceipt = await Receipt.findOne({ purchase: purchase._id });
            if (!existingReceipt) {
                await Receipt.create({
                    receiptNumber: reciptGenerator(),
                    purchase: purchase._id,
                    user: purchase.user,
                    orderId: purchase.razorpayOrderId,
                    paymentId: purchase.razorpayPaymentId || report.payment_id,
                    contentId: purchase.movie_id,
                    title: purchase.movie_name,
                    contentType: purchase.content_type,
                    amount: purchase.amount,
                    status: "paid"
                });
            }
        }

        // Report resolved
        report.status = "resolved";
        report.resolved = true;
        report.resolved_at = new Date();
        report.current_payment_status = "success";
        report.admin_reply = "Payment manually verified successfully from Razorpay.";
        report.failure_stage = null;
        report.admin = req.user._id;

        await report.save();

        // Emit real-time notification
        try {
            getIO().emit("payment-status-updated", {
                reportId: id,
                status: report.status,
                current_payment_status: report.current_payment_status
            });
        } catch (socketErr) {
            console.error("Socket emit failed for retryPaymentVerification:", socketErr);
        }

        return res.json({
            success: true,
            payment_status: payment.status,
            message: "Payment verified successfully via Razorpay API."
        });
    } catch (err) {
        next(err);
    }
};

// Admin issues refund via Razorpay API
export const refundPayment = async (req, res, next) => {
    try {
        const { id } = req.params; // report_id

        const report = await PaymentReport.findById(id);
        if (!report) {
            return next(new AppError("Payment report not found", 404));
        }

        const paymentId = report.payment_id;
        if (!paymentId) {
            return next(new AppError("Payment ID is required to process refund", 400));
        }

        const refundAmount = report.amount;
        if (!refundAmount || refundAmount <= 0) {
            return next(new AppError("Invalid amount for refund", 400));
        }

        // Call Razorpay refund
        let refundData;
        try {
            refundData = await razorpay.payments.refund(paymentId, {
                amount: refundAmount * 100
            });
        } catch (rErr) {
            return res.status(400).json({
                success: false,
                message: rErr.message || "Razorpay payment refund failed"
            });
        }

        // Update purchase status to failed/refunded
        if (report.purchase) {
            await Purchase.findByIdAndUpdate(report.purchase, { status: "failed" });
        }

        // Update report status
        report.refund_status = "refunded";
        report.refund_amount = refundAmount;
        report.razorpay_refund_id = refundData.id;
        report.status = "resolved";
        report.resolved = true;
        report.resolved_at = new Date();
        report.admin = req.user._id;
        report.admin_reply = `Refund of Rs.${refundAmount} processed successfully. Refund ID: ${refundData.id}`;

        await report.save();

        // Emit real-time notification
        try {
            getIO().emit("payment-status-updated", {
                reportId: id,
                status: "resolved",
                refund_status: "refunded",
                amount: refundAmount
            });
        } catch (socketErr) {
            console.error("Socket emit failed for refundPayment:", socketErr);
        }

        return res.json({
            success: true,
            refund: refundData,
            message: "Refund processed successfully."
        });
    } catch (err) {
        next(err);
    }
};

// Admin regenerates a receipt number
export const regenerateReceipt = async (req, res, next) => {
    try {
        const { id } = req.params; // report_id

        const report = await PaymentReport.findById(id);
        if (!report) {
            return next(new AppError("Payment report not found", 404));
        }

        const receiptNo = reciptGenerator();
        let receipt = await Receipt.findOne({ orderId: report.order_id });

        if (receipt) {
            receipt.receiptNumber = receiptNo;
            await receipt.save();
        } else {
            // Find purchase
            const purchase = await Purchase.findOne({ razorpayOrderId: report.order_id });
            if (!purchase) {
                return next(new AppError("Purchase not found for this report", 404));
            }
            receipt = await Receipt.create({
                receiptNumber: receiptNo,
                purchase: purchase._id,
                user: purchase.user,
                orderId: purchase.razorpayOrderId,
                paymentId: purchase.razorpayPaymentId || report.payment_id,
                contentId: purchase.movie_id,
                title: purchase.movie_name,
                contentType: purchase.content_type,
                amount: purchase.amount,
                status: "paid"
            });
        }

        report.status = "resolved";
        report.admin_reply = "Receipt Generated by admin";
        await report.save();

        return res.json({ success: true, receiptNo, message: "Receipt regenerated successfully" });
    } catch (err) {
        next(err);
    }
};
