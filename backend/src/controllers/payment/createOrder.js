import razorpay from "../../config/razorpay.js";
import AppError from "../../utils/appError.js";
import Purchase from "../../models/Purchase.js";

export const createOrder = async (req, res, next) => {
    try {
        const {contentId,title,poster,contentType,amount} = req.body;
        if (!contentId || !title || !contentType || !amount) {
            return next(new AppError("Missing fields",400));
        }

        // Check if content is already purchased
        const existing = await Purchase.findOne({
            user: req.user._id,
            contentId: Number(contentId),
            contentType: contentType
        });

        if (existing && existing.status === "paid") {
            return next(new AppError("You already purchased this content.", 409));
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `order_${Date.now()}`,
            notes: {userId: req.user._id.toString(),contentId,title,poster,contentType,amount}
        });

        // Save/Update pending purchase in database
        await Purchase.findOneAndUpdate(
            {
                user: req.user._id,
                contentId: Number(contentId),
                contentType: contentType
            },
            {
                user: req.user._id,
                contentId: Number(contentId),
                title,
                poster,
                contentType,
                amount,
                razorpayOrderId: order.id,
                status: "pending"
            },
            { upsert: true, new: true }
        );

        return res.status(201).json({
            success:true,order
        });
    } catch (err) {
        next(err);
    }
};