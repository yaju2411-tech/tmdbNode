import express from "express";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../controllers/watchlistController.js";
import protect from "../middleware/authMiddlware.js";

const router = express.Router();

// Secure watchlist routes
router.use(protect);

router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.delete("/:media_id/:media_type", removeFromWatchlist);

export default router;
