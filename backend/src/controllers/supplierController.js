const Supplier = require("../models/Supplier");
const Material = require("../models/Material");

// ==========================================
// GET ALL SUPPLIERS
// ==========================================
const getSuppliers = async (req, res) => {
    try {
        const { search, city, state, active } = req.query;

        const filter = {};

        // Search by supplier name or supplier code
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    supplierCode: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Filter by city
        if (city) {
            filter.city = {
                $regex: city,
                $options: "i",
            };
        }

        // Filter by state
        if (state) {
            filter.state = {
                $regex: state,
                $options: "i",
            };
        }

        // Filter active/inactive suppliers
        if (active !== undefined) {
            filter.isActive = active === "true";
        }

        const suppliers = await Supplier.find(filter)
            .populate(
                "materialsSupplied",
                "name sku category unit"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: suppliers.length,
            data: suppliers,
        });
    } catch (error) {
        console.error("Get Suppliers Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching suppliers",
        });
    }
};

// ==========================================
// GET SUPPLIER BY ID
// ==========================================
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id)
            .populate(
                "materialsSupplied",
                "name sku category unit currentStock"
            );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        res.status(200).json({
            success: true,
            data: supplier,
        });
    } catch (error) {
        console.error("Get Supplier Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching supplier",
        });
    }
};

// ==========================================
// CREATE SUPPLIER
// ==========================================
const createSupplier = async (req, res) => {
    try {
        const {
            name,
            supplierCode,
            contactPerson,
            email,
            phone,
            address,
            city,
            state,
            materialsSupplied,
            remarks,
        } = req.body;

        if (
            !name ||
            !supplierCode ||
            !contactPerson ||
            !phone
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, supplier code, contact person and phone are required",
            });
        }

        // Check duplicate supplier code
        const existingSupplier = await Supplier.findOne({
            supplierCode: supplierCode.toUpperCase(),
        });

        if (existingSupplier) {
            return res.status(400).json({
                success: false,
                message: "Supplier with this code already exists",
            });
        }

        // Validate materials if provided
        let validMaterials = [];

        if (
            materialsSupplied &&
            Array.isArray(materialsSupplied)
        ) {
            validMaterials = await Material.find({
                _id: { $in: materialsSupplied },
                isActive: true,
            }).select("_id");

            if (
                validMaterials.length !==
                materialsSupplied.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more supplied materials are invalid or inactive",
                });
            }

            validMaterials = validMaterials.map(
                (material) => material._id
            );
        }

        const supplier = await Supplier.create({
            name,
            supplierCode: supplierCode.toUpperCase(),
            contactPerson,
            email,
            phone,
            address,
            city,
            state,
            materialsSupplied: validMaterials,
            remarks,
        });

        const populatedSupplier =
            await Supplier.findById(supplier._id).populate(
                "materialsSupplied",
                "name sku category unit"
            );

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: populatedSupplier,
        });
    } catch (error) {
        console.error("Create Supplier Error:", error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Supplier code already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while creating supplier",
        });
    }
};

// ==========================================
// UPDATE SUPPLIER
// ==========================================
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(
            req.params.id
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        const {
            name,
            supplierCode,
            contactPerson,
            email,
            phone,
            address,
            city,
            state,
            materialsSupplied,
            remarks,
        } = req.body;

        if (supplierCode) {
            const duplicate = await Supplier.findOne({
                supplierCode: supplierCode.toUpperCase(),
                _id: { $ne: supplier._id },
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Another supplier already uses this code",
                });
            }

            supplier.supplierCode =
                supplierCode.toUpperCase();
        }

        if (name !== undefined) supplier.name = name;
        if (contactPerson !== undefined)
            supplier.contactPerson = contactPerson;
        if (email !== undefined) supplier.email = email;
        if (phone !== undefined) supplier.phone = phone;
        if (address !== undefined)
            supplier.address = address;
        if (city !== undefined) supplier.city = city;
        if (state !== undefined) supplier.state = state;
        if (remarks !== undefined)
            supplier.remarks = remarks;

        // Validate updated materials
        if (materialsSupplied !== undefined) {
            if (!Array.isArray(materialsSupplied)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "materialsSupplied must be an array",
                });
            }

            const validMaterials = await Material.find({
                _id: { $in: materialsSupplied },
                isActive: true,
            }).select("_id");

            if (
                validMaterials.length !==
                materialsSupplied.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more supplied materials are invalid or inactive",
                });
            }

            supplier.materialsSupplied =
                validMaterials.map(
                    (material) => material._id
                );
        }

        await supplier.save();

        const updatedSupplier =
            await Supplier.findById(supplier._id).populate(
                "materialsSupplied",
                "name sku category unit"
            );

        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: updatedSupplier,
        });
    } catch (error) {
        console.error("Update Supplier Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating supplier",
        });
    }
};

// ==========================================
// ACTIVATE / DEACTIVATE SUPPLIER
// ==========================================
const toggleSupplierStatus = async (req, res) => {
    try {
        const supplier = await Supplier.findById(
            req.params.id
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        supplier.isActive = !supplier.isActive;

        await supplier.save();

        res.status(200).json({
            success: true,
            message: supplier.isActive
                ? "Supplier activated successfully"
                : "Supplier deactivated successfully",
            data: {
                id: supplier._id,
                name: supplier.name,
                isActive: supplier.isActive,
            },
        });
    } catch (error) {
        console.error(
            "Toggle Supplier Status Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while updating supplier status",
        });
    }
};

// ==========================================
// DELETE SUPPLIER
// ==========================================
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(
            req.params.id
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        await Supplier.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Supplier deleted successfully",
        });
    } catch (error) {
        console.error("Delete Supplier Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting supplier",
        });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    toggleSupplierStatus,
    deleteSupplier,
};