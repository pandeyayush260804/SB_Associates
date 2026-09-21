import { useEffect, useState } from "react";

import { useAuth } from "@/context/useAuth";
import { getDashboard } from "@/services/dashboardService";

import AdminDashboard from "./AdminDashboard";
import ProjectManagerDashboard from "./ProjectManagerDashboard";
import SupplyManagerDashboard from "./SupplyManagerDashboard";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  [key: string]: any;
}

function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard();

        console.log("DASHBOARD API RESPONSE:", response);

        setDashboard(response.data);
      } catch (error: any) {
        console.error("Dashboard error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

          <p className="text-sm font-medium">
            Loading dashboard...
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Fetching project and supply information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/5 p-5">
        <p className="text-sm font-semibold text-destructive">
          Unable to load dashboard
        </p>

        <p className="mt-1 text-xs text-destructive/80">
          {error}
        </p>
      </div>
    );
  }

  if (!user || !dashboard) {
    return null;
  }

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard data={dashboard} />;

    case "PROJECT_MANAGER":
      return <ProjectManagerDashboard data={dashboard} />;

    case "SUPPLY_MANAGER":
      return <SupplyManagerDashboard data={dashboard} />;

    default:
      return (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-5">
          <p className="text-sm font-semibold text-destructive">
            Invalid user role
          </p>

          <p className="mt-1 text-xs text-destructive/80">
            Your account does not have a valid dashboard role.
          </p>
        </div>
      );
  }
}

export default Dashboard;