import api from "./api";

export interface Material {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialData {
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  isActive?: boolean;
}

export interface UpdateMaterialData {
  name?: string;
  sku?: string;
  category?: string;
  unit?: string;
  currentStock?: number;
  minimumStock?: number;
  unitPrice?: number;
  isActive?: boolean;
}

export interface StockUpdateData {
  quantity: number;
  operation: "ADD" | "REMOVE";
}

export interface MaterialFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export const getMaterials = async (filters?: MaterialFilters) => {
  const params: Record<string, string> = {};

  if (filters?.search) {
    params.search = filters.search;
  }

  if (filters?.category) {
    params.category = filters.category;
  }

  if (filters?.lowStock) {
    params.lowStock = "true";
  }

  const response = await api.get("/materials", {
    params,
  });

  return response.data;
};

export const getMaterialById = async (materialId: string) => {
  const response = await api.get(`/materials/${materialId}`);

  return response.data;
};

export const createMaterial = async (
  data: CreateMaterialData
) => {
  const response = await api.post("/materials", data);

  return response.data;
};

export const updateMaterial = async (
  materialId: string,
  data: UpdateMaterialData
) => {
  const response = await api.put(
    `/materials/${materialId}`,
    data
  );

  return response.data;
};

export const deleteMaterial = async (materialId: string) => {
  const response = await api.delete(
    `/materials/${materialId}`
  );

  return response.data;
};

export const updateMaterialStock = async (
  materialId: string,
  data: StockUpdateData
) => {
  const response = await api.put(
    `/materials/${materialId}/stock`,
    data
  );

  return response.data;
};