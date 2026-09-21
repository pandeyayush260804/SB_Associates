const Material = require("../models/Material");

// ============================================
// Get All Materials
// ============================================

const getMaterials = async (req, res) => {
    try {
        const { search, category, lowStock } = req.query;

        const filter = {};

        // Search by name or SKU
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    sku: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Filter by category
        if (category) {
            filter.category = {
                $regex: category,
                $options: "i",
            };
        }

        // Filter low-stock materials
        if (lowStock === "true") {
            filter.$expr = {
                $lte: ["$currentStock", "$minimumStock"],
            };
        }

        const materials = await Material.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: materials.length,
            data: materials,
        });
    } catch (error) {
        console.error("Get Materials Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching materials",
        });
    }
};

// ============================================
// Get Single Material
// ============================================

const getMaterialById = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        res.status(200).json({
            success: true,
            data: material,
        });
    } catch (error) {
        console.error("Get Material Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching material",
        });
    }
};

// ============================================
// Create Material
// ============================================

const createMaterial = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            unit,
            currentStock,
            minimumStock,
            unitPrice,
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !sku ||
            !category ||
            !unit ||
            currentStock === undefined ||
            minimumStock === undefined ||
            unitPrice === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required material fields",
            });
        }

        // Check SKU
        const existingMaterial = await Material.findOne({
            sku: sku.toUpperCase(),
        });

        if (existingMaterial) {
            return res.status(400).json({
                success: false,
                message: "Material with this SKU already exists",
            });
        }

        // Create material
        const material = await Material.create({
            name,
            sku: sku.toUpperCase(),
            category,
            unit,
            currentStock,
            minimumStock,
            unitPrice,
        });

        res.status(201).json({
            success: true,
            message: "Material created successfully",
            data: material,
        });
    } catch (error) {
        console.error("Create Material Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating material",
        });
    }
};

// ============================================
// Update Material
// ============================================

const updateMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        const {
            name,
            sku,
            category,
            unit,
            currentStock,
            minimumStock,
            unitPrice,
            isActive,
        } = req.body;

        // Check SKU uniqueness if changed
        if (
            sku &&
            sku.toUpperCase() !== material.sku
        ) {
            const existingMaterial = await Material.findOne({
                sku: sku.toUpperCase(),
                _id: { $ne: material._id },
            });

            if (existingMaterial) {
                return res.status(400).json({
                    success: false,
                    message: "Material with this SKU already exists",
                });
            }

            material.sku = sku.toUpperCase();
        }

        // Update fields
        if (name !== undefined) material.name = name;
        if (category !== undefined) material.category = category;
        if (unit !== undefined) material.unit = unit;
        if (currentStock !== undefined)
            material.currentStock = currentStock;
        if (minimumStock !== undefined)
            material.minimumStock = minimumStock;
        if (unitPrice !== undefined)
            material.unitPrice = unitPrice;
        if (isActive !== undefined)
            material.isActive = isActive;

        await material.save();

        res.status(200).json({
            success: true,
            message: "Material updated successfully",
            data: material,
        });
    } catch (error) {
        console.error("Update Material Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating material",
        });
    }
};

// ============================================
// Delete Material
// ============================================

const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        await material.deleteOne();

        res.status(200).json({
            success: true,
            message: "Material deleted successfully",
        });
    } catch (error) {
        console.error("Delete Material Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting material",
        });
    }
};

// ============================================
// Update Stock
// ============================================

const updateStock = async (req, res) => {
    try {
        const { quantity, operation } = req.body;

        if (quantity === undefined || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero",
            });
        }

        if (!["ADD", "REMOVE"].includes(operation)) {
            return res.status(400).json({
                success: false,
                message: "Operation must be ADD or REMOVE",
            });
        }

        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found",
            });
        }

        if (
            operation === "REMOVE" &&
            material.currentStock < quantity
        ) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
        }

        if (operation === "ADD") {
            material.currentStock += quantity;
        } else {
            material.currentStock -= quantity;
        }

        await material.save();

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: material,
        });
    } catch (error) {
        console.error("Update Stock Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating stock",
        });
    }
};

module.exports = {
    getMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    updateStock,
};