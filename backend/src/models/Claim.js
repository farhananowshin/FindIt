const mongoose = require("mongoose");

const ALLOWED_STATUSES = ["pending", "approved", "rejected"];

const ClaimSchema = new mongoose.Schema(
  {
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Claimant ID is required"],
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemReport",
      required: [true, "Item ID is required"],
      index: true,
    },
    secretVerificationAnswer: {
      type: String,
      required: [true, "Secret verification answer is required"],
      trim: true,
      minlength: [3, "Verification answer must be at least 3 characters"],
      maxlength: [1000, "Verification answer cannot exceed 1000 characters"],
    },
    proofDetails: {
      type: String,
      required: [true, "Proof and distinguishing details are required"],
      trim: true,
      minlength: [5, "Proof details must be at least 5 characters"],
      maxlength: [2000, "Proof details cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: "{VALUE} is not a valid claim status",
      },
      default: "pending",
      lowercase: true,
      trim: true,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Review notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user claims per item
ClaimSchema.index({ claimantId: 1, itemId: 1, status: 1 });
ClaimSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Claim", ClaimSchema);
