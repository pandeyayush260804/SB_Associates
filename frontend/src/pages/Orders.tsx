import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Eye,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  cancelOrder,
  getOrders,
  placeOrder,
  type Order,
  type OrderStatus,
} from "@/services/orderService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const statusClasses: Record<
  OrderStatus,
  string
> = {
  DRAFT:
    "border-slate-200 bg-slate-100 text-slate-700",
  PLACED:
    "border-blue-200 bg-blue-50 text-blue-700",
  PARTIALLY_RECEIVED:
    "border-amber-200 bg-amber-50 text-amber-700",
  RECEIVED:
    "border-green-200 bg-green-50 text-green-700",
  CANCELLED:
    "border-red-200 bg-red-50 text-red-700",
};

const Orders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | "">("");

  const [cancelTarget, setCancelTarget] =
    useState<Order | null>(null);

  const canManage =
    can(user?.role, "CREATE_ORDER");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders(
        statusFilter
          ? { status: statusFilter }
          : undefined
      );

      setOrders(response.data || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.orderNumber
          ?.toLowerCase()
          .includes(value) ||
        order.supplier?.name
          ?.toLowerCase()
          .includes(value) ||
        order.project?.name
          ?.toLowerCase()
          .includes(value) ||
        order.project?.projectCode
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [orders, search]);

  const handlePlace = async (
    order: Order
  ) => {
    try {
      setActionLoading(order._id);
      setError("");

      await placeOrder(order._id);

      await loadOrders();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to place order."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    try {
      setActionLoading(cancelTarget._id);
      setError("");

      await cancelOrder(cancelTarget._id);

      setCancelTarget(null);

      await loadOrders();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to cancel order."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const totalOrders = orders.length;

  const draftOrders = orders.filter(
    (order) => order.status === "DRAFT"
  ).length;

  const placedOrders = orders.filter(
    (order) => order.status === "PLACED"
  ).length;

  const receivedOrders = orders.filter(
    (order) => order.status === "RECEIVED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-600">
            Supply Chain
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Purchase Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage supplier orders and material
            receipts.
          </p>
        </div>

        {canManage && (
          <Link
            to="/orders/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            New Purchase Order
          </Link>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Orders
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Draft
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {draftOrders}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Placed
          </p>
          <p className="mt-1 text-2xl font-semibold text-blue-700">
            {placedOrders}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Received
          </p>
          <p className="mt-1 text-2xl font-semibold text-green-700">
            {receivedOrders}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search order, supplier or project..."
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | OrderStatus
                  | ""
              )
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="">
              All Statuses
            </option>
            <option value="DRAFT">Draft</option>
            <option value="PLACED">Placed</option>
            <option value="PARTIALLY_RECEIVED">
              Partially Received
            </option>
            <option value="RECEIVED">
              Received
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <button
            onClick={loadOrders}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Order
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Supplier
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Project
                </th>

                <th className="px-5 py-3 text-center font-semibold text-slate-600">
                  Items
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Amount
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Expected Delivery
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
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading purchase orders...
                  </td>
                </tr>
              ) : filteredOrders.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/orders/${order._id}`}
                        className="font-semibold text-slate-900 hover:text-amber-600"
                      >
                        {order.orderNumber}
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.requirement?.priority ||
                          "—"}{" "}
                        priority
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {order.supplier?.name ||
                          "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.supplier
                          ?.supplierCode || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {order.project?.name ||
                          "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.project
                          ?.projectCode || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-center text-slate-700">
                      {order.items?.length || 0}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-800">
                      ₹
                      {(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.expectedDeliveryDate
                        ? new Date(
                            order.expectedDeliveryDate
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[order.status]}`}
                      >
                        {order.status.replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/orders/${order._id}`}
                          title="View order"
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {canManage &&
                          order.status ===
                            "DRAFT" && (
                            <button
                              disabled={
                                actionLoading ===
                                order._id
                              }
                              onClick={() =>
                                handlePlace(
                                  order
                                )
                              }
                              title="Place order"
                              className="rounded-md p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}

                        {canManage &&
                          (order.status ===
                            "PLACED" ||
                            order.status ===
                              "PARTIALLY_RECEIVED") && (
                            <Link
                              to={`/orders/${order._id}/receive`}
                              title="Receive material"
                              className="rounded-md p-2 text-green-600 hover:bg-green-50"
                            >
                              <PackageCheck className="h-4 w-4" />
                            </Link>
                          )}

                        {canManage &&
                          order.status !==
                            "RECEIVED" &&
                          order.status !==
                            "PARTIALLY_RECEIVED" &&
                          order.status !==
                            "CANCELLED" && (
                            <button
                              disabled={
                                actionLoading ===
                                order._id
                              }
                              onClick={() =>
                                setCancelTarget(
                                  order
                                )
                              }
                              title="Cancel order"
                              className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Ban className="h-4 w-4" />
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

      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Cancel Purchase Order
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to cancel{" "}
                <span className="font-semibold">
                  {cancelTarget.orderNumber}
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                Orders that have received material
                cannot be cancelled.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() =>
                  setCancelTarget(null)
                }
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Keep Order
              </button>

              <button
                disabled={!!actionLoading}
                onClick={handleCancel}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;