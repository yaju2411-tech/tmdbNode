import Purchase from "../../models/Purchase.js";
import User from "../../models/User.js";
import AppError from "../../utils/appError.js";
import { broadcastEvent } from "../../config/socket.js";

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

        broadcastEvent("subscription_updated", { userId, subscription: user.subscription });
        broadcastEvent("user_updated", { userId });
        broadcastEvent("stats_updated", {});

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
