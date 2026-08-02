import Watchlist from "../models/Watchlist.js";
import AppError from "../utils/appError.js";
import { broadcastEvent } from "../config/socket.js";

// Fetch all watchlist items for the current user
export const getWatchlist = async (req, res, next) => {
    try {
        const items = await Watchlist.find({ user: req.user._id }).sort({ created_at: -1 });
        return res.json(items);
    } catch (err) {
        next(err);
    }
};

// Add a movie or TV show to the user's watchlist
export const addToWatchlist = async (req, res, next) => {
    try {
        const { media_id, media_type, title, poster_path } = req.body;
        if (!media_id || !media_type) {
            return next(new AppError("media_id and media_type are required", 400));
        }

        // Check if already watchlisted
        const existing = await Watchlist.findOne({
            user: req.user._id,
            media_id: Number(media_id),
            media_type
        });

        if (existing) {
            return res.json({ success: true, message: "Already watchlisted", item: existing });
        }

        const item = await Watchlist.create({
            user: req.user._id,
            media_id: Number(media_id),
            media_type,
            title,
            poster_path
        });

        broadcastEvent("watchlist_updated", { userId: req.user._id });

        return res.status(201).json({ success: true, item });
    } catch (err) {
        next(err);
    }
};

// Remove a movie or TV show from the user's watchlist
export const removeFromWatchlist = async (req, res, next) => {
    try {
        const { media_id, media_type } = req.params;
        if (!media_id || !media_type) {
            return next(new AppError("media_id and media_type are required", 400));
        }

        await Watchlist.deleteOne({
            user: req.user._id,
            media_id: Number(media_id),
            media_type
        });

        broadcastEvent("watchlist_updated", { userId: req.user._id });

        return res.json({ success: true, message: "Removed from watchlist successfully" });
    } catch (err) {
        next(err);
    }
};
