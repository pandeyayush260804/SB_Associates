import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  MapPin,
  Building2,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getProjects,
  deleteProject,
  type Project,
} from "@/services/projectService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ============================================
  // FETCH PROJECTS
  // ============================================

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProjects();

      console.log("PROJECTS API RESPONSE:", response);

      if (response?.success) {
        setProjects(response.data || []);
      } else {
        setError(response?.message || "Failed to load projects.");
      }
    } catch (err: any) {
      console.error("GET PROJECTS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ============================================
  // DELETE PROJECT
  // ============================================

  const handleDelete = async (project: Project) => {
    if (!can(user?.role, "DELETE_PROJECT")) {
      setError(
        "Access Restricted: You are not authorized to delete projects."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(project._id);
      setError("");

      const response = await deleteProject(project._id);

      console.log("DELETE PROJECT RESPONSE:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to delete project."
        );
      }

      // Remove deleted project from UI
      setProjects((previousProjects) =>
        previousProjects.filter(
          (item) => item._id !== project._id
        )
      );
    } catch (err: any) {
      console.error("DELETE PROJECT ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete project."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const getStatusVariant = (
    status: Project["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "COMPLETED":
        return "default";

      case "IN_PROGRESS":
        return "secondary";

      case "CANCELLED":
        return "destructive";

      case "ON_HOLD":
      case "PLANNING":
      default:
        return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const formatProjectType = (type: string) => {
    return type.replace(/_/g, " ");
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Projects
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor infrastructure projects.
          </p>
        </div>

        {/* ADMIN ONLY */}
        {can(user?.role, "CREATE_PROJECT") && (
          <Button onClick={() => navigate("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Total Projects
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {projects.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              In Progress
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                projects.filter(
                  (project) =>
                    project.status === "IN_PROGRESS"
                ).length
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Planning
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                projects.filter(
                  (project) =>
                    project.status === "PLANNING"
                ).length
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Completed
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {
                projects.filter(
                  (project) =>
                    project.status === "COMPLETED"
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ERROR */}

      {!loading && error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="flex min-h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading projects...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading && !error && projects.length === 0 && (
        <Card>
          <CardContent className="flex min-h-[250px] items-center justify-center p-6">
            <div className="text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                No projects found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                There are currently no projects available.
              </p>

              {can(user?.role, "CREATE_PROJECT") && (
                <Button
                  className="mt-4"
                  onClick={() =>
                    navigate("/projects/new")
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PROJECT CARDS */}

      {!loading &&
        !error &&
        projects.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {project.name}
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.projectCode}
                      </p>
                    </div>

                    <Badge
                      variant={getStatusVariant(
                        project.status
                      )}
                      className="shrink-0"
                    >
                      {formatStatus(project.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* PROJECT TYPE */}

                  <div className="flex items-center gap-2 text-sm">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />

                    <span>
                      {formatProjectType(
                        project.projectType
                      )}
                    </span>
                  </div>

                  {/* CLIENT */}

                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Client
                      </p>

                      <p className="font-medium">
                        {project.client}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Location
                      </p>

                      <p className="font-medium">
                        {project.location}
                      </p>
                    </div>
                  </div>

                  {/* COMPLETION */}

                  <div className="flex items-start gap-2 text-sm">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Expected Completion
                      </p>

                      <p className="font-medium">
                        {formatDate(
                          project.expectedCompletion
                        )}
                      </p>
                    </div>
                  </div>

                  {/* PROJECT MANAGER */}

                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      Project Manager
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.projectManager?.name ||
                        "Not assigned"}
                    </p>
                  </div>

                  {/* ADMIN ACTIONS */}

                  {can(user?.role, "EDIT_PROJECT") ||
                  can(user?.role, "DELETE_PROJECT") ? (
                    <div className="flex gap-2 border-t pt-3">
                      {can(
                        user?.role,
                        "EDIT_PROJECT"
                      ) && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            navigate(
                              `/projects/${project._id}/edit`
                            )
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}

                      {can(
                        user?.role,
                        "DELETE_PROJECT"
                      ) && (
                        <Button
                          variant="destructive"
                          className="flex-1"
                          disabled={
                            deletingId === project._id
                          }
                          onClick={() =>
                            handleDelete(project)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />

                          {deletingId === project._id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

export default Projects;