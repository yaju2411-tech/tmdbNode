import User from "../../models/User.js";
import Purchase from "../../models/Purchase.js";
import HelpTicket from "../../models/HelpTicket.js";
import AppError from "../../utils/appError.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import axios from "axios";
import nodemailer from "nodemailer";

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
        const tickets = await HelpTicket.find().sort({ createdAt: -1 });
        return res.json({
            success: true,
            tickets
        });
    } catch (err) {
        console.error("getTickets Error:", err);
        return res.status(500).json({ success: false, message: err.message, error: err.stack });
    }
};

export const updateTicketStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (status === "resolved" && !adminNote) {
            return res.status(400).json({ success: false, message: "An admin note is required to resolve a ticket." });
        }

        const updateData = { status };
        if (adminNote !== undefined) {
            updateData.adminNote = adminNote;
        }

        const ticket = await HelpTicket.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        return res.json({
            success: true,
            ticket,
            message: "Ticket status updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

export const deleteTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await HelpTicket.findByIdAndDelete(id);

        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

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
            return res.status(400).json({ success: false, message: "Content ID and Type are required." });
        }

        const ticket = await HelpTicket.findById(id);
        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        const user = await User.findOne({ email: ticket.email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found for this email." });
        }

        // Fetch details from TMDB to construct the Purchase record
        const tmdbUrl = `https://api.themoviedb.org/3/${contentType}/${contentId}?api_key=${process.env.TMDB_API_KEY}`;
        
        let title, poster;
        try {
            const tmdbRes = await axios.get(tmdbUrl);
            title = tmdbRes.data.title || tmdbRes.data.name;
            poster = tmdbRes.data.poster_path;
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid TMDB ID or unable to fetch content details." });
        }

        // Create the purchase record
        const existingPurchase = await Purchase.findOne({ user: user._id, contentId, contentType });
        
        if (!existingPurchase) {
            await Purchase.create({
                user: user._id,
                contentId,
                title,
                poster,
                contentType,
                amount: 0,
                razorpayOrderId: "MANUAL_GRANT_" + Date.now(),
                razorpayPaymentId: ticket.paymentId || "MANUAL_GRANT",
                status: "paid"
            });
        }

        // Mark ticket as resolved
        ticket.status = "resolved";
        ticket.adminNote = `Manually granted access to ${title} (${contentId}).`;
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

        const user = await User.findOne({ email: ticket.email });
        if (!user) return res.status(404).json({ success: false, message: "User not found for this email." });

        if (!ticket.contentId || !ticket.contentType) {
            return next(new AppError("Ticket missing content info", 400));
        }

        const deleted = await Purchase.findOneAndDelete({
            user: user._id,
            contentId: Number(ticket.contentId),
            contentType: ticket.contentType,
            status: "pending"
        });

        // Even if no pending purchase was found, the user is still free to retry!
        ticket.adminNote = deleted 
            ? "Pending payment deleted so user can retry from scratch."
            : "No pending payment blocked the user, but ticket marked ready for retry.";

        ticket.status = "in_progress";
        await ticket.save();

        return res.json({
            success: true,
            message: "Pending purchase deleted. User can now retry."
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

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"TMDB Support" <${process.env.EMAIL_USER}>`,
            to: ticket.email,
            subject: subject || `Update on your Ticket #${ticket.ticketId}`,
            text: body,
        });

        ticket.adminNote = `Email sent to user: \n${body}`;
        await ticket.save();

        return res.json({ success: true, message: "Email sent successfully" });
    } catch (err) {
        console.error("Nodemailer Error:", err);
        next(new AppError("Failed to send email", 500));
    }
};
