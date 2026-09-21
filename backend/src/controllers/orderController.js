const Order = require("../models/Order");
const Supplier = require("../models/Supplier");
const Project = require("../models/Project");
const Requirement = require("../models/Requirement");
const Material = require("../models/Material");

// ==========================================
// GENERATE ORDER NUMBER
// ==========================================
const generateOrderNumber = async () => {
    const count = await Order.countDocuments();

    const nextNumber = count + 1;

    return `PO-${String(nextNumber).padStart(4, "0")}`;
};

// ==========================================
// GET ALL ORDERS
// ==========================================
const getOrders = async (req, res) => {
    try {
        const {
            status,
            supplier,
            project,
            requirement,
        } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (supplier) {
            filter.supplier = supplier;
        }

        if (project) {
            filter.project = project;
        }

        if (requirement) {
            filter.requirement = requirement;
        }

        const orders = await Order.find(filter)
            .populate(
                "supplier",
                "name supplierCode contactPerson phone city state"
            )
            .populate(
                "project",
                "name projectCode projectType client location"
            )
            .populate(
                "requirement",
                "status priority remarks"
            )
            .populate(
                "items.material",
                "name sku category unit"
            )
            .populate(
                "createdBy",
                "name email role"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error("Get Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching orders",
        });
    }
};

// ==========================================
// GET ORDER BY ID
// ==========================================
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate(
                "supplier",
                "name supplierCode contactPerson phone email address city state"
            )
            .populate(
                "project",
                "name projectCode projectType client location"
            )
            .populate(
                "requirement"
            )
            .populate(
                "items.material",
                "name sku category unit currentStock"
            )
            .populate(
                "createdBy",
                "name email role"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error("Get Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching order",
        });
    }
};

// ==========================================
// CREATE ORDER
// ==========================================
const createOrder = async (req, res) => {
    try {
        const {
            supplier,
            project,
            requirement,
            items,
            expectedDeliveryDate,
            remarks,
        } = req.body;

        // ------------------------------------------
        // Basic validation
        // ------------------------------------------
        if (
            !supplier ||
            !project ||
            !requirement ||
            !items ||
            !Array.isArray(items) ||
            items.length === 0 ||
            !expectedDeliveryDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Supplier, project, requirement, items and expected delivery date are required",
            });
        }

        // ------------------------------------------
        // Validate supplier
        // ------------------------------------------
        const supplierDoc = await Supplier.findById(
            supplier
        );

        if (!supplierDoc) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        if (!supplierDoc.isActive) {
            return res.status(400).json({
                success: false,
                message: "Selected supplier is inactive",
            });
        }

        // ------------------------------------------
        // Validate project
        // ------------------------------------------
        const projectDoc = await Project.findById(project);

        if (!projectDoc) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // ------------------------------------------
        // Validate requirement
        // ------------------------------------------
        const requirementDoc =
            await Requirement.findById(requirement);

        if (!requirementDoc) {
            return res.status(404).json({
                success: false,
                message: "Requirement not found",
            });
        }

        // Make sure requirement belongs to project
        if (
            requirementDoc.project.toString() !==
            project.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Requirement does not belong to the selected project",
            });
        }

        // Supplier orders only make sense for
        // requirements that have pending quantities.
        const hasPendingQuantity =
            requirementDoc.items.some(
                (item) => item.pendingQuantity > 0
            );

        if (!hasPendingQuantity) {
            return res.status(400).json({
                success: false,
                message:
                    "This requirement has no pending material quantity",
            });
        }

        // ------------------------------------------
        // Validate order items
        // ------------------------------------------
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            if (!item.material || !item.quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each order item requires material and quantity",
                });
            }

            const requirementItem =
                requirementDoc.items.find(
                    (reqItem) =>
                        reqItem.material.toString() ===
                        item.material.toString()
                );

            if (!requirementItem) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Material is not part of the selected requirement",
                });
            }

            // Cannot order more than the pending quantity
            if (
                Number(item.quantity) >
                requirementItem.pendingQuantity
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Cannot order more than pending quantity for material ${item.material}`,
                });
            }

            const material = await Material.findById(
                item.material
            );

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: "Material not found",
                });
            }

            if (!material.isActive) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Material ${material.name} is inactive`,
                });
            }

            // Make sure supplier supplies this material
            const suppliesMaterial =
                supplierDoc.materialsSupplied.some(
                    (materialId) =>
                        materialId.toString() ===
                        item.material.toString()
                );

            if (!suppliesMaterial) {
                return res.status(400).json({
                    success: false,
                    message:
                        `${supplierDoc.name} does not supply ${material.name}`,
                });
            }

            const quantity = Number(item.quantity);
            const unitPrice = Number(material.unitPrice);
            const itemTotal = quantity * unitPrice;

            orderItems.push({
                material: material._id,
                quantity,
                receivedQuantity: 0,
                unitPrice,
                totalPrice: itemTotal,
            });

            totalAmount += itemTotal;
        }

        // ------------------------------------------
        // Generate order number
        // ------------------------------------------
        const orderNumber = await generateOrderNumber();

        // ------------------------------------------
        // Create order
        // ------------------------------------------
        const order = await Order.create({
            orderNumber,
            supplier: supplierDoc._id,
            project: projectDoc._id,
            requirement: requirementDoc._id,
            items: orderItems,
            totalAmount,
            expectedDeliveryDate,
            status: "DRAFT",
            remarks,
            createdBy: req.user._id,
        });

        const populatedOrder =
            await Order.findById(order._id)
                .populate(
                    "supplier",
                    "name supplierCode contactPerson phone"
                )
                .populate(
                    "project",
                    "name projectCode projectType client location"
                )
                .populate(
                    "requirement",
                    "status priority"
                )
                .populate(
                    "items.material",
                    "name sku category unit"
                )
                .populate(
                    "createdBy",
                    "name email role"
                );

        res.status(201).json({
            success: true,
            message: "Supplier order created successfully",
            data: populatedOrder,
        });
    } catch (error) {
        console.error("Create Order Error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message:
                    "Order number already exists. Please try again.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while creating order",
        });
    }
};

// ==========================================
// PLACE ORDER
// ==========================================
const placeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.status !== "DRAFT") {
            return res.status(400).json({
                success: false,
                message:
                    "Only draft orders can be placed",
            });
        }

        order.status = "PLACED";

        await order.save();

        const updatedOrder =
            await Order.findById(order._id)
                .populate(
                    "supplier",
                    "name supplierCode contactPerson phone"
                )
                .populate(
                    "project",
                    "name projectCode projectType client location"
                )
                .populate(
                    "items.material",
                    "name sku category unit"
                );

        res.status(200).json({
            success: true,
            message: "Supplier order placed successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Place Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while placing order",
        });
    }
};

// ==========================================
// RECEIVE ORDER
// ==========================================
const receiveOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (
            order.status !== "PLACED" &&
            order.status !== "PARTIALLY_RECEIVED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Only placed or partially received orders can receive material",
            });
        }

        const receivedItems = req.body.items;

        if (
            !receivedItems ||
            !Array.isArray(receivedItems) ||
            receivedItems.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Received material quantities are required",
            });
        }

        let allReceived = true;

        // ------------------------------------------
        // Process received quantities
        // ------------------------------------------
        for (const receivedItem of receivedItems) {
            const orderItem = order.items.id(
                receivedItem.itemId
            );

            if (!orderItem) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order item ID",
                });
            }

            const quantity =
                Number(receivedItem.receivedQuantity);

            if (!Number.isFinite(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Received quantity must be greater than 0",
                });
            }

            const remaining =
                orderItem.quantity -
                orderItem.receivedQuantity;

            if (quantity > remaining) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Received quantity cannot exceed remaining order quantity",
                });
            }

            // Update order received quantity
            orderItem.receivedQuantity += quantity;

            // Update inventory
            const material = await Material.findById(
                orderItem.material
            );

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Material associated with order item not found",
                });
            }

            material.currentStock += quantity;

            await material.save();
        }

        // ------------------------------------------
        // Determine order status
        // ------------------------------------------
        for (const item of order.items) {
            if (
                item.receivedQuantity <
                item.quantity
            ) {
                allReceived = false;
                break;
            }
        }

        order.status = allReceived
            ? "RECEIVED"
            : "PARTIALLY_RECEIVED";

        await order.save();

        // ------------------------------------------
        // Update requirement quantities
        // ------------------------------------------
        const requirement =
            await Requirement.findById(
                order.requirement
            );

        if (requirement) {
            for (const orderItem of order.items) {
                const requirementItem =
                    requirement.items.find(
                        (reqItem) =>
                            reqItem.material.toString() ===
                            orderItem.material.toString()
                    );

                if (!requirementItem) continue;

                // Only the newly fulfilled amount
                // should reduce pending quantity.
                const fulfilledFromOrder =
                    orderItem.receivedQuantity;

                const previousAllocated =
                    requirementItem.allocatedQuantity;

                // Don't double count already reflected
                // quantities.
                const additionalAllocation =
                    Math.min(
                        fulfilledFromOrder,
                        requirementItem.pendingQuantity
                    );

                requirementItem.allocatedQuantity +=
                    additionalAllocation;

                requirementItem.pendingQuantity =
                    Math.max(
                        0,
                        requirementItem.requiredQuantity -
                            requirementItem.allocatedQuantity
                    );
            }

            const allFulfilled =
                requirement.items.every(
                    (item) =>
                        item.pendingQuantity === 0
                );

            const anyAllocated =
                requirement.items.some(
                    (item) =>
                        item.allocatedQuantity > 0
                );

            if (allFulfilled) {
                requirement.status = "FULFILLED";
            } else if (anyAllocated) {
                requirement.status =
                    "PARTIALLY_FULFILLED";
            }

            await requirement.save();
        }

        const updatedOrder =
            await Order.findById(order._id)
                .populate(
                    "supplier",
                    "name supplierCode contactPerson phone"
                )
                .populate(
                    "project",
                    "name projectCode projectType client location"
                )
                .populate(
                    "requirement"
                )
                .populate(
                    "items.material",
                    "name sku category unit currentStock"
                );

        res.status(200).json({
            success: true,
            message: "Material received successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Receive Order Error:", error);

        res.status(500).json({
            success: false,
            message:
                "Server error while receiving material",
        });
    }
};

// ==========================================
// CANCEL ORDER
// ==========================================
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (
            order.status === "RECEIVED" ||
            order.status === "PARTIALLY_RECEIVED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Received orders cannot be cancelled",
            });
        }

        if (order.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled",
            });
        }

        order.status = "CANCELLED";

        await order.save();

        res.status(200).json({
            success: true,
            message: "Supplier order cancelled successfully",
            data: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
            },
        });
    } catch (error) {
        console.error("Cancel Order Error:", error);

        res.status(500).json({
            success: false,
            message:
                "Server error while cancelling order",
        });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    placeOrder,
    receiveOrder,
    cancelOrder,
};