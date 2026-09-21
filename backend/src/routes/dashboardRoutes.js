const express = require("express");

const router = express.Router();

// ============================================
// Middleware
// ============================================

const protect = require("../middleware/authMiddleware");

// ============================================
// Controller
// ============================================

const {
  getDashboard,
} = require("../controllers/dashboardController");

// ============================================
// Dashboard
// ============================================

router.get(
  "/",
  protect,
  getDashboard
);

module.exports = router;