const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ItemReport = require("../models/ItemReport");
const Notification = require("../models/Notification");
const upload = require("../middleware/upload");
const { authenticateToken, requireRole } = require("../middleware/auth");

/**
 * Helper: parse location from either nested object, flat fields, or JSON string.
 */
function extractLocation(body) {
  if (body.location) {
    if (typeof body.location === "string") {
      try {
        return JSON.parse(body.location);
      } catch (e) {
        // Fallback if not valid JSON
      }
    } else if (typeof body.location === "object") {
      return body.location;
    }
  }

  // Fallback to flat fields from FormData
  return {
    campusZone: body.campusZone || body["location[campusZone]"] || body.campusLocation || "",
    specificLocation: body.specificLocation || body["location[specificLocation]"] || "",
  };
}

/**
 * @route   POST /api/items
 * @desc    Create a new lost or found item report (Supports JSON & multipart/form-data with images)
 * @access  Private (Authenticated users only)
 */
router.post(
  "/",
  authenticateToken,
  (req, res, next) => {
    // Multer middleware with custom error handling for size/type limits
    upload.array("images", 4)(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds the 5MB limit per image.",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "You can upload a maximum of 4 images.",
          });
        }
        if (err.code === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        type,
        reportType,
        title,
        category,
        brand,
        primaryColor,
        secondaryColor,
        description,
        uniqueMarks,
        secretVerificationDetail,
        secretVerificationHint,
        dateTime,
        submitterName,
        reporterName,
        submitterStudentId,
        studentId,
        submitterEmail,
        contactEmail,
        submitterPhone,
        contactPhone,
        status,
      } = req.body;

      // Normalize field names (supporting both frontend form conventions and standard schema names)
      const effectiveType = (type || reportType || "").toLowerCase();
      const effectiveVerificationDetail = (secretVerificationDetail || secretVerificationHint || "").trim();
      const effectiveSubmitterName = (req.user?.name || submitterName || reporterName || "").trim();
      const effectiveStudentId = (req.user?.studentId || submitterStudentId || studentId || "").trim();
      const effectiveEmail = (req.user?.email || submitterEmail || contactEmail || "").trim();
      const effectivePhone = (req.user?.phone || submitterPhone || contactPhone || "").trim();
      const location = extractLocation(req.body);

      // Process uploaded images
      const imagePaths = [];
      const imageUrls = [];
      const protocol = req.protocol;
      const host = req.get("host");

      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
          imagePaths.push(`uploads/${file.filename}`);
          // Publicly accessible URL served by Express
          imageUrls.push(`${protocol}://${host}/uploads/${file.filename}`);
        });
      }

      // Check for manually passed imageUrls if using JSON (e.g., seeding/testing)
      if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
        imageUrls.push(...req.body.imageUrls);
      }

      // Instantiate Mongoose document
      const itemData = {
        type: effectiveType,
        title: (title || "").trim(),
        category: (category || "").toLowerCase().trim(),
        brand: (brand || "").trim(),
        primaryColor: (primaryColor || "Black").trim(),
        secondaryColor: (secondaryColor || "None").trim(),
        description: (description || "").trim(),
        uniqueMarks: (uniqueMarks || "").trim(),
        secretVerificationDetail: effectiveVerificationDetail,
        location: {
          campusZone: (location.campusZone || "").trim(),
          specificLocation: (location.specificLocation || "").trim(),
        },
        dateTime: dateTime ? new Date(dateTime) : new Date(),
        imagePaths,
        imageUrls,
        submitterId: req.user?._id || null, // Always attach authenticated user ID
        submitterName: effectiveSubmitterName,
        submitterStudentId: effectiveStudentId,
        submitterEmail: effectiveEmail,
        submitterPhone: effectivePhone,
        status: status || "active",
      };

      const newItem = new ItemReport(itemData);
      const savedItem = await newItem.save();

      // Ensure secret verification detail is removed from response payload
      const responsePayload = savedItem.toObject();
      delete responsePayload.secretVerificationDetail;

      return res.status(201).json({
        success: true,
        message: "Item report created successfully.",
        data: responsePayload,
      });
    } catch (error) {
      console.error("❌ Error saving item report:", error);

      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: messages,
        });
      }

      // Handle other server errors
      return res.status(500).json({
        success: false,
        message: "Internal server error while saving item report.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * @route   GET /api/items
 * @desc    Fetch all item reports with optional filtering (type, category, status)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { type, reportType, category, status, search } = req.query;
    const query = {};

    // Filter by type ('lost' | 'found')
    const filterType = type || reportType;
    if (filterType && filterType !== "all") {
      query.type = filterType.toLowerCase();
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category.toLowerCase();
    }

    // Filter by status ('active', 'matched', 'claimed', 'resolved')
    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    // Search in title, description, or brand
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ];
    }

    // Fetch from MongoDB, sorting newest first, strictly excluding secretVerificationDetail
    const items = await ItemReport.find(query)
      .select("-secretVerificationDetail")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item reports.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Fetch a single item report by MongoDB ObjectId
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid item ID format: "${id}". Must be a 24-character hexadecimal string.`,
      });
    }

    const item = await ItemReport.findById(id)
      .select("-secretVerificationDetail")
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item report with ID "${id}" was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error(`❌ Error fetching item ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve item report.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/items/:id/admin
 * @desc    Fetch single item report with confidential secretVerificationDetail (Admin only)
 * @access  Private (Admin only)
 */
router.get("/:id/admin", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid item ID format: "${id}". Must be a 24-character hex string.`,
      });
    }

    const item = await ItemReport.findById(id).select("+secretVerificationDetail").lean();
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item report with ID "${id}" was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error(`❌ Error fetching item ${req.params.id} for admin:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve item report for admin review.",
    });
  }
});

/**
 * @route   GET /api/items/:id/matches
 * @desc    Proxy matching request to the FastAPI AI service (OpenCLIP + S-BERT)
 * @access  Public
 */
router.get("/:id/matches", async (req, res) => {
  try {
    const { id } = req.params;
    const topK = req.query.topK ? parseInt(req.query.topK, 10) : 5;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid item ID format: "${id}".`,
      });
    }

    // Verify item exists and is a lost item
    const item = await ItemReport.findById(id).lean();
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item report with ID "${id}" was not found.`,
      });
    }

    if (item.type !== "lost") {
      return res.status(400).json({
        success: false,
        message: `Item "${id}" is of type "${item.type}". AI matching is initiated from Lost item reports.`,
      });
    }

    // Call FastAPI AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";
    try {
      const response = await fetch(`${aiServiceUrl}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lostItemId: id, topK }),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      const aiResponse = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          message: aiResponse.detail || "AI matching service encountered an error.",
        });
      }

      // Check for High-Confidence AI Match Alerts (threshold >= 70%)
      if (item.submitterId && Array.isArray(aiResponse.matches)) {
        const HIGH_CONFIDENCE_THRESHOLD = 70.0;
        const highMatches = aiResponse.matches.filter(
          (m) => (m.matchScore || (m.matchScoreNormalized * 100)) >= HIGH_CONFIDENCE_THRESHOLD
        );

        for (const candidate of highMatches) {
          try {
            const candidateId = candidate.itemId;
            // Prevent duplicate notifications for this lost item + found item candidate
            const existingNotification = await Notification.findOne({
              userId: item.submitterId,
              type: "match_alert",
              relatedItemId: candidateId,
            });

            if (!existingNotification) {
              await Notification.create({
                userId: item.submitterId,
                type: "match_alert",
                title: "High-Confidence AI Match Identified",
                message: `Multimodal AI found a ${candidate.matchScore}% match for your lost item "${item.title}". Review found candidate report.`,
                relatedItemId: candidateId,
                matchScore: candidate.matchScore,
                metadata: {
                  sourceItemId: item._id,
                  candidateItemId: candidateId,
                  matchScore: candidate.matchScore,
                },
              });
            }
          } catch (notifErr) {
            console.warn("⚠️ Non-blocking error generating match notification:", notifErr.message);
          }
        }
      }

      return res.status(200).json(aiResponse);
    } catch (fetchErr) {
      console.error("❌ Failed to reach FastAPI AI service:", fetchErr.message);
      return res.status(503).json({
        success: false,
        message:
          "The Multimodal AI Matching Service (FastAPI) is currently offline or unreachable. Please verify it is running on port 8001.",
      });
    }
  } catch (error) {
    console.error("❌ Error in matches proxy route:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving matches.",
    });
  }
});

module.exports = router;
