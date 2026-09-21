import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

import { createProject } from "@/services/projectService";
import { useAuth } from "@/context/useAuth";
import { can } from "@/utils/permissions";

function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
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
    projectManager: "6aafe04b4ae0c3bea946bf45",
    status: "PLANNING",
  });

  // ============================================
  // ROLE PROTECTION
  // ============================================

  if (!can(user?.role, "CREATE_PROJECT")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4 text-4xl">⚠️</div>

            <h2 className="text-lg font-semibold">
              Access Restricted
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You are not authorized to create a project.
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
  // HANDLE INPUT CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    // Frontend validation
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
      setError("Expected completion date is required.");
      return;
    }

    if (!formData.projectManager) {
      setError("Please select a project manager.");
      return;
    }

    setLoading(true);

    try {
      const response = await createProject({
        name: formData.name.trim(),
        projectCode: formData.projectCode.trim(),
        projectType: formData.projectType as
          | "SOLAR"
          | "HYDRO"
          | "DAM"
          | "INFRASTRUCTURE"
          | "OTHER",
        client: formData.client.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        expectedCompletion: formData.expectedCompletion,
        projectManager: formData.projectManager,
        status: formData.status as
          | "PLANNING"
          | "IN_PROGRESS"
          | "ON_HOLD"
          | "COMPLETED"
          | "CANCELLED",
      });

      console.log("CREATE PROJECT RESPONSE:", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to create project."
        );
      }

      // Successfully created
      navigate("/projects");
    } catch (err: any) {
      console.error("CREATE PROJECT ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ============================================
          HEADER
      ============================================ */}

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
            Create Project
          </h1>

          <p className="text-sm text-muted-foreground">
            Add a new infrastructure project to the system.
          </p>
        </div>
      </div>

      {/* ============================================
          FORM CARD
      ============================================ */}

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* ========================================
                NAME + CODE
            ======================================== */}

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
                  placeholder="Rajasthan Solar Power Project"
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
                  placeholder="SOL-002"
                  required
                />
              </div>
            </div>

            {/* ========================================
                TYPE + CLIENT
            ======================================== */}

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
                  placeholder="Client company name"
                  required
                />
              </div>
            </div>

            {/* ========================================
                LOCATION
            ======================================== */}

            <div className="space-y-2">
              <Label htmlFor="location">
                Location
              </Label>

              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Rajasthan"
                required
              />
            </div>

            {/* ========================================
                DESCRIPTION
            ======================================== */}

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Project description..."
                rows={4}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
              />
            </div>

            {/* ========================================
                DATES
            ======================================== */}

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
                  value={formData.expectedCompletion}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* ========================================
                PROJECT MANAGER
            ======================================== */}

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
                <option value="6aafe04b4ae0c3bea946bf45">
                  Project Manager — pm@shreebalaji.com
                </option>
              </select>

              <p className="text-xs text-muted-foreground">
                The selected user must have the PROJECT_MANAGER role.
              </p>
            </div>

            {/* ========================================
                STATUS
            ======================================== */}

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

            {/* ========================================
                ERROR
            ======================================== */}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* ========================================
                ACTIONS
            ======================================== */}

            <div className="flex justify-end gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateProject;