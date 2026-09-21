const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Material name is required"],
            trim: true,
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },

        category: {
            type: String,
            required: [true, "Material category is required"],
            trim: true,
        },

        unit: {
            type: String,
            required: [true, "Material unit is required"],
            trim: true,
        },

        currentStock: {
            type: Number,
            required: [true, "Current stock is required"],
            min: [0, "Current stock cannot be negative"],
            default: 0,
        },

        minimumStock: {
            type: Number,
            required: [true, "Minimum stock is required"],
            min: [0, "Minimum stock cannot be negative"],
            default: 0,
        },

        unitPrice: {
            type: Number,
            required: [true, "Unit price is required"],
            min: [0, "Unit price cannot be negative"],
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Material = mongoose.model("Material", materialSchema);

module.exports = Material;