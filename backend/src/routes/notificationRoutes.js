import express from "express";
import { getNotifications, markAllRead } from "../controllers/notificationController.js";
import protect from "../middleware/authMiddlware.js";

const router = express.Router();

// Secure all notification routes
router.use(protect);

router.get("/", getNotifications);
router.put("/mark-read", markAllRead);

export default router;
