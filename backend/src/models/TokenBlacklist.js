const mongoose = require("mongoose");

/**
 * TokenBlacklist Schema
 * Stores invalidated JWT tokens upon logout or revocation.
 * Uses MongoDB TTL (Time-To-Live) index to automatically prune expired tokens from database.
 */
const TokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: MongoDB automatically removes document when expiresAt < now
    },
    reason: {
      type: String,
      default: "logout",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TokenBlacklist", TokenBlacklistSchema);
