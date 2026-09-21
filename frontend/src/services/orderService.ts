import api from "./api";

export interface OrderMaterial {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock?: number;
}

export interface OrderSupplier {
  _id: string;
  name: string;
  supplierCode: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface OrderProject {
  _id: string;
  name: string;
  projectCode: string;
  projectType?: string;
  client?: string;
  location?: string;
}

export interface OrderRequirement {
  _id: string;
  status?: string;
  priority?: string;
  remarks?: string;
}

export interface OrderItem {
  _id: string;
  material: OrderMaterial | null;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | "DRAFT"
  | "PLACED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface Order {
  _id: string;
  orderNumber: string;
  supplier: OrderSupplier | null;
  project: OrderProject | null;
  requirement: OrderRequirement | null;
  items: OrderItem[];
  totalAmount: number;
  expectedDeliveryDate: string;
  status: OrderStatus;
  remarks?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItem {
  material: string;
  quantity: number;
}

export interface CreateOrderData {
  supplier: string;
  project: string;
  requirement: string;
  items: CreateOrderItem[];
  expectedDeliveryDate: string;
  remarks?: string;
}

export interface ReceiveOrderItem {
  itemId: string;
  receivedQuantity: number;
}

// ============================================
// GET ALL ORDERS
// ============================================

export const getOrders = async (params?: {
  status?: string;
  supplier?: string;
  project?: string;
  requirement?: string;
}) => {
  const response = await api.get("/orders", {
    params,
  });

  return response.data;
};

// ============================================
// GET SINGLE ORDER
// ============================================

export const getOrderById = async (
  orderId: string
) => {
  const response = await api.get(
    `/orders/${orderId}`
  );

  return response.data;
};

// ============================================
// CREATE ORDER
// ============================================

export const createOrder = async (
  data: CreateOrderData
) => {
  const response = await api.post(
    "/orders",
    data
  );

  return response.data;
};

// ============================================
// PLACE ORDER
// ============================================

export const placeOrder = async (
  orderId: string
) => {
  const response = await api.put(
    `/orders/${orderId}/place`
  );

  return response.data;
};

// ============================================
// RECEIVE ORDER
// ============================================

export const receiveOrder = async (
  orderId: string,
  items: ReceiveOrderItem[]
) => {
  const response = await api.put(
    `/orders/${orderId}/receive`,
    {
      items,
    }
  );

  return response.data;
};

// ============================================
// CANCEL ORDER
// ============================================

export const cancelOrder = async (
  orderId: string
) => {
  const response = await api.put(
    `/orders/${orderId}/cancel`
  );

  return response.data;
};