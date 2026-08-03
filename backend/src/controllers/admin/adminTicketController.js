import HelpTicket from "../../models/HelpTicket.js";
import User from "../../models/User.js";
import Purchase from "../../models/Purchase.js";
import PasswordReset from "../../models/PasswordReset.js";
import AppError from "../../utils/appError.js";
import axios from "axios";
import bcrypt from "bcryptjs";
import generateOTP from "../../utils/generateOtp.js";
import { sendEmailMessage, sendOTP } from "../../services/emailService.js";
import { broadcastEvent } from "../../config/socket.js";

// Fetch all support tickets with enriched purchase info
export const getTickets = async (req, res, next) => {
    try {
        const rawTickets = await HelpTicket.find().sort({ createdAt: -1 });

        const emails = [...new Set(rawTickets.map((t) => t.email ? t.email.trim().toLowerCase() : null).filter(Boolean))];
        const contentIds = [...new Set(rawTickets.map((t) => t.contentId ? Number(t.contentId) : null).filter((id) => id !== null && !isNaN(id)))];

        const users = emails.length > 0 ? await User.find({ email: { $in: emails } }).select("_id email") : [];
        const userMap = new Map(users.map((u) => [u.email.toLowerCase(), u._id.toString()]));
        const userIds = users.map((u) => u._id);

        const purchases = userIds.length > 0 && contentIds.length > 0
            ? await Purchase.find({ user: { $in: userIds }, contentId: { $in: contentIds } }).sort({ createdAt: -1 })
            : [];

        const purchaseMap = new Map();
        for (const p of purchases) {
            const key = `${p.user.toString()}_${p.contentId}_${p.contentType || "movie"}`;
            if (!purchaseMap.has(key)) {
                purchaseMap.set(key, p);
            }
        }

        const tickets = rawTickets.map((t) => {
            const doc = t.toObject();
            if (doc.email && doc.contentId) {
                const normalizedEmail = doc.email.trim().toLowerCase();
                const userId = userMap.get(normalizedEmail);
                if (userId) {
                    const key = `${userId}_${Number(doc.contentId)}_${doc.contentType || "movie"}`;
                    const purchase = purchaseMap.get(key);
                    if (purchase) {
                        doc.purchaseStatus = purchase.status === "paid" ? "success" : purchase.status;
                        if ((!doc.orderId || doc.orderId === "N/A") && purchase.razorpayOrderId) {
                            doc.orderId = purchase.razorpayOrderId;
                        }
                        if ((!doc.paymentId || doc.paymentId === "N/A") && purchase.razorpayPaymentId) {
                            doc.paymentId = purchase.razorpayPaymentId;
                        }
                        if (!doc.contentName && purchase.title) {
                            doc.contentName = purchase.title;
                        }
                    } else {
                        doc.purchaseStatus = "no_record";
                    }
                }
            }
            return doc;
        });

        return res.json({
            success: true,
            tickets
        });
    } catch (err) {
        console.error("getTickets Error:", err);
        next(err);
    }
};

// Update ticket status
export const updateTicketStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const ALLOWED_STATUSES = ["open", "in_progress", "resolved", "closed"];
        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return next(new AppError("Invalid or missing ticket status.", 400));
        }

        const existingTicket = await HelpTicket.findById(id);
        if (!existingTicket) {
            return next(new AppError("Ticket not found", 404));
        }

        if (status === "resolved") {
            const noteToCheck = adminNote !== undefined ? adminNote : existingTicket.adminNote;
            if (!noteToCheck || noteToCheck.trim().length < 5) {
                return next(new AppError("A resolution note (at least 5 characters) explaining how the issue was solved is required to resolve a ticket.", 400));
            }
        }

        const updateData = { status };
        if (adminNote !== undefined) {
            updateData.adminNote = adminNote.trim();
        }

        const ticket = await HelpTicket.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        broadcastEvent("ticket_updated", { ticket });

        return res.json({
            success: true,
            ticket,
            message: `Ticket status updated to '${status.replace("_", " ")}'`
        });
    } catch (err) {
        next(err);
    }
};

// Delete ticket
export const deleteTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await HelpTicket.findById(id);

        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        if (ticket.status !== "resolved") {
            return next(new AppError("Cannot delete an unresolved ticket. Please first progress the ticket to 'Resolved' with a resolution note.", 400));
        }

        if (!ticket.adminNote || ticket.adminNote.trim().length < 5) {
            return next(new AppError("Cannot delete ticket without an admin resolution note explaining how the issue was solved.", 400));
        }

        await HelpTicket.findByIdAndDelete(id);

        broadcastEvent("ticket_updated", { ticketId: id, deleted: true });

        return res.json({
            success: true,
            message: "Ticket deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

// Draft Email with Groq AI
export const draftEmail = async (req, res, next) => {
    try {
        const { instruction } = req.body;
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        if (!process.env.GROQ_API) {
            return next(new AppError("Groq API key not configured.", 500));
        }

        const prompt = `You are an expert customer support agent for TMDB (a streaming platform for movies and TV shows).
Draft a professional, empathetic email to a user based on their ticket and the admin's instructions.
User Name: ${ticket.name}
Ticket Category: ${ticket.category}
User Description: ${ticket.description}
Admin Instruction: ${instruction}

CRITICAL RULES:
1. Write ONLY the final email body. No subject lines.
2. DO NOT repeat, echo, or quote the "Admin Instruction" in your email. It is for your eyes only.
3. Keep it clear, step-by-step if needed, and highly professional.`;

        const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }]
            },
            {
                timeout: 15000,
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const draft = groqRes.data.choices[0].message.content.trim();

        return res.json({ success: true, draft });
    } catch (err) {
        console.error("Groq AI Error:", err.response?.data || err.message);
        next(new AppError("Failed to generate AI draft", 500));
    }
};

// Send Email via sendEmailMessage
export const sendEmail = async (req, res, next) => {
    try {
        const { subject, body } = req.body;
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        let emailSent = false;
        try {
            await sendEmailMessage({
                to: ticket.email,
                subject: subject || `Update on your Ticket #${ticket.ticketId}`,
                fromName: "TMDB Support",
                html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 24px; border-radius: 12px; line-height: 1.6; border: 1px solid #222;">${(body || "").replace(/\n/g, "<br>")}</div>`
            });
            emailSent = true;
        } catch (mErr) {
            console.error("sendEmail Transport Error:", mErr.message || mErr);
        }

        const emailLog = emailSent 
            ? `[AI Support Response Sent to ${ticket.email}]: ${body || ""}`
            : `[AI Support Response Saved (Email Transport Pending)]: ${body || ""}`;

        ticket.adminNote = ticket.adminNote
            ? `${ticket.adminNote}\n\n${emailLog}`
            : emailLog;
        ticket.status = "in_progress";
        await ticket.save();

        return res.json({
            success: true,
            message: emailSent ? "Email sent to user successfully!" : "AI Response logged to ticket (Email transport pending).",
            ticket
        });
    } catch (err) {
        console.error("sendEmail Controller Error:", err);
        next(err);
    }
};

// Force Verify Ticket User Email & Account
export const verifyTicketUser = async (req, res, next) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        const user = await User.findOne({ email: ticket.email.toLowerCase() });
        if (user) {
            user.isEmailVerified = true;
            user.isCaptchaVerified = true;
            await user.save();
        }

        ticket.status = "resolved";
        ticket.adminNote = "User email & account verified by admin.";
        await ticket.save();

        return res.json({
            success: true,
            message: `User account (${ticket.email}) verified and ticket marked resolved!`,
            ticket
        });
    } catch (err) {
        next(err);
    }
};

// Trigger Password Reset Email from Admin Panel
export const sendPasswordResetFromAdmin = async (req, res, next) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        await PasswordReset.findOneAndUpdate(
            { email: ticket.email.toLowerCase() },
            {
                email: ticket.email.toLowerCase(),
                otp: hashedOTP,
                otpExpires: new Date(Date.now() + 15 * 60 * 1000),
                lastOTPSent: new Date()
            },
            { upsert: true, new: true }
        );

        let emailSent = false;
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password-conform?email=${encodeURIComponent(ticket.email)}&otp=${otp}`;

        try {
            await sendEmailMessage({
                to: ticket.email,
                subject: `🔑 Password Reset Link & Instructions • Ticket #${ticket.ticketId}`,
                fromName: "TMDB Support",
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
                      <div style="background: linear-gradient(135deg, #e50914 0%, #b00610 100%); padding: 32px; text-align: center;">
                        <h1 style="margin: 0; font-size: 26px; color: white;">🔑 Reset Your Password</h1>
                        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Requested via Support Ticket #${ticket.ticketId}</p>
                      </div>
                      <div style="padding: 32px;">
                        <p style="font-size: 16px;">Hi <strong>${ticket.name || "User"}</strong>,</p>
                        <p style="color: #ccc; line-height: 1.6;">Our support team has processed your request. Click the direct button link below to reset your password instantly:</p>

                        <div style="text-align: center; margin: 28px 0;">
                          <a href="${resetUrl}" style="background: linear-gradient(135deg, #e50914 0%, #b00610 100%); color: white; text-decoration: none; padding: 16px 32px; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 16px;">
                            🚀 Click Here to Reset Password Now
                          </a>
                        </div>
                        
                        <div style="background: #141414; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; border: 1px solid #2a2a2a;">
                          <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 6px;">Backup 6-Digit Reset OTP Code</span>
                          <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #e50914; letter-spacing: 6px;">${otp}</span>
                          <p style="margin: 10px 0 0; font-size: 11px; color: #888;">Valid for 15 minutes.</p>
                        </div>

                        <div style="background: #1e1e1e; padding: 16px; border-radius: 10px; border-left: 4px solid #e50914;">
                          <h4 style="margin: 0 0 6px; color: white; font-size: 13px;">Direct Reset Link URL:</h4>
                          <p style="margin: 0; word-break: break-all; font-size: 12px;"><a href="${resetUrl}" style="color: #e50914;">${resetUrl}</a></p>
                        </div>
                      </div>
                    </div>
                `
            });
            emailSent = true;
        } catch (mailErr) {
            console.error("Failed to deliver Password Reset email:", mailErr.message || mailErr);
        }

        ticket.status = "in_progress";
        ticket.adminNote = emailSent
            ? `Password reset link and OTP (${otp}) sent to ${ticket.email}.`
            : `Password reset link & OTP generated (${otp}) but email transport failed. Saved on ticket.`;
        await ticket.save();

        return res.json({
            success: true,
            message: emailSent
                ? `Password reset link & OTP emailed to ${ticket.email}!`
                : `Password reset link generated (${otp}), but email transport failed. Saved on ticket.`,
            otp,
            resetUrl,
            ticket
        });
    } catch (err) {
        next(err);
    }
};
