import { useEffect, useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  deleteSupplier,
  getSuppliers,
  toggleSupplierStatus,
  type Supplier,
} from "@/services/supplierService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const Suppliers = () => {
  const { user } = useAuth();

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Supplier | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSuppliers({
        search: search.trim() || undefined,
        active:
          active === ""
            ? undefined
            : active === "true",
      });

      setSuppliers(response.data || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load suppliers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuppliers();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, active]);

  const handleToggleStatus = async (
    supplierId: string
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await toggleSupplierStatus(supplierId);

      await loadSuppliers();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to update supplier status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await deleteSupplier(deleteTarget._id);

      setDeleteTarget(null);

      await loadSuppliers();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete supplier."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-600" />

            <h1 className="text-2xl font-semibold text-slate-900">
              Suppliers
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage material suppliers and their supplied
            materials.
          </p>
        </div>

        {can(
          user?.role,
          "CREATE_SUPPLIER"
        ) && (
          <Link
            to="/suppliers/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />

            New Supplier
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search supplier or supplier code..."
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <select
            value={active}
            onChange={(e) =>
              setActive(e.target.value)
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="">
              All Suppliers
            </option>

            <option value="true">
              Active Only
            </option>

            <option value="false">
              Inactive Only
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Supplier
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Contact
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Location
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Materials
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
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-slate-50"
                  >
                    {/* Supplier */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {supplier.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {supplier.supplierCode}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {supplier.contactPerson}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {supplier.phone}
                      </div>

                      {supplier.email && (
                        <div className="text-xs text-slate-500">
                          {supplier.email}
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="text-slate-700">
                        {supplier.city ||
                        supplier.state
                          ? [
                              supplier.city,
                              supplier.state,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "—"}
                      </div>
                    </td>

                    {/* Materials */}
                    <td className="px-5 py-4">
                      {supplier.materialsSupplied
                        .length > 0 ? (
                        <div className="flex max-w-[300px] flex-wrap gap-1.5">
                          {supplier.materialsSupplied
                            .filter(Boolean)
                            .slice(0, 3)
                            .map(
                              (material) => (
                                <span
                                  key={
                                    material!._id
                                  }
                                  className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                >
                                  {material!.name}
                                </span>
                              )
                            )}

                          {supplier.materialsSupplied
                            .filter(Boolean)
                            .length > 3 && (
                            <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                              +
                              {supplier.materialsSupplied.filter(
                                Boolean
                              ).length - 3}{" "}
                              more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No materials assigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          supplier.isActive
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {supplier.isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {/* View */}
                        <Link
                          to={`/suppliers/${supplier._id}`}
                          title="View"
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Edit */}
                        {can(
                          user?.role,
                          "EDIT_SUPPLIER"
                        ) && (
                          <Link
                            to={`/suppliers/${supplier._id}/edit`}
                            title="Edit"
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}

                        {/* Toggle */}
                        {can(
                          user?.role,
                          "TOGGLE_SUPPLIER"
                        ) && (
                          <button
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              handleToggleStatus(
                                supplier._id
                              )
                            }
                            title={
                              supplier.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            className={`rounded-md p-2 ${
                              supplier.isActive
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {supplier.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Delete */}
                        {can(
                          user?.role,
                          "DELETE_SUPPLIER"
                        ) && (
                          <button
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              setDeleteTarget(
                                supplier
                              )
                            }
                            title="Delete"
                            className="rounded-md p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete Supplier
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.name}
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading
                  ? "Deleting..."
                  : "Delete Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;