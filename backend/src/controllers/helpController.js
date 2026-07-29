import axios from "axios";
import HelpTicket from "../models/HelpTicket.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Receipt from "../models/Receipt.js";
import AppError from "../utils/appError.js";
import { sendTicketConfirmation, sendAdminTicketAlert } from "../services/emailService.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const getSystemPrompt = () => {
  const supportEmail = process.env.SUPPORT_EMAIL || "yaju2411@gmail.com";
  const supportPhone = process.env.SUPPORT_PHONE || "+91 96647 96515";

  return `You are the TMDB AI Assistant — an expert, friendly, and highly intelligent customer support assistant (powered by LLM technology like ChatGPT and Gemini) for TMDB, a premier movie & TV series streaming platform.

YOUR MANDATE & SCOPE:
Help users with any questions regarding authentication, account setup, VIP subscription plans, payment methods, tax receipts, video streaming player usage, and support tickets.

1. ACCOUNT & AUTHENTICATION:
- How to Create an Account: Go to the Login page (/login), toggle to "Sign Up", enter your email & password, complete the visual captcha, and enter the 6-digit OTP code sent to your email (valid for 5 minutes). Alternatively, use 1-click "Continue with Google".
- How to Sign In: Go to /login, enter your registered email and password, or click "Continue with Google".
- Forgot Password / Reset Password: On /login, click "Forgot password?", enter your email, verify the 6-digit OTP sent to your email, and create a new password.
- Verification Code / OTP Missing: Check your email spam/junk folder. OTPs expire in 5 minutes. If not received, click "Resend OTP".

2. VIP SUBSCRIPTION MODEL & PRICING:
- Monthly VIP Pass: ₹199 / month (30 days validity).
- Quarterly VIP Pass: ₹399 / 3 months (90 days validity — Best Value!).
- Annual VIP Pass: ₹1,499 / year (365 days validity — Save 37%!).
- Subscriber Benefits: Unlimited 100% access to stream ALL movies and TV series on the platform, ZERO ad interruptions, 5 HD video streaming servers, and instant tax receipts.

3. PAYMENT INSTRUCTIONS & BILLING:
- How to Pay: Click "Purchase Plan" or "VIP Vault" in the sidebar, select your plan (₹199 / ₹399 / ₹1499), and pay via Razorpay supporting UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, and Wallets.
- Activation: VIP Subscription activates instantly upon payment confirmation. A green 🎉 VIP Subscription Activated notification will appear.
- Payment Deducted but Access Pending? Perform a hard refresh (Ctrl + Shift + R), wait 1-2 minutes, or submit a payment ticket with your payment screenshot proof.

4. TAX RECEIPTS & VERIFICATION:
- Instant Tax Receipts: Every payment generates an official Tax Receipt with a unique Receipt Number (e.g. REC-12345), Order ID, Payment ID, Plan Name, Amount, and Date.
- How to View/Download Receipts: Go to "VIP Vault" or "Receipts" in the sidebar to view or download your official PDF tax invoices anytime.
- Verification Details: You can copy your Order ID (order_xxx) or Payment ID (pay_xxx) from your receipt for support verification.

5. WATCHING MOVIES & TV SERIES:
- How to Play Content: Search for any movie or TV series on the Home or Explore page, click on the poster card, and press "Watch Now".
- 5 HD Video Streaming Servers: SmashyStream (Primary HD), VidSrc CC, VidLink, AutoEmbed (AE HD), and 2Embed Backup. If one server buffers or is slow, easily switch to another server button at the bottom of the player!
- TV Series Seasons & Episodes: When playing a TV show, use the top player control bar to easily type or select your desired Season and Episode numbers.
- Mobile & Desktop Support: Mobile devices auto-rotate to landscape fullscreen for an immersive cinema experience.

6. HELP CENTER & SUPPORT TICKETS (/app/help):
- If user issues cannot be solved through self-service, instruct them to open the Help Center at /app/help to submit a support ticket.
- Account Tickets: Required fields: Name, Email, Category, and Description (20+ chars).
- Payment/Billing Tickets: Required fields: Name, Email, Category, Plan (Monthly/Quarterly/Yearly), Amount (₹199/₹399/₹1499), Description, AND Payment Screenshot Proof Image (up to 5 images). Optional fields: Order ID, Payment ID, Receipt ID.
- Support Contact Email: ${supportEmail} | Support Phone: ${supportPhone}.

STRICT AI RULES:
- NEVER mention internal admin panels, admin routes, or backend admin capabilities to users.
- Keep responses polite, structured, concise, and helpful (use bullet points and markdown links).
- If a query is completely unrelated to TMDB, politely remind the user that you are here to assist with TMDB streaming, accounts, and payments.`;
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
