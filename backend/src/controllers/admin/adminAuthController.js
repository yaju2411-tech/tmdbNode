import User from "../../models/User.js";
import AppError from "../../utils/appError.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import { broadcastEvent } from "../../config/socket.js";

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

        broadcastEvent("user_updated", { user });
        broadcastEvent("stats_updated", {});

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

        broadcastEvent("user_updated", { user: adminUser });
        broadcastEvent("stats_updated", {});

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

        broadcastEvent("user_updated", { userId: id, deleted: true });
        broadcastEvent("stats_updated", {});

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

        broadcastEvent("user_updated", { user });
        broadcastEvent("stats_updated", {});

        return res.json({
            success: true,
            message: "User forcibly verified successfully"
        });
    } catch (err) {
        next(err);
    }
};
