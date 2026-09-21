import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  PackageCheck,
  Search,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  approveRequirement,
  allocateRequirement,
  getRequirements,
  rejectRequirement,
  type Requirement,
  type RequirementPriority,
  type RequirementStatus,
} from "@/services/requirementService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

const Requirements = () => {
  const { user } = useAuth();

  const [requirements, setRequirements] = useState<
    Requirement[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");

  const [rejectTarget, setRejectTarget] =
    useState<Requirement | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  // ============================================
  // Load Requirements
  // ============================================

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRequirements({
        status: status
          ? (status as RequirementStatus)
          : undefined,

        priority: priority
          ? (priority as RequirementPriority)
          : undefined,
      });

      setRequirements(response.data || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load requirements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [status, priority]);

  // ============================================
  // Search
  // ============================================

  const filteredRequirements = requirements.filter(
    (requirement) => {
      if (!search.trim()) {
        return true;
      }

      const value = search.toLowerCase();

      return (
        requirement.project?.name
          ?.toLowerCase()
          .includes(value) ||
        requirement.project?.projectCode
          ?.toLowerCase()
          .includes(value) ||
        requirement.requestedBy?.name
          ?.toLowerCase()
          .includes(value)
      );
    }
  );

  // ============================================
  // Approve
  // ============================================

  const handleApprove = async (
    requirementId: string
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await approveRequirement(requirementId);

      await loadRequirements();
    } catch (err: any) {
      console.error(err);

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
    if (!rejectTarget) {
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
        rejectTarget._id,
        rejectionReason.trim()
      );

      setRejectTarget(null);
      setRejectionReason("");

      await loadRequirements();
    } catch (err: any) {
      console.error(err);

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

  const handleAllocate = async (
    requirementId: string
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await allocateRequirement(requirementId);

      await loadRequirements();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to allocate inventory."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Status Classes
  // ============================================

  const getStatusClass = (
    value: RequirementStatus
  ) => {
    switch (value) {
      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "APPROVED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "PROCESSING":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "PARTIALLY_FULFILLED":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "FULFILLED":
        return "border-green-200 bg-green-50 text-green-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  // ============================================
  // Priority Classes
  // ============================================

  const getPriorityClass = (
    value: RequirementPriority
  ) => {
    switch (value) {
      case "URGENT":
        return "text-red-700 bg-red-50";

      case "HIGH":
        return "text-orange-700 bg-orange-50";

      case "MEDIUM":
        return "text-amber-700 bg-amber-50";

      case "LOW":
        return "text-slate-600 bg-slate-100";

      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================
          Header
      ======================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-amber-600" />

            <h1 className="text-2xl font-semibold text-slate-900">
              Material Requirements
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage project material requirements and
            inventory allocation.
          </p>
        </div>

        {can(
          user?.role,
          "CREATE_REQUIREMENT"
        ) && (
          <Link
            to="/requirements/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
          >
            <ClipboardList className="h-4 w-4" />

            New Requirement
          </Link>
        )}
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
          Filters
      ======================================== */}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search project or requester..."
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="">All Statuses</option>

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="PROCESSING">
              Processing
            </option>

            <option value="PARTIALLY_FULFILLED">
              Partially Fulfilled
            </option>

            <option value="FULFILLED">
              Fulfilled
            </option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="">All Priorities</option>

            <option value="LOW">Low</option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">High</option>

            <option value="URGENT">
              Urgent
            </option>
          </select>
        </div>
      </div>

      {/* ========================================
          Requirements Table
      ======================================== */}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Project
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Requested By
                </th>

                <th className="px-5 py-3 text-left font-semibold text-slate-600">
                  Materials
                </th>

                <th className="px-5 py-3 text-center font-semibold text-slate-600">
                  Priority
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
              {/* Loading */}
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading requirements...
                  </td>
                </tr>
              ) : filteredRequirements.length === 0 ? (
                /* Empty */
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No requirements found.
                  </td>
                </tr>
              ) : (
                /* Data */
                filteredRequirements.map(
                  (requirement) => (
                    <tr
                      key={requirement._id}
                      className="hover:bg-slate-50"
                    >
                      {/* Project */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {requirement.project?.name ||
                            "Project unavailable"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {requirement.project
                            ?.projectCode || "—"}
                        </div>
                      </td>

                      {/* Requested By */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {requirement.requestedBy
                            ?.name ||
                            "Requester unavailable"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {requirement.requestedBy
                            ?.role || "—"}
                        </div>
                      </td>

                      {/* Materials */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {requirement.items.map(
                            (item) => {
                              const material =
                                item.material;

                              return (
                                <div
                                  key={item._id}
                                  className="text-xs text-slate-700"
                                >
                                  {material ? (
                                    <>
                                      {material.name}

                                      <span className="text-slate-400">
                                        {" "}
                                        ×{" "}
                                        {item.requiredQuantity.toLocaleString(
                                          "en-IN"
                                        )}{" "}
                                        {material.unit}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-medium text-red-600">
                                        Material unavailable
                                      </span>

                                      <span className="text-slate-400">
                                        {" "}
                                        ×{" "}
                                        {item.requiredQuantity.toLocaleString(
                                          "en-IN"
                                        )}
                                      </span>
                                    </>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                            requirement.priority
                          )}`}
                        >
                          {requirement.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            requirement.status
                          )}`}
                        >
                          {requirement.status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          {/* View */}
                          <Link
                            to={`/requirements/${requirement._id}`}
                            title="View"
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Approve */}
                          {requirement.status ===
                            "PENDING" &&
                            can(
                              user?.role,
                              "APPROVE_REQUIREMENT"
                            ) && (
                              <button
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleApprove(
                                    requirement._id
                                  )
                                }
                                title="Approve"
                                className="rounded-md p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}

                          {/* Reject */}
                          {requirement.status ===
                            "PENDING" &&
                            can(
                              user?.role,
                              "REJECT_REQUIREMENT"
                            ) && (
                              <button
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  setRejectTarget(
                                    requirement
                                  )
                                }
                                title="Reject"
                                className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}

                          {/* Allocate */}
                          {(requirement.status ===
                            "APPROVED" ||
                            requirement.status ===
                              "PROCESSING") &&
                            can(
                              user?.role,
                              "ALLOCATE_REQUIREMENT"
                            ) && (
                              <button
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleAllocate(
                                    requirement._id
                                  )
                                }
                                title="Allocate Inventory"
                                className="rounded-md p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                              >
                                <PackageCheck className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================
          Reject Modal
      ======================================== */}

      {rejectTarget && (
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
                  setRejectTarget(null);
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

export default Requirements;