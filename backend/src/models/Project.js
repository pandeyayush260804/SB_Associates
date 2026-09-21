const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
        },

        projectCode: {
            type: String,
            required: [true, "Project code is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },

        projectType: {
            type: String,
            enum: [
                "SOLAR",
                "HYDRO",
                "DAM",
                "INFRASTRUCTURE",
                "OTHER",
            ],
            required: [true, "Project type is required"],
        },

        client: {
            type: String,
            required: [true, "Client name is required"],
            trim: true,
        },

        location: {
            type: String,
            required: [true, "Project location is required"],
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },

        expectedCompletion: {
            type: Date,
            required: [true, "Expected completion date is required"],
        },

        projectManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Project manager is required"],
        },

        status: {
            type: String,
            enum: [
                "PLANNING",
                "IN_PROGRESS",
                "ON_HOLD",
                "COMPLETED",
                "CANCELLED",
            ],
            default: "PLANNING",
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;