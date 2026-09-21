const express = require("express");

const {
    getRequirements,
    getRequirementById,
    createRequirement,
    approveRequirement,
    rejectRequirement,
    allocateInventory,
} = require("../controllers/requirementController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================
// Get All Requirements
// ============================================

router.get(
    "/",
    protect,
    authorize(
        "ADMIN",
        "PROJECT_MANAGER",
        "SUPPLY_MANAGER"
    ),
    getRequirements
);

// ============================================
// Get Single Requirement
// ============================================

router.get(
    "/:id",
    protect,
    authorize(
        "ADMIN",
        "PROJECT_MANAGER",
        "SUPPLY_MANAGER"
    ),
    getRequirementById
);

// ============================================
// Create Requirement
// ============================================

// Project Manager can create requirements
router.post(
    "/",
    protect,
    authorize("PROJECT_MANAGER"),
    createRequirement
);

// ============================================
// Approve Requirement
// ============================================

// Admin or Supply Manager can approve
router.put(
    "/:id/approve",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    approveRequirement
);

// ============================================
// Reject Requirement
// ============================================

// Admin or Supply Manager can reject
router.put(
    "/:id/reject",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    rejectRequirement
);

// ============================================
// Allocate Inventory
// ============================================

// Supply Manager or Admin can allocate
router.put(
    "/:id/allocate",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    allocateInventory
);

module.exports = router;