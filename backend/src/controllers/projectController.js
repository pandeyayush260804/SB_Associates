const Project = require("../models/Project");
const User = require("../models/User");

// ============================================
// Get All Projects
// ============================================

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("projectManager", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    } catch (error) {
        console.error("Get Projects Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching projects",
        });
    }
};

// ============================================
// Get Single Project
// ============================================

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("projectManager", "name email role");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.error("Get Project Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching project",
        });
    }
};

// ============================================
// Create Project
// ============================================

const createProject = async (req, res) => {
    try {
        const {
            name,
            projectCode,
            projectType,
            client,
            location,
            description,
            startDate,
            expectedCompletion,
            projectManager,
            status,
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !projectCode ||
            !projectType ||
            !client ||
            !location ||
            !startDate ||
            !expectedCompletion ||
            !projectManager
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required project fields",
            });
        }

        // Check project manager
        const manager = await User.findById(projectManager);

        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Project manager not found",
            });
        }

        if (manager.role !== "PROJECT_MANAGER") {
            return res.status(400).json({
                success: false,
                message:
                    "Selected user must have PROJECT_MANAGER role",
            });
        }

        // Check project code uniqueness
        const existingProject = await Project.findOne({
            projectCode: projectCode.toUpperCase(),
        });

        if (existingProject) {
            return res.status(400).json({
                success: false,
                message: "Project code already exists",
            });
        }

        // Create project
        const project = await Project.create({
            name,
            projectCode: projectCode.toUpperCase(),
            projectType,
            client,
            location,
            description,
            startDate,
            expectedCompletion,
            projectManager,
            status: status || "PLANNING",
        });

        // Populate manager before response
        await project.populate(
            "projectManager",
            "name email role"
        );

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        console.error("Create Project Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating project",
        });
    }
};

// ============================================
// Update Project
// ============================================

const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const {
            name,
            projectCode,
            projectType,
            client,
            location,
            description,
            startDate,
            expectedCompletion,
            projectManager,
            status,
        } = req.body;

        // If project manager is being changed
        if (projectManager) {
            const manager = await User.findById(projectManager);

            if (!manager) {
                return res.status(404).json({
                    success: false,
                    message: "Project manager not found",
                });
            }

            if (manager.role !== "PROJECT_MANAGER") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected user must have PROJECT_MANAGER role",
                });
            }

            project.projectManager = projectManager;
        }

        // If project code is being changed
        if (
            projectCode &&
            projectCode.toUpperCase() !== project.projectCode
        ) {
            const existingProject = await Project.findOne({
                projectCode: projectCode.toUpperCase(),
                _id: { $ne: project._id },
            });

            if (existingProject) {
                return res.status(400).json({
                    success: false,
                    message: "Project code already exists",
                });
            }

            project.projectCode = projectCode.toUpperCase();
        }

        // Update fields only if provided
        if (name !== undefined) project.name = name;
        if (projectType !== undefined)
            project.projectType = projectType;
        if (client !== undefined) project.client = client;
        if (location !== undefined)
            project.location = location;
        if (description !== undefined)
            project.description = description;
        if (startDate !== undefined)
            project.startDate = startDate;
        if (expectedCompletion !== undefined)
            project.expectedCompletion = expectedCompletion;
        if (status !== undefined) project.status = status;

        await project.save();

        await project.populate(
            "projectManager",
            "name email role"
        );

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project,
        });
    } catch (error) {
        console.error("Update Project Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating project",
        });
    }
};

// ============================================
// Delete Project
// ============================================

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Delete Project Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting project",
        });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
};