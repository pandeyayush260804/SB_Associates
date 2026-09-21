const express = require("express");

const {
    getOrders,
    getOrderById,
    createOrder,
    placeOrder,
    receiveOrder,
    cancelOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// GET ALL ORDERS
// ==========================================
router.get(
    "/",
    protect,
    authorize(
        "ADMIN",
        "SUPPLY_MANAGER",
        "PROJECT_MANAGER"
    ),
    getOrders
);

// ==========================================
// GET ORDER BY ID
// ==========================================
router.get(
    "/:id",
    protect,
    authorize(
        "ADMIN",
        "SUPPLY_MANAGER",
        "PROJECT_MANAGER"
    ),
    getOrderById
);

// ==========================================
// CREATE ORDER
// ==========================================
router.post(
    "/",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    createOrder
);

// ==========================================
// PLACE ORDER
// ==========================================
router.put(
    "/:id/place",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    placeOrder
);

// ==========================================
// RECEIVE MATERIAL
// ==========================================
router.put(
    "/:id/receive",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    receiveOrder
);

// ==========================================
// CANCEL ORDER
// ==========================================
router.put(
    "/:id/cancel",
    protect,
    authorize("ADMIN", "SUPPLY_MANAGER"),
    cancelOrder
);

module.exports = router;