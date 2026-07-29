import express from "express";
import rateLimit from "express-rate-limit";
import { aiChat, submitTicket } from "../controllers/helpController.js";
import upload from "../middleware/upload.js";
import { optionalProtect } from "../middleware/authMiddlware.js";

const router = express.Router();

// Rate limiters for public endpoints
const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 AI chat requests per 15 minutes
  message: {
    success: false,
    message: "Too many AI chat requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const ticketSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 ticket submissions per 15 minutes
  message: {
    success: false,
    message: "Too many ticket submission attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes — protected by rate limiters
router.post("/ai-chat", aiChatLimiter, aiChat);
router.post("/ticket", ticketSubmitLimiter, optionalProtect, upload.array("proofImages", 5), submitTicket);

export default router;
