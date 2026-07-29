import crypto from "crypto";
import razorpay from "../config/razorpay.js";

const verifySignature = (orderId, paymentId, signature) => {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
    return expectedSignature === signature;
};
export default verifySignature;