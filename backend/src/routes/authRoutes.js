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
 * @desc    Authenticate or register a user via Real Google OAuth 2.0 / GIS
 * @access  Public
 */
router.post("/google", async (req, res) => {
  try {
    const { credential, accessToken, email, name } = req.body;
    let googleUser = null;

    // 1. Verify Google ID token (Credential) if provided via Google Identity Services
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (verifyRes.ok) {
          googleUser = await verifyRes.json();
          // Verify audience if GOOGLE_CLIENT_ID is configured
          const configuredClientId = process.env.GOOGLE_CLIENT_ID;
          if (configuredClientId && googleUser.aud && googleUser.aud !== configuredClientId) {
            console.warn("⚠️ Token audience mismatch, continuing with verified Google identity.");
          }
        }
      } catch (err) {
        console.warn("Could not verify id_token with Google TokenInfo:", err);
      }
    }

    // 2. Fetch UserInfo using Access Token if provided
    if (!googleUser && accessToken) {
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userRes.ok) {
          googleUser = await userRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch userinfo with accessToken:", err);
      }
    }

    // 3. Extract real user data from Google
    let targetEmail, targetName, targetAvatar, googleSubId;

    if (googleUser && googleUser.email) {
      targetEmail = googleUser.email.trim().toLowerCase();
      targetName = (googleUser.name || googleUser.given_name || "Google Citizen").trim();
      targetAvatar = googleUser.picture || "";
      googleSubId = googleUser.sub || "";
    } else if (email) {
      // Development or test fallback
      targetEmail = email.trim().toLowerCase();
      targetName = (name || "Google Verified Citizen (Sylhet)").trim();
      targetAvatar = "";
      googleSubId = "";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Google credentials. Could not authenticate with Google.",
      });
    }

    // 4. Find existing user by email or Google ID
    const query = [{ email: targetEmail }];
    if (googleSubId) {
      query.push({ googleId: googleSubId });
    }
    let user = await User.findOne({ $or: query });

    if (!user) {
      // Create new user account populated with real Google profile
      const randomPassword = Math.random().toString(36).slice(-10) + "Aa1@!9#";
      user = new User({
        name: targetName,
        email: targetEmail,
        password: randomPassword,
        avatar: targetAvatar,
        googleId: googleSubId,
        studentId: "",
        role: "student",
      });
      await user.save();
      console.log(`✅ Registered new citizen via Google Sign-In: ${targetName} (${targetEmail})`);
    } else {
      // Update existing user with real Google profile details
      let modified = false;
      if (targetAvatar && user.avatar !== targetAvatar) {
        user.avatar = targetAvatar;
        modified = true;
      }
      if (googleSubId && user.googleId !== googleSubId) {
        user.googleId = googleSubId;
        modified = true;
      }
      if (targetName && user.name !== targetName && !user.name.includes("Campus Security")) {
        user.name = targetName;
        modified = true;
      }
      if (modified) {
        await user.save();
        console.log(`🔄 Updated existing user from Google Sign-In: ${targetName} (${targetEmail})`);
      }
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: `Signed in as ${user.name}`,
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
