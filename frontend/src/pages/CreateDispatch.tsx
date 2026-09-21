import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "@/services/api";
import {
  createDispatch,
} from "@/services/dispatchService";
import type {
  CreateDispatchItem,
} from "@/services/dispatchService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

interface Project {
  _id: string;
  name: string;
  projectCode: string;
}

interface RequirementItem {
  _id: string;
  material:
    | string
    | {
        _id: string;
        name: string;
        sku: string;
        unit?: string;
        currentStock?: number;
      };
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
  status: string;
  priority?: string;
  remarks?: string;
  items: RequirementItem[];
}

interface MaterialOption {
  _id: string;
  name: string;
  sku: string;
  unit?: string;
  currentStock?: number;
}

interface FormItem {
  material: string;
  quantity: string;
}

function CreateDispatch() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>(
    []
  );

  const [project, setProject] = useState("");
  const [requirement, setRequirement] = useState("");

  const [items, setItems] = useState<FormItem[]>([
    {
      material: "",
      quantity: "",
    },
  ]);

  const [expectedDeliveryDate, setExpectedDeliveryDate] =
    useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [transporterName, setTransporterName] =
    useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] =
    useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!can(user?.role, "CREATE_DISPATCH")) {
      return;
    }

    const loadData = async () => {
      try {
        setPageLoading(true);

        const [projectResponse, requirementResponse] =
          await Promise.all([
            api.get("/projects"),
            api.get("/requirements"),
          ]);

        setProjects(projectResponse.data?.data || []);

        const allRequirements =
          requirementResponse.data?.data || [];

        setRequirements(
          allRequirements.filter(
            (req: Requirement) =>
              req.status === "FULFILLED" ||
              req.status === "PARTIALLY_FULFILLED"
          )
        );
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Failed to load dispatch data"
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [user?.role]);

  const eligibleRequirements = useMemo(() => {
    if (!project) return [];

    return requirements.filter((req) => {
      const projectId =
        typeof req.project === "string"
          ? req.project
          : req.project?._id;

      return projectId === project;
    });
  }, [requirements, project]);

  const selectedRequirement = requirements.find(
    (req) => req._id === requirement
  );

  const materialOptions: MaterialOption[] = useMemo(() => {
    if (!selectedRequirement) return [];

    return selectedRequirement.items
      .map((item) => {
        if (typeof item.material === "string") {
          return null;
        }

        return {
          _id: item.material._id,
          name: item.material.name,
          sku: item.material.sku,
          unit: item.material.unit,
          currentStock: item.material.currentStock,
        };
      })
      .filter(Boolean) as MaterialOption[];
  }, [selectedRequirement]);

  const getRequirementItem = (materialId: string) => {
    return selectedRequirement?.items.find((item) => {
      const id =
        typeof item.material === "string"
          ? item.material
          : item.material?._id;

      return id === materialId;
    });
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        material: "",
        quantity: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;

    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof FormItem,
    value: string
  ) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setItems(updated);
  };

  const handleProjectChange = (value: string) => {
    setProject(value);
    setRequirement("");

    setItems([
      {
        material: "",
        quantity: "",
      },
    ]);
  };

  const handleRequirementChange = (value: string) => {
    setRequirement(value);

    setItems([
      {
        material: "",
        quantity: "",
      },
    ]);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!can(user?.role, "CREATE_DISPATCH")) {
      setError("You do not have permission to create dispatches.");
      return;
    }

    setError("");

    if (!project) {
      setError("Please select a project.");
      return;
    }

    if (!requirement) {
      setError("Please select a requirement.");
      return;
    }

    if (!expectedDeliveryDate) {
      setError("Please select expected delivery date.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }

    const validItems: CreateDispatchItem[] = [];

    for (const item of items) {
      if (!item.material || !item.quantity) {
        setError(
          "Please select material and quantity for every dispatch item."
        );
        return;
      }

      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError(
          "Dispatch quantity must be greater than zero."
        );
        return;
      }

      const requirementItem = getRequirementItem(
        item.material
      );

      if (!requirementItem) {
        setError(
          "Selected material is not part of the requirement."
        );
        return;
      }

      if (
        quantity > requirementItem.allocatedQuantity
      ) {
        setError(
          `Quantity cannot exceed allocated quantity (${requirementItem.allocatedQuantity}).`
        );
        return;
      }

      validItems.push({
        material: item.material,
        quantity,
      });
    }

    try {
      setLoading(true);

      const response = await createDispatch({
        project,
        requirement,
        items: validItems,
        expectedDeliveryDate,
        vehicleNumber: vehicleNumber.trim() || undefined,
        transporterName:
          transporterName.trim() || undefined,
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        remarks: remarks.trim() || undefined,
      });

      navigate(`/dispatches/${response.data._id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to create dispatch"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!can(user?.role, "CREATE_DISPATCH")) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h2>

        <p className="mt-2 text-sm text-red-700">
          You do not have permission to create dispatches.
        </p>

        <Link
          to="/dispatches"
          className="mt-5 inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm text-white"
        >
          Back to Dispatches
        </Link>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading dispatch form...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/dispatches"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dispatches
          </Link>

          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-amber-600" />

            <h1 className="text-2xl font-semibold text-slate-900">
              Create Dispatch
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Project / Requirement */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Dispatch Reference
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Project *">
            <select
              value={project}
              onChange={(e) =>
                handleProjectChange(e.target.value)
              }
              className="input"
            >
              <option value="">Select project</option>

              {projects.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.name} ({item.projectCode})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Requirement *">
            <select
              value={requirement}
              onChange={(e) =>
                handleRequirementChange(e.target.value)
              }
              disabled={!project}
              className="input disabled:bg-slate-100"
            >
              <option value="">
                {project
                  ? "Select requirement"
                  : "Select project first"}
              </option>

              {eligibleRequirements.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.priority || "MEDIUM"} —{" "}
                  {item.status}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Items */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Dispatch Items
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Quantity cannot exceed the allocated quantity.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={!selectedRequirement}
            className="inline-flex items-center gap-2 rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const requirementItem =
              getRequirementItem(item.material);

            return (
              <div
                key={index}
                className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_45px]"
              >
                <Field label="Material">
                  <select
                    value={item.material}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "material",
                        e.target.value
                      )
                    }
                    disabled={!selectedRequirement}
                    className="input bg-white"
                  >
                    <option value="">
                      {selectedRequirement
                        ? "Select material"
                        : "Select requirement first"}
                    </option>

                    {materialOptions.map((material) => (
                      <option
                        key={material._id}
                        value={material._id}
                      >
                        {material.name} ({material.sku})
                      </option>
                    ))}
                  </select>

                  {requirementItem && (
                    <p className="mt-1 text-xs text-slate-500">
                      Allocated:{" "}
                      {requirementItem.allocatedQuantity}{" "}
                      {typeof requirementItem.material ===
                      "string"
                        ? ""
                        : requirementItem.material.unit ||
                          ""}
                    </p>
                  )}
                </Field>

                <Field label="Quantity">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="input bg-white"
                  />
                </Field>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Delivery */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Delivery & Transport
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Expected Delivery Date *">
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) =>
                setExpectedDeliveryDate(e.target.value)
              }
              className="input"
            />
          </Field>

          <Field label="Vehicle Number">
            <input
              value={vehicleNumber}
              onChange={(e) =>
                setVehicleNumber(e.target.value)
              }
              placeholder="e.g. RJ14AB1234"
              className="input"
            />
          </Field>

          <Field label="Transporter Name">
            <input
              value={transporterName}
              onChange={(e) =>
                setTransporterName(e.target.value)
              }
              placeholder="Transporter name"
              className="input"
            />
          </Field>

          <Field label="Driver Name">
            <input
              value={driverName}
              onChange={(e) =>
                setDriverName(e.target.value)
              }
              placeholder="Driver name"
              className="input"
            />
          </Field>

          <Field label="Driver Phone">
            <input
              value={driverPhone}
              onChange={(e) =>
                setDriverPhone(e.target.value)
              }
              placeholder="Driver phone"
              className="input"
            />
          </Field>

          <Field label="Delivery Address *">
            <input
              value={deliveryAddress}
              onChange={(e) =>
                setDeliveryAddress(e.target.value)
              }
              placeholder="Project site delivery address"
              className="input"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Remarks">
            <textarea
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              rows={3}
              placeholder="Additional dispatch remarks..."
              className="input resize-none"
            />
          </Field>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          to="/dispatches"
          className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Dispatch"}
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.375rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }

        .input:focus {
          border-color: rgb(245 158 11);
          box-shadow: 0 0 0 1px rgb(245 158 11);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

export default CreateDispatch;