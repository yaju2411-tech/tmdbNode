import resend from "../config/resend.js";

export const sendPaymentEmail = async ({user,purchase,receipt,}) => {
    try {
        await resend.emails.send({
            from: "TMDB Movies <onboarding@resend.dev>",
            to: user.email,
            subject: `Payment Successful • ${purchase.title}`,
            html: `
                <h1>Payment Successful</h1>
                <p>Hello ${user.name},</p>
                <p>
                    Thank you for purchasing
                    <strong>${purchase.title}</strong>.
                </p>
                <p>
                    Receipt Number:
                    <strong>${receipt.receiptNumber}</strong>
                </p>
                <p>
                    Payment ID:
                    ${receipt.razorpayPaymentId}
                </p>
            `,
        });
    } catch (err) {
        throw err;
    }
};