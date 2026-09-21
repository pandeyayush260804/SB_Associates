const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: [true, "Material is required"],
        },

        quantity: {
            type: Number,
            required: [true, "Order quantity is required"],
            min: [1, "Order quantity must be greater than 0"],
        },

        receivedQuantity: {
            type: Number,
            default: 0,
            min: [0, "Received quantity cannot be negative"],
        },

        unitPrice: {
            type: Number,
            required: [true, "Unit price is required"],
            min: [0, "Unit price cannot be negative"],
        },

        totalPrice: {
            type: Number,
            default: 0,
            min: [0, "Total price cannot be negative"],
        },
    },
    { _id: true }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: [true, "Order number is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: [true, "Supplier is required"],
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: [true, "Project is required"],
        },

        requirement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Requirement",
            required: [true, "Requirement is required"],
        },

        items: {
            type: [orderItemSchema],
            required: [true, "At least one order item is required"],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "At least one order item is required",
            },
        },

        totalAmount: {
            type: Number,
            default: 0,
            min: [0, "Total amount cannot be negative"],
        },

        expectedDeliveryDate: {
            type: Date,
            required: [true, "Expected delivery date is required"],
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "PLACED",
                "PARTIALLY_RECEIVED",
                "RECEIVED",
                "CANCELLED",
            ],
            default: "DRAFT",
        },

        remarks: {
            type: String,
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;