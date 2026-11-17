const express = require("express");
const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const ItemReport = require("../models/ItemReport");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { authenticateToken, requireRole } = require("../middleware/auth");
const emailService = require("../services/emailService");
const smsService = require("../services/smsService");
const ChatMessage = require("../models/ChatMessage");
const { claimLimiter, decryptField } = require("../config/security");

const router = express.Router();

/**
 * @route   POST /api/claims
 * @desc    Submit an ownership claim for a found item (Student only)
 * @access  Private (Authenticated)
 */
router.post("/", authenticateToken, claimLimiter, async (req, res) => {
  try {
    const { itemId, secretVerificationAnswer, proofDetails } = req.body;

    // 1. Validate required fields
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Target item ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format.",
      });
    }

    if (!secretVerificationAnswer || !secretVerificationAnswer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Secret verification answer is required.",
      });
    }

    if (!proofDetails || !proofDetails.trim()) {
      return res.status(400).json({
        success: false,
        message: "Proof and distinguishing details are required.",
      });
    }

    // 2. Validate target item existence and status
    const item = await ItemReport.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Found item with ID "${itemId}" does not exist.`,
      });
    }

    // Only Found items can be claimed by students who lost them
    if (item.type !== "found") {
      return res.status(400).json({
        success: false,
        message: `Item "${item.title}" is of type "${item.type}". Ownership claims can only be submitted for Found item reports.`,
      });
    }

    // Ensure item is not already claimed or resolved
    if (item.status === "claimed" || item.status === "resolved") {
      return res.status(400).json({
        success: false,
        message: `This item has already been marked as "${item.status}" and is no longer available for claims.`,
      });
    }

    // 3. Prevent duplicate pending claims for the same user & item
    const existingPendingClaim = await Claim.findOne({
      claimantId: req.user._id,
      itemId: item._id,
      status: "pending",
    });

    if (existingPendingClaim) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending claim submitted for this item. Please wait for an administrator to review your evidence.",
      });
    }

    // 4. Create and save new claim (claimantId is ALWAYS from trusted req.user)
    const newClaim = new Claim({
      claimantId: req.user._id,
      itemId: item._id,
      secretVerificationAnswer: secretVerificationAnswer.trim(),
      proofDetails: proofDetails.trim(),
      status: "pending",
    });

    const savedClaim = await newClaim.save();

    return res.status(201).json({
      success: true,
      message: "Ownership claim submitted successfully. Campus security will review your private evidence.",
      data: {
        _id: savedClaim._id,
        claimantId: savedClaim.claimantId,
        itemId: savedClaim.itemId,
        status: savedClaim.status,
        createdAt: savedClaim.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error creating claim:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error while submitting claim.",
    });
  }
});

/**
 * @route   GET /api/claims/my-claims
 * @desc    Fetch all claims submitted by the currently authenticated user
 * @access  Private (Authenticated)
 */
router.get("/my-claims", authenticateToken, async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate("itemId", "title category brand primaryColor location dateTime imageUrls status")
      .sort({ createdAt: -1 });

    const decryptedClaims = claims.map((c) => (c.decryptSensitiveFields ? c.decryptSensitiveFields() : c));

    return res.status(200).json({
      success: true,
      count: decryptedClaims.length,
      data: decryptedClaims,
    });
  } catch (error) {
    console.error("❌ Error fetching user claims:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching your claims.",
    });
  }
});

/**
 * @route   GET /api/claims
 * @desc    List all claims for administrative review (Admins only)
 * @access  Private (Admin only)
 */
router.get("/", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && ["pending", "approved", "rejected"].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Claim.countDocuments(query);
    const claims = await Claim.find(query)
      .populate("claimantId", "name email studentId phone")
      .populate({
        path: "itemId",
        select: "+secretVerificationDetail", // Admins are authorized to view item secretVerificationDetail for cross-examination
      })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const decryptedClaims = claims.map((c) => (c.decryptSensitiveFields ? c.decryptSensitiveFields() : c));

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: decryptedClaims.length,
      data: decryptedClaims,
    });
  } catch (error) {
    console.error("❌ Error listing admin claims:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching administrative claims.",
    });
  }
});

/**
 * @route   GET /api/claims/:id/ai-explanation
 * @desc    Fetch explainable AI match output (sub-scores & top visual/textual cues) for an admin reviewing a claim
 * @access  Private (Admin only)
 */
router.get("/:id/ai-explanation", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid claim ID format." });
    }

    const claim = await Claim.findById(id).populate("itemId claimantId");
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const foundItem = claim.itemId;
    if (!foundItem) {
      return res.status(404).json({ success: false, message: "Associated found item not found." });
    }

    // Look for a matching lost item report by this claimant, or synthesize from proof
    let lostItem = await ItemReport.findOne({
      submitterId: claim.claimantId?._id || claim.claimantId,
      type: "lost",
      category: foundItem.category,
    }).lean();

    if (!lostItem) {
      lostItem = await ItemReport.findOne({
        submitterId: claim.claimantId?._id || claim.claimantId,
        type: "lost",
      }).lean();
    }

    // Call FastAPI AI service match-pair endpoint
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";
    
    const requestPayload = {
      foundItemId: String(foundItem._id),
      foundItemData: foundItem.toObject ? foundItem.toObject() : foundItem,
    };

    if (lostItem) {
      requestPayload.lostItemId = String(lostItem._id);
      requestPayload.lostItemData = lostItem;
    } else {
      // Synthesize query lost item from claimant's verified proof details
      requestPayload.lostItemData = {
        title: foundItem.title,
        category: foundItem.category,
        brand: foundItem.brand || "",
        primaryColor: foundItem.primaryColor || "",
        secondaryColor: foundItem.secondaryColor || "",
        description: decryptField(claim.proofDetails) || foundItem.description,
        location: foundItem.location,
        dateTime: claim.createdAt,
      };
    }

    try {
      const aiRes = await fetch(`${aiServiceUrl}/api/match-pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
        signal: AbortSignal.timeout(25000),
      });

      const aiData = await aiRes.json().catch(() => ({}));
      if (aiRes.ok && aiData.success) {
        return res.status(200).json({
          success: true,
          claimId: claim._id,
          matchedLostReport: lostItem ? { id: lostItem._id, title: lostItem.title } : null,
          isSynthesizedFromProof: !lostItem,
          ...aiData,
        });
      }

      return res.status(aiRes.status || 503).json({
        success: false,
        message: aiData.detail || aiData.message || "AI explanation service returned an error.",
      });
    } catch (aiErr) {
      console.warn("⚠️ FastAPI match-pair unavailable:", aiErr.message);
      return res.status(503).json({
        success: false,
        message:
          "The AI matching service is offline, so this claim has no live sub-scores yet. Start the FastAPI service and open the explanation again.",
      });
    }
  } catch (err) {
    console.error("❌ Error generating AI explanation for claim:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/**
 * @route   PATCH /api/claims/:id/status
 * @desc    Approve or reject a pending claim (Admin only)
 * @access  Private (Admin only)
 */
router.patch("/:id/status", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID format.",
      });
    }

    const targetStatus = (status || "").toLowerCase();
    if (!["approved", "rejected"].includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be either 'approved' or 'rejected'.",
      });
    }

    // 1. Fetch claim and verify it exists
    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: `Claim with ID "${id}" was not found.`,
      });
    }

    // Ensure claim is still pending
    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This claim has already been reviewed with status "${claim.status}" on ${claim.reviewedAt?.toISOString() || "record"}.`,
      });
    }

    // 2. Fetch associated ItemReport
    const item = await ItemReport.findById(claim.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "The associated item report no longer exists in the database.",
      });
    }

    // 3. Handle Status Transitions
    if (targetStatus === "approved") {
      // Consistency safeguard: Ensure item has not already been approved/claimed by another party
      if (item.status === "claimed" || item.status === "resolved") {
        return res.status(400).json({
          success: false,
          message: `Cannot approve claim: Item "${item.title}" is already marked as "${item.status}". Conflicting approvals are strictly prevented.`,
        });
      }

      // Update target claim to approved
      claim.status = "approved";
      claim.reviewedBy = req.user._id;
      claim.reviewedAt = new Date();
      claim.reviewNotes = (reviewNotes || "").trim() || "Claim approved by verification administrator.";
      await claim.save();

      // Non-blocking closed-loop AI learning feedback (Positive Match)
      try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";
        fetch(`${aiServiceUrl}/api/weights/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lostItemId: String(claim.itemId?._id || claim.itemId),
            candidateFoundId: String(claim.itemId?._id || claim.itemId),
            isApproved: true,
          }),
        }).catch((err) => {
          console.warn("Non-blocking feedback sync advisory:", err.message);
        });
      } catch (err) {}

      // Update item status to 'claimed'
      item.status = "claimed";
      await item.save();

      // Concurrency safeguard: Automatically reject any other pending claims for this item
      const otherPendingClaims = await Claim.find({
        itemId: item._id,
        _id: { $ne: claim._id },
        status: "pending",
      }).select("_id claimantId");

      await Claim.updateMany(
        {
          itemId: item._id,
          _id: { $ne: claim._id },
          status: "pending",
        },
        {
          status: "rejected",
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          reviewNotes: "Item ownership was verified and claimed by another claimant.",
        }
      );

      // Trigger Notification for Approved Claimant
      try {
        await Notification.create({
          userId: claim.claimantId,
          type: "claim_approved",
          title: "Ownership Claim Approved!",
          message: `Your ownership claim for item "${item.title}" was approved. Instructions: ${claim.reviewNotes}`,
          relatedItemId: item._id,
          relatedClaimId: claim._id,
          metadata: {
            claimId: claim._id,
            itemId: item._id,
            reviewNotes: claim.reviewNotes,
          },
        });

        // Notify other claimants whose claims were closed
        for (const otherClaim of otherPendingClaims) {
          await Notification.create({
            userId: otherClaim.claimantId,
            type: "claim_rejected",
            title: "Ownership Claim Closed",
            message: `The item "${item.title}" was claimed and verified by another claimant.`,
            relatedItemId: item._id,
            relatedClaimId: otherClaim._id,
          });
        }
      } catch (notifErr) {
        console.warn("⚠️ Non-blocking error generating claim approval notification:", notifErr.message);
      }
    } else {
      // Rejection: Update claim only; leave item status 'active' so other legitimate claims can be submitted
      claim.status = "rejected";
      claim.reviewedBy = req.user._id;
      claim.reviewedAt = new Date();
      claim.reviewNotes = (reviewNotes || "").trim() || "Claim rejected. Evidence did not match verified item attributes.";
      await claim.save();

      // Non-blocking closed-loop AI learning feedback (Negative Match)
      try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";
        fetch(`${aiServiceUrl}/api/weights/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lostItemId: String(claim.itemId?._id || claim.itemId),
            candidateFoundId: String(claim.itemId?._id || claim.itemId),
            isApproved: false,
          }),
        }).catch((err) => {
          console.warn("Non-blocking feedback sync advisory:", err.message);
        });
      } catch (err) {}

      // Trigger Notification for Rejected Claimant
      try {
        await Notification.create({
          userId: claim.claimantId,
          type: "claim_rejected",
          title: "Ownership Claim Update",
          message: `Your ownership claim for item "${item.title}" was reviewed and not approved. Note: ${claim.reviewNotes}`,
          relatedItemId: item._id,
          relatedClaimId: claim._id,
          metadata: {
            claimId: claim._id,
            itemId: item._id,
            reviewNotes: claim.reviewNotes,
          },
        });
      } catch (notifErr) {
        console.warn("⚠️ Non-blocking error generating claim rejection notification:", notifErr.message);
      }
    }

    // Dispatch automated email notification to claimant in background (non-blocking)
    User.findById(claim.claimantId)
      .then((claimant) => {
        if (claimant && claimant.email) {
          emailService
            .sendClaimStatusEmail({
              to: claimant.email,
              recipientName: claimant.name || "Student",
              itemTitle: item.title,
              status: targetStatus,
              reviewNotes: claim.reviewNotes,
              viewLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/my-claims`,
            })
            .catch((err) => {
              console.warn("⚠️ Non-blocking claim email delivery notice:", err.message);
            });
        }
        if (claimant && claimant.phone) {
          smsService
            .sendClaimStatusSms({
              to: claimant.phone,
              recipientName: claimant.name || "Citizen",
              itemTitle: item.title,
              status: targetStatus,
              notes: claim.reviewNotes,
              claimId: claim._id,
            })
            .catch((err) => {
              console.warn("⚠️ Non-blocking claim SMS delivery notice:", err.message);
            });
        }
      })
      .catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Claim successfully ${claim.status}.`,
      data: {
        claim,
        itemStatus: item.status,
      },
    });
  } catch (error) {
    console.error("❌ Error updating claim status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating claim status.",
    });
  }
});

/**
 * @route   GET /api/claims/:id/messages
 * @desc    Fetch anonymous mediation chat messages for an ownership claim
 * @access  Private (Claimant, Finder, Admin)
 */
router.get("/:id/messages", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findById(id).populate("itemId", "submitterId title");
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const userId = req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isClaimant = claim.claimantId.toString() === userId;
    const isFinder = claim.itemId && claim.itemId.submitterId && claim.itemId.submitterId.toString() === userId;

    if (!isAdmin && !isClaimant && !isFinder) {
      return res.status(403).json({ success: false, message: "Unauthorized to access this private handover channel." });
    }

    const messages = await ChatMessage.find({ claimId: id })
      .select("-senderId")
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("❌ Error fetching claim messages:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve messages." });
  }
});

/**
 * @route   POST /api/claims/:id/messages
 * @desc    Send an anonymous mediation message in the handover channel
 * @access  Private (Claimant, Finder, Admin)
 */
router.post("/:id/messages", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." });
    }

    const claim = await Claim.findById(id).populate("itemId", "submitterId title");
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const userId = req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isClaimant = claim.claimantId.toString() === userId;
    const isFinder = claim.itemId && claim.itemId.submitterId && claim.itemId.submitterId.toString() === userId;

    if (!isAdmin && !isClaimant && !isFinder) {
      return res.status(403).json({ success: false, message: "Unauthorized to participate in this handover channel." });
    }

    let senderRole = "claimant";
    let senderAlias = `Claimant #${id.slice(-4).toUpperCase()}`;

    if (isAdmin) {
      senderRole = "admin";
      senderAlias = "Sylhet City Admin Desk";
    } else if (isFinder) {
      senderRole = "finder";
      senderAlias = "Finder (Sylhet Citizen)";
    }

    const chatMsg = await ChatMessage.create({
      claimId: claim._id,
      itemId: claim.itemId ? claim.itemId._id : claim.itemId,
      senderId: req.user._id,
      senderRole,
      senderAlias,
      message: message.trim(),
    });

    return res.status(201).json({ success: true, data: chatMsg });
  } catch (error) {
    console.error("❌ Error sending claim message:", error);
    return res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

module.exports = router;
