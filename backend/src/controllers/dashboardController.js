const Project = require("../models/Project");
const Material = require("../models/Material");
const Requirement = require("../models/Requirement");
const Supplier = require("../models/Supplier");
const Order = require("../models/Order");
const Dispatch = require("../models/Dispatch");

// ======================================================
// ADMIN DASHBOARD
// ======================================================

const getAdminDashboard = async () => {
  // ------------------------------------------
  // Basic counts
  // ------------------------------------------

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    totalMaterials,
    lowStockMaterials,
    totalSuppliers,
    pendingRequirements,
    approvedRequirements,
    processingRequirements,
    partiallyFulfilledRequirements,
    fulfilledRequirements,
    draftOrders,
    placedOrders,
    partiallyReceivedOrders,
    receivedOrders,
    inTransitDispatches,
    deliveredDispatches,
    confirmedDispatches,
  ] = await Promise.all([
    Project.countDocuments(),

    Project.countDocuments({
      status: "IN_PROGRESS",
    }),

    Project.countDocuments({
      status: "COMPLETED",
    }),

    Project.countDocuments({
      status: "ON_HOLD",
    }),

    Material.countDocuments({
      isActive: true,
    }),

    Material.countDocuments({
      isActive: true,
      $expr: {
        $lte: ["$currentStock", "$minimumStock"],
      },
    }),

    Supplier.countDocuments({
      isActive: true,
    }),

    Requirement.countDocuments({
      status: "PENDING",
    }),

    Requirement.countDocuments({
      status: "APPROVED",
    }),

    Requirement.countDocuments({
      status: "PROCESSING",
    }),

    Requirement.countDocuments({
      status: "PARTIALLY_FULFILLED",
    }),

    Requirement.countDocuments({
      status: "FULFILLED",
    }),

    Order.countDocuments({
      status: "DRAFT",
    }),

    Order.countDocuments({
      status: "PLACED",
    }),

    Order.countDocuments({
      status: "PARTIALLY_RECEIVED",
    }),

    Order.countDocuments({
      status: "RECEIVED",
    }),

    Dispatch.countDocuments({
      status: "IN_TRANSIT",
    }),

    Dispatch.countDocuments({
      status: "DELIVERED",
    }),

    Dispatch.countDocuments({
      status: "CONFIRMED",
    }),
  ]);

  // ------------------------------------------
  // Inventory value
  // ------------------------------------------

  const inventoryResult = await Material.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,

        totalInventoryValue: {
          $sum: {
            $multiply: [
              "$currentStock",
              "$unitPrice",
            ],
          },
        },

        totalStockUnits: {
          $sum: "$currentStock",
        },
      },
    },
  ]);

  const totalInventoryValue =
    inventoryResult.length > 0
      ? inventoryResult[0].totalInventoryValue
      : 0;

  const totalStockUnits =
    inventoryResult.length > 0
      ? inventoryResult[0].totalStockUnits
      : 0;

  // ------------------------------------------
  // Project status
  // ------------------------------------------

  const projectStatus =
    await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  // ------------------------------------------
  // Requirement status
  // ------------------------------------------

  const requirementStatus =
    await Requirement.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  // ------------------------------------------
  // Order status
  // ------------------------------------------

  const orderStatus =
    await Order.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },

          totalAmount: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  // ------------------------------------------
  // Dispatch status
  // ------------------------------------------

  const dispatchStatus =
    await Dispatch.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

  // ------------------------------------------
  // Low stock materials
  // ------------------------------------------

  const lowStockList =
    await Material.find({
      isActive: true,

      $expr: {
        $lte: [
          "$currentStock",
          "$minimumStock",
        ],
      },
    })
      .select(
        "name sku category unit currentStock minimumStock unitPrice"
      )
      .sort({
        currentStock: 1,
      })
      .limit(10);

  // ------------------------------------------
  // Recent projects
  // ------------------------------------------

  const recentProjects =
    await Project.find()
      .populate(
        "projectManager",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

  // ------------------------------------------
  // Recent requirements
  // ------------------------------------------

  const recentRequirements =
    await Requirement.find()
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "requestedBy",
        "name email role"
      )
      .populate(
        "items.material",
        "name sku unit"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

  // ------------------------------------------
  // Recent orders
  // ------------------------------------------

  const recentOrders =
    await Order.find()
      .populate(
        "supplier",
        "name supplierCode"
      )
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "requirement",
        "priority status"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

  // ------------------------------------------
  // Recent dispatches
  // ------------------------------------------

  const recentDispatches =
    await Dispatch.find()
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "requirement",
        "priority status"
      )
      .populate(
        "items.material",
        "name sku unit"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

  return {
    overview: {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,

      totalMaterials,
      lowStockMaterials,

      totalSuppliers,

      pendingRequirements,
      approvedRequirements,
      processingRequirements,
      partiallyFulfilledRequirements,
      fulfilledRequirements,

      draftOrders,
      placedOrders,
      partiallyReceivedOrders,
      receivedOrders,

      inTransitDispatches,
      deliveredDispatches,
      confirmedDispatches,

      totalStockUnits,
      totalInventoryValue,
    },

    charts: {
      projectStatus,
      requirementStatus,
      orderStatus,
      dispatchStatus,
    },

    lowStockMaterials: lowStockList,

    recent: {
      projects: recentProjects,
      requirements: recentRequirements,
      orders: recentOrders,
      dispatches: recentDispatches,
    },
  };
};

// ======================================================
// PROJECT MANAGER DASHBOARD
// ======================================================

const getProjectManagerDashboard = async (
  userId
) => {
  // ------------------------------------------
  // Find assigned projects
  // ------------------------------------------

  const myProjects =
    await Project.find({
      projectManager: userId,
    })
      .select(
        "name projectCode projectType client location status startDate expectedCompletion"
      )
      .sort({
        createdAt: -1,
      });

  const projectIds = myProjects.map(
    (project) => project._id
  );

  // ------------------------------------------
  // Requirements belonging to my projects
  // ------------------------------------------

  const myRequirements =
    await Requirement.find({
      project: {
        $in: projectIds,
      },
    })
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "requestedBy",
        "name email role"
      )
      .populate(
        "items.material",
        "name sku unit"
      )
      .sort({
        createdAt: -1,
      });

  // ------------------------------------------
  // Dispatches for my projects
  // ------------------------------------------

  const myDispatches =
    await Dispatch.find({
      project: {
        $in: projectIds,
      },
    })
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "items.material",
        "name sku unit"
      )
      .sort({
        createdAt: -1,
      });

  // ------------------------------------------
  // Counts
  // ------------------------------------------

  const [
    totalProjects,
    inProgressProjects,
    completedProjects,
    pendingRequirements,
    approvedRequirements,
    processingRequirements,
    partiallyFulfilledRequirements,
    fulfilledRequirements,
    readyDispatches,
    dispatchedDispatches,
    inTransitDispatches,
    deliveredDispatches,
    confirmedDispatches,
  ] = await Promise.all([
    Project.countDocuments({
      projectManager: userId,
    }),

    Project.countDocuments({
      projectManager: userId,
      status: "IN_PROGRESS",
    }),

    Project.countDocuments({
      projectManager: userId,
      status: "COMPLETED",
    }),

    Requirement.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "PENDING",
    }),

    Requirement.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "APPROVED",
    }),

    Requirement.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "PROCESSING",
    }),

    Requirement.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "PARTIALLY_FULFILLED",
    }),

    Requirement.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "FULFILLED",
    }),

    Dispatch.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "READY",
    }),

    Dispatch.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "DISPATCHED",
    }),

    Dispatch.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "IN_TRANSIT",
    }),

    Dispatch.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "DELIVERED",
    }),

    Dispatch.countDocuments({
      project: {
        $in: projectIds,
      },
      status: "CONFIRMED",
    }),
  ]);

  // ------------------------------------------
  // Status charts
  // ------------------------------------------

  const requirementStatus =
    await Requirement.aggregate([
      {
        $match: {
          project: {
            $in: projectIds,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  const dispatchStatus =
    await Dispatch.aggregate([
      {
        $match: {
          project: {
            $in: projectIds,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  // ------------------------------------------
  // Recent requirements
  // ------------------------------------------

  const recentRequirements =
    myRequirements.slice(0, 5);

  // ------------------------------------------
  // Recent dispatches
  // ------------------------------------------

  const recentDispatches =
    myDispatches.slice(0, 5);

  return {
    overview: {
      totalProjects,
      inProgressProjects,
      completedProjects,

      pendingRequirements,
      approvedRequirements,
      processingRequirements,
      partiallyFulfilledRequirements,
      fulfilledRequirements,

      readyDispatches,
      dispatchedDispatches,
      inTransitDispatches,
      deliveredDispatches,
      confirmedDispatches,
    },

    charts: {
      requirementStatus,
      dispatchStatus,
    },

    myProjects,

    recent: {
      requirements: recentRequirements,
      dispatches: recentDispatches,
    },
  };
};

// ======================================================
// SUPPLY MANAGER DASHBOARD
// ======================================================

const getSupplyManagerDashboard = async () => {
  // ------------------------------------------
  // Inventory
  // ------------------------------------------

  const [
    totalMaterials,
    lowStockMaterials,
    outOfStockMaterials,
    totalSuppliers,
    pendingRequirements,
    approvedRequirements,
    processingRequirements,
    partiallyFulfilledRequirements,
    fulfilledRequirements,
    draftOrders,
    placedOrders,
    partiallyReceivedOrders,
    receivedOrders,
    readyDispatches,
    dispatchedDispatches,
    inTransitDispatches,
    deliveredDispatches,
    confirmedDispatches,
  ] = await Promise.all([
    Material.countDocuments({
      isActive: true,
    }),

    Material.countDocuments({
      isActive: true,

      $expr: {
        $lte: [
          "$currentStock",
          "$minimumStock",
        ],
      },
    }),

    Material.countDocuments({
      isActive: true,
      currentStock: 0,
    }),

    Supplier.countDocuments({
      isActive: true,
    }),

    Requirement.countDocuments({
      status: "PENDING",
    }),

    Requirement.countDocuments({
      status: "APPROVED",
    }),

    Requirement.countDocuments({
      status: "PROCESSING",
    }),

    Requirement.countDocuments({
      status: "PARTIALLY_FULFILLED",
    }),

    Requirement.countDocuments({
      status: "FULFILLED",
    }),

    Order.countDocuments({
      status: "DRAFT",
    }),

    Order.countDocuments({
      status: "PLACED",
    }),

    Order.countDocuments({
      status: "PARTIALLY_RECEIVED",
    }),

    Order.countDocuments({
      status: "RECEIVED",
    }),

    Dispatch.countDocuments({
      status: "READY",
    }),

    Dispatch.countDocuments({
      status: "DISPATCHED",
    }),

    Dispatch.countDocuments({
      status: "IN_TRANSIT",
    }),

    Dispatch.countDocuments({
      status: "DELIVERED",
    }),

    Dispatch.countDocuments({
      status: "CONFIRMED",
    }),
  ]);

  // ------------------------------------------
  // Inventory value
  // ------------------------------------------

  const inventoryResult =
    await Material.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,

          totalInventoryValue: {
            $sum: {
              $multiply: [
                "$currentStock",
                "$unitPrice",
              ],
            },
          },

          totalStockUnits: {
            $sum: "$currentStock",
          },
        },
      },
    ]);

  const totalInventoryValue =
    inventoryResult.length > 0
      ? inventoryResult[0].totalInventoryValue
      : 0;

  const totalStockUnits =
    inventoryResult.length > 0
      ? inventoryResult[0].totalStockUnits
      : 0;

  // ------------------------------------------
  // Low stock
  // ------------------------------------------

  const lowStockList =
    await Material.find({
      isActive: true,

      $expr: {
        $lte: [
          "$currentStock",
          "$minimumStock",
        ],
      },
    })
      .select(
        "name sku category unit currentStock minimumStock unitPrice"
      )
      .sort({
        currentStock: 1,
      })
      .limit(10);

  // ------------------------------------------
  // Pending requirements
  // ------------------------------------------

  const pendingRequirementList =
    await Requirement.find({
      status: {
        $in: [
          "PENDING",
          "APPROVED",
          "PROCESSING",
          "PARTIALLY_FULFILLED",
        ],
      },
    })
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "requestedBy",
        "name email"
      )
      .populate(
        "items.material",
        "name sku unit currentStock"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);

  // ------------------------------------------
  // Recent orders
  // ------------------------------------------

  const recentOrders =
    await Order.find()
      .populate(
        "supplier",
        "name supplierCode"
      )
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "requirement",
        "priority status"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);

  // ------------------------------------------
  // Recent dispatches
  // ------------------------------------------

  const recentDispatches =
    await Dispatch.find()
      .populate(
        "project",
        "name projectCode"
      )
      .populate(
        "items.material",
        "name sku unit"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);

  // ------------------------------------------
  // Requirement chart
  // ------------------------------------------

  const requirementStatus =
    await Requirement.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  // ------------------------------------------
  // Order chart
  // ------------------------------------------

  const orderStatus =
    await Order.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },

          totalAmount: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

  // ------------------------------------------
  // Dispatch chart
  // ------------------------------------------

  const dispatchStatus =
    await Dispatch.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  return {
    overview: {
      totalMaterials,
      lowStockMaterials,
      outOfStockMaterials,

      totalSuppliers,

      pendingRequirements,
      approvedRequirements,
      processingRequirements,
      partiallyFulfilledRequirements,
      fulfilledRequirements,

      draftOrders,
      placedOrders,
      partiallyReceivedOrders,
      receivedOrders,

      readyDispatches,
      dispatchedDispatches,
      inTransitDispatches,
      deliveredDispatches,
      confirmedDispatches,

      totalStockUnits,
      totalInventoryValue,
    },

    charts: {
      requirementStatus,
      orderStatus,
      dispatchStatus,
    },

    lowStockMaterials: lowStockList,

    pendingRequirements:
      pendingRequirementList,

    recent: {
      orders: recentOrders,
      dispatches: recentDispatches,
    },
  };
};

// ======================================================
// MAIN DASHBOARD CONTROLLER
// ======================================================

const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    let dashboardData;

    // ------------------------------------------
    // ADMIN
    // ------------------------------------------

    if (user.role === "ADMIN") {
      dashboardData =
        await getAdminDashboard();
    }

    // ------------------------------------------
    // PROJECT MANAGER
    // ------------------------------------------

    else if (
      user.role === "PROJECT_MANAGER"
    ) {
      dashboardData =
        await getProjectManagerDashboard(
          user._id
        );
    }

    // ------------------------------------------
    // SUPPLY MANAGER
    // ------------------------------------------

    else if (
      user.role === "SUPPLY_MANAGER"
    ) {
      dashboardData =
        await getSupplyManagerDashboard();
    }

    // ------------------------------------------
    // Invalid role
    // ------------------------------------------

    else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role",
      });
    }

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        ...dashboardData,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getDashboard,
};