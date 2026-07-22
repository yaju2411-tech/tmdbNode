import mongoose from "mongoose";
import crypto from "crypto";

const helpTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "cant_login",
        "otp_issues",
        "google_signin",
        "payment_deducted",
        "content_not_showing",
        "account_locked",
        "email_not_verified",
        "password_reset",
        "other",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    ticketId: {
      type: String,
      unique: true,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    // New fields for payment issues
    orderId: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    receiptId: { type: String, trim: true },
    contentName: { type: String, trim: true },
    contentId: { type: String, trim: true },
    contentType: { type: String, enum: ["movie", "tv"] },
    proofImages: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate a short ticket ID before saving
helpTicketSchema.pre("save", function () {
  if (!this.ticketId) {
    this.ticketId = "TKT-" + crypto.randomBytes(5).toString("hex").toUpperCase();
  }
});

export default mongoose.model("HelpTicket", helpTicketSchema);
