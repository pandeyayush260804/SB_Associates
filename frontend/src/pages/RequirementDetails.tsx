import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  XCircle,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  approveRequirement,
  allocateRequirement,
  getRequirementById,
  rejectRequirement,
  type Requirement,
  type RequirementStatus,
} from "@/services/requirementService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const RequirementDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [requirement, setRequirement] =
    useState<Requirement | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [showReject, setShowReject] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState("");

  // ============================================
  // Load Requirement
  // ============================================

  const loadRequirement = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getRequirementById(id);

      setRequirement(response.data);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load requirement."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirement();
  }, [id]);

  // ============================================
  // Approve
  // ============================================

  const handleApprove = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await approveRequirement(id);

      await loadRequirement();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to approve requirement."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Reject
  // ============================================

  const handleReject = async () => {
    if (!id) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await rejectRequirement(
        id,
        rejectionReason.trim()
      );

      setShowReject(false);
      setRejectionReason("");

      await loadRequirement();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to reject requirement."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Allocate Inventory
  // ============================================

  const handleAllocate = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await allocateRequirement(id);

      await loadRequirement();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to allocate inventory."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Status Class
  // ============================================

  const statusClass = (
    status: RequirementStatus
  ) => {
    switch (status) {
      case "FULFILLED":
        return "border-green-200 bg-green-50 text-green-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "APPROVED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "PARTIALLY_FULFILLED":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "PROCESSING":
        return "border-purple-200 bg-purple-50 text-purple-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  // ============================================
  // Loading
  // ============================================

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading requirement...
      </div>
    );
  }

  // ============================================
  // Not Found
  // ============================================

  if (!requirement) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Requirement not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================
          Header
      ======================================== */}

      <div>
        <Link
          to="/requirements"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Requirements
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Material Requirement
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {requirement.project?.projectCode ||
                "—"}{" "}
              —{" "}
              {requirement.project?.name ||
                "Project unavailable"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
              requirement.status
            )}`}
          >
            {requirement.status.replace(
              "_",
              " "
            )}
          </span>
        </div>
      </div>

      {/* ========================================
          Error
      ======================================== */}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ========================================
          Information Cards
      ======================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Project */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Project
          </p>

          <p className="mt-2 font-semibold text-slate-900">
            {requirement.project?.name ||
              "Project unavailable"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {requirement.project?.client || "—"}
          </p>
        </div>

        {/* Requested By */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Requested By
          </p>

          <p className="mt-2 font-semibold text-slate-900">
            {requirement.requestedBy?.name ||
              "Requester unavailable"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {requirement.requestedBy?.email || "—"}
          </p>
        </div>

        {/* Priority */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Priority
          </p>

          <p className="mt-2 font-semibold text-slate-900">
            {requirement.priority}
          </p>
        </div>
      </div>

      {/* ========================================
          Material Allocation
      ======================================== */}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Material Allocation
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
                  Required
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Allocated
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Pending
                </th>

                <th className="px-5 py-3 text-right font-semibold text-slate-600">
                  Current Stock
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {requirement.items.map((item) => {
                const material = item.material;

                return (
                  <tr key={item._id}>
                    {/* Material */}
                    <td className="px-5 py-4">
                      {material ? (
                        <>
                          <div className="font-medium text-slate-900">
                            {material.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {material.sku} ·{" "}
                            {material.unit}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-red-600">
                            Material unavailable
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            The referenced material no
                            longer exists.
                          </div>
                        </>
                      )}
                    </td>

                    {/* Required */}
                    <td className="px-5 py-4 text-right">
                      {item.requiredQuantity.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* Allocated */}
                    <td className="px-5 py-4 text-right font-medium text-green-700">
                      {item.allocatedQuantity.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* Pending */}
                    <td className="px-5 py-4 text-right font-medium text-orange-700">
                      {item.pendingQuantity.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* Current Stock */}
                    <td className="px-5 py-4 text-right text-slate-700">
                      {material
                        ? material.currentStock.toLocaleString(
                            "en-IN"
                          )
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================
          Remarks
      ======================================== */}

      {(requirement.remarks ||
        requirement.rejectionReason) && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {/* Remarks */}
          {requirement.remarks && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Remarks
              </p>

              <p className="mt-2 text-sm text-slate-700">
                {requirement.remarks}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {requirement.rejectionReason && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                Rejection Reason
              </p>

              <p className="mt-2 text-sm text-red-700">
                {requirement.rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================
          Actions
      ======================================== */}

      <div className="flex flex-wrap justify-end gap-2">
        {/* Approve */}
        {requirement.status === "PENDING" &&
          can(
            user?.role,
            "APPROVE_REQUIREMENT"
          ) && (
            <button
              disabled={actionLoading}
              onClick={handleApprove}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />

              Approve
            </button>
          )}

        {/* Reject */}
        {requirement.status === "PENDING" &&
          can(
            user?.role,
            "REJECT_REQUIREMENT"
          ) && (
            <button
              disabled={actionLoading}
              onClick={() => setShowReject(true)}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />

              Reject
            </button>
          )}

        {/* Allocate */}
        {(requirement.status === "APPROVED" ||
          requirement.status === "PROCESSING") &&
          can(
            user?.role,
            "ALLOCATE_REQUIREMENT"
          ) && (
            <button
              disabled={actionLoading}
              onClick={handleAllocate}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <PackageCheck className="h-4 w-4" />

              Allocate Inventory
            </button>
          )}
      </div>

      {/* ========================================
          Reject Modal
      ======================================== */}

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Reject Requirement
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide a reason for rejecting this
                requirement.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Enter rejection reason..."
                className="mt-4 w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => {
                  setShowReject(false);
                  setRejectionReason("");
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleReject}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading
                  ? "Rejecting..."
                  : "Reject Requirement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementDetails;