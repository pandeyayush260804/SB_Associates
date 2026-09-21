const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Supplier name is required"],
            trim: true,
        },

        supplierCode: {
            type: String,
            required: [true, "Supplier code is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },

        contactPerson: {
            type: String,
            required: [true, "Contact person is required"],
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },

        address: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },

        materialsSupplied: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Material",
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        remarks: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;