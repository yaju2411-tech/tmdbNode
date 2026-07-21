import express from "express";
import { aiChat, submitTicket } from "../controllers/helpController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes — no auth required so locked-out users can access help
router.post("/ai-chat", aiChat);
router.post("/ticket", upload.array("proofImages", 5), submitTicket);

export default router;
