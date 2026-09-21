import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  confirmDelivery,
  getDispatchById,
} from "@/services/dispatchService";

import type { Dispatch } from "@/services/dispatchService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

function ConfirmDelivery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dispatch, setDispatch] =
    useState<Dispatch | null>(null);

  const [received, setReceived] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const response = await getDispatchById(id);

        const data: Dispatch = response?.data;

        setDispatch(data);

        const initial: Record<string, string> = {};

        data.items.forEach((item) => {
          initial[item._id] = String(
            item.quantity
          );
        });

        setReceived(initial);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Failed to load dispatch"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (!can(user?.role, "CONFIRM_DELIVERY")) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-800">
          Access Restricted
        </h2>

        <p className="mt-2 text-sm text-red-700">
          You do not have permission to confirm deliveries.
        </p>

        <Link
          to="/dispatches"
          className="mt-5 inline-flex rounded-md bg-slate-800 px-4 py-2 text-sm text-white"
        >
          Back to Dispatches
        </Link>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!dispatch || !id) return;

    if (dispatch.status !== "DELIVERED") {
      setError(
        "Delivery can only be confirmed after the dispatch is marked DELIVERED."
      );
      return;
    }

    const items = dispatch.items.map((item) => ({
      itemId: item._id,
      receivedQuantity: Number(
        received[item._id] || 0
      ),
    }));

    for (const item of items) {
      const dispatchItem = dispatch.items.find(
        (value) => value._id === item.itemId
      );

      if (
        !dispatchItem ||
        item.receivedQuantity !==
          dispatchItem.quantity
      ) {
        setError(
          "All dispatched material must be received before confirmation."
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      await confirmDelivery(id, items);

      navigate(`/dispatches/${id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to confirm delivery"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading delivery details...
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to={`/dispatches/${dispatch._id}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dispatch
        </Link>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Confirm Delivery
            </h1>

            <p className="text-sm text-slate-500">
              {dispatch.dispatchNumber}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {dispatch.status !== "DELIVERED" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This dispatch must first be marked as DELIVERED.
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Received Material
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Enter the actual quantity received at the
            project site.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600">
                  Material
                </th>

                <th className="px-6 py-3 font-semibold text-slate-600">
                  Dispatched
                </th>

                <th className="px-6 py-3 font-semibold text-slate-600">
                  Received
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dispatch.items.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">
                      {item.material?.name ||
                        "Material unavailable"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {item.material?.sku || "-"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {item.quantity}{" "}
                    {item.material?.unit || ""}
                  </td>

                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={
                        received[item._id] ?? ""
                      }
                      onChange={(e) =>
                        setReceived({
                          ...received,
                          [item._id]:
                            e.target.value,
                        })
                      }
                      className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />

                    <span className="ml-2 text-xs text-slate-500">
                      {item.material?.unit || ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Link
          to={`/dispatches/${dispatch._id}`}
          className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          onClick={handleConfirm}
          disabled={
            submitting ||
            dispatch.status !== "DELIVERED"
          }
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />

          {submitting
            ? "Confirming..."
            : "Confirm Delivery"}
        </button>
      </div>
    </div>
  );
}

export default ConfirmDelivery;