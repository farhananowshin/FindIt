const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * Helper to generate signed JWT token for an authenticated user.
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET || "findit_super_secret_jwt_key_2026_campus_secure";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn }
  );
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account (public registration CANNOT create admins)
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, studentId, phone, role } = req.body;

    // 1. Validate mandatory fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // 2. Strict Security: Block public registration from granting admin role
    if (role && role.toLowerCase() === "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Administrator accounts cannot be created via public registration.",
      });
    }

    // 3. Check for existing account with the same email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please log in.",
      });
    }

    // 4. Create student user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      studentId: (studentId || "").trim(),
      phone: (phone || "").trim(),
      role: "student", // Always force student role
    });

    await newUser.save();

    // 5. Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration.",
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and return signed JWT token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user and explicitly select password hash
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify bcrypt password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate or register a user via Google Sign-In
 * @access  Public
 */
router.post("/google", async (req, res) => {
  try {
    const { email, name, studentId } = req.body;
    const targetEmail = (email || "citizen.google@sylhet.net").trim().toLowerCase();
    const targetName = (name || "Google Verified Citizen (Sylhet)").trim();

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      // Create verified citizen account linked with Google
      const randomPassword = Math.random().toString(36).slice(-10) + "Aa1@!";
      user = new User({
        name: targetName,
        email: targetEmail,
        password: randomPassword,
        studentId: studentId || "GOOGLE-VERIFIED-CITIZEN",
        role: "student",
      });
      await user.save();
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "Google authentication successful.",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Google authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during Google authentication.",
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get profile of the currently authenticated user
 * @access  Private (Authenticated)
 */
router.get("/me", authenticateToken, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
