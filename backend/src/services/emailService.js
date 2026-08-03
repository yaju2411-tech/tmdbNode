import nodemailer from "nodemailer";
import axios from "axios";

export const createTransporter = async () => {
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN || process.env.OAUTH_REFRESH_TOKEN || process.env.REFRESH_TOKEN;
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET;
  
  if (refreshToken) {
    let accessToken = "";
    try {
      accessToken = await getGoogleAccessToken();
    } catch (e) {
      console.warn("Could not pre-fetch Google Access Token:", e.message);
    }

    return nodemailer.createTransport({
      service: "gmail",
      family: 4, // Force IPv4 to fix ENETUNREACH IPv6 connection failure on Render
      auth: {
        type: "OAuth2",
        user: emailUser,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
    });
  }

  const port = Number(process.env.EMAIL_PORT) || 587;
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure,
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// Helper to get fresh access token using refresh token from Google OAuth2
const getGoogleAccessToken = async () => {
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN || process.env.OAUTH_REFRESH_TOKEN || process.env.REFRESH_TOKEN;
  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials");
  }

  const res = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  return res.data.access_token;
};

// Send email using official Gmail REST API over HTTPS Port 443 (100% bypasses Render SMTP port blocking!)
const sendViaGmailRestApi = async ({ to, subject, html, fromName = "TMDB Support" }) => {
  const senderEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || "yaju2411@gmail.com";
  const accessToken = await getGoogleAccessToken();

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `From: "${fromName}" <${senderEmail}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    html,
  ];
  const message = messageParts.join("\r\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await axios.post(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    { raw: encodedMessage },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  console.log("🎉 Email delivered successfully via Gmail REST API (Port 443):", res.data.id);
  return res.data;
};

export const sendEmailMessage = async ({ to, subject, html, attachments, fromName = "TMDB Support" }) => {
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN || process.env.OAUTH_REFRESH_TOKEN || process.env.REFRESH_TOKEN;
  const senderEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || "yaju2411@gmail.com";

  // 1. Try Gmail REST API over HTTPS Port 443 if GMAIL_REFRESH_TOKEN is set and no attachments
  if (refreshToken && (!attachments || attachments.length === 0)) {
    try {
      return await sendViaGmailRestApi({ to, subject, html, fromName });
    } catch (gmailErr) {
      console.error("Gmail REST API error, falling back to Nodemailer:", gmailErr.response?.data || gmailErr.message);
    }
  }

  // 2. Fallback to Nodemailer Transporter
  try {
    const transporter = await createTransporter();
    const mailOptions = {
      from: `"${fromName}" <${senderEmail}>`,
      to,
      subject,
      html,
    };
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log("Email delivered via Nodemailer:", info.messageId);
    return info;
  } catch (mailErr) {
    console.error("Nodemailer Transport Error Details:", {
      message: mailErr.message,
      code: mailErr.code,
      command: mailErr.command,
      response: mailErr.response,
    });
    throw mailErr;
  }
};

const CATEGORY_LABELS = {
  cant_login: "Can't Login",
  google_signin: "Google Sign-in Issue",
  payment_deducted: "Payment Deducted but Content Locked",
  content_not_showing: "Purchased Content Not Showing",
  account_locked: "Account Locked",
  email_not_verified: "Email Not Verified",
  password_reset: "Password Reset Issue",
  other: "Other",
};

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const sendOTP = async (email, otp) => {
  try {
    await sendEmailMessage({
      to: email,
      subject: "Verify your TMDB account",
      fromName: "TMDB",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>TMDB Verification</h2>
          <p>Your OTP is</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("sendOTP Error:", err.message || err);
    throw err;
  }
};

export const sendTicketConfirmation = async (email, ticket) => {
  try {
    const safeName = escapeHtml(ticket.name);
    const safeDescription = escapeHtml(ticket.description);
    const categoryLabel = CATEGORY_LABELS[ticket.category] || "Other";
    const safeCategoryLabel = escapeHtml(categoryLabel);

    await sendEmailMessage({
      to: email,
      subject: `[${ticket.ticketId}] We received your support request — TMDB`,
      fromName: "TMDB Support",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f1f1f1; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e50914 0%, #b00610 100%); padding: 32px 40px;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: white;">TMDB Support</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Your request has been received</p>
          </div>
          <div style="padding: 32px 40px;">
            <p style="font-size: 16px; color: #e0e0e0;">Hi <strong>${safeName}</strong>,</p>
            <p style="color: #aaa; font-size: 15px; line-height: 1.6;">We've received your support ticket and our team will review it shortly. Here's a summary of your request:</p>

            <div style="background: #1a1a1a; border-radius: 10px; padding: 20px 24px; margin: 24px 0; border: 1px solid #2a2a2a;">
              <table style="width:100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #777; font-size: 13px; width: 40%;">Ticket ID</td>
                  <td style="padding: 8px 0; color: #e50914; font-weight: 700; font-size: 15px;">${ticket.ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #777; font-size: 13px;">Category</td>
                  <td style="padding: 8px 0; color: #f1f1f1; font-size: 14px;">${safeCategoryLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #777; font-size: 13px; vertical-align: top;">Description</td>
                  <td style="padding: 8px 0; color: #f1f1f1; font-size: 14px; line-height: 1.5;">${safeDescription}</td>
                </tr>
              </table>
            </div>

            <p style="color: #aaa; font-size: 14px; line-height: 1.6;">While you wait, you can also try our <strong style="color:#e50914;">AI Assistant</strong> on the Help Center page for instant answers.</p>

            <p style="color: #555; font-size: 13px; margin-top: 32px; border-top: 1px solid #222; padding-top: 16px;">If you did not submit this ticket, please ignore this email.<br>— TMDB Support Team</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("sendTicketConfirmation Error:", err.message || err);
  }
};

export const sendAdminTicketAlert = async (ticket) => {
  try {
    const safeName = escapeHtml(ticket.name);
    const safeEmail = escapeHtml(ticket.email);
    const safeDescription = escapeHtml(ticket.description);
    const categoryLabel = CATEGORY_LABELS[ticket.category] || "Other";
    const safeCategoryLabel = escapeHtml(categoryLabel);

    await sendEmailMessage({
      to: process.env.EMAIL_USER || process.env.GMAIL_USER,
      subject: `🆕 New Support Ticket [${ticket.ticketId}] — ${categoryLabel}`,
      fromName: "TMDB Alerts",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #f1f1f1; border-radius: 12px; overflow: hidden; border: 1px solid #222;">
          <div style="background: #1a1a1a; padding: 24px 32px; border-bottom: 1px solid #333;">
            <h2 style="margin: 0; color: #e50914; font-size: 20px;">New Support Ticket</h2>
            <p style="color: #666; font-size: 13px; margin: 6px 0 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          <div style="padding: 24px 32px;">
            <table style="width:100%; border-collapse: collapse;">
              <tr><td style="padding:10px 0;color:#666;font-size:13px;width:35%;">Ticket ID</td><td style="padding:10px 0;color:#e50914;font-weight:700;">${ticket.ticketId}</td></tr>
              <tr><td style="padding:10px 0;color:#666;font-size:13px;">From</td><td style="padding:10px 0;color:#f1f1f1;">${safeName} &lt;${safeEmail}&gt;</td></tr>
              <tr><td style="padding:10px 0;color:#666;font-size:13px;">Category</td><td style="padding:10px 0;color:#f1f1f1;">${safeCategoryLabel}</td></tr>
              <tr><td style="padding:10px 0;color:#666;font-size:13px;vertical-align:top;">Description</td><td style="padding:10px 0;color:#f1f1f1;line-height:1.6;">${safeDescription}</td></tr>
            </table>
            <div style="margin-top:24px;padding:12px 16px;background:#1e1e1e;border-radius:8px;border-left:3px solid #e50914;">
              <p style="margin:0;color:#aaa;font-size:13px;">Go to <strong style="color:white;">Admin Panel → Users</strong> to search for this user and take action.</p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("sendAdminTicketAlert Error:", err.message || err);
  }
};