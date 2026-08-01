import Receipt from "../../models/Receipt.js";
import Purchase from "../../models/Purchase.js";
import User from "../../models/User.js";
import AppError from "../../utils/appError.js";
import razorpay from "../../config/razorpay.js";
import { reciptGenerator } from "../../utils/receiptNoGenerator.js";
import { sendEmailMessage } from "../../services/emailService.js";
import { generateReceiptPDFBuffer } from "../../utils/pdfReceiptGenerator.js";

// Helper to generate PDF and send receipt email to user
export const sendReceiptEmailHelper = async ({ user, receipt }) => {
    const mappedData = {
        receipt_number: receipt.receiptNumber,
        uname: user.name || "Subscriber",
        uemail: user.email,
        payment_id: receipt.razorpayPaymentId || "N/A",
        paid_at: receipt.paidAt || receipt.createdAt || Date.now(),
        status: receipt.status || "paid",
        content_title: receipt.title || "TMDB VIP Pass",
        order_id: receipt.razorpayOrderId || "N/A",
        content_type: receipt.contentType || "subscription",
        amount: receipt.amount || 0
    };

    const pdfBuffer = await generateReceiptPDFBuffer(mappedData);

    await sendEmailMessage({
        to: user.email,
        subject: `🧾 Official Tax Receipt • ${mappedData.content_title} (${mappedData.receipt_number})`,
        fromName: "TMDB Billing & Receipts",
        attachments: [
            {
                filename: `TMDB_Receipt_${mappedData.receipt_number}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf"
            }
        ],
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 26px; color: white;">🧾 Official Payment Receipt</h1>
                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Receipt #${mappedData.receipt_number}</p>
              </div>
              <div style="padding: 32px;">
                <p style="font-size: 16px;">Hi <strong>${user.name || "Valued Customer"}</strong>,</p>
                <p style="color: #ccc; line-height: 1.6;">Thank you for your purchase with TMDB! We've attached your official PDF receipt to this email.</p>
                
                <div style="background: #141414; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #2a2a2a;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 8px 0; color: #888;">Item / Plan:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981;">${mappedData.content_title}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; color: white;">₹${mappedData.amount}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888;">Receipt No:</td><td style="padding: 8px 0; font-family: monospace; color: #10b981;">${mappedData.receipt_number}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888;">Payment ID:</td><td style="padding: 8px 0; font-family: monospace; color: #aaa;">${mappedData.payment_id}</td></tr>
                  </table>
                </div>

                <p style="color: #aaa; font-size: 13px;">Please find the attached PDF document for full tax and billing details.</p>
              </div>
            </div>
        `
    });
};

// 1. Verify Payment ID via Razorpay API
export const verifyLivePaymentId = async (req, res, next) => {
    try {
        const paymentId = req.body.paymentId || req.query.paymentId || req.params.paymentId;
        if (!paymentId || !paymentId.trim()) {
            return next(new AppError("Payment ID is required", 400));
        }

        const cleanPaymentId = paymentId.trim();

        let razorpayPayment = null;
        try {
            razorpayPayment = await razorpay.payments.fetch(cleanPaymentId);
        } catch (rErr) {
            return next(new AppError(`Razorpay API Error: ${rErr.message || "Invalid Payment ID"}`, 404));
        }

        if (!razorpayPayment) {
            return next(new AppError("Payment ID not found on Razorpay", 404));
        }

        const isCaptured = razorpayPayment.status === "captured";

        return res.json({
            success: true,
            valid: isCaptured,
            payment: {
                id: razorpayPayment.id,
                entity: razorpayPayment.entity,
                amount: razorpayPayment.amount / 100,
                currency: razorpayPayment.currency,
                status: razorpayPayment.status,
                orderId: razorpayPayment.order_id,
                method: razorpayPayment.method,
                email: razorpayPayment.email,
                contact: razorpayPayment.contact,
                errorDescription: razorpayPayment.error_description || null,
                createdAt: new Date(razorpayPayment.created_at * 1000).toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

// 2. Generate PDF Receipt and send via email
export const generateAndSendReceipt = async (req, res, next) => {
    try {
        const { paymentId, orderId, receiptNumber, email } = req.body;

        if (!paymentId && !orderId && !receiptNumber) {
            return next(new AppError("Payment ID, Order ID, or Receipt Number is required", 400));
        }

        const lookupKey = paymentId || orderId || receiptNumber;

        let receipt = await Receipt.findOne({
            $or: [
                { receiptNumber: lookupKey },
                { razorpayPaymentId: lookupKey },
                { razorpayOrderId: lookupKey }
            ]
        }).populate("user", "name email");

        let user = receipt?.user;

        if (!receipt) {
            const purchase = await Purchase.findOne({
                $or: [
                    { razorpayPaymentId: lookupKey },
                    { razorpayOrderId: lookupKey }
                ]
            }).populate("user", "name email");

            if (!purchase) {
                return next(new AppError("No matching purchase or receipt record found", 404));
            }

            user = purchase.user;
            const newReceiptNo = reciptGenerator();
            receipt = await Receipt.create({
                purchase: purchase._id,
                user: purchase.user._id,
                receiptNumber: newReceiptNo,
                razorpayOrderId: purchase.razorpayOrderId || "ORD-" + Date.now(),
                razorpayPaymentId: purchase.razorpayPaymentId || lookupKey,
                contentId: purchase.contentId || 0,
                title: purchase.title || "TMDB VIP Pass",
                contentType: purchase.contentType || "subscription",
                amount: purchase.amount || 399,
                status: "paid"
            });
        }

        const targetEmail = email || user?.email;
        if (!targetEmail) {
            return next(new AppError("User email not found for sending receipt", 400));
        }

        await sendReceiptEmailHelper({ user: { name: user?.name || "Subscriber", email: targetEmail }, receipt });

        return res.json({
            success: true,
            message: `Receipt #${receipt.receiptNumber} PDF generated and emailed to ${targetEmail} successfully!`,
            receiptNumber: receipt.receiptNumber
        });
    } catch (err) {
        console.error("generateAndSendReceipt Error:", err);
        next(err);
    }
};
