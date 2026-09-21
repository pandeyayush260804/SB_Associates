import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/dashboard/Dashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";

import Projects from "@/pages/Projects";
import CreateProject from "@/pages/CreateProject";
import EditProject from "@/pages/EditProject";

import Materials from "@/pages/Materials";
import CreateMaterial from "@/pages/CreateMaterial";
import EditMaterial from "@/pages/EditMaterial";

import Requirements from "@/pages/Requirements";
import CreateRequirement from "@/pages/CreateRequirement";
import RequirementDetails from "@/pages/RequirementDetails";

import Suppliers from "@/pages/Suppliers";
import CreateSupplier from "@/pages/CreateSupplier";
import EditSupplier from "@/pages/EditSupplier";
import SupplierDetails from "@/pages/SupplierDetails";

import Orders from "@/pages/Orders";
import CreateOrder from "@/pages/CreateOrder";
import OrderDetails from "@/pages/OrderDetails";
import ReceiveOrder from "@/pages/ReceiveOrder";

import Dispatches from "@/pages/Dispatches";
import CreateDispatch from "@/pages/CreateDispatch";
import DispatchDetails from "@/pages/DispatchDetails";
import ConfirmDelivery from "@/pages/ConfirmDelivery";

import Users from "@/pages/Users";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* ========================= */}
        {/* PROJECTS */}
        {/* ========================= */}

        <Route
          path="/projects"
          element={
            <DashboardLayout>
              <Projects />
            </DashboardLayout>
          }
        />

        <Route
          path="/projects/new"
          element={
            <DashboardLayout>
              <CreateProject />
            </DashboardLayout>
          }
        />

        <Route
          path="/projects/:id/edit"
          element={
            <DashboardLayout>
              <EditProject />
            </DashboardLayout>
          }
        />

        {/* ========================= */}
        {/* MATERIALS */}
        {/* ========================= */}

        <Route
          path="/materials"
          element={
            <DashboardLayout>
              <Materials />
            </DashboardLayout>
          }
        />

        <Route
          path="/materials/new"
          element={
            <DashboardLayout>
              <CreateMaterial />
            </DashboardLayout>
          }
        />

        <Route
          path="/materials/:id/edit"
          element={
            <DashboardLayout>
              <EditMaterial />
            </DashboardLayout>
          }
        />

        {/* ========================= */}
        {/* REQUIREMENTS */}
        {/* ========================= */}

        <Route
          path="/requirements"
          element={
            <DashboardLayout>
              <Requirements />
            </DashboardLayout>
          }
        />

        <Route
          path="/requirements/new"
          element={
            <DashboardLayout>
              <CreateRequirement />
            </DashboardLayout>
          }
        />

        <Route
          path="/requirements/:id"
          element={
            <DashboardLayout>
              <RequirementDetails />
            </DashboardLayout>
          }
        />

        {/* ========================= */}
        {/* SUPPLIERS */}
        {/* ========================= */}

        <Route
          path="/suppliers"
          element={
            <DashboardLayout>
              <Suppliers />
            </DashboardLayout>
          }
        />

        <Route
          path="/suppliers/new"
          element={
            <DashboardLayout>
              <CreateSupplier />
            </DashboardLayout>
          }
        />

        <Route
          path="/suppliers/:id"
          element={
            <DashboardLayout>
              <SupplierDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/suppliers/:id/edit"
          element={
            <DashboardLayout>
              <EditSupplier />
            </DashboardLayout>
          }
        />
        <Route
        path="/dispatches"
        element={
            <DashboardLayout>
            <Dispatches />
            </DashboardLayout>
        }
        />

        <Route
        path="/dispatches/new"
        element={
            <DashboardLayout>
            <CreateDispatch />
            </DashboardLayout>
        }
        />

        <Route
        path="/dispatches/:id"
        element={
            <DashboardLayout>
            <DispatchDetails />
            </DashboardLayout>
        }
        />

        <Route
        path="/dispatches/:id/confirm"
        element={
            <DashboardLayout>
            <ConfirmDelivery />
            </DashboardLayout>
        }
        />
        {/* ========================= */}
        {/* PURCHASE ORDERS */}
        {/* ========================= */}

        <Route
          path="/orders"
          element={
            <DashboardLayout>
              <Orders />
            </DashboardLayout>
          }
        />

        <Route
          path="/orders/new"
          element={
            <DashboardLayout>
              <CreateOrder />
            </DashboardLayout>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <DashboardLayout>
              <OrderDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/orders/:id/receive"
          element={
            <DashboardLayout>
              <ReceiveOrder />
            </DashboardLayout>
          }
        />
        <Route
        path="/users"
        element={
            <DashboardLayout>
            <Users />
            </DashboardLayout>
        }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;