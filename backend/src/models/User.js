import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        default: "",
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    avatar: {
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isCaptchaVerified: {
        type: Boolean,
        default: false,
    },
    subscription: {
        status: {
            type: String,
            enum: ["none", "active", "expired", "cancelled"],
            default: "none",
        },
        plan: {
            type: String,
            enum: ["none", "monthly", "quarterly", "yearly"],
            default: "none",
        },
        startDate: {
            type: Date,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: "",
        },
        razorpayPaymentId: {
            type: String,
            default: "",
        },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual("avatar_url").get(function() {
  return this.avatar?.url || "";
});

export default mongoose.model("User", userSchema);