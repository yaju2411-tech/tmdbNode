import axios from "axios";
import HelpTicket from "../models/HelpTicket.js";
import { sendTicketConfirmation, sendAdminTicketAlert } from "../services/emailService.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

const SYSTEM_PROMPT = `You are a friendly and professional support assistant for TMDB — a streaming platform where users can browse, purchase, and watch movies and TV shows.

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
- want to contact give them contact info like emial:yaju2411@gmail.com and contact number: +91 9664796515

TONE: Friendly, concise, no jargon. If you cannot solve the issue, tell the user to submit a support ticket using the form available on this page.

DO NOT make up features that don't exist. DO NOT ask for passwords. Keep responses under 200 words.`;

// POST /api/help/ai-chat
export const aiChat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "Messages are required" });
    }

    // Sanitize messages
    const sanitized = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content).slice(0, 1000), // cap at 1000 chars
    }));

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitized],
        max_tokens: 400,
        temperature: 0.5,
      },
      {
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
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (description.trim().length < 20) {
      return res.status(400).json({ success: false, message: "Please describe your issue in at least 20 characters" });
    }

    let proofImagesUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, "tickets"));
        const uploadResults = await Promise.all(uploadPromises);
        proofImagesUrls = uploadResults.map(result => result.secure_url);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const ticketData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category,
      description: description.trim(),
    };

    if (orderId) ticketData.orderId = orderId.trim();
    if (paymentId) ticketData.paymentId = paymentId.trim();
    if (receiptId) ticketData.receiptId = receiptId.trim();
    if (contentName) ticketData.contentName = contentName.trim();
    if (contentId) ticketData.contentId = contentId.trim();
    if (contentType) ticketData.contentType = contentType;
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
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting your ticket. Please try again later.",
      error: err.stack
    });
  }
};
