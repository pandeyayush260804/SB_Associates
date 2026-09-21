import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

interface ProjectManagerDashboardProps {
  data: any;
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
    normalized === "DELIVERED" ||
    normalized === "CONFIRMED" ||
    normalized === "COMPLETED"
  ) {
    return "default";
  }

  if (
    normalized === "PENDING" ||
    normalized === "PROCESSING" ||
    normalized === "PARTIALLY_FULFILLED" ||
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

function ProjectManagerDashboard({
  data,
}: ProjectManagerDashboardProps) {
  const overview = data?.overview || {};
  const projects = data?.myProjects || [];
  const recent = data?.recent || {};

  const requirements = recent.requirements || [];
  const dispatches = recent.dispatches || [];

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Project Management
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Welcome, {data?.user?.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track your assigned projects, material requirements and site deliveries.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit px-3 py-1 text-xs"
        >
          PROJECT MANAGER
        </Badge>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Stat
          title="Assigned Projects"
          value={overview.totalProjects ?? 0}
          description="Projects under your responsibility"
          icon={ClipboardList}
        />

        <Stat
          title="Requirements"
          value={overview.fulfilledRequirements ?? 0}
          description="Fulfilled material requirements"
          icon={PackageCheck}
        />

        <Stat
          title="Pending Requirements"
          value={overview.pendingRequirements ?? 0}
          description="Awaiting fulfillment"
          icon={AlertCircle}
        />

        <Stat
          title="Confirmed Dispatches"
          value={overview.confirmedDispatches ?? 0}
          description="Successfully delivered"
          icon={Truck}
        />

      </div>

      {/* ASSIGNED PROJECTS */}

      <Card>

        <CardHeader>
          <CardTitle className="text-base">
            Assigned Projects
          </CardTitle>

          <p className="text-xs text-muted-foreground">
            Projects currently assigned to you.
          </p>
        </CardHeader>

        <CardContent>

          {projects.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="text-sm font-medium">
                No projects assigned
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                There are currently no projects assigned to your account.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {projects.map((project: any) => (
                <div
                  key={project._id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-sm font-semibold">
                        {project.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.projectCode}
                      </p>
                    </div>

                    <Badge
                      variant={getStatusVariant(
                        project.status
                      )}
                      className="text-[10px]"
                    >
                      {formatStatus(
                        project.status
                      )}
                    </Badge>

                  </div>

                  <div className="mt-4 space-y-2">

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ClipboardList className="h-3.5 w-3.5" />
                      {project.client}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.location}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Completion:{" "}
                      {new Date(
                        project.expectedCompletion
                      ).toLocaleDateString("en-IN")}
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </CardContent>
      </Card>

      {/* REQUIREMENTS + DISPATCHES */}

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Material Requirements
            </CardTitle>
          </CardHeader>

          <CardContent>

            {requirements.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No material requirements found.
              </div>
            ) : (
              <div className="space-y-3">

                {requirements.map(
                  (requirement: any) => (
                    <div
                      key={requirement._id}
                      className="border-b pb-3 last:border-0 last:pb-0"
                    >

                      <div className="flex items-center justify-between gap-3">

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

                      <div className="mt-3 space-y-1">
                        {requirement.items?.map(
                          (item: any) => (
                            <div
                              key={item._id}
                              className="flex justify-between text-xs"
                            >
                              <span className="text-muted-foreground">
                                {item.material?.name}
                              </span>

                              <span className="font-medium">
                                {item.allocatedQuantity.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                {item.material?.unit}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </CardContent>
        </Card>

        <Card>

          <CardHeader>
            <CardTitle className="text-base">
              Material Deliveries
            </CardTitle>
          </CardHeader>

          <CardContent>

            {dispatches.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No dispatches found.
              </div>
            ) : (
              <div className="space-y-3">

                {dispatches.map(
                  (dispatch: any) => (
                    <div
                      key={dispatch._id}
                      className="border-b pb-3 last:border-0 last:pb-0"
                    >

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-sm font-medium">
                            {dispatch.dispatchNumber}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {dispatch.vehicleNumber}
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

                      <div className="mt-3 space-y-1">
                        {dispatch.items?.map(
                          (item: any) => (
                            <div
                              key={item._id}
                              className="flex justify-between text-xs"
                            >
                              <span className="text-muted-foreground">
                                {item.material?.name}
                              </span>

                              <span className="font-medium">
                                {item.receivedQuantity.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                {item.material?.unit}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </CardContent>
        </Card>

      </div>

      {/* SUMMARY */}

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-5">

          <div className="grid gap-5 sm:grid-cols-3">

            <Summary
              icon={CheckCircle2}
              value={overview.fulfilledRequirements ?? 0}
              label="Fulfilled requirements"
            />

            <Summary
              icon={Truck}
              value={
                (overview.readyDispatches ?? 0) +
                (overview.dispatchedDispatches ?? 0) +
                (overview.inTransitDispatches ?? 0)
              }
              label="Active dispatches"
            />

            <Summary
              icon={PackageCheck}
              value={overview.confirmedDispatches ?? 0}
              label="Confirmed deliveries"
            />

          </div>

        </CardContent>
      </Card>

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
  value: number;
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

function Summary({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div>
        <p className="text-lg font-semibold">
          {value}
        </p>

        <p className="text-xs text-muted-foreground">
          {label}
        </p>
      </div>

    </div>
  );
}

export default ProjectManagerDashboard;