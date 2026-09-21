import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  FileCheck2,
  IndianRupee,
  PackageCheck,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface AdminDashboardProps {
  data: any;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatStatus(status?: string) {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusVariant(
  status?: string
): "default" | "secondary" | "destructive" | "outline" {
  const normalized = status?.toUpperCase();

  if (
    normalized === "FULFILLED" ||
    normalized === "RECEIVED" ||
    normalized === "DELIVERED" ||
    normalized === "CONFIRMED" ||
    normalized === "COMPLETED"
  ) {
    return "default";
  }

  if (
    normalized === "PENDING" ||
    normalized === "PROCESSING" ||
    normalized === "PLACED" ||
    normalized === "IN_TRANSIT"
  ) {
    return "secondary";
  }

  if (
    normalized === "REJECTED" ||
    normalized === "CANCELLED"
  ) {
    return "destructive";
  }

  return "outline";
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard({
  data,
}: AdminDashboardProps) {
  const overview = data?.overview || {};
  const recent = data?.recent || {};

  const projects = recent.projects || [];
  const requirements = recent.requirements || [];
  const orders = recent.orders || [];
  const dispatches = recent.dispatches || [];

  const lowStockMaterials =
    data?.lowStockMaterials || [];

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome, {data?.user?.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Company-wide overview of projects, inventory and supply operations.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit px-3 py-1 text-xs"
        >
          ADMIN
        </Badge>
      </div>

      {/* PRIMARY STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Projects"
          value={overview.totalProjects ?? 0}
          description="Projects under management"
          icon={ClipboardList}
        />

        <StatCard
          title="Materials"
          value={overview.totalMaterials ?? 0}
          description="Materials in inventory"
          icon={Boxes}
        />

        <StatCard
          title="Low Stock"
          value={overview.lowStockMaterials ?? 0}
          description="Materials needing attention"
          icon={AlertTriangle}
        />

        <StatCard
          title="Suppliers"
          value={overview.totalSuppliers ?? 0}
          description="Registered suppliers"
          icon={Users}
        />

      </div>

      {/* OPERATIONS STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Requirements"
          value={overview.fulfilledRequirements ?? 0}
          description="Fulfilled requirements"
          icon={FileCheck2}
        />

        <StatCard
          title="Purchase Orders"
          value={overview.receivedOrders ?? 0}
          description="Received purchase orders"
          icon={ShoppingCart}
        />

        <StatCard
          title="Dispatches"
          value={overview.confirmedDispatches ?? 0}
          description="Confirmed dispatches"
          icon={Truck}
        />

        <StatCard
          title="Inventory Value"
          value={formatCurrency(
            overview.totalInventoryValue
          )}
          description="Current stock valuation"
          icon={IndianRupee}
        />

      </div>

      {/* INVENTORY + REQUIREMENTS */}

      <div className="grid gap-6 lg:grid-cols-3">

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Inventory Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <Boxes className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Total Stock
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Units currently available
                  </p>
                </div>
              </div>

              <p className="text-lg font-semibold">
                {(overview.totalStockUnits ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-yellow-100">
                  <AlertTriangle className="h-4 w-4 text-yellow-700" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Low Stock
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Below minimum level
                  </p>
                </div>
              </div>

              <p className="text-lg font-semibold">
                {overview.lowStockMaterials ?? 0}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-100">
                  <PackageCheck className="h-4 w-4 text-green-700" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Inventory Value
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Current stock value
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold">
                {formatCurrency(
                  overview.totalInventoryValue
                )}
              </p>
            </div>

          </CardContent>
        </Card>

        <Card className="lg:col-span-2">

          <CardHeader>
            <CardTitle className="text-base">
              Recent Requirements
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Latest material requirements across projects.
            </p>
          </CardHeader>

          <CardContent>

            {requirements.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No requirements available.
              </div>
            ) : (
              <div className="space-y-3">
                {requirements.map(
                  (requirement: any) => (
                    <div
                      key={requirement._id}
                      className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {requirement.project?.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {requirement.project?.projectCode}
                          {" • "}
                          {formatStatus(
                            requirement.priority
                          )}
                        </p>
                      </div>

                      <Badge
                        variant={getStatusVariant(
                          requirement.status
                        )}
                        className="text-[10px]"
                      >
                        {formatStatus(
                          requirement.status
                        )}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}

          </CardContent>
        </Card>

      </div>

      {/* LOW STOCK */}

      <Card>

        <CardHeader>
          <CardTitle className="text-base">
            Low Stock Materials
          </CardTitle>

          <p className="text-xs text-muted-foreground">
            Materials requiring procurement attention.
          </p>
        </CardHeader>

        <CardContent>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                    Material
                  </th>

                  <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                    SKU
                  </th>

                  <th className="pb-3 pr-4 text-right text-xs font-medium text-muted-foreground">
                    Current
                  </th>

                  <th className="pb-3 pr-4 text-right text-xs font-medium text-muted-foreground">
                    Minimum
                  </th>

                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {lowStockMaterials.map(
                  (material: any) => {

                    const outOfStock =
                      material.currentStock <= 0;

                    return (
                      <tr
                        key={material._id}
                        className="border-b last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {material.name}
                        </td>

                        <td className="py-3 pr-4 text-muted-foreground">
                          {material.sku}
                        </td>

                        <td className="py-3 pr-4 text-right">
                          {material.currentStock.toLocaleString(
                            "en-IN"
                          )}{" "}
                          {material.unit}
                        </td>

                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {material.minimumStock.toLocaleString(
                            "en-IN"
                          )}{" "}
                          {material.unit}
                        </td>

                        <td className="py-3 text-right">
                          <Badge
                            variant={
                              outOfStock
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {outOfStock
                              ? "OUT OF STOCK"
                              : "LOW STOCK"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>

            </table>

          </div>

        </CardContent>
      </Card>

      {/* ORDERS + DISPATCHES */}

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Recent Purchase Orders
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Latest supplier procurement activity.
            </p>
          </CardHeader>

          <CardContent>

            {orders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No purchase orders available.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.supplier?.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </p>

                      <Badge
                        variant={getStatusVariant(
                          order.status
                        )}
                        className="mt-1 text-[10px]"
                      >
                        {formatStatus(
                          order.status
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Recent Dispatches
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Latest project material dispatches.
            </p>
          </CardHeader>

          <CardContent>

            {dispatches.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No dispatches available.
              </div>
            ) : (
              <div className="space-y-3">
                {dispatches.map(
                  (dispatch: any) => (
                    <div
                      key={dispatch._id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {dispatch.dispatchNumber}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {dispatch.project?.name}
                        </p>
                      </div>

                      <Badge
                        variant={getStatusVariant(
                          dispatch.status
                        )}
                        className="text-[10px]"
                      >
                        {formatStatus(
                          dispatch.status
                        )}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}

          </CardContent>
        </Card>

      </div>

    </div>
  );
}

export default AdminDashboard;