const Dispatch = require("../models/Dispatch");
const Project = require("../models/Project");
const Requirement = require("../models/Requirement");
const Material = require("../models/Material");

// ======================================================
// HELPER: Generate Dispatch Number
// ======================================================

const generateDispatchNumber = async () => {
  const count = await Dispatch.countDocuments();

  const number = count + 1;

  return `DSP-${String(number).padStart(4, "0")}`;
};

// ======================================================
// GET ALL DISPATCHES
// ======================================================

const getDispatches = async (req, res) => {
  try {
    const { status, project, requirement } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (project) {
      filter.project = project;
    }

    if (requirement) {
      filter.requirement = requirement;
    }

    const dispatches = await Dispatch.find(filter)
      .populate(
        "project",
        "name projectCode projectType client location status"
      )
      .populate("requirement", "priority status remarks")
      .populate(
        "items.material",
        "name sku category unit currentStock unitPrice"
      )
      .populate("createdBy", "name email role")
      .populate("confirmedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches,
    });
  } catch (error) {
    console.error("Get dispatches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dispatches",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE DISPATCH
// ======================================================

const getDispatchById = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id)
      .populate(
        "project",
        "name projectCode projectType client location status"
      )
      .populate("requirement", "priority status remarks items")
      .populate(
        "items.material",
        "name sku category unit currentStock unitPrice"
      )
      .populate("createdBy", "name email role")
      .populate("confirmedBy", "name email role");

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    console.error("Get dispatch by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dispatch",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE DISPATCH
// ======================================================

const createDispatch = async (req, res) => {
  try {
    const {
      project,
      requirement,
      items,
      expectedDeliveryDate,
      vehicleNumber,
      transporterName,
      driverName,
      driverPhone,
      deliveryAddress,
      remarks,
    } = req.body;

    // ------------------------------------------
    // Basic validation
    // ------------------------------------------

    if (!project || !requirement) {
      return res.status(400).json({
        success: false,
        message: "Project and requirement are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one dispatch item is required",
      });
    }

    if (!expectedDeliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Expected delivery date is required",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // ------------------------------------------
    // Validate project
    // ------------------------------------------

    const projectData = await Project.findById(project);

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ------------------------------------------
    // Validate requirement
    // ------------------------------------------

    const requirementData = await Requirement.findById(requirement);

    if (!requirementData) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    // Requirement must belong to project
    if (String(requirementData.project) !== String(project)) {
      return res.status(400).json({
        success: false,
        message: "Requirement does not belong to the selected project",
      });
    }

    // ------------------------------------------
    // Requirement status validation
    // ------------------------------------------

    if (
      requirementData.status !== "FULFILLED" &&
      requirementData.status !== "PARTIALLY_FULFILLED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Material can only be dispatched for an approved/fulfilled requirement",
      });
    }

    // ------------------------------------------
    // Validate dispatch items
    // ------------------------------------------

    const dispatchItems = [];

    for (const item of items) {
      if (!item.material || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Each dispatch item requires material and quantity",
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Dispatch quantity must be greater than zero",
        });
      }

      // Find requirement item
      const requirementItem = requirementData.items.find(
        (reqItem) =>
          String(reqItem.material) === String(item.material)
      );

      if (!requirementItem) {
        return res.status(400).json({
          success: false,
          message:
            "Material is not part of the selected requirement",
        });
      }

      // ------------------------------------------
      // Check allocated quantity
      // ------------------------------------------

      if (requirementItem.allocatedQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot dispatch ${item.quantity} units of material ` +
            `because only ${requirementItem.allocatedQuantity} units ` +
            `are allocated`,
        });
      }

      // ------------------------------------------
      // Validate material
      // ------------------------------------------

      const material = await Material.findById(item.material);

      if (!material) {
        return res.status(404).json({
          success: false,
          message: `Material not found: ${item.material}`,
        });
      }

      if (!material.isActive) {
        return res.status(400).json({
          success: false,
          message: `Material is inactive: ${material.name}`,
        });
      }

      // ------------------------------------------
      // Check current warehouse stock
      // ------------------------------------------

      if (material.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${material.name}. ` +
            `Available: ${material.currentStock}, ` +
            `Required: ${item.quantity}`,
        });
      }

      dispatchItems.push({
        material: item.material,
        quantity: item.quantity,
        receivedQuantity: 0,
      });
    }

    // ------------------------------------------
    // Generate dispatch number
    // ------------------------------------------

    const dispatchNumber = await generateDispatchNumber();

    // ------------------------------------------
    // Create dispatch
    // ------------------------------------------

    const dispatch = await Dispatch.create({
      dispatchNumber,
      project,
      requirement,
      items: dispatchItems,
      expectedDeliveryDate,
      vehicleNumber,
      transporterName,
      driverName,
      driverPhone,
      deliveryAddress,
      remarks,
      status: "READY",
      inventoryDeducted: false,
      createdBy: req.user._id,
    });

    // ------------------------------------------
    // Populate response
    // ------------------------------------------

    const populatedDispatch = await Dispatch.findById(dispatch._id)
      .populate(
        "project",
        "name projectCode projectType client location status"
      )
      .populate("requirement", "priority status remarks")
      .populate(
        "items.material",
        "name sku category unit currentStock unitPrice"
      )
      .populate("createdBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Dispatch created successfully",
      data: populatedDispatch,
    });
  } catch (error) {
    console.error("Create dispatch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create dispatch",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DISPATCH STATUS
// ======================================================

const updateDispatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "DISPATCHED",
      "IN_TRANSIT",
      "DELIVERED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dispatch status",
      });
    }

    // ------------------------------------------
    // Find dispatch
    // ------------------------------------------

    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found",
      });
    }

    // ------------------------------------------
    // Valid transitions
    // ------------------------------------------

    const validTransitions = {
      READY: ["DISPATCHED"],
      DISPATCHED: ["IN_TRANSIT"],
      IN_TRANSIT: ["DELIVERED"],
    };

    const nextStatuses =
      validTransitions[dispatch.status] || [];

    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid status transition: ` +
          `${dispatch.status} → ${status}`,
      });
    }

    // ==================================================
    // READY → DISPATCHED
    // DEDUCT INVENTORY
    // ==================================================

    if (
      dispatch.status === "READY" &&
      status === "DISPATCHED"
    ) {
      // ------------------------------------------
      // First validate ALL materials
      // ------------------------------------------

      const materials = [];

      for (const item of dispatch.items) {
        const material = await Material.findById(
          item.material
        );

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
              `Material is inactive: ${material.name}`,
          });
        }

        if (material.currentStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message:
              `Insufficient stock for ${material.name}. ` +
              `Available: ${material.currentStock}, ` +
              `Required: ${item.quantity}`,
          });
        }

        materials.push({
          material,
          quantity: item.quantity,
        });
      }

      // ------------------------------------------
      // Deduct inventory
      // ------------------------------------------

      for (const item of materials) {
        item.material.currentStock -= item.quantity;

        await item.material.save();
      }

      dispatch.inventoryDeducted = true;
    }

    // ==================================================
    // DELIVERED
    // ==================================================

    if (status === "DELIVERED") {
      dispatch.actualDeliveryDate = new Date();
    }

    // ------------------------------------------
    // Update status
    // ------------------------------------------

    dispatch.status = status;

    await dispatch.save();

    // ------------------------------------------
    // Populate response
    // ------------------------------------------

    const updatedDispatch = await Dispatch.findById(
      dispatch._id
    )
      .populate(
        "project",
        "name projectCode projectType client location status"
      )
      .populate("requirement", "priority status")
      .populate(
        "items.material",
        "name sku category unit currentStock unitPrice"
      )
      .populate("createdBy", "name email role")
      .populate("confirmedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Dispatch status updated successfully",
      data: updatedDispatch,
    });
  } catch (error) {
    console.error(
      "Update dispatch status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update dispatch status",
      error: error.message,
    });
  }
};

// ======================================================
// CONFIRM DELIVERY
// ======================================================

const confirmDelivery = async (req, res) => {
  try {
    const { items } = req.body;

    // ------------------------------------------
    // Find dispatch
    // ------------------------------------------

    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found",
      });
    }

    // ------------------------------------------
    // Must be DELIVERED
    // ------------------------------------------

    if (dispatch.status !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        message:
          "Delivery can only be confirmed after dispatch is DELIVERED",
      });
    }

    // ------------------------------------------
    // Validate received items
    // ------------------------------------------

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Received items are required",
      });
    }

    // ------------------------------------------
    // Validate every dispatch item
    // ------------------------------------------

    for (const dispatchItem of dispatch.items) {
      const receivedItem = items.find(
        (item) =>
          String(item.itemId) ===
          String(dispatchItem._id)
      );

      if (!receivedItem) {
        return res.status(400).json({
          success: false,
          message:
            `Received quantity missing for dispatch item ` +
            `${dispatchItem._id}`,
        });
      }

      const receivedQuantity =
        Number(receivedItem.receivedQuantity);

      if (
        !Number.isFinite(receivedQuantity) ||
        receivedQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Received quantity must be a valid non-negative number",
        });
      }

      if (
        receivedQuantity >
        dispatchItem.quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Received quantity cannot exceed dispatched quantity`,
        });
      }

      if (
        receivedQuantity !==
        dispatchItem.quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `All dispatched material must be received before confirmation`,
        });
      }
    }

    // ------------------------------------------
    // Save received quantities
    // ------------------------------------------

    for (const dispatchItem of dispatch.items) {
      const receivedItem = items.find(
        (item) =>
          String(item.itemId) ===
          String(dispatchItem._id)
      );

      dispatchItem.receivedQuantity =
        Number(receivedItem.receivedQuantity);
    }

    // ------------------------------------------
    // Confirm delivery
    // ------------------------------------------

    dispatch.status = "CONFIRMED";
    dispatch.confirmedBy = req.user._id;

    if (!dispatch.actualDeliveryDate) {
      dispatch.actualDeliveryDate = new Date();
    }

    await dispatch.save();

    // ------------------------------------------
    // Populate response
    // ------------------------------------------

    const updatedDispatch = await Dispatch.findById(
      dispatch._id
    )
      .populate(
        "project",
        "name projectCode projectType client location status"
      )
      .populate(
        "requirement",
        "priority status items"
      )
      .populate(
        "items.material",
        "name sku category unit currentStock unitPrice"
      )
      .populate("createdBy", "name email role")
      .populate(
        "confirmedBy",
        "name email role"
      );

    return res.status(200).json({
      success: true,
      message: "Delivery confirmed successfully",
      data: updatedDispatch,
    });
  } catch (error) {
    console.error(
      "Confirm delivery error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to confirm delivery",
      error: error.message,
    });
  }
};

// ======================================================
// CANCEL DISPATCH
// ======================================================

const cancelDispatch = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(
      req.params.id
    );

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: "Dispatch not found",
      });
    }

    // ------------------------------------------
    // Only READY dispatch can be cancelled
    // ------------------------------------------

    if (dispatch.status !== "READY") {
      return res.status(400).json({
        success: false,
        message:
          "Only READY dispatches can be cancelled",
      });
    }

    dispatch.status = "CANCELLED";

    await dispatch.save();

    return res.status(200).json({
      success: true,
      message: "Dispatch cancelled successfully",
      data: dispatch,
    });
  } catch (error) {
    console.error(
      "Cancel dispatch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel dispatch",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getDispatches,
  getDispatchById,
  createDispatch,
  updateDispatchStatus,
  confirmDelivery,
  cancelDispatch,
};