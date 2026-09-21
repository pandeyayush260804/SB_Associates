import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  type LoginData,
  type RegisterData,
} from "@/services/authService";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "SUPPLY_MANAGER";
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const restoreUser = async () => {
      try {
        const response = await getCurrentUser();

        console.log("AUTH CONTEXT - CURRENT USER:", response);

        const currentUser = response?.data;

        if (currentUser) {
          setUser(currentUser);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("AUTH CONTEXT - RESTORE USER ERROR:", error);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (data: LoginData): Promise<User> => {
    const response = await loginUser(data);

    console.log("AUTH CONTEXT - LOGIN RESPONSE:", response);

    const loginData = response?.data;

    const token = loginData?.token;
    const loggedInUser = loginData;

    if (!token) {
      throw new Error("Login successful but no token was returned.");
    }

    if (!loggedInUser) {
      throw new Error("Login successful but no user was returned.");
    }

    localStorage.setItem("token", token);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const response = await registerUser(data);

    const registerData = response?.data;

    const token = registerData?.token;
    const registeredUser = registerData;

    if (!token) {
      throw new Error(
        "Registration successful but no token was returned."
      );
    }

    if (!registeredUser) {
      throw new Error(
        "Registration successful but no user was returned."
      );
    }

    localStorage.setItem("token", token);
    setUser(registeredUser);

    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}