import User from "../../models/User.js";
import Purchase from "../../models/Purchase.js";
import HelpTicket from "../../models/HelpTicket.js";
import AppError from "../../utils/appError.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import axios from "axios";
import nodemailer from "nodemailer";
import Receipt from "../../models/Receipt.js";
import { reciptGenerator } from "../../utils/receiptNoGenerator.js";
import razorpay from "../../config/razorpay.js";
import { createTransporter } from "../../services/emailService.js";

// Fetch all admin profiles
export const getAdmins = async (req, res, next) => {
    try {
        const admins = await User.find({ role: "admin" }).select("-password");
        return res.json({
            success: true,
            admins,
        });
    } catch (err) {
        next(err);
    }
};

// Fetch regular users with search support
export const getUsers = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { role: "user" };

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { email: regex }
            ];
        }

        const users = await User.find(query).select("-password").sort({ createdAt: -1 });
        return res.json({
            success: true,
            users,
        });
    } catch (err) {
        next(err);
    }
};

// Fetch paginated purchase list with populated user information
export const getMoviePurchases = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const { search, type } = req.query;

        let match = {};
        if (type && type !== "all") {
            match.contentType = type;
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetail"
                }
            },
            { $unwind: "$userDetail" }
        ];

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            pipeline.push({
                $match: {
                    $or: [
                        { title: searchRegex },
                        { "userDetail.name": searchRegex },
                        { "userDetail.email": searchRegex }
                    ]
                }
            });
        }

        // Count query
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await Purchase.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Pagination and projection pipeline
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    id: "$_id",
                    user_name: { $ifNull: ["$userDetail.name", ""] },
                    user_email: { $ifNull: ["$userDetail.email", ""] },
                    avatar_url: { $ifNull: ["$userDetail.avatar.url", ""] },
                    movie_name: "$title",
                    movie_id: "$contentId",
                    content_type: "$contentType",
                    amount: 1,
                    status: {
                        $cond: {
                            if: { $eq: ["$status", "paid"] },
                            then: "success",
                            else: "$status"
                        }
                    },
                    created_at: "$createdAt",
                    order_id: "$razorpayOrderId",
                    payment_id: "$razorpayPaymentId",
                    poster_path: "$poster"
                }
            }
        );

        const rows = await Purchase.aggregate(pipeline);

        return res.json({
            success: true,
            rows,
            total
        });
    } catch (err) {
        next(err);
    }
};

// Fetch admin statistics and dynamic calculations
export const getStats = async (req, res, next) => {
    try {
        const { status, from, to, type } = req.query;
        let match = {};

        if (status) {
            match.status = status === "success" ? "paid" : status;
        }

        if (from || to) {
            match.createdAt = {};
            if (from) {
                match.createdAt.$gte = new Date(from);
            }
            if (to) {
                match.createdAt.$lte = new Date(to);
            }
        }

        if (type && type !== "all") {
            match.contentType = type;
        }

        const purchases = await Purchase.find(match);

        // Transform collection output to expected frontend format
        const table = purchases.map(p => ({
            id: p._id,
            amount: p.amount,
            user_id: p.user,
            content_type: p.contentType,
            status: p.status === "paid" ? "success" : p.status,
            created_at: p.createdAt,
            movie_name: p.title
        }));

        const successOrders = table.filter(p => p.status === "success").length;
        const pendingOrders = table.filter(p => p.status === "pending").length;
        const failedOrders = table.filter(p => p.status === "failed").length;

        const successData = table.filter(p => p.status === "success");
        const revenue = successData.reduce((s, p) => s + (p.amount || 0), 0);

        const users = new Set(successData.map(p => String(p.user_id))).size;

        const movieRevenue = successData
            .filter(p => p.content_type === "movie")
            .reduce((s, p) => s + (p.amount || 0), 0);

        const tvRevenue = successData
            .filter(p => p.content_type === "tv")
            .reduce((s, p) => s + (p.amount || 0), 0);

        const movieOrder = successData.filter(p => p.content_type === "movie").length;
        const tvOrder = successData.filter(p => p.content_type === "tv").length;

        const stats = {
            revenue,
            orders: successData.length,
            users,
            movieRevenue,
            tvRevenue,
            movieOrder,
            tvOrder,
            successOrders,
            pendingOrders,
            failedOrders,
        };

        return res.json({
            success: true,
            table,
            stats
        });
    } catch (err) {
        next(err);
    }
};

// Update user details by admin
export const updateUserByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const user = await User.findOne({ _id: id, role: "user" });
        if (!user) {
            return next(new AppError("User not found or not a regular user", 404));
        }

        if (name?.trim()) {
            user.name = name.trim();
        }
        if (email?.trim()) {
            const existingUser = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: id } });
            if (existingUser) {
                return next(new AppError("Email is already in use", 400));
            }
            user.email = email.trim().toLowerCase();
        }

        if (req.file) {
            if (user.avatar?.public_id) {
                try {
                    await cloudinary.uploader.destroy(user.avatar.public_id);
                } catch (e) {
                    console.error("Cloudinary error destroying old avatar:", e);
                }
            }
            const uploaded = await uploadToCloudinary(req.file.buffer, "tmdb/avatars");
            user.avatar = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            };
        }

        await user.save();

        return res.json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (err) {
        next(err);
    }
};

// Update admin profile details
export const updateAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const adminUser = await User.findOne({ _id: id, role: "admin" });
        if (!adminUser) {
            return next(new AppError("Admin not found", 404));
        }

        if (name?.trim()) {
            adminUser.name = name.trim();
        }
        if (email?.trim()) {
            const existingUser = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: id } });
            if (existingUser) {
                return next(new AppError("Email is already in use", 400));
            }
            adminUser.email = email.trim().toLowerCase();
        }

        if (req.file) {
            if (adminUser.avatar?.public_id) {
                try {
                    await cloudinary.uploader.destroy(adminUser.avatar.public_id);
                } catch (e) {
                    console.error("Cloudinary error destroying old avatar:", e);
                }
            }
            const uploaded = await uploadToCloudinary(req.file.buffer, "tmdb/avatars");
            adminUser.avatar = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            };
        }

        await adminUser.save();

        return res.json({
            success: true,
            message: "Admin profile updated successfully",
            admin: adminUser,
        });
    } catch (err) {
        next(err);
    }
};

// Delete user by admin
export const deleteUserByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ _id: id, role: "user" });
        if (!user) {
            return next(new AppError("User not found or not a regular user", 404));
        }

        if (user.avatar?.public_id) {
            try {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            } catch (e) {
                console.error("Cloudinary error destroying avatar:", e);
            }
        }

        await User.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

// Admin forces verification for a user by email
export const forceVerifyUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new AppError("Email is required", 400));
        }

        const user = await User.findOneAndUpdate(
            { email: email.trim().toLowerCase() },
            { isCaptchaVerified: true, isEmailVerified: true },
            { new: true }
        );

        if (!user) {
            return next(new AppError("User not found with that email", 404));
        }

        return res.json({
            success: true,
            message: "User forcibly verified successfully"
        });
    } catch (err) {
        next(err);
    }
};

// Help Tickets Management
export const getTickets = async (req, res, next) => {
    try {
        const rawTickets = await HelpTicket.find().sort({ createdAt: -1 });

        // Collect distinct emails and contentIds for batching
        const emails = [...new Set(rawTickets.map((t) => t.email ? t.email.trim().toLowerCase() : null).filter(Boolean))];
        const contentIds = [...new Set(rawTickets.map((t) => t.contentId ? Number(t.contentId) : null).filter((id) => id !== null && !isNaN(id)))];

        const users = emails.length > 0 ? await User.find({ email: { $in: emails } }).select("_id email") : [];
        const userMap = new Map(users.map((u) => [u.email.toLowerCase(), u._id.toString()]));
        const userIds = users.map((u) => u._id);

        const purchases = userIds.length > 0 && contentIds.length > 0
            ? await Purchase.find({ user: { $in: userIds }, contentId: { $in: contentIds } }).sort({ createdAt: -1 })
            : [];

        // Build purchase lookup map: "userId_contentId_contentType" => purchase
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

        return res.json({
            success: true,
            ticket,
            message: `Ticket status updated to '${status.replace("_", " ")}'`
        });
    } catch (err) {
        next(err);
    }
};

export const deleteTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await HelpTicket.findById(id);

        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        // Rule 1: Ticket MUST be in 'resolved' status before deleting
        if (ticket.status !== "resolved") {
            return next(new AppError("Cannot delete an unresolved ticket. Please first progress the ticket to 'Resolved' with a resolution note.", 400));
        }

        // Rule 2: Ticket MUST have a resolution note
        if (!ticket.adminNote || ticket.adminNote.trim().length < 5) {
            return next(new AppError("Cannot delete ticket without an admin resolution note explaining how the issue was solved.", 400));
        }

        await HelpTicket.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: "Ticket deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

export const grantManualAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { contentId, contentType } = req.body;

        if (!contentId || !contentType) {
            return next(new AppError("Content ID and Type are required.", 400));
        }

        if (!["movie", "tv"].includes(contentType)) {
            return next(new AppError("Invalid Content Type. Must be 'movie' or 'tv'.", 400));
        }

        const ticket = await HelpTicket.findById(id);
        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        const user = await User.findOne({ email: ticket.email.trim().toLowerCase() });
        if (!user) {
            return next(new AppError("User not found for this email.", 404));
        }

        // Fetch details from TMDB to construct the Purchase record
        const tmdbUrl = `https://api.themoviedb.org/3/${contentType}/${contentId}?api_key=${process.env.TMDB_API_KEY}`;
        
        let title, poster;
        try {
            const tmdbRes = await axios.get(tmdbUrl, { timeout: 10000 });
            title = tmdbRes.data.title || tmdbRes.data.name;
            poster = tmdbRes.data.poster_path;
        } catch (err) {
            return next(new AppError("Invalid TMDB ID or unable to fetch content details.", 400));
        }

        const receiptNo = reciptGenerator();
        let existingPurchase = await Purchase.findOne({ user: user._id, contentId, contentType });
        
        if (existingPurchase) {
            existingPurchase.status = "paid";
            // Replace dummy or missing payment ID with a receipt number if not valid
            if (!existingPurchase.razorpayPaymentId || !existingPurchase.razorpayPaymentId.startsWith("pay_")) {
                existingPurchase.razorpayPaymentId = receiptNo;
            }
            await existingPurchase.save();
        } else {
            existingPurchase = await Purchase.create({
                user: user._id,
                contentId,
                title,
                poster,
                contentType,
                amount: 0, // Granted for free
                razorpayOrderId: "MANUAL_GRANT_" + Date.now(),
                razorpayPaymentId: receiptNo,
                status: "paid"
            });
        }

        // Create Receipt so user can view/download proof of purchase
        const existingReceipt = await Receipt.findOne({ purchase: existingPurchase._id });
        if (!existingReceipt) {
            await Receipt.create({
                receiptNumber: receiptNo,
                purchase: existingPurchase._id,
                user: user._id,
                orderId: existingPurchase.razorpayOrderId,
                paymentId: existingPurchase.razorpayPaymentId,
                contentId: existingPurchase.contentId,
                title: existingPurchase.title,
                contentType: existingPurchase.contentType,
                amount: existingPurchase.amount,
                status: "paid"
            });
        }

        // Mark ticket as resolved
        ticket.status = "resolved";
        ticket.paymentId = existingPurchase.razorpayPaymentId;
        ticket.adminNote = `Manually granted access to ${title} (${contentId}). Receipt: ${existingPurchase.razorpayPaymentId}`;
        ticket.contentId = contentId;
        ticket.contentType = contentType;
        await ticket.save();

        return res.json({
            success: true,
            message: `Successfully granted access to ${title} and resolved ticket.`
        });
    } catch (err) {
        console.error("Grant Manual Access Error:", err);
        next(err);
    }
};

// Reset Payment (Start from Scratch)
export const resetPayment = async (req, res, next) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        const user = await User.findOne({ email: ticket.email.trim().toLowerCase() });
        if (!user) return next(new AppError("User not found for this email.", 404));

        if (!ticket.contentId || !ticket.contentType) {
            return next(new AppError("Ticket missing content info", 400));
        }

        const rawContentId = ticket.contentId;
        const numContentId = Number(rawContentId);
        const contentIdFilter = !isNaN(numContentId)
            ? { $in: [numContentId, String(rawContentId)] }
            : rawContentId;

        // Delete ALL non-paid purchase records (pending, failed, cancelled, etc.) for this user & content
        const deleteResult = await Purchase.deleteMany({
            user: user._id,
            contentId: contentIdFilter,
            contentType: ticket.contentType,
            status: { $ne: "paid" }
        });

        const count = deleteResult.deletedCount || 0;

        ticket.adminNote = count > 0 
            ? `Reset payment: Deleted ${count} non-paid purchase record(s) (pending/failed/cancelled). User can now retry with the blue Buy button.`
            : "Reset payment: No active non-paid purchase record found, state is ready for retry with blue Buy button.";

        ticket.status = "in_progress";
        await ticket.save();

        return res.json({
            success: true,
            message: `Payment reset successfully. Deleted ${count} record(s). User can now retry with the blue Buy button.`,
            deletedCount: count
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

// Send Email via Nodemailer
export const sendEmail = async (req, res, next) => {
    try {
        const { subject, body } = req.body;
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        await createTransporter().sendMail({
            from: `"TMDB Support" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
            to: ticket.email,
            subject: subject || `Update on your Ticket #${ticket.ticketId}`,
            text: body,
        });

        const emailLog = `[Email Sent]: ${body || ""}`;
        ticket.adminNote = ticket.adminNote
            ? `${ticket.adminNote}\n\n${emailLog}`
            : emailLog;
        await ticket.save();

        return res.json({ success: true, message: "Email sent successfully" });
    } catch (err) {
        console.error("Nodemailer Error:", err);
        next(new AppError("Failed to send email", 500));
    }
};

// Check live status of Order ID or Payment ID on Razorpay
export const checkRazorpayStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await HelpTicket.findById(id);
        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        const orderId = ticket.orderId && ticket.orderId !== "N/A" ? ticket.orderId : null;
        const paymentId = ticket.paymentId && ticket.paymentId !== "N/A" ? ticket.paymentId : null;

        if (!orderId && !paymentId) {
            return next(new AppError("No Order ID or Payment ID available on this ticket to verify with Razorpay.", 400));
        }

        let orderDetails = null;
        let orderPayments = [];
        let singlePayment = null;

        // 1. Fetch Order from Razorpay API
        if (orderId && orderId.startsWith("order_")) {
            try {
                orderDetails = await razorpay.orders.fetch(orderId);
                const paymentsRes = await razorpay.orders.fetchPayments(orderId);
                orderPayments = paymentsRes?.items || [];
            } catch (err) {
                console.error("Razorpay order fetch error:", err.message);
            }
        }

        // 2. Fetch Single Payment from Razorpay API if provided
        if (paymentId && paymentId.startsWith("pay_")) {
            try {
                singlePayment = await razorpay.payments.fetch(paymentId);
            } catch (err) {
                console.error("Razorpay payment fetch error:", err.message);
            }
        }

        // Determine Overall Verification Result
        const hasCapturedPayment = 
            orderPayments.some(p => p.status === "captured") ||
            (singlePayment && singlePayment.status === "captured") ||
            (orderDetails && orderDetails.status === "paid");

        return res.json({
            success: true,
            ticketId: ticket.ticketId,
            verification: {
                hasCapturedPayment,
                orderId,
                paymentId,
                orderDetails: orderDetails ? {
                    id: orderDetails.id,
                    amount: orderDetails.amount / 100,
                    amountPaid: orderDetails.amount_paid / 100,
                    status: orderDetails.status,
                    attempts: orderDetails.attempts,
                    createdAt: new Date(orderDetails.created_at * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                } : null,
                payments: orderPayments.map(p => ({
                    id: p.id,
                    amount: p.amount / 100,
                    status: p.status,
                    method: p.method,
                    email: p.email,
                    contact: p.contact,
                    errorDescription: p.error_description || null,
                    createdAt: new Date(p.created_at * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                })),
                singlePayment: singlePayment ? {
                    id: singlePayment.id,
                    amount: singlePayment.amount / 100,
                    status: singlePayment.status,
                    method: singlePayment.method,
                    email: singlePayment.email,
                    errorDescription: singlePayment.error_description || null,
                    createdAt: new Date(singlePayment.created_at * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                } : null,
            }
        });
    } catch (err) {
        next(err);
    }
};

// Admin manually grant/extend/cancel user subscription
export const updateUserSubscription = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status, plan, days = 30 } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + Number(days));

        user.subscription = {
            status: status || "active",
            plan: plan || "monthly",
            startDate: now,
            expiresAt,
            razorpayOrderId: "admin_manual_grant",
            razorpayPaymentId: "admin_manual_grant"
        };

        await user.save();

        return res.json({
            success: true,
            message: `User subscription updated successfully. Valid for ${days} days.`,
            subscription: user.subscription
        });
    } catch (err) {
        next(err);
    }
};

// Analytics Data for Recharts Dashboard
export const getSubscriptionAnalytics = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const now = new Date();

        const activeSubscribers = await User.countDocuments({
            "subscription.status": "active",
            "subscription.expiresAt": { $gt: now }
        });

        const expiredSubscribers = await User.countDocuments({
            $or: [
                { "subscription.status": "expired" },
                { "subscription.expiresAt": { $lte: now } }
            ]
        });

        const monthlyPlanCount = await User.countDocuments({ "subscription.plan": "monthly", "subscription.status": "active" });
        const quarterlyPlanCount = await User.countDocuments({ "subscription.plan": "quarterly", "subscription.status": "active" });
        const yearlyPlanCount = await User.countDocuments({ "subscription.plan": "yearly", "subscription.status": "active" });

        const purchases = await Purchase.find({ status: "paid" });

        const totalRevenue = purchases.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const planRevenueData = [
            { name: "Monthly (₹199)", value: monthlyPlanCount * 199, count: monthlyPlanCount },
            { name: "Quarterly (₹399)", value: quarterlyPlanCount * 399, count: quarterlyPlanCount },
            { name: "Yearly (₹1499)", value: yearlyPlanCount * 1499, count: yearlyPlanCount }
        ];

        const subscriberStatusData = [
            { name: "Active VIP", count: activeSubscribers },
            { name: "Expired / Free", count: totalUsers - activeSubscribers }
        ];

        return res.json({
            success: true,
            analytics: {
                totalUsers,
                activeSubscribers,
                expiredSubscribers,
                totalRevenue,
                planRevenueData,
                subscriberStatusData
            }
        });
    } catch (err) {
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

// Resend Fresh OTP from Admin Panel
export const resendUserOtpFromAdmin = async (req, res, next) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        const generateOTP = (await import("../../utils/generateOtp.js")).default;
        const { sendOTP } = await import("../../services/emailService.js");
        const PasswordReset = (await import("../../models/PasswordReset.js")).default;
        const bcrypt = (await import("bcryptjs")).default;

        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);

        await PasswordReset.findOneAndUpdate(
            { email: ticket.email.toLowerCase() },
            {
                email: ticket.email.toLowerCase(),
                otp: hashedOTP,
                otpExpires: new Date(Date.now() + 5 * 60 * 1000),
                lastOTPSent: new Date()
            },
            { upsert: true, new: true }
        );

        await sendOTP(ticket.email, otp);

        ticket.status = "in_progress";
        ticket.adminNote = `Fresh 6-digit OTP sent to ${ticket.email} by admin.`;
        await ticket.save();

        return res.json({
            success: true,
            message: `Fresh OTP (${otp}) generated and emailed to ${ticket.email}!`,
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

        const generateOTP = (await import("../../utils/generateOtp.js")).default;
        const { sendOTP } = await import("../../services/emailService.js");
        const PasswordReset = (await import("../../models/PasswordReset.js")).default;
        const bcrypt = (await import("bcryptjs")).default;

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

        await sendOTP(ticket.email, otp);

        ticket.status = "in_progress";
        ticket.adminNote = `Password reset instructions and verification OTP sent to ${ticket.email}.`;
        await ticket.save();

        return res.json({
            success: true,
            message: `Password reset OTP emailed to ${ticket.email}!`,
            ticket
        });
    } catch (err) {
        next(err);
    }
};
