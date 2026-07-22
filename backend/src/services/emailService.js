import nodemailer from "nodemailer";

const port = Number(process.env.EMAIL_PORT) || 587;
const secure = port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"TMDB" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your TMDB account",

    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>TMDB Verification</h2>

        <p>Your OTP is</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });
};

export const sendTicketConfirmation = async (email, ticket) => {
  const categoryLabels = {
    cant_login: "Can't Login",
    otp_issues: "OTP Not Received / Expired",
    google_signin: "Google Sign-in Issue",
    payment_deducted: "Payment Deducted but Content Locked",
    content_not_showing: "Purchased Content Not Showing",
    account_locked: "Account Locked",
    email_not_verified: "Email Not Verified",
    password_reset: "Password Reset Issue",
    other: "Other",
  };

  await transporter.sendMail({
    from: `"TMDB Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `[${ticket.ticketId}] We received your support request — TMDB`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f1f1f1; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e50914 0%, #b00610 100%); padding: 32px 40px;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: white;">TMDB Support</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Your request has been received</p>
        </div>
        <div style="padding: 32px 40px;">
          <p style="font-size: 16px; color: #e0e0e0;">Hi <strong>${ticket.name}</strong>,</p>
          <p style="color: #aaa; font-size: 15px; line-height: 1.6;">We've received your support ticket and our team will review it shortly. Here's a summary of your request:</p>

          <div style="background: #1a1a1a; border-radius: 10px; padding: 20px 24px; margin: 24px 0; border: 1px solid #2a2a2a;">
            <table style="width:100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #777; font-size: 13px; width: 40%;">Ticket ID</td>
                <td style="padding: 8px 0; color: #e50914; font-weight: 700; font-size: 15px;">${ticket.ticketId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #777; font-size: 13px;">Category</td>
                <td style="padding: 8px 0; color: #f1f1f1; font-size: 14px;">${categoryLabels[ticket.category] || ticket.category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #777; font-size: 13px; vertical-align: top;">Description</td>
                <td style="padding: 8px 0; color: #f1f1f1; font-size: 14px; line-height: 1.5;">${ticket.description}</td>
              </tr>
            </table>
          </div>

          <p style="color: #aaa; font-size: 14px; line-height: 1.6;">While you wait, you can also try our <strong style="color:#e50914;">AI Assistant</strong> on the Help Center page for instant answers.</p>

          <p style="color: #555; font-size: 13px; margin-top: 32px; border-top: 1px solid #222; padding-top: 16px;">If you did not submit this ticket, please ignore this email.<br>— TMDB Support Team</p>
        </div>
      </div>
    `,
  });
};

export const sendAdminTicketAlert = async (ticket) => {
  const categoryLabels = {
    cant_login: "Can't Login",
    otp_issues: "OTP Not Received / Expired",
    google_signin: "Google Sign-in Issue",
    payment_deducted: "Payment Deducted but Content Locked",
    content_not_showing: "Purchased Content Not Showing",
    account_locked: "Account Locked",
    email_not_verified: "Email Not Verified",
    password_reset: "Password Reset Issue",
    other: "Other",
  };

  await transporter.sendMail({
    from: `"TMDB Alerts" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🆕 New Support Ticket [${ticket.ticketId}] — ${categoryLabels[ticket.category] || ticket.category}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #f1f1f1; border-radius: 12px; overflow: hidden; border: 1px solid #222;">
        <div style="background: #1a1a1a; padding: 24px 32px; border-bottom: 1px solid #333;">
          <h2 style="margin: 0; color: #e50914; font-size: 20px;">New Support Ticket</h2>
          <p style="color: #666; font-size: 13px; margin: 6px 0 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
        <div style="padding: 24px 32px;">
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:10px 0;color:#666;font-size:13px;width:35%;">Ticket ID</td><td style="padding:10px 0;color:#e50914;font-weight:700;">${ticket.ticketId}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;">From</td><td style="padding:10px 0;color:#f1f1f1;">${ticket.name} &lt;${ticket.email}&gt;</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;">Category</td><td style="padding:10px 0;color:#f1f1f1;">${categoryLabels[ticket.category] || ticket.category}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;vertical-align:top;">Description</td><td style="padding:10px 0;color:#f1f1f1;line-height:1.6;">${ticket.description}</td></tr>
          </table>
          <div style="margin-top:24px;padding:12px 16px;background:#1e1e1e;border-radius:8px;border-left:3px solid #e50914;">
            <p style="margin:0;color:#aaa;font-size:13px;">Go to <strong style="color:white;">Admin Panel → Users</strong> to search for this user and take action.</p>
          </div>
        </div>
      </div>
    `,
  });
};