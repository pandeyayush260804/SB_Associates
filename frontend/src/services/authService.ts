import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "PROJECT_MANAGER" | "SUPPLY_MANAGER";
}

// LOGIN
export const loginUser = async (data: LoginData) => {
  console.log("=================================");
  console.log("AUTH SERVICE - LOGIN REQUEST");
  console.log("Email:", data.email);
  console.log("Password length:", data.password.length);
  console.log("=================================");

  const response = await api.post("/auth/login", data);

  console.log("AUTH SERVICE - LOGIN RESPONSE:", response);
  console.log("AUTH SERVICE - RESPONSE DATA:", response.data);

  return response.data;
};

// REGISTER
export const registerUser = async (data: RegisterData) => {
  console.log("AUTH SERVICE - REGISTER REQUEST:", {
    name: data.name,
    email: data.email,
    role: data.role,
  });

  const response = await api.post("/auth/register", data);

  console.log("AUTH SERVICE - REGISTER RESPONSE:", response.data);

  return response.data;
};

// CURRENT USER
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  console.log("AUTH SERVICE - CURRENT USER:", response.data);

  return response.data;
};