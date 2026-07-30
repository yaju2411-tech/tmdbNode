import { sendEmailMessage } from "./emailService.js";

export const sendPaymentEmail = async ({ user, purchase, receipt }) => {
  try {
    const isSubscription = purchase.contentType === "subscription";
    const title = purchase.title || (isSubscription ? "TMDB VIP Pass" : "Movie Access");

    await sendEmailMessage({
      to: user.email,
      subject: `🎉 Payment Successful • ${title}`,
      fromName: "TMDB Movies & VIP",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
          <div style="background: linear-gradient(135deg, #e50914 0%, #b00610 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: white;">🎉 Payment Successful!</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 15px;">Your TMDB VIP access is now active</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${user.name || "Subscriber"}</strong>,</p>
            <p style="color: #ccc; line-height: 1.6;">Thank you for your purchase! Your payment has been confirmed and verified.</p>
            
            <div style="background: #141414; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #2a2a2a;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #888;">Item / Plan:</td><td style="padding: 8px 0; font-weight: bold; color: #e50914;">${title}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; color: white;">₹${purchase.amount}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Receipt No:</td><td style="padding: 8px 0; font-family: monospace; color: #10b981;">${receipt.receiptNumber || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Order ID:</td><td style="padding: 8px 0; font-family: monospace; color: #aaa;">${purchase.razorpayOrderId || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Payment ID:</td><td style="padding: 8px 0; font-family: monospace; color: #aaa;">${receipt.razorpayPaymentId || 'N/A'}</td></tr>
              </table>
            </div>

            <p style="color: #aaa; font-size: 14px;">You can view and download your official PDF tax invoice anytime from the <strong>VIP Vault</strong> page on TMDB.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send payment success email:", err.message || err);
  }
};

export const sendPaymentFailedEmail = async ({ user, purchase, reason = "Payment cancelled or failed" }) => {
  try {
    const isSubscription = purchase.contentType === "subscription";
    const title = purchase.title || (isSubscription ? "TMDB VIP Pass" : "Movie Access");

    await sendEmailMessage({
      to: user.email,
      subject: `⚠️ Payment Pending or Cancelled • ${title}`,
      fromName: "TMDB Billing Support",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
          <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: white;">⚠️ Payment Status Update</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${reason}</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px;">Hi <strong>${user.name || "User"}</strong>,</p>
            <p style="color: #ccc; line-height: 1.6;">We noticed that your recent payment attempt for <strong>${title}</strong> was not completed or is currently pending.</p>
            
            <div style="background: #141414; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #2a2a2a;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #888;">Item / Plan:</td><td style="padding: 8px 0; font-weight: bold; color: #f59e0b;">${title}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Amount:</td><td style="padding: 8px 0; font-weight: bold; color: white;">₹${purchase.amount}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Order ID:</td><td style="padding: 8px 0; font-family: monospace; color: #f59e0b;">${purchase.razorpayOrderId || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Payment ID:</td><td style="padding: 8px 0; font-family: monospace; color: #aaa;">${purchase.razorpayPaymentId || 'Pending / N/A'}</td></tr>
              </table>
            </div>

            <div style="background: #1e1e1e; padding: 16px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
              <p style="margin: 0; color: #ddd; font-size: 13px;">
                <strong>Did your bank deduct money?</strong><br>
                Don't worry! Go to <a href="https://tmdb-node.vercel.app/app/help" style="color: #e50914; font-weight: bold;">Help Center</a> and submit a ticket using Order ID: <code>${purchase.razorpayOrderId}</code>. Our support team will verify and activate your access manually!
              </p>
            </div>

            <p style="color: #aaa; font-size: 13px;">You can also retry your payment anytime by clicking "Subscribe Now" on the TMDB website.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send payment failure email:", err.message || err);
  }
};