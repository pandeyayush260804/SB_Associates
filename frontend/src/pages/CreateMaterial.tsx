import { type FormEvent, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { createMaterial } from "@/services/materialService";
import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const CreateMaterial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    currentStock: "",
    minimumStock: "",
    unitPrice: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!can(user?.role, "CREATE_MATERIAL")) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h1>

        <p className="mt-1 text-sm text-red-700">
          You do not have permission to create materials.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createMaterial({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        unit: form.unit.trim(),
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
        unitPrice: Number(form.unitPrice),
        isActive: form.isActive,
      });

      navigate("/materials");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to create material."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/materials"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Materials
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">
          Create Material
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new material to the project inventory.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Material Name *
            </label>

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Solar DC Cable"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              SKU *
            </label>

            <input
              required
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku: e.target.value,
                })
              }
              placeholder="e.g. SDC-001"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm uppercase outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category *
            </label>

            <input
              required
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              placeholder="e.g. Electrical"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Unit *
            </label>

            <input
              required
              value={form.unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  unit: e.target.value,
                })
              }
              placeholder="e.g. meter, piece, kg"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Current Stock *
            </label>

            <input
              required
              type="number"
              min="0"
              value={form.currentStock}
              onChange={(e) =>
                setForm({
                  ...form,
                  currentStock: e.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Minimum Stock *
            </label>

            <input
              required
              type="number"
              min="0"
              value={form.minimumStock}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumStock: e.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Unit Price *
            </label>

            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  unitPrice: e.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div className="flex items-center gap-3 pt-7">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />

            <label
              htmlFor="isActive"
              className="text-sm text-slate-700"
            >
              Material is active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Link
            to="/materials"
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

            {loading ? "Creating..." : "Create Material"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMaterial;