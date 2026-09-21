export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "SUPPLY_MANAGER";

export type Permission =
  // Projects
  | "CREATE_PROJECT"
  | "EDIT_PROJECT"
  | "DELETE_PROJECT"

  // Materials
  | "CREATE_MATERIAL"
  | "EDIT_MATERIAL"
  | "DELETE_MATERIAL"
  | "UPDATE_STOCK"

  // Requirements
  | "CREATE_REQUIREMENT"
  | "APPROVE_REQUIREMENT"
  | "REJECT_REQUIREMENT"
  | "ALLOCATE_REQUIREMENT"

  // Suppliers
  | "CREATE_SUPPLIER"
  | "EDIT_SUPPLIER"
  | "TOGGLE_SUPPLIER"
  | "DELETE_SUPPLIER"

  // Orders
  | "CREATE_ORDER"
  | "PLACE_ORDER"
  | "RECEIVE_ORDER"
  | "CANCEL_ORDER"

  // Dispatches
  | "CREATE_DISPATCH"
  | "UPDATE_DISPATCH_STATUS"
  | "CONFIRM_DELIVERY"
  | "CANCEL_DISPATCH";

const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "CREATE_PROJECT",
    "EDIT_PROJECT",
    "DELETE_PROJECT",

    "CREATE_MATERIAL",
    "EDIT_MATERIAL",
    "DELETE_MATERIAL",
    "UPDATE_STOCK",

    "APPROVE_REQUIREMENT",
    "REJECT_REQUIREMENT",
    "ALLOCATE_REQUIREMENT",

    "CREATE_SUPPLIER",
    "EDIT_SUPPLIER",
    "TOGGLE_SUPPLIER",
    "DELETE_SUPPLIER",

    "CREATE_ORDER",
    "PLACE_ORDER",
    "RECEIVE_ORDER",
    "CANCEL_ORDER",

    "CREATE_DISPATCH",
    "UPDATE_DISPATCH_STATUS",
    "CONFIRM_DELIVERY",
    "CANCEL_DISPATCH",
  ],

  PROJECT_MANAGER: [
    "CREATE_REQUIREMENT",

    // Backend allows PM to confirm delivery
    "CONFIRM_DELIVERY",
  ],

  SUPPLY_MANAGER: [
    "CREATE_MATERIAL",
    "EDIT_MATERIAL",
    "UPDATE_STOCK",

    "APPROVE_REQUIREMENT",
    "REJECT_REQUIREMENT",
    "ALLOCATE_REQUIREMENT",

    "CREATE_SUPPLIER",
    "EDIT_SUPPLIER",
    "TOGGLE_SUPPLIER",

    "CREATE_ORDER",
    "PLACE_ORDER",
    "RECEIVE_ORDER",
    "CANCEL_ORDER",

    "CREATE_DISPATCH",
    "UPDATE_DISPATCH_STATUS",
    "CANCEL_DISPATCH",
  ],
};

export const can = (
  role: UserRole | undefined,
  permission: Permission
): boolean => {
  if (!role) return false;

  return rolePermissions[role].includes(permission);
};