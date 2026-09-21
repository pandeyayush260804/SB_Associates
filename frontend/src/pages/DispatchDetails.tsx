import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Truck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getDispatchById,
  updateDispatchStatus,
} from "@/services/dispatchService";
import type { Dispatch } from "@/services/dispatchService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const nextStatusMap: Record<
  string,
  "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | null
> = {
  READY: "DISPATCHED",
  DISPATCHED: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
  DELIVERED: null,
  CONFIRMED: null,
  CANCELLED: null,
};

const nextStatusLabel: Record<string, string> = {
  READY: "Mark as Dispatched",
  DISPATCHED: "Mark In Transit",
  IN_TRANSIT: "Mark as Delivered",
};

function DispatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dispatch, setDispatch] =
    useState<Dispatch | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");

  const loadDispatch = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await getDispatchById(id);

      setDispatch(response?.data || null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load dispatch"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatch();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!dispatch) return;

    const nextStatus =
      nextStatusMap[dispatch.status];

    if (!nextStatus) return;

    if (
      !can(user?.role, "UPDATE_DISPATCH_STATUS")
    ) {
      setError(
        "You do not have permission to update dispatch status."
      );
      return;
    }

    const confirmed = window.confirm(
      `Change dispatch status from ${dispatch.status} to ${nextStatus}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await updateDispatchStatus(
        dispatch._id,
        nextStatus
      );

      await loadDispatch();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to update dispatch status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading dispatch...
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">
        Dispatch not found.
      </div>
    );
  }

  const nextStatus =
    nextStatusMap[dispatch.status];

  const canUpdateStatus = can(
    user?.role,
    "UPDATE_DISPATCH_STATUS"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/dispatches"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dispatches
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-3">
              <Truck className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {dispatch.dispatchNumber}
              </h1>

              <p className="text-sm text-slate-500">
                {dispatch.project?.name}
              </p>
            </div>
          </div>

          {nextStatus &&
            canUpdateStatus && (
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {actionLoading
                  ? "Updating..."
                  : nextStatusLabel[
                      dispatch.status
                    ]}
              </button>
            )}

          {dispatch.status === "DELIVERED" &&
            can(
              user?.role,
              "CONFIRM_DELIVERY"
            ) && (
              <button
                onClick={() =>
                  navigate(
                    `/dispatches/${dispatch._id}/confirm`
                  )
                }
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Delivery
              </button>
            )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Status */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Dispatch Status
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {[
            "READY",
            "DISPATCHED",
            "IN_TRANSIT",
            "DELIVERED",
            "CONFIRMED",
          ].map((status, index) => {
            const active =
              dispatch.status === status;

            const reached =
              [
                "READY",
                "DISPATCHED",
                "IN_TRANSIT",
                "DELIVERED",
                "CONFIRMED",
              ].indexOf(dispatch.status) >=
              index;

            return (
              <div
                key={status}
                className="flex items-center gap-3"
              >
                <div
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    active
                      ? "bg-amber-500 text-white"
                      : reached
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {status.replace("_", " ")}
                </div>

                {index < 4 && (
                  <span className="text-slate-300">
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {dispatch.inventoryDeducted && (
          <p className="mt-4 text-xs font-medium text-emerald-700">
            ✓ Inventory deducted from warehouse stock
          </p>
        )}
      </section>

      {/* Project / Requirement */}
      <section className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Project">
          <InfoRow
            label="Project"
            value={dispatch.project?.name}
          />

          <InfoRow
            label="Project Code"
            value={dispatch.project?.projectCode}
          />

          <InfoRow
            label="Client"
            value={dispatch.project?.client}
          />

          <InfoRow
            label="Location"
            value={dispatch.project?.location}
          />
        </InfoCard>

        <InfoCard title="Requirement">
          <InfoRow
            label="Status"
            value={dispatch.requirement?.status}
          />

          <InfoRow
            label="Priority"
            value={
              dispatch.requirement?.priority || "-"
            }
          />

          <InfoRow
            label="Remarks"
            value={
              dispatch.requirement?.remarks || "-"
            }
          />
        </InfoCard>
      </section>

      {/* Items */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Dispatch Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600">
                  Material
                </th>
                <th className="px-6 py-3 font-semibold text-slate-600">
                  SKU
                </th>
                <th className="px-6 py-3 font-semibold text-slate-600">
                  Quantity
                </th>
                <th className="px-6 py-3 font-semibold text-slate-600">
                  Received
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dispatch.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {item.material?.name ||
                      "Material unavailable"}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {item.material?.sku || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {item.quantity}{" "}
                    {item.material?.unit || ""}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {item.receivedQuantity}{" "}
                    {item.material?.unit || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transport */}
      <InfoCard title="Transport & Delivery">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow
            label="Vehicle Number"
            value={
              dispatch.vehicleNumber || "-"
            }
          />

          <InfoRow
            label="Transporter"
            value={
              dispatch.transporterName || "-"
            }
          />

          <InfoRow
            label="Driver"
            value={dispatch.driverName || "-"}
          />

          <InfoRow
            label="Driver Phone"
            value={dispatch.driverPhone || "-"}
          />

          <InfoRow
            label="Expected Delivery"
            value={new Date(
              dispatch.expectedDeliveryDate
            ).toLocaleDateString("en-IN")}
          />

          <InfoRow
            label="Actual Delivery"
            value={
              dispatch.actualDeliveryDate
                ? new Date(
                    dispatch.actualDeliveryDate
                  ).toLocaleDateString("en-IN")
                : "-"
            }
          />

          <InfoRow
            label="Delivery Address"
            value={dispatch.deliveryAddress}
          />
        </div>
      </InfoCard>

      {/* Confirmation */}
      {dispatch.confirmedBy && (
        <InfoCard title="Delivery Confirmation">
          <InfoRow
            label="Confirmed By"
            value={dispatch.confirmedBy.name}
          />

          <InfoRow
            label="Email"
            value={dispatch.confirmedBy.email}
          />
        </InfoCard>
      )}
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span className="text-sm text-slate-700">
        {value || "-"}
      </span>
    </div>
  );
}

export default DispatchDetails;