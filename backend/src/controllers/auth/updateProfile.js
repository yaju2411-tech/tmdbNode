import User from "../../models/User.js";
import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import AppError from "../../utils/appError.js";
import { broadcastEvent } from "../../config/socket.js";

export const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError("User not found",404));
        }
        if (name?.trim()) {
            user.name = name.trim();
        }
        if (req.file) {
            if (user.avatar?.public_id) {
                await cloudinary.uploader.destroy(
                    user.avatar.public_id
                );
            }
            const uploaded = await uploadToCloudinary(req.file.buffer,"tmdb/avatars");
            user.avatar = {
                url: uploaded.secure_url,
                public_id: uploaded.public_id,
            };
        }
        await user.save();

        broadcastEvent("user_updated", { user });

        return res.json({
            success:true,
            message:"Profile updated successfully.",
            user,
        });
    } catch(err){
        next(err);
    }
};