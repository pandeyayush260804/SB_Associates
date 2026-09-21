import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  createRequirement,
  type RequirementPriority,
} from "@/services/requirementService";

import {
  getProjects,
  type Project,
} from "@/services/projectService";

import {
  getMaterials,
  type Material,
} from "@/services/materialService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

interface RequirementFormItem {
  material: string;
  requiredQuantity: string;
}

const CreateRequirement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [project, setProject] = useState("");
  const [priority, setPriority] =
    useState<RequirementPriority>("MEDIUM");

  const [remarks, setRemarks] = useState("");

  const [items, setItems] = useState<
    RequirementFormItem[]
  >([
    {
      material: "",
      requiredQuantity: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectResponse, materialResponse] =
          await Promise.all([
            getProjects(),
            getMaterials(),
          ]);

        setProjects(projectResponse.data || []);
        setMaterials(materialResponse.data || []);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Failed to load projects and materials."
        );
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  if (!can(user?.role, "CREATE_REQUIREMENT")) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h1>

        <p className="mt-1 text-sm text-red-700">
          Only project managers can create material
          requirements.
        </p>
      </div>
    );
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        material: "",
        requiredQuantity: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;

    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof RequirementFormItem,
    value: string
  ) => {
    setItems(
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!project) {
      setError("Please select a project.");
      return;
    }

    if (items.length === 0) {
      setError("At least one material is required.");
      return;
    }

    const usedMaterials = new Set<string>();

    for (const item of items) {
      if (!item.material) {
        setError("Please select a material for every item.");
        return;
      }

      if (usedMaterials.has(item.material)) {
        setError(
          "The same material cannot be added more than once."
        );
        return;
      }

      usedMaterials.add(item.material);

      const quantity = Number(item.requiredQuantity);

      if (!quantity || quantity <= 0) {
        setError(
          "Required quantity must be greater than zero."
        );
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      await createRequirement({
        project,
        priority,
        remarks: remarks.trim(),
        items: items.map((item) => ({
          material: item.material,
          requiredQuantity: Number(
            item.requiredQuantity
          ),
        })),
      });

      navigate("/requirements");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to create requirement."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading projects and materials...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          to="/requirements"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">
          Create Material Requirement
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Request materials for an assigned project.
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
        {/* Basic details */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Requirement Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Project *
              </label>

              <select
                required
                value={project}
                onChange={(e) =>
                  setProject(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">
                  Select project
                </option>

                {projects.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.projectCode} — {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value as RequirementPriority
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Remarks
              </label>

              <textarea
                rows={3}
                value={remarks}
                onChange={(e) =>
                  setRemarks(e.target.value)
                }
                placeholder="Additional requirement details..."
                className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Required Materials
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Add one or more materials required for
                this project.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-md border border-amber-500 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </button>
          </div>

          <div className="space-y-4 p-6">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_220px_auto]"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Material *
                  </label>

                  <select
                    required
                    value={item.material}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "material",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option value="">
                      Select material
                    </option>

                    {materials
                      .filter(
                        (material) =>
                          material.isActive
                      )
                      .map((material) => (
                        <option
                          key={material._id}
                          value={material._id}
                        >
                          {material.name} ({material.sku})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Required Quantity *
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={item.requiredQuantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "requiredQuantity",
                        e.target.value
                      )
                    }
                    placeholder="Quantity"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            to="/requirements"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {loading
              ? "Submitting..."
              : "Submit Requirement"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequirement;