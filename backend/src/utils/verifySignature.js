import crypto from "crypto";
import razorpay from "../config/razorpay.js";

const verifySignature = (orderId, paymentId, signature) => {
    const secret = (process.env.RAZORPAY_KEY_SECRET || "JLDSoSsBUTrMmDYE5mmH20Ee").trim();
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return expectedSignature === signature;
};
export default verifySignature;