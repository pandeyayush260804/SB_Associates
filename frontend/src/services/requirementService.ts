import api from "./api";

export type RequirementPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type RequirementStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSING"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED";

export interface RequirementMaterial {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
}

export interface RequirementItem {
  _id: string;

  // Material can be null if the referenced
  // Material document no longer exists.
  material: RequirementMaterial | null;

  requiredQuantity: number;
  allocatedQuantity: number;
  pendingQuantity: number;
}

export interface RequirementProject {
  _id: string;
  name: string;
  projectCode: string;
  projectType: string;
  client: string;
  location: string;
}

export interface RequirementUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Requirement {
  _id: string;
  project: RequirementProject;
  requestedBy: RequirementUser;
  items: RequirementItem[];
  priority: RequirementPriority;
  status: RequirementStatus;
  remarks?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequirementItem {
  material: string;
  requiredQuantity: number;
}

export interface CreateRequirementData {
  project: string;
  items: CreateRequirementItem[];
  priority?: RequirementPriority;
  remarks?: string;
}

// ============================================
// Get All Requirements
// ============================================

export const getRequirements = async (filters?: {
  status?: RequirementStatus;
  project?: string;
  priority?: RequirementPriority;
}) => {
  const params: Record<string, string> = {};

  if (filters?.status) {
    params.status = filters.status;
  }

  if (filters?.project) {
    params.project = filters.project;
  }

  if (filters?.priority) {
    params.priority = filters.priority;
  }

  const response = await api.get("/requirements", {
    params,
  });

  return response.data;
};

// ============================================
// Get Single Requirement
// ============================================

export const getRequirementById = async (
  requirementId: string
) => {
  const response = await api.get(
    `/requirements/${requirementId}`
  );

  return response.data;
};

// ============================================
// Create Requirement
// ============================================

export const createRequirement = async (
  data: CreateRequirementData
) => {
  const response = await api.post(
    "/requirements",
    data
  );

  return response.data;
};

// ============================================
// Approve Requirement
// ============================================

export const approveRequirement = async (
  requirementId: string
) => {
  const response = await api.put(
    `/requirements/${requirementId}/approve`
  );

  return response.data;
};

// ============================================
// Reject Requirement
// ============================================

export const rejectRequirement = async (
  requirementId: string,
  rejectionReason: string
) => {
  const response = await api.put(
    `/requirements/${requirementId}/reject`,
    {
      rejectionReason,
    }
  );

  return response.data;
};

// ============================================
// Allocate Inventory
// ============================================

export const allocateRequirement = async (
  requirementId: string
) => {
  const response = await api.put(
    `/requirements/${requirementId}/allocate`
  );

  return response.data;
};