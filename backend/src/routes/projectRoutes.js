const express = require("express");

const {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================
// Project Routes
// ============================================

// Get all projects
// ADMIN, PROJECT_MANAGER, SUPPLY_MANAGER
router.get(
    "/",
    protect,
    authorize("ADMIN", "PROJECT_MANAGER", "SUPPLY_MANAGER"),
    getProjects
);

// Get single project
// ADMIN, PROJECT_MANAGER, SUPPLY_MANAGER
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "PROJECT_MANAGER", "SUPPLY_MANAGER"),
    getProjectById
);

// Create project
// ADMIN only
router.post(
    "/",
    protect,
    authorize("ADMIN"),
    createProject
);

// Update project
// ADMIN only
router.put(
    "/:id",
    protect,
    authorize("ADMIN"),
    updateProject
);

// Delete project
// ADMIN only
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteProject
);

module.exports = router;