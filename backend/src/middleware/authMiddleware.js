const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// PROTECT MIDDLEWARE
// ======================================================

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token is missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check active user
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "User account is inactive.",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

// ======================================================
// AUTHORIZE MIDDLEWARE
// ======================================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden. You do not have permission to perform this action.",
      });
    }

    next();
  };
};

// ======================================================
// EXPORT
// ======================================================

// Export protect directly so existing routes continue working
module.exports = protect;

// Attach authorize to protect
module.exports.authorize = authorize;