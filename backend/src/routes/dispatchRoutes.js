const express = require("express");

const router = express.Router();

// Middleware
const protect = require("../middleware/authMiddleware");
const authorize = protect.authorize;

// Controller
const {
  getDispatches,
  getDispatchById,
  createDispatch,
  updateDispatchStatus,
  confirmDelivery,
  cancelDispatch,
} = require("../controllers/dispatchController");


// GET ALL
router.get("/", protect, getDispatches);

// GET ONE
router.get("/:id", protect, getDispatchById);

// CREATE
router.post(
  "/",
  protect,
  authorize("ADMIN", "SUPPLY_MANAGER"),
  createDispatch
);

// UPDATE STATUS
router.put(
  "/:id/status",
  protect,
  authorize("ADMIN", "SUPPLY_MANAGER"),
  updateDispatchStatus
);

// CONFIRM DELIVERY
router.put(
  "/:id/confirm",
  protect,
  authorize("ADMIN", "PROJECT_MANAGER"),
  confirmDelivery
);

// CANCEL
router.put(
  "/:id/cancel",
  protect,
  authorize("ADMIN", "SUPPLY_MANAGER"),
  cancelDispatch
);

module.exports = router;