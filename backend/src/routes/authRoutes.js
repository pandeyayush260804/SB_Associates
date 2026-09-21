const express = require("express");

const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================
// Public Routes
// ============================================

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// ============================================
// Protected Routes
// ============================================

// Get current logged-in user
router.get("/me", protect, getMe);

// Get all users
router.get("/users", protect, getAllUsers);

module.exports = router;