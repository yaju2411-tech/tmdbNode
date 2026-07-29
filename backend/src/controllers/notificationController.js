import Notification from "../models/Notification.js";

// Get latest 10 notifications for authenticated user
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ created_at: -1 })
            .limit(10);
        return res.json({
            success: true,
            notifications
        });
    } catch (err) {
        next(err);
    }
};

// Mark all notifications as read for authenticated user
export const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, is_read: false },
            { is_read: true }
        );
        return res.json({
            success: true,
            message: "All notifications marked as read."
        });
    } catch (err) {
        next(err);
    }
};
