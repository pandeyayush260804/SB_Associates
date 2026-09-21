import { useEffect, useState } from "react";
import {
  ArrowLeft,
  PackageCheck,
  Save,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getOrderById,
  receiveOrder,
  type Order,
} from "@/services/orderService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

interface ReceiveLine {
  itemId: string;
  materialName: string;
  sku: string;
  orderedQuantity: number;
  alreadyReceived: number;
  remainingQuantity: number;
  receivedQuantity: number;
}

const ReceiveOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [lines, setLines] =
    useState<ReceiveLine[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getOrderById(id);

        const orderData: Order =
          response.data;

        setOrder(orderData);

        setLines(
          orderData.items.map((item) => ({
            itemId: item._id,
            materialName:
              item.material?.name ||
              "Material unavailable",
            sku:
              item.material?.sku || "—",
            orderedQuantity:
              item.quantity,
            alreadyReceived:
              item.receivedQuantity,
            remainingQuantity:
              item.quantity -
              item.receivedQuantity,
            receivedQuantity: 0,
          }))
        );
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

    loadOrder();
  }, [id]);

  if (
    !can(user?.role, "CREATE_ORDER")
  ) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h1>

        <p className="mt-1 text-sm text-red-700">
          You do not have permission to receive
          materials.
        </p>
      </div>
    );
  }

  const updateQuantity = (
    index: number,
    value: number
  ) => {
    setLines((current) =>
      current.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line;
        }

        return {
          ...line,
          receivedQuantity: Math.min(
            Math.max(value, 0),
            line.remainingQuantity
          ),
        };
      })
    );
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!id || !order) {
      return;
    }

    const receivedItems = lines
      .filter(
        (line) =>
          line.receivedQuantity > 0
      )
      .map((line) => ({
        itemId: line.itemId,
        receivedQuantity:
          line.receivedQuantity,
      }));

    if (receivedItems.length === 0) {
      setError(
        "Enter a received quantity for at least one material."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await receiveOrder(
        order._id,
        receivedItems
      );

      navigate(`/orders/${order._id}`);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to receive material."
      );
    } finally {
      setSaving(false);
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

  if (
    order.status !== "PLACED" &&
    order.status !==
      "PARTIALLY_RECEIVED"
  ) {
    return (
      <div className="space-y-4">
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </Link>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="font-semibold text-amber-800">
            Material cannot be received
          </h1>

          <p className="mt-1 text-sm text-amber-700">
            This order is currently{" "}
            {order.status.replace(
              /_/g,
              " "
            )}
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/orders/${order._id}`}
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </Link>

        <div className="flex items-center gap-3">
          <PackageCheck className="h-6 w-6 text-green-600" />

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Receive Material
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Order {order.orderNumber}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Order summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Supplier
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {order.supplier?.name ||
              "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Project
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {order.project?.name ||
              "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Current Status
          </p>

          <p className="mt-1 font-medium text-blue-700">
            {order.status.replace(
              /_/g,
              " "
            )}
          </p>
        </div>
      </div>

      {/* Receive form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Material Receipt
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Enter the quantity received in this
            shipment. Partial receipt is supported.
          </p>
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
                  Already Received
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Remaining
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Receive Now
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {lines.map((line, index) => (
                <tr key={line.itemId}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {line.materialName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {line.sku}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-right text-slate-700">
                    {line.orderedQuantity.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-4 text-right text-green-700">
                    {line.alreadyReceived.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-medium text-amber-700">
                    {line.remainingQuantity.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <input
                      type="number"
                      min={0}
                      max={
                        line.remainingQuantity
                      }
                      value={
                        line.receivedQuantity
                      }
                      disabled={
                        line.remainingQuantity ===
                        0
                      }
                      onChange={(e) =>
                        updateQuantity(
                          index,
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="h-9 w-32 rounded-md border border-slate-300 px-2 text-right text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <Link
            to={`/orders/${order._id}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Saving..."
              : "Confirm Receipt"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReceiveOrder;