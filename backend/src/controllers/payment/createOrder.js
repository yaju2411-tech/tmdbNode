import razorpay from "../../config/razorpay.js";
import AppError from "../../utils/appError.js";
import Purchase from "../../models/Purchase.js";

export const createOrder = async (req, res, next) => {
    try {
        const { plan = "monthly", contentId = 0, title, poster = "", contentType = "subscription", amount } = req.body;
        
        let planAmount = 199;
        let planTitle = "TMDB VIP Monthly Pass";

        if (plan === "monthly") {
            planAmount = 199;
            planTitle = "TMDB VIP Monthly Pass";
        } else if (plan === "quarterly") {
            planAmount = 399;
            planTitle = "TMDB VIP Quarterly Pass";
        } else if (plan === "yearly") {
            planAmount = 1499;
            planTitle = "TMDB VIP Annual Pass";
        } else if (amount) {
            planAmount = amount;
            planTitle = title || "TMDB VIP Subscription";
        }

        const order = await razorpay.orders.create({
            amount: planAmount * 100,
            currency: "INR",
            receipt: `sub_${Date.now()}`,
            notes: { userId: req.user._id.toString(), plan, title: planTitle, amount: planAmount }
        });

        // Save pending purchase / subscription order
        await Purchase.create({
            user: req.user._id,
            contentId: Number(contentId) || 0,
            title: planTitle,
            poster,
            contentType,
            plan,
            amount: planAmount,
            razorpayOrderId: order.id,
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        next(err);
    }
};