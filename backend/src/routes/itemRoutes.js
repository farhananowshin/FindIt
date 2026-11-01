const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ItemReport = require("../models/ItemReport");
const Notification = require("../models/Notification");
const upload = require("../middleware/upload");
const { authenticateToken, requireRole } = require("../middleware/auth");
const storageService = require("../services/storageService");
const emailService = require("../services/emailService");

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

      // Process uploaded images (Cloudinary remote storage with graceful local disk fallback)
      const imagePaths = [];
      const imageUrls = [];
      const protocol = req.protocol;
      const host = req.get("host");

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadResults = await storageService.uploadMultipleFiles(req.files, { protocol, host });
        uploadResults.forEach((resItem) => {
          imagePaths.push(resItem.path);
          imageUrls.push(resItem.url);
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

      // Dispatch automated email notification in background (non-blocking)
      if (effectiveEmail) {
        emailService
          .sendReportConfirmationEmail({
            to: effectiveEmail,
            recipientName: effectiveSubmitterName || "Citizen",
            itemTitle: savedItem.title,
            type: savedItem.type,
            viewLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/explore`,
          })
          .catch((err) => {
            console.warn("⚠️ Non-blocking email delivery notice:", err.message);
          });
      }

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

/**
 * @route   POST /api/items/generate-challenge
 * @desc    Generate AI-powered zero-knowledge ownership verification questions (Groq LLM + Smart Heuristic Engine)
 * @access  Public
 */
router.post("/generate-challenge", async (req, res) => {
  try {
    const { title, description, category, brand, uniqueMarks } = req.body;

    const itemContext = `Item Title: ${title || "Personal Belonging"}
Category: ${category || "General"}
Brand: ${brand || "Unspecified"}
Description: ${description || "Found personal item"}
Distinctive Marks: ${uniqueMarks || "None specified"}`;

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey && groqApiKey !== "your_groq_api_key_here") {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "You are a security AI for a Lost & Found platform. Your job is to generate 3 secret, highly-specific verification challenge questions that ONLY the true owner would know, but a fraudster cannot guess. Focus on hidden compartments, lockscreen wallpapers, engravings, minor internal marks, or specific contents. Respond ONLY with a valid JSON array of 3 strings. No markdown, no preface.",
              },
              {
                role: "user",
                content: `Generate 3 unguessable secret ownership verification questions for this item:\n${itemContext}`,
              },
            ],
            temperature: 0.6,
            max_tokens: 250,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const content = groqData.choices?.[0]?.message?.content?.trim();
          if (content) {
            try {
              const cleanJson = content.replace(/```json/gi, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleanJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return res.status(200).json({
                  success: true,
                  source: "Groq LLM (Llama 3.1)",
                  challenges: parsed.slice(0, 3),
                });
              }
            } catch (pErr) {
              console.warn("Could not parse Groq JSON array, falling back to smart rules:", pErr.message);
            }
          }
        }
      } catch (groqErr) {
        console.warn("Groq API request failed, utilizing high-precision fallback engine:", groqErr.message);
      }
    }

    // High-Precision Smart Heuristic Challenge Generator (Zero-Downtime Guarantee)
    const cat = (category || "").toLowerCase();
    const suggestions = [];

    if (cat.includes("electronic") || cat.includes("phone") || cat.includes("laptop")) {
      suggestions.push("What specific wallpaper or lockscreen photo is set on the device?");
      suggestions.push("Is there any specific scratch, sticker, or cover type on the back?");
      suggestions.push("What is the exact storage capacity or model/serial number identifier?");
    } else if (cat.includes("bag") || cat.includes("wallet")) {
      suggestions.push("What specific card, photo, or ID is inside the hidden inner sleeve?");
      suggestions.push("What is the exact coin denomination or approximate cash note amount?");
      suggestions.push("Are there any keys, transit tokens, or receipts inside the zipper compartment?");
    } else if (cat.includes("key")) {
      suggestions.push("How many total keys are on the ring and what specific keychain/charm is attached?");
      suggestions.push("Is there any engraved number, vehicle brand logo, or distinct color band?");
      suggestions.push("Is there a USB drive, bottle opener, or tag attached to the bunch?");
    } else if (cat.includes("book") || cat.includes("note") || cat.includes("id_card")) {
      suggestions.push("What name, handwritten notes, or student ID number is on the first or back page?");
      suggestions.push("Is there any specific bookmark, highlighter color, or folded section?");
      suggestions.push("What specific department, semester, or subject is referenced inside?");
    } else {
      suggestions.push(`What specific hidden marking, initial, or scratch is on the item?`);
      suggestions.push(`What specific contents, brand tag, or accessory is attached to it?`);
      suggestions.push(`Can you specify the exact brand, purchase origin, or serial details?`);
    }

    return res.status(200).json({
      success: true,
      source: "FindIt Security Engine (Heuristic AI)",
      challenges: suggestions,
    });
  } catch (err) {
    console.error("❌ Error generating verification challenges:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate verification challenge questions.",
    });
  }
});

module.exports = router;
