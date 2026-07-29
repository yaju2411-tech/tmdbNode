import axios from "axios";
import HelpTicket from "../models/HelpTicket.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Receipt from "../models/Receipt.js";
import AppError from "../utils/appError.js";
import { sendTicketConfirmation, sendAdminTicketAlert } from "../services/emailService.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const getSystemPrompt = () => {
  const supportEmail = process.env.SUPPORT_EMAIL;
  const supportPhone = process.env.SUPPORT_PHONE;

  return `You are a friendly and professional support assistant for TMDB — a streaming platform where users can browse, purchase, and watch movies and TV shows.

Your job is to help users resolve their account and app problems quickly. Always be concise, clear, and helpful.

IMPORTANT FACTS ABOUT THIS APP:
- Authentication: Users can sign up with email/password OR Google. They CANNOT mix the two — a Google account cannot use password login and vice versa.
- Email Verification: After signup, users must verify their email with a 6-digit OTP. OTPs expire in exactly 5 minutes. If expired, user can click "Resend OTP".
- Password: Must be 8+ characters with uppercase, lowercase, number, and symbol (e.g., Password@1).
- Captcha: Signup requires passing a Cloudflare Turnstile captcha.
- Forgot Password: Uses OTP sent to email. OTP expires in 5 minutes.
- Payments: Handled by Razorpay. If a payment is deducted but content is locked, it may be a network/verification issue.
- Purchased content: Accessible under "My Movies" in the navigation sidebar.
- Watchlist: Users can add movies/TV to their watchlist.

WHAT ADMINS CAN DO (tell users to contact support if needed):
- Force-verify a stuck account (if OTP emails are not arriving)
- Edit user name, email, or avatar
- View purchase status and investigate payment issues
- Delete accounts
- If the user asks for direct contact info, provide support email: ${supportEmail} and contact number: ${supportPhone}.

TONE: Friendly, concise, no jargon. If you cannot solve the issue, tell the user to submit a support ticket using the form available on this page.

DO NOT make up features that don't exist. DO NOT ask for passwords. Keep responses under 200 words.`;
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
      orderId, paymentId, receiptId, contentName, contentId, contentType
    } = req.body;

    if (!name || !email || !category || !description) {
      return next(new AppError("All fields are required", 400));
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

    const userEmail = email.trim().toLowerCase();
    const isRequesterOwner = Boolean(
      req.user && req.user.email && req.user.email.trim().toLowerCase() === userEmail
    );

    let resolvedOrderId = isRequesterOwner && orderId ? orderId.trim() : null;
    let resolvedPaymentId = isRequesterOwner && paymentId ? paymentId.trim() : null;
    let resolvedReceiptId = isRequesterOwner && receiptId ? receiptId.trim() : null;
    let resolvedContentName = contentName ? contentName.trim() : null;
    const resolvedContentId = contentId ? contentId.trim() : null;
    const resolvedContentType = contentType || "movie";

    // Auto-lookup purchase in DB only if the authenticated user matches the ticket email
    if (isRequesterOwner && req.user && resolvedContentId) {
      try {
        const foundPurchase = await Purchase.findOne({
          user: req.user._id,
          contentId: Number(resolvedContentId),
          contentType: resolvedContentType,
        }).sort({ createdAt: -1 });

        if (foundPurchase) {
          if (!resolvedOrderId || resolvedOrderId === "N/A") {
            resolvedOrderId = foundPurchase.razorpayOrderId || null;
          }
          if (!resolvedPaymentId || resolvedPaymentId === "N/A") {
            resolvedPaymentId = foundPurchase.razorpayPaymentId || null;
          }
          if (!resolvedContentName) {
            resolvedContentName = foundPurchase.title || null;
          }

          const foundReceipt = await Receipt.findOne({ purchase: foundPurchase._id });
          if (foundReceipt) {
            if (!resolvedReceiptId) resolvedReceiptId = foundReceipt.receiptNumber || null;
            if (!resolvedPaymentId || resolvedPaymentId === "N/A") resolvedPaymentId = foundReceipt.razorpayPaymentId || null;
          }
        }
      } catch (lookupErr) {
        console.error("Purchase auto-lookup error in submitTicket:", lookupErr);
      }
    }

    const ticketData = {
      name: name.trim(),
      email: userEmail,
      category,
      description: description.trim(),
    };

    if (resolvedOrderId) ticketData.orderId = resolvedOrderId;
    if (resolvedPaymentId) ticketData.paymentId = resolvedPaymentId;
    if (resolvedReceiptId) ticketData.receiptId = resolvedReceiptId;
    if (resolvedContentName) ticketData.contentName = resolvedContentName;
    if (resolvedContentId) ticketData.contentId = resolvedContentId;
    if (resolvedContentType) ticketData.contentType = resolvedContentType;
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
