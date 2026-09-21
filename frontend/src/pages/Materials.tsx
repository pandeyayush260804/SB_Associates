import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Edit,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  X,
} from "lucide-react";

import {
  deleteMaterial,
  getMaterials,
  updateMaterialStock,
  type Material,
} from "@/services/materialService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const Materials = () => {
  const { user } = useAuth();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const [error, setError] = useState("");

  const [stockModal, setStockModal] = useState<{
    material: Material;
    operation: "ADD" | "REMOVE";
  } | null>(null);

  const [stockQuantity, setStockQuantity] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Material | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMaterials({
        search,
        category,
        lowStock,
      });

      setMaterials(response.data || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load materials."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaterials();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, lowStock]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(materials.map((material) => material.category))
    );
  }, [materials]);

  const totalMaterials = materials.length;

  const lowStockCount = materials.filter(
    (material) =>
      material.currentStock <= material.minimumStock
  ).length;

  const outOfStockCount = materials.filter(
    (material) => material.currentStock === 0
  ).length;

  const totalInventoryValue = materials.reduce(
    (total, material) =>
      total +
      material.currentStock * material.unitPrice,
    0
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);

      await deleteMaterial(deleteTarget._id);

      setDeleteTarget(null);

      await loadMaterials();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete material."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!stockModal) return;

    const quantity = Number(stockQuantity);

    if (!quantity || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (
      stockModal.operation === "REMOVE" &&
      quantity > stockModal.material.currentStock
    ) {
      setError("Insufficient stock.");
      return;
    }

    try {
      setStockLoading(true);
      setError("");

      await updateMaterialStock(
        stockModal.material._id,
        {
          quantity,
          operation: stockModal.operation,
        }
      );

      setStockModal(null);
      setStockQuantity("");

      await loadMaterials();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to update stock."
      );
    } finally {
      setStockLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (material: Material) => {
    if (material.currentStock === 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (
      material.currentStock <= material.minimumStock
    ) {
      return {
        label: "Low Stock",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-green-50 text-green-700 border-green-200",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" />

            <h1 className="text-2xl font-semibold text-slate-900">
              Materials
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage project materials, inventory and stock
            levels.
          </p>
        </div>

        {can(user?.role, "CREATE_MATERIAL") && (
          <Link
            to="/materials/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            New Material
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Materials
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalMaterials}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {lowStockCount}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Out of Stock
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            {outOfStockCount}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Inventory Value
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalInventoryValue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by material name or SKU..."
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            onClick={() => setLowStock(!lowStock)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition ${
              lowStock
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <TrendingDown className="h-4 w-4" />

            Low Stock
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Material
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  SKU
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Category
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Stock
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Min. Stock
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Unit Price
                </th>

                <th className="px-5 py-3 text-center font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading materials...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No materials found.
                  </td>
                </tr>
              ) : (
                materials.map((material) => {
                  const stockStatus =
                    getStockStatus(material);

                  return (
                    <tr
                      key={material._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {material.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          Per {material.unit}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {material.sku}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {material.category}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-slate-900">
                        {material.currentStock.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-slate-600">
                        {material.minimumStock.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-slate-700">
                        {formatCurrency(
                          material.unitPrice
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/materials/${material._id}`}
                            title="View"
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {can(
                            user?.role,
                            "UPDATE_STOCK"
                          ) && (
                            <>
                              <button
                                title="Add Stock"
                                onClick={() => {
                                  setStockModal({
                                    material,
                                    operation: "ADD",
                                  });
                                  setStockQuantity("");
                                  setError("");
                                }}
                                className="rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                              >
                                + Stock
                              </button>

                              <button
                                title="Remove Stock"
                                onClick={() => {
                                  setStockModal({
                                    material,
                                    operation: "REMOVE",
                                  });
                                  setStockQuantity("");
                                  setError("");
                                }}
                                className="rounded-md px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
                              >
                                − Stock
                              </button>
                            </>
                          )}

                          {can(
                            user?.role,
                            "EDIT_MATERIAL"
                          ) && (
                            <Link
                              to={`/materials/${material._id}/edit`}
                              title="Edit"
                              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}

                          {can(
                            user?.role,
                            "DELETE_MATERIAL"
                          ) && (
                            <button
                              title="Delete"
                              onClick={() =>
                                setDeleteTarget(material)
                              }
                              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {stockModal.operation === "ADD"
                  ? "Add Stock"
                  : "Remove Stock"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {stockModal.material.name}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(e.target.value)
                  }
                  placeholder="Enter quantity"
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div className="rounded-md bg-slate-50 p-3 text-sm">
                Current stock:{" "}
                <strong>
                  {stockModal.material.currentStock.toLocaleString(
                    "en-IN"
                  )}
                </strong>{" "}
                {stockModal.material.unit}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => {
                  setStockModal(null);
                  setStockQuantity("");
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleStockUpdate}
                disabled={stockLoading}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {stockLoading
                  ? "Updating..."
                  : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Delete Material?
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <strong className="text-slate-700">
                  {deleteTarget.name}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Material"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;