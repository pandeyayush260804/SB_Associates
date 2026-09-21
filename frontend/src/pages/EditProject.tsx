import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getProjectById,
  updateProject,
  type Project,
} from "@/services/projectService";

import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    projectCode: "",
    projectType: "SOLAR",
    client: "",
    location: "",
    description: "",
    startDate: "",
    expectedCompletion: "",
    projectManager: "",
    status: "PLANNING",
  });

  // ============================================
  // ROLE PROTECTION
  // ============================================

  if (!can(user?.role, "EDIT_PROJECT")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4 text-4xl">
              ⚠️
            </div>

            <h2 className="text-lg font-semibold">
              Access Restricted
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You are not authorized to edit projects.
              Please contact an administrator.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/projects")}
            >
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // DATE FORMATTER
  // ============================================

  const formatDateForInput = (
    date?: string
  ) => {
    if (!date) return "";

    return new Date(date)
      .toISOString()
      .split("T")[0];
  };

  // ============================================
  // FETCH PROJECT
  // ============================================

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getProjectById(id);

        console.log(
          "PROJECT DETAILS RESPONSE:",
          response
        );

        if (!response?.success || !response?.data) {
          throw new Error(
            response?.message ||
              "Unable to load project."
          );
        }

        const data: Project = response.data;

        setProject(data);

        setFormData({
          name: data.name || "",
          projectCode: data.projectCode || "",
          projectType:
            data.projectType || "SOLAR",
          client: data.client || "",
          location: data.location || "",
          description: data.description || "",
          startDate: formatDateForInput(
            data.startDate
          ),
          expectedCompletion:
            formatDateForInput(
              data.expectedCompletion
            ),
          projectManager:
            data.projectManager?._id || "",
          status:
            data.status || "PLANNING",
        });
      } catch (err: any) {
        console.error(
          "GET PROJECT ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // ============================================
  // HANDLE CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================
  // UPDATE PROJECT
  // ============================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!id) {
      setError("Project ID is missing.");
      return;
    }

    // Required fields according to backend
    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!formData.projectCode.trim()) {
      setError("Project code is required.");
      return;
    }

    if (!formData.client.trim()) {
      setError("Client is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!formData.expectedCompletion) {
      setError(
        "Expected completion date is required."
      );
      return;
    }

    if (!formData.projectManager) {
      setError(
        "Project manager is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await updateProject(
        id,
        {
          name: formData.name.trim(),
          projectCode:
            formData.projectCode.trim(),
          projectType: formData.projectType as
            | "SOLAR"
            | "HYDRO"
            | "DAM"
            | "INFRASTRUCTURE"
            | "OTHER",
          client: formData.client.trim(),
          location: formData.location.trim(),
          description:
            formData.description.trim(),
          startDate: formData.startDate,
          expectedCompletion:
            formData.expectedCompletion,
          projectManager:
            formData.projectManager,
          status: formData.status as
            | "PLANNING"
            | "IN_PROGRESS"
            | "ON_HOLD"
            | "COMPLETED"
            | "CANCELLED",
        }
      );

      console.log(
        "UPDATE PROJECT RESPONSE:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to update project."
        );
      }

      navigate("/projects");
    } catch (err: any) {
      console.error(
        "UPDATE PROJECT ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update project."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading project...
        </p>
      </div>
    );
  }

  // ============================================
  // ERROR / PROJECT NOT FOUND
  // ============================================

  if (!project && error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-lg font-semibold">
              Unable to Load Project
            </h2>

            <p className="mt-2 text-sm text-destructive">
              {error}
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/projects")}
            >
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // FORM
  // ============================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Project
          </h1>

          <p className="text-sm text-muted-foreground">
            Update project information.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Project Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* NAME + CODE */}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name
                </Label>

                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectCode">
                  Project Code
                </Label>

                <Input
                  id="projectCode"
                  name="projectCode"
                  value={formData.projectCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* TYPE + CLIENT */}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="projectType">
                  Project Type
                </Label>

                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                >
                  <option value="SOLAR">
                    Solar
                  </option>

                  <option value="HYDRO">
                    Hydro
                  </option>

                  <option value="DAM">
                    Dam
                  </option>

                  <option value="INFRASTRUCTURE">
                    Infrastructure
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">
                  Client
                </Label>

                <Input
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* LOCATION */}

            <div className="space-y-2">
              <Label htmlFor="location">
                Location
              </Label>

              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
              />
            </div>

            {/* DATES */}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date
                </Label>

                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCompletion">
                  Expected Completion
                </Label>

                <Input
                  id="expectedCompletion"
                  name="expectedCompletion"
                  type="date"
                  value={
                    formData.expectedCompletion
                  }
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* PROJECT MANAGER */}

            <div className="space-y-2">
              <Label htmlFor="projectManager">
                Project Manager
              </Label>

              <select
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                required
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                {project?.projectManager && (
                  <option
                    value={
                      project.projectManager._id
                    }
                  >
                    {project.projectManager.name} —{" "}
                    {project.projectManager.email}
                  </option>
                )}
              </select>

              <p className="text-xs text-muted-foreground">
                The selected user must have the
                PROJECT_MANAGER role.
              </p>
            </div>

            {/* STATUS */}

            <div className="space-y-2">
              <Label htmlFor="status">
                Status
              </Label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="PLANNING">
                  Planning
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="ON_HOLD">
                  On Hold
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate("/projects")
                }
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Updating..."
                  : "Update Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditProject;