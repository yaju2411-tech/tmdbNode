import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
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
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
    type: String,
    required: true,
    },

    otpExpires: {
    type: Date,
    required: true,
    },

    lastOTPSent: {
    type: Date,
    default: Date.now,
    },

    isCaptchaVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

pendingUserSchema.index(
  { otpExpires: 1 },
  { expireAfterSeconds: 0 }
);


export default mongoose.model(
  "PendingUser",
  pendingUserSchema
);