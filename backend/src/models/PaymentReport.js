import mongoose from "mongoose";

const paymentReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Purchase"
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  user_email: {
    type: String,
    required: true
  },
  movie_id: Number,
  movie_name: String,
  content_type: {
    type: String,
    enum: ["movie", "tv"]
  },
  order_id: String,
  payment_id: String,
  amount: Number,
  current_payment_status: String,
  issue_type: {
    type: String,
    required: true
  },
  subject: String,
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["open", "closed", "pending", "resolved", "investigating"],
    default: "open"
  },
  admin_reply: {
    type: String,
    default: ""
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolved_at: Date,
  refund_status: {
    type: String,
    enum: ["not_requested", "pending", "refunded", "failed"],
    default: "not_requested"
  },
  refund_amount: Number,
  razorpay_refund_id: String,
  assigned_to: String,
  internal_notes: {
    type: String,
    default: ""
  },
  payment_snapshot: mongoose.Schema.Types.Mixed,
  failure_stage: String
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

export default mongoose.model("PaymentReport", paymentReportSchema);
