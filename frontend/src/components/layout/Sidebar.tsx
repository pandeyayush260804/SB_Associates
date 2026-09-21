import {
  Boxes,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PackageCheck,
  Settings,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/context/useAuth";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: Boxes,
  },
  {
    label: "Materials",
    path: "/materials",
    icon: Warehouse,
  },
  {
    label: "Requirements",
    path: "/requirements",
    icon: ClipboardList,
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: Users,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: FileText,
  },
  {
    label: "Dispatches",
    path: "/dispatches",
    icon: Truck,
  },
];

function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <PackageCheck className="h-5 w-5" />
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight">
              S.B.A.
            </div>

            <div className="text-[9px] font-medium tracking-wider text-sidebar-foreground/50">
              PROJECT PORTAL
            </div>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Operations
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Admin only */}
          {user?.role === "ADMIN" && (
            <>
              <div className="my-5 border-t border-sidebar-border" />

              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Administration
              </p>

              <NavLink
                to="/users"
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  ].join(" ")
                }
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  ].join(" ")
                }
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-md bg-sidebar-accent/50 px-3 py-2.5">
          <p className="truncate text-xs font-medium">
            {user?.name}
          </p>

          <p className="mt-0.5 text-[10px] text-sidebar-foreground/50">
            {user?.role?.replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;