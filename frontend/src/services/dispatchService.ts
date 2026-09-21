import api from "./api";

export type DispatchStatus =
  | "READY"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CONFIRMED"
  | "CANCELLED";

export interface DispatchMaterial {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  unit: string;
  currentStock?: number;
  unitPrice?: number;
}

export interface DispatchProject {
  _id: string;
  name: string;
  projectCode: string;
  projectType?: string;
  client?: string;
  location?: string;
  status?: string;
}

export interface DispatchRequirement {
  _id: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "PROCESSING"
    | "PARTIALLY_FULFILLED"
    | "FULFILLED";
  remarks?: string;
  items?: Array<{
    _id: string;
    material:
      | string
      | {
          _id: string;
          name: string;
          sku: string;
          unit?: string;
        };
    requiredQuantity: number;
    allocatedQuantity: number;
    pendingQuantity: number;
  }>;
}

export interface DispatchUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface DispatchItem {
  _id: string;
  material: DispatchMaterial | null;
  quantity: number;
  receivedQuantity: number;
}

export interface Dispatch {
  _id: string;
  dispatchNumber: string;

  project: DispatchProject;
  requirement: DispatchRequirement;

  items: DispatchItem[];

  dispatchDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;

  vehicleNumber?: string;
  transporterName?: string;
  driverName?: string;
  driverPhone?: string;

  deliveryAddress: string;

  status: DispatchStatus;

  inventoryDeducted: boolean;

  confirmedBy?: DispatchUser | null;
  createdBy?: DispatchUser | null;

  remarks?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDispatchItem {
  material: string;
  quantity: number;
}

export interface CreateDispatchData {
  project: string;
  requirement: string;
  items: CreateDispatchItem[];
  expectedDeliveryDate: string;
  vehicleNumber?: string;
  transporterName?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryAddress: string;
  remarks?: string;
}

export interface ConfirmDispatchItem {
  itemId: string;
  receivedQuantity: number;
}

export const getDispatches = async (params?: {
  status?: DispatchStatus;
  project?: string;
  requirement?: string;
}) => {
  const response = await api.get("/dispatches", { params });

  return response.data;
};

export const getDispatchById = async (id: string) => {
  const response = await api.get(`/dispatches/${id}`);

  return response.data;
};

export const createDispatch = async (
  data: CreateDispatchData
) => {
  const response = await api.post("/dispatches", data);

  return response.data;
};

export const updateDispatchStatus = async (
  id: string,
  status: "DISPATCHED" | "IN_TRANSIT" | "DELIVERED"
) => {
  const response = await api.put(`/dispatches/${id}/status`, {
    status,
  });

  return response.data;
};

export const confirmDelivery = async (
  id: string,
  items: ConfirmDispatchItem[]
) => {
  const response = await api.put(`/dispatches/${id}/confirm`, {
    items,
  });

  return response.data;
};

export const cancelDispatch = async (id: string) => {
  const response = await api.put(`/dispatches/${id}/cancel`);

  return response.data;
};