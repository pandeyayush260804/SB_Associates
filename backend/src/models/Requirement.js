const mongoose = require("mongoose");

const requirementItemSchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: [true, "Material is required"],
        },

        requiredQuantity: {
            type: Number,
            required: [true, "Required quantity is required"],
            min: [0, "Required quantity cannot be negative"],
        },

        allocatedQuantity: {
            type: Number,
            default: 0,
            min: [0, "Allocated quantity cannot be negative"],
        },

        pendingQuantity: {
            type: Number,
            default: 0,
            min: [0, "Pending quantity cannot be negative"],
        },
    },
    {
        _id: true,
    }
);

const requirementSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: [true, "Project is required"],
        },

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Requester is required"],
        },

        items: {
            type: [requirementItemSchema],
            required: [true, "At least one material is required"],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "At least one material is required",
            },
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            default: "MEDIUM",
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "PROCESSING",
                "PARTIALLY_FULFILLED",
                "FULFILLED",
            ],
            default: "PENDING",
        },

        remarks: {
            type: String,
            trim: true,
        },

        rejectionReason: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Requirement = mongoose.model(
    "Requirement",
    requirementSchema
);

module.exports = Requirement;