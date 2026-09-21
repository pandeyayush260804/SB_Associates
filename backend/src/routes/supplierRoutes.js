const express = require("express");

const {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    toggleSupplierStatus,
    deleteSupplier,
} = require("../controllers/supplierController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all suppliers
router.get(
    "/",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER", "PROJECT_MANAGER"),
    getSuppliers
);

// Get supplier by ID
router.get(
    "/:id",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER", "PROJECT_MANAGER"),
    getSupplierById
);

// Create supplier
router.post(
    "/",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    createSupplier
);

// Update supplier
router.put(
    "/:id",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    updateSupplier
);

// Activate / deactivate supplier
router.put(
    "/:id/toggle-status",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    toggleSupplierStatus
);

// Delete supplier
router.delete(
    "/:id",
    protect,
    authorize("ADMIN"),
    deleteSupplier
);

module.exports = router;