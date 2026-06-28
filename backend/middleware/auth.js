const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Reads the JWT from the secure, HTTP-only cookie (set during login —
 * see authController.js), verifies it, and attaches the user to req.user.
 * Using an HTTP-only cookie instead of localStorage protects the token from XSS.
 */
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};

/** Restricts a route to admin accounts only. Use after `protect`. */
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};
