import {
  AlertTriangle,
  Boxes,
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

interface SupplyManagerDashboardProps {
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
    normalized === "RECEIVED" ||
    normalized === "DELIVERED" ||
    normalized === "CONFIRMED" ||
    normalized === "FULFILLED"
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
    normalized === "CANCELLED" ||
    normalized === "REJECTED"
  ) {
    return "destructive";
  }

  return "outline";
}

function SupplyManagerDashboard({
  data,
}: SupplyManagerDashboardProps) {
  const overview = data?.overview || {};
  const recent = data?.recent || {};

  const lowStockMaterials =
    data?.lowStockMaterials || [];

  const pendingRequirements =
    data?.pendingRequirements || [];

  const orders = recent.orders || [];
  const dispatches = recent.dispatches || [];

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Supply Operations
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome, {data?.user?.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor inventory, procurement, suppliers and material dispatch operations.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit px-3 py-1 text-xs"
        >
          SUPPLY MANAGER
        </Badge>

      </div>

      {/* PRIMARY STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          title="Materials"
          value={overview.totalMaterials ?? 0}
          description="Materials under inventory"
          icon={Boxes}
        />

        <Stat
          title="Total Stock"
          value={(overview.totalStockUnits ?? 0).toLocaleString("en-IN")}
          description="Units currently available"
          icon={PackageCheck}
        />

        <Stat
          title="Low Stock"
          value={overview.lowStockMaterials ?? 0}
          description="Materials below minimum"
          icon={AlertTriangle}
        />

        <Stat
          title="Suppliers"
          value={overview.totalSuppliers ?? 0}
          description="Active supplier records"
          icon={Users}
        />

      </div>

      {/* OPERATIONS STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          title="Requirements"
          value={overview.fulfilledRequirements ?? 0}
          description="Fulfilled requirements"
          icon={FileCheck2}
        />

        <Stat
          title="Purchase Orders"
          value={overview.receivedOrders ?? 0}
          description="Received purchase orders"
          icon={ShoppingCart}
        />

        <Stat
          title="Dispatches"
          value={overview.confirmedDispatches ?? 0}
          description="Confirmed dispatches"
          icon={Truck}
        />

        <Stat
          title="Inventory Value"
          value={formatCurrency(
            overview.totalInventoryValue
          )}
          description="Current stock valuation"
          icon={IndianRupee}
        />

      </div>

      {/* INVENTORY STATUS */}

      <div className="grid gap-6 lg:grid-cols-3">

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Inventory Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <InventoryRow
              icon={Boxes}
              title="Total Stock"
              description="Available inventory"
              value={(overview.totalStockUnits ?? 0).toLocaleString("en-IN")}
            />

            <InventoryRow
              icon={AlertTriangle}
              title="Low Stock"
              description="Below minimum level"
              value={overview.lowStockMaterials ?? 0}
            />

            <InventoryRow
              icon={AlertTriangle}
              title="Out of Stock"
              description="Immediate procurement"
              value={overview.outOfStockMaterials ?? 0}
            />

            <InventoryRow
              icon={IndianRupee}
              title="Inventory Value"
              description="Current stock value"
              value={formatCurrency(
                overview.totalInventoryValue
              )}
            />

          </CardContent>
        </Card>

        {/* PENDING REQUIREMENTS */}

        <Card className="lg:col-span-2">

          <CardHeader>
            <CardTitle className="text-base">
              Material Requirements
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Requirements requiring supply action.
            </p>
          </CardHeader>

          <CardContent>

            {pendingRequirements.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">

                <p className="text-sm font-medium">
                  No pending requirements
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  All current material requirements are being handled.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {pendingRequirements.map(
                  (requirement: any) => (
                    <div
                      key={requirement._id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >

                      <div>
                        <p className="text-sm font-medium">
                          {requirement.project?.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
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

      {/* LOW STOCK TABLE */}

      <Card>

        <CardHeader>
          <CardTitle className="text-base">
            Inventory Attention
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

                    const isOutOfStock =
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
                              isOutOfStock
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {isOutOfStock
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
              Dispatch Operations
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Latest material movement to project sites.
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

function Stat({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="p-5">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-2xl font-semibold">
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

function InventoryRow({
  icon: Icon,
  title,
  description,
  value,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div>
          <p className="text-sm font-medium">
            {title}
          </p>

          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>

      </div>

      <p className="text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}

export default SupplyManagerDashboard;