import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    news: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to ensure a user can only like a news article once
likeSchema.index({ user: 1, news: 1 }, { unique: true });

// Index for querying likes by news article
likeSchema.index({ news: 1 });

// Index for querying likes by user
likeSchema.index({ user: 1 });

const Like = mongoose.model('Like', likeSchema);

export default Like; 