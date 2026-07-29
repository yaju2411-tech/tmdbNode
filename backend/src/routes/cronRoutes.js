import express from "express";
import { checkPendingPayments } from "../controllers/cronController.js";

const router = express.Router();

// Reconciliation endpoint for scheduled cron execution
router.get("/check-pending", checkPendingPayments);

export default router;
