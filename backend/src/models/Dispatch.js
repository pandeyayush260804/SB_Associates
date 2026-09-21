const mongoose = require("mongoose");

// ============================================
// DISPATCH ITEM SCHEMA
// ============================================

const dispatchItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

// ============================================
// DISPATCH SCHEMA
// ============================================

const dispatchSchema = new mongoose.Schema(
  {
    // ------------------------------------------
    // Dispatch Number
    // ------------------------------------------

    dispatchNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },

    // ------------------------------------------
    // Project
    // ------------------------------------------

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // ------------------------------------------
    // Requirement
    // ------------------------------------------

    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
      required: true,
    },

    // ------------------------------------------
    // Dispatch Items
    // ------------------------------------------

    items: {
      type: [dispatchItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "At least one dispatch item is required",
      },
    },

    // ------------------------------------------
    // Dispatch Dates
    // ------------------------------------------

    dispatchDate: {
      type: Date,
      default: Date.now,
    },

    expectedDeliveryDate: {
      type: Date,
      required: true,
    },

    actualDeliveryDate: {
      type: Date,
    },

    // ------------------------------------------
    // Transport Details
    // ------------------------------------------

    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    transporterName: {
      type: String,
      trim: true,
    },

    driverName: {
      type: String,
      trim: true,
    },

    driverPhone: {
      type: String,
      trim: true,
    },

    // ------------------------------------------
    // Delivery Address
    // ------------------------------------------

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // ------------------------------------------
    // Dispatch Status
    // ------------------------------------------

    status: {
      type: String,
      enum: [
        "READY",
        "DISPATCHED",
        "IN_TRANSIT",
        "DELIVERED",
        "CONFIRMED",
        "CANCELLED",
      ],
      default: "READY",
    },

    // ------------------------------------------
    // Inventory Tracking
    // ------------------------------------------

    inventoryDeducted: {
      type: Boolean,
      default: false,
    },

    // ------------------------------------------
    // Delivery Confirmation
    // ------------------------------------------

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ------------------------------------------
    // Additional Information
    // ------------------------------------------

    remarks: {
      type: String,
      trim: true,
    },

    // ------------------------------------------
    // Created By
    // ------------------------------------------

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dispatch", dispatchSchema);