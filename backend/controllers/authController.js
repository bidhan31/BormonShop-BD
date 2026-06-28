const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generates a signed JWT containing the user's id and role
function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Sets the JWT as an HTTP-only cookie so client-side JS can never read it (XSS protection)
function setTokenCookie(res, token) {
  const isProd = process.env.NODE_ENV !== "development";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // HTTPS only in prod
    sameSite: isProd ? "none" : "lax", // 'none' is REQUIRED for cross-domain cookies (Netlify -> Render)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN default
  });
}

// Verifies a Google access_token (implicit flow) and returns the user profile
async function verifyGoogleToken(accessToken) {
  const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Invalid Google access token");
  return res.json(); // { sub, email, name, picture, email_verified, ... }
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobileNumber,
    });

    const token = generateToken(user);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // password has `select: false` on the schema, so it must be explicitly requested here
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Google-only accounts have no password set
    if (!user.password) {
      return res.status(401).json({ success: false, message: "This account uses Google sign-in. Please log in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ success: true, message: "Logged out" });
};

// Returns the currently authenticated user — used by the frontend to check session on load
exports.getMe = async (req, res) => {
  // req.user is attached by the `protect` middleware
  return res.status(200).json({ success: true, user: req.user });
};

/**
 * POST /api/auth/google
 * Login with Google. Verifies the ID token, finds the user by email, and issues a JWT.
 * If no account is found, returns { needsRegistration: true } so the frontend can
 * redirect the user to the sign-up page.
 */
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Google token is required" });
    }

    const payload = await verifyGoogleToken(token);
    const { sub: googleId, email, name, picture } = payload;

    // Try to find by googleId first, then fall back to email (handles accounts
    // created before Google login was added)
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (!user) {
      // No matching account — tell frontend to redirect to registration
      return res.status(404).json({
        success: false,
        needsRegistration: true,
        message: "No account found. Please sign up first.",
        profile: { name, email, picture },
      });
    }

    // Attach googleId and avatar if not already set (first Google login on an existing account)
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }

    const jwtToken = generateToken(user);
    setTokenCookie(res, jwtToken);

    return res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(401).json({ success: false, message: "Google authentication failed" });
  }
};

/**
 * POST /api/auth/google-register
 * Sign up via Google. Verifies the ID token, then creates a new user with the
 * Google profile data plus the mobileNumber and password supplied in Step 2.
 */
exports.googleRegister = async (req, res) => {
  try {
    const { token, mobileNumber, password } = req.body;

    if (!token || !mobileNumber || !password) {
      return res.status(400).json({ success: false, message: "Token, phone number, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const payload = await verifyGoogleToken(token);
    const { sub: googleId, email, name, picture } = payload;

    const existing = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please log in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      mobileNumber,
      googleId,
      avatar: picture,
    });

    const jwtToken = generateToken(user);
    setTokenCookie(res, jwtToken);

    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error("Google register error:", error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};
