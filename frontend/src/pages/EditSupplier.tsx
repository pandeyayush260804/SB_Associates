import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getSupplierById,
  updateSupplier,
  type Supplier,
} from "@/services/supplierService";

import {
  getMaterials,
  type Material,
} from "@/services/materialService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [supplier, setSupplier] =
    useState<Supplier | null>(null);

  const [materials, setMaterials] =
    useState<Material[]>([]);

  const [name, setName] = useState("");
  const [supplierCode, setSupplierCode] =
    useState("");
  const [contactPerson, setContactPerson] =
    useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [remarks, setRemarks] =
    useState("");

  const [selectedMaterials, setSelectedMaterials] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        return;
      }

      try {
        setInitialLoading(true);
        setError("");

        const [
          supplierResponse,
          materialsResponse,
        ] = await Promise.all([
          getSupplierById(id),
          getMaterials(),
        ]);

        const data: Supplier =
          supplierResponse.data;

        setSupplier(data);

        setMaterials(
          materialsResponse.data || []
        );

        setName(data.name || "");
        setSupplierCode(
          data.supplierCode || ""
        );
        setContactPerson(
          data.contactPerson || ""
        );
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setState(data.state || "");
        setRemarks(data.remarks || "");

        setSelectedMaterials(
          data.materialsSupplied
            .filter(Boolean)
            .map(
              (material) => material!._id
            )
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Failed to load supplier."
        );
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (
    !can(user?.role, "EDIT_SUPPLIER")
  ) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h1>

        <p className="mt-1 text-sm text-red-700">
          You do not have permission to edit
          suppliers.
        </p>
      </div>
    );
  }

  const toggleMaterial = (
    materialId: string
  ) => {
    setSelectedMaterials((current) =>
      current.includes(materialId)
        ? current.filter(
            (id) => id !== materialId
          )
        : [...current, materialId]
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!id) {
      return;
    }

    if (
      !name.trim() ||
      !supplierCode.trim() ||
      !contactPerson.trim() ||
      !phone.trim()
    ) {
      setError(
        "Name, supplier code, contact person and phone are required."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateSupplier(id, {
        name: name.trim(),
        supplierCode:
          supplierCode.trim().toUpperCase(),
        contactPerson: contactPerson.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        materialsSupplied:
          selectedMaterials,
        remarks:
          remarks.trim() || undefined,
      });

      navigate("/suppliers");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to update supplier."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading supplier...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Supplier not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/suppliers"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Suppliers
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">
          Edit Supplier
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update supplier information and supplied
          materials.
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
        {/* Supplier Information */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Supplier Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Supplier Name *
              </label>

              <input
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Supplier Code *
              </label>

              <input
                required
                value={supplierCode}
                onChange={(e) =>
                  setSupplierCode(
                    e.target.value.toUpperCase()
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm uppercase outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Contact Person *
              </label>

              <input
                required
                value={contactPerson}
                onChange={(e) =>
                  setContactPerson(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone *
              </label>

              <input
                required
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                State
              </label>

              <input
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                rows={2}
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Materials Supplied
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select the active materials supplied by
              this supplier.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {materials
              .filter(
                (material) =>
                  material.isActive
              )
              .map((material) => {
                const selected =
                  selectedMaterials.includes(
                    material._id
                  );

                return (
                  <button
                    key={material._id}
                    type="button"
                    onClick={() =>
                      toggleMaterial(
                        material._id
                      )
                    }
                    className={`rounded-md border p-4 text-left ${
                      selected
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {material.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {material.sku}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {material.category}
                        </p>
                      </div>

                      <div
                        className={`mt-1 h-4 w-4 rounded border ${
                          selected
                            ? "border-amber-500 bg-amber-500"
                            : "border-slate-300"
                        }`}
                      >
                        {selected && (
                          <div className="flex h-full items-center justify-center text-[10px] font-bold text-white">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Remarks */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Remarks
            </label>

            <textarea
              rows={3}
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/suppliers"
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
              ? "Updating..."
              : "Update Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSupplier;