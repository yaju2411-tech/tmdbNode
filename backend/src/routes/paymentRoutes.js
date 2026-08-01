import express from "express";
import { createOrder } from "../controllers/payment/createOrder.js";
import { verifyPayment } from "../controllers/payment/verifyController.js";
import { getReceipt, getPaymentIdAndReceipt } from "../controllers/payment/getReceipt.js";
import { getPurchases, checkPurchase, updatePurchaseStatus } from "../controllers/payment/getPurchase.js";
import { verifyLivePaymentId, generateAndSendReceipt } from "../controllers/payment/receiptController.js";
import protect from "../middleware/authMiddlware.js";

const router = express.Router();

router.post("/create-order",protect,createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/receipt/:receiptNumber",protect,getReceipt);
router.get("/my-purchases",protect,getPurchases);
router.get("/check", protect, checkPurchase);
router.post("/update-status", protect, updatePurchaseStatus);
router.get("/payment-id", protect, getPaymentIdAndReceipt);
router.post("/verify-payment-id", protect, verifyLivePaymentId);
router.post("/generate-receipt", protect, generateAndSendReceipt);

export default router;