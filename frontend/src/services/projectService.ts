import api from "./api";

export interface Project {
  _id: string;
  name: string;
  projectCode: string;
  projectType:
    | "SOLAR"
    | "HYDRO"
    | "DAM"
    | "INFRASTRUCTURE"
    | "OTHER";
  client: string;
  location: string;
  description?: string;
  startDate?: string;
  expectedCompletion?: string;
  projectManager?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  status:
    | "PLANNING"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "COMPLETED"
    | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectData {
  name: string;
  projectCode: string;
  projectType:
    | "SOLAR"
    | "HYDRO"
    | "DAM"
    | "INFRASTRUCTURE"
    | "OTHER";
  client: string;
  location: string;
  description?: string;
  startDate?: string;
  expectedCompletion?: string;
  projectManager?: string;
  status?:
    | "PLANNING"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "COMPLETED"
    | "CANCELLED";
}

/* =========================================
   GET ALL PROJECTS
========================================= */

export const getProjects = async () => {
  const response = await api.get("/projects");

  return response.data;
};

/* =========================================
   GET PROJECT BY ID
========================================= */

export const getProjectById = async (
  projectId: string
) => {
  const response = await api.get(
    `/projects/${projectId}`
  );

  return response.data;
};

/* =========================================
   CREATE PROJECT
========================================= */

export const createProject = async (
  data: CreateProjectData
) => {
  const response = await api.post(
    "/projects",
    data
  );

  return response.data;
};

/* =========================================
   UPDATE PROJECT
========================================= */

export const updateProject = async (
  projectId: string,
  data: Partial<CreateProjectData>
) => {
  const response = await api.put(
    `/projects/${projectId}`,
    data
  );

  return response.data;
};

/* =========================================
   DELETE PROJECT
========================================= */

export const deleteProject = async (
  projectId: string
) => {
  const response = await api.delete(
    `/projects/${projectId}`
  );

  return response.data;
};