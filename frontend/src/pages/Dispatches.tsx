import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Eye,
  Plus,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { getDispatches, cancelDispatch } from "@/services/dispatchService";
import type {
  Dispatch,
  DispatchStatus,
} from "@/services/dispatchService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const statusLabels: Record<DispatchStatus, string> = {
  READY: "Ready",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

const statusClasses: Record<DispatchStatus, string> = {
  READY: "bg-amber-50 text-amber-700 border-amber-200",
  DISPATCHED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

function Dispatches() {
  const { user } = useAuth();

  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DispatchStatus | "ALL"
  >("ALL");

  const loadDispatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDispatches(
        statusFilter === "ALL"
          ? undefined
          : { status: statusFilter }
      );

      setDispatches(response?.data || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load dispatches"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, [statusFilter]);

  const filteredDispatches = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return dispatches;

    return dispatches.filter((dispatch) => {
      return (
        dispatch.dispatchNumber
          ?.toLowerCase()
          .includes(value) ||
        dispatch.project?.name
          ?.toLowerCase()
          .includes(value) ||
        dispatch.project?.projectCode
          ?.toLowerCase()
          .includes(value) ||
        dispatch.vehicleNumber
          ?.toLowerCase()
          .includes(value) ||
        dispatch.transporterName
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [dispatches, search]);

  const summary = {
    total: dispatches.length,
    ready: dispatches.filter(
      (item) => item.status === "READY"
    ).length,
    inTransit: dispatches.filter(
      (item) => item.status === "IN_TRANSIT"
    ).length,
    delivered: dispatches.filter(
      (item) => item.status === "DELIVERED"
    ).length,
    confirmed: dispatches.filter(
      (item) => item.status === "CONFIRMED"
    ).length,
  };

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this dispatch?"
    );

    if (!confirmed) return;

    try {
      await cancelDispatch(id);
      await loadDispatches();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Failed to cancel dispatch"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl font-semibold text-slate-900">
              Dispatch Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage material dispatches, transportation and
            delivery confirmation.
          </p>
        </div>

        {can(user?.role, "CREATE_DISPATCH") && (
          <Link
            to="/dispatches/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            New Dispatch
          </Link>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <SummaryCard
          label="Total"
          value={summary.total}
        />
        <SummaryCard
          label="Ready"
          value={summary.ready}
        />
        <SummaryCard
          label="In Transit"
          value={summary.inTransit}
        />
        <SummaryCard
          label="Delivered"
          value={summary.delivered}
        />
        <SummaryCard
          label="Confirmed"
          value={summary.confirmed}
        />
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dispatch, project, vehicle..."
              className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as DispatchStatus | "ALL"
              )
            }
            className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading dispatches...
          </div>
        ) : filteredDispatches.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No dispatches found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Create a dispatch from an eligible fulfilled
              requirement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Dispatch
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Project
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Items
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Expected Delivery
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDispatches.map((dispatch) => (
                  <tr
                    key={dispatch._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {dispatch.dispatchNumber}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {dispatch.vehicleNumber ||
                          "No vehicle"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {dispatch.project?.name ||
                          "Project unavailable"}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {dispatch.project?.projectCode || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {dispatch.items?.length || 0} material
                      {dispatch.items?.length === 1
                        ? ""
                        : "s"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {dispatch.expectedDeliveryDate
                        ? new Date(
                            dispatch.expectedDeliveryDate
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          statusClasses[dispatch.status]
                        }`}
                      >
                        {statusLabels[dispatch.status]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dispatches/${dispatch._id}`}
                          className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {can(
                          user?.role,
                          "CANCEL_DISPATCH"
                        ) &&
                          dispatch.status === "READY" && (
                            <button
                              onClick={() =>
                                handleCancel(dispatch._id)
                              }
                              className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default Dispatches;