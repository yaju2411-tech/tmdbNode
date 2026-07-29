import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  media_id: {
    type: Number,
    required: true
  },
  media_type: {
    type: String,
    enum: ["movie", "tv"],
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  poster_path: {
    type: String,
    default: ""
  }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

// Compound unique index ensuring user can only watchlist any media item once
watchlistSchema.index({ user: 1, media_id: 1, media_type: 1 }, { unique: true });

export default mongoose.model("Watchlist", watchlistSchema);
