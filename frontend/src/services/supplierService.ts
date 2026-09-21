import api from "./api";

export interface SupplierMaterial {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock?: number;
}

export interface Supplier {
  _id: string;
  name: string;
  supplierCode: string;
  contactPerson: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  materialsSupplied: (
    | SupplierMaterial
    | null
  )[];
  isActive: boolean;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierData {
  name: string;
  supplierCode: string;
  contactPerson: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  materialsSupplied?: string[];
  remarks?: string;
}

export interface UpdateSupplierData
  extends Partial<CreateSupplierData> {}

export interface SupplierFilters {
  search?: string;
  city?: string;
  state?: string;
  active?: boolean;
}

// ============================================
// Get All Suppliers
// ============================================

export const getSuppliers = async (
  filters?: SupplierFilters
) => {
  const params: Record<string, string> = {};

  if (filters?.search) {
    params.search = filters.search;
  }

  if (filters?.city) {
    params.city = filters.city;
  }

  if (filters?.state) {
    params.state = filters.state;
  }

  if (filters?.active !== undefined) {
    params.active = String(filters.active);
  }

  const response = await api.get("/suppliers", {
    params,
  });

  return response.data;
};

// ============================================
// Get Supplier By ID
// ============================================

export const getSupplierById = async (
  supplierId: string
) => {
  const response = await api.get(
    `/suppliers/${supplierId}`
  );

  return response.data;
};

// ============================================
// Create Supplier
// ============================================

export const createSupplier = async (
  data: CreateSupplierData
) => {
  const response = await api.post(
    "/suppliers",
    data
  );

  return response.data;
};

// ============================================
// Update Supplier
// ============================================

export const updateSupplier = async (
  supplierId: string,
  data: UpdateSupplierData
) => {
  const response = await api.put(
    `/suppliers/${supplierId}`,
    data
  );

  return response.data;
};

// ============================================
// Toggle Supplier Status
// ============================================

export const toggleSupplierStatus = async (
  supplierId: string
) => {
  const response = await api.put(
    `/suppliers/${supplierId}/toggle-status`
  );

  return response.data;
};

// ============================================
// Delete Supplier
// ============================================

export const deleteSupplier = async (
  supplierId: string
) => {
  const response = await api.delete(
    `/suppliers/${supplierId}`
  );

  return response.data;
};