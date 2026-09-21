import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "@/services/api";

import {
  createOrder,
  type CreateOrderItem,
} from "@/services/orderService";

import {
  getSuppliers,
  type Supplier,
} from "@/services/supplierService";

import {
  getProjects,
  type Project,
} from "@/services/projectService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

interface RequirementMaterial {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock?: number;
  unitPrice?: number;
}

interface RequirementItem {
  _id: string;
  material: RequirementMaterial | null;
  requiredQuantity: number;
  allocatedQuantity: number;
  pendingQuantity: number;
}

interface Requirement {
  _id: string;
  project:
    | string
    | {
        _id: string;
        name: string;
        projectCode: string;
      };
  requestedBy?: any;
  items: RequirementItem[];
  priority: string;
  status: string;
  remarks?: string;
}

interface OrderLine {
  material: string;
  materialName: string;
  sku: string;
  unit: string;
  pendingQuantity: number;
  quantity: number;
  unitPrice: number;
}

const CreateOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [supplierId, setSupplierId] =
    useState("");

  const [projectId, setProjectId] =
    useState("");

  const [requirementId, setRequirementId] =
    useState("");

  const [
    expectedDeliveryDate,
    setExpectedDeliveryDate,
  ] = useState("");

  const [remarks, setRemarks] =
    useState("");

  const [lines, setLines] =
    useState<OrderLine[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        supplierResponse,
        projectResponse,
        requirementResponse,
      ] = await Promise.all([
        getSuppliers({
          active: true,
        }),
        getProjects(),
        api.get("/requirements"),
      ]);

      setSuppliers(
        supplierResponse.data || []
      );

      setProjects(
        projectResponse.data || []
      );

      setRequirements(
        requirementResponse.data?.data || []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load order data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (
    !can(user?.role, "CREATE_ORDER")
  ) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h1>

        <p className="mt-1 text-sm text-red-700">
          You do not have permission to create
          purchase orders.
        </p>
      </div>
    );
  }

  const availableRequirements =
    requirements.filter((requirement) => {
      if (requirement.status === "REJECTED") {
        return false;
      }

      return requirement.items.some(
        (item) =>
          item.pendingQuantity > 0
      );
    });

  const selectedRequirement =
    requirements.find(
      (requirement) =>
        requirement._id === requirementId
    );

  const selectedSupplier =
    suppliers.find(
      (supplier) =>
        supplier._id === supplierId
    );

  const availableRequirementItems =
    selectedRequirement?.items.filter(
      (item) =>
        item.material &&
        item.pendingQuantity > 0
    ) || [];

  const addLine = () => {
    const firstAvailable =
      availableRequirementItems.find(
        (item) =>
          !lines.some(
            (line) =>
              line.material ===
              item.material!._id
          )
      );

    if (!firstAvailable?.material) {
      return;
    }

    setLines((current) => [
      ...current,
      {
        material:
          firstAvailable.material!._id,
        materialName:
          firstAvailable.material!.name,
        sku: firstAvailable.material!.sku,
        unit:
          firstAvailable.material!.unit,
        pendingQuantity:
          firstAvailable.pendingQuantity,
        quantity: 1,
        unitPrice:
          firstAvailable.material!
            .unitPrice || 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((current) =>
      current.filter(
        (_, lineIndex) =>
          lineIndex !== index
      )
    );
  };

  const updateLineMaterial = (
    index: number,
    materialId: string
  ) => {
    const requirementItem =
      availableRequirementItems.find(
        (item) =>
          item.material?._id ===
          materialId
      );

    if (!requirementItem?.material) {
      return;
    }

    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line;
        }

        return {
          ...line,
          material: materialId,
          materialName:
            requirementItem.material!.name,
          sku:
            requirementItem.material!.sku,
          unit:
            requirementItem.material!.unit,
          pendingQuantity:
            requirementItem.pendingQuantity,
          quantity: Math.min(
            Math.max(line.quantity, 1),
            requirementItem.pendingQuantity
          ),
          unitPrice:
            requirementItem.material!
              .unitPrice || 0,
        };
      })
    );
  };

  const updateLineQuantity = (
    index: number,
    quantity: number
  ) => {
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line;
        }

        return {
          ...line,
          quantity: Math.min(
            Math.max(quantity, 1),
            line.pendingQuantity
          ),
        };
      })
    );
  };

  const totalAmount = useMemo(() => {
    return lines.reduce(
      (total, line) =>
        total +
        line.quantity * line.unitPrice,
      0
    );
  }, [lines]);

  const handleProjectChange = (
    value: string
  ) => {
    setProjectId(value);
    setRequirementId("");
    setLines([]);
  };

  const handleRequirementChange = (
    value: string
  ) => {
    setRequirementId(value);
    setLines([]);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (!projectId) {
      setError("Please select a project.");
      return;
    }

    if (!requirementId) {
      setError(
        "Please select a requirement."
      );
      return;
    }

    if (lines.length === 0) {
      setError(
        "Please add at least one material."
      );
      return;
    }

    if (!expectedDeliveryDate) {
      setError(
        "Please select an expected delivery date."
      );
      return;
    }

    const invalidLine = lines.find(
      (line) =>
        line.quantity <= 0 ||
        line.quantity >
          line.pendingQuantity
    );

    if (invalidLine) {
      setError(
        `Order quantity for ${invalidLine.materialName} cannot exceed its pending quantity.`
      );
      return;
    }

    if (selectedSupplier) {
      const supplierMaterials =
        selectedSupplier.materialsSupplied
          .filter(Boolean)
          .map(
            (material) => material!._id
          );

      const unsupportedLine =
        lines.find(
          (line) =>
            !supplierMaterials.includes(
              line.material
            )
        );

      if (unsupportedLine) {
        setError(
          `${selectedSupplier.name} does not supply ${unsupportedLine.materialName}.`
        );
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const items: CreateOrderItem[] =
        lines.map((line) => ({
          material: line.material,
          quantity: line.quantity,
        }));

      await createOrder({
        supplier: supplierId,
        project: projectId,
        requirement: requirementId,
        items,
        expectedDeliveryDate,
        remarks:
          remarks.trim() || undefined,
      });

      navigate("/orders");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to create purchase order."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading order data...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/orders"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Purchase Orders
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">
          Create Purchase Order
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a supplier order against a pending
          project material requirement.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Order Information */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Order Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            {/* Supplier */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Supplier *
              </label>

              <select
                value={supplierId}
                onChange={(e) =>
                  setSupplierId(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >
                    {supplier.name} (
                    {supplier.supplierCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Project *
              </label>

              <select
                value={projectId}
                onChange={(e) =>
                  handleProjectChange(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">
                  Select project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.name} (
                    {project.projectCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Requirement */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Requirement *
              </label>

              <select
                value={requirementId}
                disabled={!projectId}
                onChange={(e) =>
                  handleRequirementChange(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">
                  {!projectId
                    ? "Select project first"
                    : "Select requirement"}
                </option>

                {availableRequirements
                  .filter((requirement) => {
                    const requirementProject =
                      typeof requirement.project ===
                      "string"
                        ? requirement.project
                        : requirement.project
                            ?._id;

                    return (
                      requirementProject ===
                      projectId
                    );
                  })
                  .map((requirement) => (
                    <option
                      key={requirement._id}
                      value={requirement._id}
                    >
                      {requirement.priority} —{" "}
                      {requirement.status} —{" "}
                      {requirement._id.slice(
                        -6
                      )}
                    </option>
                  ))}
              </select>
            </div>

            {/* Delivery date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Expected Delivery Date *
              </label>

              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) =>
                  setExpectedDeliveryDate(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Order Items
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Order only quantities that are pending
                on the selected requirement.
              </p>
            </div>

            <button
              type="button"
              disabled={
                !requirementId ||
                availableRequirementItems.length ===
                  0
              }
              onClick={addLine}
              className="inline-flex items-center gap-2 rounded-md border border-amber-500 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">
                    Material
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Pending
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Quantity
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Unit Price
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Total
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {lines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      {requirementId
                        ? "No materials added. Click Add Material."
                        : "Select a project and requirement first."}
                    </td>
                  </tr>
                ) : (
                  lines.map((line, index) => (
                    <tr key={index}>
                      <td className="px-5 py-4">
                        <select
                          value={line.material}
                          onChange={(e) =>
                            updateLineMaterial(
                              index,
                              e.target.value
                            )
                          }
                          className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-amber-500"
                        >
                          {availableRequirementItems.map(
                            (item) => (
                              <option
                                key={
                                  item.material!
                                    ._id
                                }
                                value={
                                  item.material!
                                    ._id
                                }
                                disabled={lines.some(
                                  (
                                    existingLine,
                                    existingIndex
                                  ) =>
                                    existingIndex !==
                                      index &&
                                    existingLine.material ===
                                      item
                                        .material!
                                        ._id
                                )}
                              >
                                {item.material!
                                  .name}{" "}
                                (
                                {
                                  item.material!
                                    .sku
                                }
                                )
                              </option>
                            )
                          )}
                        </select>

                        <p className="mt-1 text-xs text-slate-500">
                          Unit: {line.unit}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right text-slate-700">
                        {line.pendingQuantity.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="number"
                          min={1}
                          max={
                            line.pendingQuantity
                          }
                          value={line.quantity}
                          onChange={(e) =>
                            updateLineQuantity(
                              index,
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="h-9 w-28 rounded-md border border-slate-300 px-2 text-right text-sm outline-none focus:border-amber-500"
                        />
                      </td>

                      <td className="px-5 py-4 text-right text-slate-700">
                        ₹
                        {line.unitPrice.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-800">
                        ₹
                        {(
                          line.quantity *
                          line.unitPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            removeLine(index)
                          }
                          className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t border-slate-200 px-6 py-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Amount
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Remarks
          </label>

          <textarea
            rows={3}
            value={remarks}
            onChange={(e) =>
              setRemarks(e.target.value)
            }
            placeholder="Additional order remarks..."
            className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/orders"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Creating..."
              : "Create Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;