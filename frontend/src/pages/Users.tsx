import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";

import api from "@/services/api";
import { useAuth } from "@/context/useAuth";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "SUPPLY_MANAGER";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const roleLabels: Record<User["role"], string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  SUPPLY_MANAGER: "Supply Manager",
};

const roleClasses: Record<User["role"], string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  PROJECT_MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
  SUPPLY_MANAGER: "bg-amber-50 text-amber-700 border-amber-200",
};

function Users() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    User["role"] | "ALL"
  >("ALL");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/users");

      setUsers(response.data?.data || []);
    } catch (err: any) {
      console.error("Get users error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.email.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" ||
        item.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.isActive) ||
        (statusFilter === "INACTIVE" && !item.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((item) => item.isActive).length,
      inactive: users.filter(
        (item) => !item.isActive
      ).length,
      admins: users.filter(
        (item) => item.role === "ADMIN"
      ).length,
    };
  }, [users]);

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-amber-600" />

          <h1 className="text-2xl font-semibold text-slate-900">
            Users
          </h1>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          View and manage users registered in the project
          management system.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total Users"
          value={summary.total}
          icon={<UsersIcon className="h-5 w-5" />}
        />

        <SummaryCard
          label="Active Users"
          value={summary.active}
          icon={<UserCheck className="h-5 w-5" />}
        />

        <SummaryCard
          label="Inactive Users"
          value={summary.inactive}
          icon={<UserX className="h-5 w-5" />}
        />

        <SummaryCard
          label="Administrators"
          value={summary.admins}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name or email..."
              className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value as
                  | User["role"]
                  | "ALL"
              )
            }
            className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">
              Project Manager
            </option>
            <option value="SUPPLY_MANAGER">
              Supply Manager
            </option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "ALL"
                  | "ACTIVE"
                  | "INACTIVE"
              )
            }
            className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    User
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Role
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                          {item.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          roleClasses[item.role]
                        }`}
                      >
                        {roleLabels[item.role]}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result count */}
      {!loading && (
        <div className="text-xs text-slate-500">
          Showing {filteredUsers.length} of{" "}
          {users.length} users
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className="text-slate-400">{icon}</div>
      </div>

      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default Users;