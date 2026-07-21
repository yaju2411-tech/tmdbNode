import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPaymentEmail = async ({user,purchase,receipt,}) => {
    try {
        await transporter.sendMail({
            from: `"TMDB Movies" <${process.env.EMAIL_USER}>`,
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

export const sendPaymentFailedEmail = async ({ user, purchase }) => {
    try {
        await transporter.sendMail({
            from: `"TMDB Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Payment Failed • ${purchase.title}`,
            html: `
                <h1>Payment Failed or Cancelled</h1>
                <p>Hello ${user.name},</p>
                <p>We noticed an issue with your recent payment for <strong>${purchase.title}</strong>.</p>
                <p>If your money was deducted but the content is locked, please submit a Help Ticket on our website and provide these details:</p>
                <ul>
                    <li><strong>Content Name:</strong> ${purchase.title}</li>
                    <li><strong>Content ID:</strong> ${purchase.contentId}</li>
                    <li><strong>Order ID:</strong> ${purchase.razorpayOrderId}</li>
                    <li><strong>Payment ID:</strong> ${purchase.razorpayPaymentId || 'N/A'}</li>
                </ul>
                <p>Please take a screenshot of this email or your bank statement to upload as proof.</p>
            `,
        });
    } catch (err) {
        console.error("Failed to send payment failure email", err);
    }
};