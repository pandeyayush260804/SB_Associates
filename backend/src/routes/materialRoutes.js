const express = require("express");

const {
    getMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    updateStock,
} = require("../controllers/materialController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================
// Material Routes
// ============================================

// Get all materials
// ADMIN, PROJECT_MANAGER, SUPPLY_MANAGER
router.get(
    "/",
    protect,
    authorize(
        "ADMIN",
        "PROJECT_MANAGER",
        "SUPPLY_MANAGER"
    ),
    getMaterials
);

// Get single material
// ADMIN, PROJECT_MANAGER, SUPPLY_MANAGER
router.get(
    "/:id",
    protect,
    authorize(
        "ADMIN",
        "PROJECT_MANAGER",
        "SUPPLY_MANAGER"
    ),
    getMaterialById
);

// Create material
// ADMIN, SUPPLY_MANAGER
router.post(
    "/",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    createMaterial
);

// Update material
// ADMIN, SUPPLY_MANAGER
router.put(
    "/:id",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    updateMaterial
);

// Delete material
// ADMIN only
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteMaterial
);

// Update stock
// ADMIN, SUPPLY_MANAGER
router.put(
    "/:id/stock",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    updateStock
);

module.exports = router;