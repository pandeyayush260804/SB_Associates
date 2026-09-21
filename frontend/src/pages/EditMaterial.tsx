import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMaterialById,
  updateMaterial,
} from "@/services/materialService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const EditMaterial = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const loadMaterial = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const response = await getMaterialById(id);
        const material = response.data;

        setForm({
          name: material.name || "",
          sku: material.sku || "",
          category: material.category || "",
          unit: material.unit || "",
          currentStock: String(
            material.currentStock ?? 0
          ),
          minimumStock: String(
            material.minimumStock ?? 0
          ),
          unitPrice: String(material.unitPrice ?? 0),
          isActive: material.isActive ?? true,
        });
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Failed to load material."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMaterial();
  }, [id]);

  if (!can(user?.role, "EDIT_MATERIAL")) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h1>

        <p className="mt-1 text-sm text-red-700">
          You do not have permission to edit materials.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await updateMaterial(id, {
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
          "Failed to update material."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading material...
      </div>
    );
  }

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
          Edit Material
        </h1>
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
          {[
            ["name", "Material Name"],
            ["sku", "SKU"],
            ["category", "Category"],
            ["unit", "Unit"],
            ["currentStock", "Current Stock"],
            ["minimumStock", "Minimum Stock"],
            ["unitPrice", "Unit Price"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} *
              </label>

              <input
                required
                type={
                  [
                    "currentStock",
                    "minimumStock",
                    "unitPrice",
                  ].includes(key)
                    ? "number"
                    : "text"
                }
                min={
                  [
                    "currentStock",
                    "minimumStock",
                    "unitPrice",
                  ].includes(key)
                    ? "0"
                    : undefined
                }
                step={
                  key === "unitPrice"
                    ? "0.01"
                    : undefined
                }
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          ))}

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
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMaterial;