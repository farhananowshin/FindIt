const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: [true, "Claim ID is required"],
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemReport",
      required: [true, "Item ID is required"],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    senderRole: {
      type: String,
      enum: ["claimant", "finder", "admin"],
      required: true,
    },
    senderAlias: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Verified Claimant #428" or "Finder #912" to preserve anonymous privacy
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ChatMessageSchema.index({ claimId: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
