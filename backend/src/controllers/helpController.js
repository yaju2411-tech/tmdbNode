import axios from "axios";
import HelpTicket from "../models/HelpTicket.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Receipt from "../models/Receipt.js";
import AppError from "../utils/appError.js";
import { sendTicketConfirmation, sendAdminTicketAlert } from "../services/emailService.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const getSystemPrompt = () => {
  const supportEmail = process.env.SUPPORT_EMAIL || "support@tmdb.com";
  const supportPhone = process.env.SUPPORT_PHONE || "+91 9876543210";

  return `You are a friendly and professional support assistant for TMDB — a premium streaming platform offering unlimited access to thousands of movies and TV shows via VIP Subscriptions.

Your job is to help users resolve account, subscription, and streaming questions. Always be concise, clear, and helpful.

VIP SUBSCRIPTION PLANS & PRICING:
- Monthly Pass: ₹199 / month (30 days validity)
- Quarterly VIP Pass: ₹399 / 3 months (90 days validity - Best Value)
- Annual VIP Pass: ₹1,499 / year (365 days validity - Save 37%)

SUBSCRIPTION ADVANTAGES:
- Active VIP subscribers get unlimited access to stream ALL movies and TV shows on the platform.
- Zero ad interruptions.
- Full HD streaming with multiple server sources.

IMPORTANT FACTS ABOUT THIS APP:
- Authentication: Email/password or Google sign-in.
- OTP Verification: 6-digit OTP sent on signup/password reset, valid for 5 minutes.
- Payments: Handled securely by Razorpay.
- Receipts: Download tax invoices anytime under "Receipts" in sidebar.

WHAT ADMINS CAN DO:
- Manually activate, extend (+30d/+90d/+365d), or manage VIP Subscriptions.
- Force-verify accounts and resolve billing queries.
- Support Email: ${supportEmail} | Phone: ${supportPhone}.

TONE: Friendly, concise, professional. If you cannot solve the issue, instruct the user to submit a support ticket using the form on this page. Keep responses under 200 words.`;
};

// POST /api/help/ai-chat
export const aiChat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return next(new AppError("Messages are required", 400));
    }

    // Sanitize messages — cap at latest 20 messages and 1000 characters per message
    const sanitized = messages.slice(-20).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content).slice(0, 1000),
    }));

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: getSystemPrompt() }, ...sanitized],
        max_tokens: 400,
        temperature: 0.5,
      },
      {
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    return res.json({ success: true, reply });
  } catch (err) {
    console.error("Groq API Error:", err.response?.data || err.message);
    return res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable. Please submit a support ticket instead."
    });
  }
};

// POST /api/help/ticket
export const submitTicket = async (req, res, next) => {
  try {
    const {
      name, email, category, description,
      plan, amount, orderId, paymentId, receiptId
    } = req.body;

    if (!name || !email || !category || !description) {
      return next(new AppError("Name, email, category, and description are required", 400));
    }

    const isPaymentIssue = category === "payment_deducted" || category === "content_not_showing" || category === "purchased_content_not_showing";

    if (isPaymentIssue) {
      if (!plan) {
        return next(new AppError("Subscription plan is required for payment support tickets", 400));
      }
      if (!amount || Number(amount) <= 0) {
        return next(new AppError("Plan amount is required for payment support tickets", 400));
      }
    }

    if (description.trim().length < 20) {
      return next(new AppError("Please describe your issue in at least 20 characters", 400));
    }

    let proofImagesUrls = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return next(new AppError("You can upload a maximum of 5 proof images", 400));
      }
      try {
        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, "tickets"));
        const uploadResults = await Promise.all(uploadPromises);
        proofImagesUrls = uploadResults.map(result => result.secure_url);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return next(new AppError("Failed to upload payment proof images. Please try again.", 400));
      }
    }

    if (isPaymentIssue && proofImagesUrls.length === 0) {
      return next(new AppError("Payment screenshot proof image is required for billing tickets", 400));
    }

    const userEmail = email.trim().toLowerCase();

    const ticketData = {
      name: name.trim(),
      email: userEmail,
      category,
      description: description.trim(),
    };

    if (plan) ticketData.plan = plan;
    if (amount) ticketData.amount = Number(amount);
    if (orderId && orderId.trim()) ticketData.orderId = orderId.trim();
    if (paymentId && paymentId.trim()) ticketData.paymentId = paymentId.trim();
    if (receiptId && receiptId.trim()) ticketData.receiptId = receiptId.trim();
    if (proofImagesUrls.length > 0) ticketData.proofImages = proofImagesUrls;

    const ticket = await HelpTicket.create(ticketData);

    // Send emails in parallel — don't block response if one fails
    await Promise.allSettled([
      sendTicketConfirmation(ticket.email, ticket),
      sendAdminTicketAlert(ticket),
    ]);

    return res.status(201).json({
      success: true,
      ticketId: ticket.ticketId,
      message: "Your ticket has been submitted. Check your email for confirmation.",
    });
  } catch (err) {
    console.error("Submit Ticket Error:", err);
    next(err);
  }
};
