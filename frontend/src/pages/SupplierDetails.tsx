import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  getSupplierById,
  type Supplier,
} from "@/services/supplierService";

const SupplierDetails = () => {
  const { id } = useParams();

  const [supplier, setSupplier] =
    useState<Supplier | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSupplier = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getSupplierById(id);

        setSupplier(response.data);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Failed to load supplier."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSupplier();
  }, [id]);

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/suppliers"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Suppliers
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-amber-600" />

              <h1 className="text-2xl font-semibold text-slate-900">
                {supplier.name}
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Supplier Code:{" "}
              {supplier.supplierCode}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
              supplier.isActive
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-slate-200 bg-slate-100 text-slate-500"
            }`}
          >
            {supplier.isActive
              ? "ACTIVE"
              : "INACTIVE"}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Contact Information */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Contact Person
          </p>

          <p className="mt-2 font-semibold text-slate-900">
            {supplier.contactPerson}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-600" />

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Phone
            </p>
          </div>

          <p className="mt-2 font-semibold text-slate-900">
            {supplier.phone}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-amber-600" />

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Email
            </p>
          </div>

          <p className="mt-2 break-all font-semibold text-slate-900">
            {supplier.email || "—"}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-600" />

          <h2 className="font-semibold text-slate-900">
            Location
          </h2>
        </div>

        <div className="mt-3 text-sm text-slate-700">
          {supplier.address && (
            <p>{supplier.address}</p>
          )}

          {(supplier.city ||
            supplier.state) && (
            <p className="mt-1">
              {[
                supplier.city,
                supplier.state,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          {!supplier.address &&
            !supplier.city &&
            !supplier.state && (
              <p className="text-slate-400">
                No location information available.
              </p>
            )}
        </div>
      </div>

      {/* Materials */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Materials Supplied
          </h2>
        </div>

        <div className="p-5">
          {supplier.materialsSupplied.filter(
            Boolean
          ).length === 0 ? (
            <p className="text-sm text-slate-500">
              No materials are assigned to this
              supplier.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {supplier.materialsSupplied
                .filter(Boolean)
                .map((material) => (
                  <div
                    key={material!._id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-medium text-slate-900">
                      {material!.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      SKU: {material!.sku}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Category:{" "}
                      {material!.category}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Unit: {material!.unit}
                    </p>

                    {material!.currentStock !==
                      undefined && (
                      <p className="mt-2 text-xs font-medium text-slate-700">
                        Current Stock:{" "}
                        {material!.currentStock.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Remarks */}
      {supplier.remarks && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Remarks
          </h2>

          <p className="mt-2 text-sm text-slate-700">
            {supplier.remarks}
          </p>
        </div>
      )}
    </div>
  );
};

export default SupplierDetails;