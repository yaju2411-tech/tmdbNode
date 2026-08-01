import Purchase from "../../models/Purchase.js";
import User from "../../models/User.js";
import HelpTicket from "../../models/HelpTicket.js";
import Receipt from "../../models/Receipt.js";
import AppError from "../../utils/appError.js";
import axios from "axios";
import razorpay from "../../config/razorpay.js";
import { reciptGenerator } from "../../utils/receiptNoGenerator.js";
import { sendReceiptEmailHelper } from "../payment/receiptController.js";

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

        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await Purchase.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    contentId: 1,
                    title: 1,
                    poster: 1,
                    contentType: 1,
                    amount: 1,
                    razorpayOrderId: 1,
                    razorpayPaymentId: 1,
                    status: 1,
                    createdAt: 1,
                    user: {
                        _id: "$userDetail._id",
                        name: "$userDetail.name",
                        email: "$userDetail.email",
                        avatar: "$userDetail.avatar"
                    }
                }
            }
        );

        const purchases = await Purchase.aggregate(pipeline);

        return res.json({
            success: true,
            purchases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

// Grant Manual Access / VIP Pass
export const grantManualAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { contentId, contentType: reqContentType, plan: reqPlan } = req.body;

        const ticket = await HelpTicket.findById(id);
        if (!ticket) {
            return next(new AppError("Ticket not found", 404));
        }

        const user = await User.findOne({ email: ticket.email.trim().toLowerCase() });
        if (!user) {
            return next(new AppError("User not found for this email.", 404));
        }

        const contentType = reqContentType || ticket.contentType || "subscription";
        const plan = reqPlan || ticket.plan || "monthly";
        const receiptNo = reciptGenerator();

        let title, poster, amount, startDate, expiresAt;

        if (contentType === "subscription" || plan) {
            const numPlan = plan || "monthly";
            amount = ticket.amount || (numPlan === "yearly" ? 1499 : numPlan === "quarterly" ? 399 : 199);
            title = numPlan === "yearly" ? "TMDB VIP Annual Pass" : numPlan === "quarterly" ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass";
            poster = "";
            startDate = new Date();
            expiresAt = new Date();
            if (numPlan === "yearly") expiresAt.setDate(expiresAt.getDate() + 365);
            else if (numPlan === "quarterly") expiresAt.setDate(expiresAt.getDate() + 90);
            else expiresAt.setDate(expiresAt.getDate() + 30);
        } else {
            if (!["movie", "tv"].includes(contentType)) {
                return next(new AppError("Invalid Content Type. Must be 'movie', 'tv', or 'subscription'.", 400));
            }
            const tmdbUrl = `https://api.themoviedb.org/3/${contentType}/${contentId}?api_key=${process.env.TMDB_API_KEY}`;
            try {
                const tmdbRes = await axios.get(tmdbUrl, { timeout: 10000 });
                title = tmdbRes.data.title || tmdbRes.data.name;
                poster = tmdbRes.data.poster_path;
            } catch (err) {
                return next(new AppError("Invalid TMDB ID or unable to fetch content details.", 400));
            }
            amount = 0;
            startDate = new Date();
            expiresAt = null;
        }

        let existingPurchase = await Purchase.findOne({
            user: user._id,
            ...(contentType === "subscription" ? { contentType: "subscription" } : { contentId, contentType })
        });

        if (existingPurchase) {
            existingPurchase.status = "paid";
            existingPurchase.plan = plan || existingPurchase.plan || "monthly";
            existingPurchase.startDate = startDate;
            existingPurchase.expiresAt = expiresAt;
            if (!existingPurchase.razorpayPaymentId || !existingPurchase.razorpayPaymentId.startsWith("pay_")) {
                existingPurchase.razorpayPaymentId = receiptNo;
            }
            await existingPurchase.save();
        } else {
            existingPurchase = await Purchase.create({
                user: user._id,
                contentId: contentType === "subscription" ? 0 : Number(contentId || 0),
                title,
                poster,
                contentType,
                plan: contentType === "subscription" ? plan : undefined,
                startDate,
                expiresAt,
                amount,
                razorpayOrderId: "MANUAL_GRANT_" + Date.now(),
                razorpayPaymentId: receiptNo,
                status: "paid"
            });
        }

        if (contentType === "subscription") {
            user.subscription = {
                status: "active",
                plan,
                startDate,
                expiresAt,
                razorpayOrderId: existingPurchase.razorpayOrderId,
                razorpayPaymentId: existingPurchase.razorpayPaymentId
            };
            await user.save();
        }

        let existingReceipt = await Receipt.findOne({ purchase: existingPurchase._id });
        if (!existingReceipt) {
            existingReceipt = await Receipt.create({
                receiptNumber: receiptNo,
                purchase: existingPurchase._id,
                user: user._id,
                razorpayOrderId: existingPurchase.razorpayOrderId,
                razorpayPaymentId: existingPurchase.razorpayPaymentId,
                contentId: existingPurchase.contentId,
                title: existingPurchase.title,
                contentType: existingPurchase.contentType,
                amount: existingPurchase.amount,
                status: "paid"
            });
        }

        ticket.status = "resolved";
        ticket.paymentId = existingPurchase.razorpayPaymentId;
        ticket.receiptId = existingReceipt.receiptNumber;
        ticket.adminNote = `Manually granted access to ${title}. Receipt: ${existingReceipt.receiptNumber}`;
        ticket.contentId = String(existingPurchase.contentId);
        ticket.contentType = existingPurchase.contentType;
        await ticket.save();

        try {
            await sendReceiptEmailHelper({ user, receipt: existingReceipt });
        } catch (pdfErr) {
            console.error("Failed to email receipt PDF:", pdfErr);
        }

        return res.json({
            success: true,
            message: `Successfully granted manual access to ${title} and resolved ticket!`,
            receiptNumber: existingReceipt.receiptNumber
        });
    } catch (err) {
        console.error("Grant Manual Access Error:", err);
        next(err);
    }
};

// Reset Payment
export const resetPayment = async (req, res, next) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        const user = await User.findOne({ email: ticket.email.trim().toLowerCase() });
        if (!user) return next(new AppError("User not found for this email.", 404));

        const contentType = ticket.contentType || "subscription";
        let queryFilter = { user: user._id, status: { $ne: "paid" } };

        if (contentType === "subscription" || ticket.category === "payment_deducted") {
            queryFilter.$or = [
                { contentType: "subscription" },
                { contentId: 0 }
            ];
        } else if (ticket.contentId) {
            const rawContentId = ticket.contentId;
            const numContentId = Number(rawContentId);
            queryFilter.contentId = !isNaN(numContentId) ? { $in: [numContentId, String(rawContentId)] } : rawContentId;
            queryFilter.contentType = contentType;
        }

        const deleteResult = await Purchase.deleteMany(queryFilter);
        const count = deleteResult.deletedCount || 0;

        if (user.subscription && user.subscription.status !== "active") {
            user.subscription.status = "none";
            user.subscription.plan = "none";
            await user.save();
        }

        ticket.adminNote = count > 0
            ? `Reset payment: Deleted ${count} non-paid purchase record(s). User can now retry purchasing.`
            : "Reset payment: No active non-paid purchase record found, state cleared for retry.";

        ticket.status = "in_progress";
        await ticket.save();

        return res.json({
            success: true,
            message: `Payment reset successfully. Deleted ${count} record(s). User can now retry.`,
            deletedCount: count
        });
    } catch (err) {
        next(err);
    }
};

// Check live status of Order ID or Payment ID on Razorpay
export const checkRazorpayStatus = async (req, res, next) => {
    try {
        const ticket = await HelpTicket.findById(req.params.id);
        if (!ticket) return next(new AppError("Ticket not found", 404));

        const searchId = ticket.paymentId || ticket.orderId || ticket.receiptId;
        if (!searchId || searchId === "N/A") {
            return next(new AppError("No Payment ID or Order ID provided in ticket", 400));
        }

        let isOrder = searchId.startsWith("order_");
        let isPayment = searchId.startsWith("pay_");

        let singlePayment = null;
        let orderDetails = null;

        if (isPayment) {
            try {
                singlePayment = await razorpay.payments.fetch(searchId);
            } catch (pErr) {
                console.warn("Razorpay Payment Fetch Warning:", pErr.message);
            }
        } else if (isOrder) {
            try {
                orderDetails = await razorpay.orders.fetch(searchId);
                const payments = await razorpay.orders.fetchPayments(searchId);
                if (payments && payments.items && payments.items.length > 0) {
                    singlePayment = payments.items[0];
                }
            } catch (oErr) {
                console.warn("Razorpay Order Fetch Warning:", oErr.message);
            }
        }

        return res.json({
            success: true,
            searchId,
            liveData: {
                found: !!(singlePayment || orderDetails),
                status: singlePayment?.status || orderDetails?.status || "unknown",
                amount: singlePayment ? singlePayment.amount / 100 : (orderDetails ? orderDetails.amount / 100 : 0),
                currency: singlePayment?.currency || orderDetails?.currency || "INR",
                method: singlePayment?.method || "N/A",
                email: singlePayment?.email || ticket.email,
                contact: singlePayment?.contact || "N/A",
                paymentId: singlePayment?.id || null,
                orderId: orderDetails?.id || singlePayment?.order_id || null,
                errorDescription: singlePayment?.error_description || null,
                payment: singlePayment ? {
                    id: singlePayment.id,
                    status: singlePayment.status,
                    method: singlePayment.method,
                    bank: singlePayment.bank || singlePayment.wallet || singlePayment.vpa || "N/A",
                    createdAt: new Date(singlePayment.created_at * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                } : null,
            }
        });
    } catch (err) {
        next(err);
    }
};
