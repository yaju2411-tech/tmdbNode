import mongoose from "mongoose";
import { getIO } from "../config/socket.js";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["user", "admin", "system"],
    default: "user"
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

notificationSchema.post("save", function (doc) {
  try {
    const io = getIO();
    if (doc.type === "admin") {
      io.emit("admin-notification", {
        new: doc
      });
    } else {
      io.to(doc.user.toString()).emit("user-notification", {
        new: doc
      });
    }
  } catch (err) {
    console.error("Failed to emit socket notification:", err);
  }
});

export default mongoose.model("Notification", notificationSchema);
