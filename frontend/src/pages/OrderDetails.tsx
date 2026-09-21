import { useEffect, useState } from "react";
import {
  ArrowLeft,
  PackageCheck,
  Send,
  XCircle,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getOrderById,
  placeOrder,
  cancelOrder,
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

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const canManage =
    can(user?.role, "CREATE_ORDER");

  const loadOrder = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getOrderById(id);

      setOrder(response.data);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handlePlace = async () => {
    if (!order) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await placeOrder(order._id);

      await loadOrder();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to place order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await cancelOrder(order._id);

      await loadOrder();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to cancel order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Order not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/orders"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Purchase Orders
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-amber-600">
              Purchase Order
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {order.orderNumber}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Created{" "}
              {order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleDateString(
                    "en-IN"
                  )
                : "—"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${statusClasses[order.status]}`}
          >
            {order.status.replace(
              /_/g,
              " "
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="flex flex-wrap gap-2">
          {order.status === "DRAFT" && (
            <button
              disabled={actionLoading}
              onClick={handlePlace}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Place Order
            </button>
          )}

          {(order.status === "PLACED" ||
            order.status ===
              "PARTIALLY_RECEIVED") && (
            <Link
              to={`/orders/${order._id}/receive`}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <PackageCheck className="h-4 w-4" />
              Receive Material
            </Link>
          )}

          {order.status !== "RECEIVED" &&
            order.status !==
              "PARTIALLY_RECEIVED" &&
            order.status !==
              "CANCELLED" && (
              <button
                disabled={actionLoading}
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Cancel Order
              </button>
            )}
        </div>
      )}

      {/* Supplier + Project */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Supplier
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Name
              </span>
              <span className="font-medium text-slate-800">
                {order.supplier?.name ||
                  "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Code
              </span>
              <span className="font-medium text-slate-800">
                {order.supplier
                  ?.supplierCode || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Contact
              </span>
              <span className="font-medium text-slate-800">
                {order.supplier
                  ?.contactPerson || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Phone
              </span>
              <span className="font-medium text-slate-800">
                {order.supplier?.phone ||
                  "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Project
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Name
              </span>
              <span className="font-medium text-slate-800">
                {order.project?.name ||
                  "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Code
              </span>
              <span className="font-medium text-slate-800">
                {order.project
                  ?.projectCode || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Client
              </span>
              <span className="font-medium text-slate-800">
                {order.project?.client ||
                  "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Location
              </span>
              <span className="font-medium text-slate-800">
                {order.project?.location ||
                  "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order information */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Order Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Requirement
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {order.requirement?.priority ||
                "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Expected Delivery
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {new Date(
                order.expectedDeliveryDate
              ).toLocaleDateString(
                "en-IN"
              )}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Created By
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {order.createdBy?.name ||
                "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Ordered Materials
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Material
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Ordered
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Received
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Pending
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Unit Price
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const pending =
                  item.quantity -
                  item.receivedQuantity;

                return (
                  <tr key={item._id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {item.material?.name ||
                          "Material unavailable"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.material?.sku ||
                          "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right text-slate-700">
                      {item.quantity.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-green-700">
                      {item.receivedQuantity.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-amber-700">
                      {pending.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-slate-700">
                      ₹
                      {item.unitPrice.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-800">
                      ₹
                      {item.totalPrice.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td
                  colSpan={5}
                  className="px-5 py-4 text-right font-semibold text-slate-700"
                >
                  Total Amount
                </td>

                <td className="px-5 py-4 text-right text-lg font-semibold text-slate-900">
                  ₹
                  {order.totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Remarks */}
      {order.remarks && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Remarks
          </h2>

          <p className="mt-2 text-sm text-slate-700">
            {order.remarks}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;