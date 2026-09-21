const Requirement = require("../models/Requirement");
const Project = require("../models/Project");
const Material = require("../models/Material");
const User = require("../models/User");

// ============================================
// Get All Requirements
// ============================================

const getRequirements = async (req, res) => {
    try {
        const { status, project, priority } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (project) {
            filter.project = project;
        }

        if (priority) {
            filter.priority = priority;
        }

        const requirements = await Requirement.find(filter)
            .populate(
                "project",
                "name projectCode projectType client location"
            )
            .populate(
                "requestedBy",
                "name email role"
            )
            .populate(
                "items.material",
                "name sku category unit currentStock minimumStock unitPrice"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requirements.length,
            data: requirements,
        });
    } catch (error) {
        console.error(
            "Get Requirements Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching requirements",
        });
    }
};

// ============================================
// Get Single Requirement
// ============================================

const getRequirementById = async (req, res) => {
    try {
        const requirement =
            await Requirement.findById(req.params.id)
                .populate(
                    "project",
                    "name projectCode projectType client location"
                )
                .populate(
                    "requestedBy",
                    "name email role"
                )
                .populate(
                    "items.material",
                    "name sku category unit currentStock minimumStock unitPrice"
                );

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found",
            });
        }

        res.status(200).json({
            success: true,
            data: requirement,
        });
    } catch (error) {
        console.error(
            "Get Requirement Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while fetching requirement",
        });
    }
};

// ============================================
// Create Requirement
// ============================================

const createRequirement = async (req, res) => {
    try {
        const {
            project,
            items,
            priority,
            remarks,
        } = req.body;

        // Validate project
        if (!project) {
            return res.status(400).json({
                success: false,
                message: "Project is required",
            });
        }

        // Validate items
        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one material is required",
            });
        }

        // Check project
        const projectExists =
            await Project.findById(project);

        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Validate each material
        const processedItems = [];

        for (const item of items) {
            if (
                !item.material ||
                item.requiredQuantity === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each item must contain material and requiredQuantity",
                });
            }

            if (item.requiredQuantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Required quantity must be greater than zero",
                });
            }

            const material =
                await Material.findById(item.material);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message:
                        `Material not found: ${item.material}`,
                });
            }

            if (!material.isActive) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Material ${material.name} is inactive`,
                });
            }

            processedItems.push({
                material: material._id,
                requiredQuantity:
                    item.requiredQuantity,
                allocatedQuantity: 0,
                pendingQuantity:
                    item.requiredQuantity,
            });
        }

        // Create requirement
        const requirement =
            await Requirement.create({
                project,
                requestedBy: req.user._id,
                items: processedItems,
                priority:
                    priority || "MEDIUM",
                remarks,
                status: "PENDING",
            });

        await requirement.populate([
            {
                path: "project",
                select:
                    "name projectCode projectType client location",
            },
            {
                path: "requestedBy",
                select: "name email role",
            },
            {
                path: "items.material",
                select:
                    "name sku category unit currentStock minimumStock unitPrice",
            },
        ]);

        res.status(201).json({
            success: true,
            message:
                "Material requirement created successfully",
            data: requirement,
        });
    } catch (error) {
        console.error(
            "Create Requirement Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while creating requirement",
        });
    }
};

// ============================================
// Approve Requirement
// ============================================

const approveRequirement = async (req, res) => {
    try {
        const requirement =
            await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found",
            });
        }

        if (requirement.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending requirements can be approved",
            });
        }

        requirement.status = "APPROVED";

        await requirement.save();

        await requirement.populate([
            {
                path: "project",
                select:
                    "name projectCode projectType client location",
            },
            {
                path: "requestedBy",
                select: "name email role",
            },
            {
                path: "items.material",
                select:
                    "name sku category unit currentStock minimumStock unitPrice",
            },
        ]);

        res.status(200).json({
            success: true,
            message:
                "Requirement approved successfully",
            data: requirement,
        });
    } catch (error) {
        console.error(
            "Approve Requirement Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while approving requirement",
        });
    }
};

// ============================================
// Reject Requirement
// ============================================

const rejectRequirement = async (req, res) => {
    try {
        const {
            rejectionReason,
        } = req.body;

        const requirement =
            await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found",
            });
        }

        if (requirement.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending requirements can be rejected",
            });
        }

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message:
                    "Rejection reason is required",
            });
        }

        requirement.status = "REJECTED";
        requirement.rejectionReason =
            rejectionReason;

        await requirement.save();

        res.status(200).json({
            success: true,
            message:
                "Requirement rejected successfully",
            data: requirement,
        });
    } catch (error) {
        console.error(
            "Reject Requirement Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while rejecting requirement",
        });
    }
};

// ============================================
// Allocate Inventory
// ============================================

const allocateInventory = async (req, res) => {
    try {
        const requirement =
            await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found",
            });
        }

        if (
            requirement.status !== "APPROVED" &&
            requirement.status !== "PROCESSING"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Requirement must be approved before inventory allocation",
            });
        }

        let hasPending = false;
        let hasAllocation = false;

        // Process every requirement item
        for (const item of requirement.items) {
            const material =
                await Material.findById(item.material);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message:
                        "One of the requested materials no longer exists",
                });
            }

            const remainingQuantity =
                item.requiredQuantity -
                item.allocatedQuantity;

            if (remainingQuantity <= 0) {
                continue;
            }

            // Enough stock
            if (
                material.currentStock >=
                remainingQuantity
            ) {
                material.currentStock -=
                    remainingQuantity;

                item.allocatedQuantity +=
                    remainingQuantity;

                item.pendingQuantity = 0;

                hasAllocation = true;

                await material.save();
            }

            // Partial stock available
            else if (material.currentStock > 0) {
                const availableStock =
                    material.currentStock;

                material.currentStock = 0;

                item.allocatedQuantity +=
                    availableStock;

                item.pendingQuantity =
                    item.requiredQuantity -
                    item.allocatedQuantity;

                hasAllocation = true;
                hasPending = true;

                await material.save();
            }

            // No stock available
            else {
                item.pendingQuantity =
                    item.requiredQuantity -
                    item.allocatedQuantity;

                hasPending = true;
            }
        }

        // Determine final requirement status
        const allFulfilled =
            requirement.items.every(
                (item) =>
                    item.pendingQuantity === 0
            );

        const anyPending =
            requirement.items.some(
                (item) =>
                    item.pendingQuantity > 0
            );

        if (allFulfilled) {
            requirement.status = "FULFILLED";
        } else if (hasAllocation && anyPending) {
            requirement.status =
                "PARTIALLY_FULFILLED";
        } else {
            requirement.status = "PROCESSING";
        }

        await requirement.save();

        await requirement.populate([
            {
                path: "project",
                select:
                    "name projectCode projectType client location",
            },
            {
                path: "requestedBy",
                select: "name email role",
            },
            {
                path: "items.material",
                select:
                    "name sku category unit currentStock minimumStock unitPrice",
            },
        ]);

        res.status(200).json({
            success: true,
            message:
                "Inventory allocation completed",
            data: requirement,
        });
    } catch (error) {
        console.error(
            "Allocate Inventory Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while allocating inventory",
        });
    }
};

module.exports = {
    getRequirements,
    getRequirementById,
    createRequirement,
    approveRequirement,
    rejectRequirement,
    allocateInventory,
};