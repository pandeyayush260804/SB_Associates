import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/useAuth";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // While checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading portal...
        </p>
      </div>
    );
  }

  // If not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;