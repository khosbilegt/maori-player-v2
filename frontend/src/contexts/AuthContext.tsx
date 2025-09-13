import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiClient } from "../utils/apiClient";

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (
    email: string,
    username: string,
    password?: string
  ) => Promise<void>;
  checkProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("trying to login");
      console.log(JSON.stringify({ email, password }));
      const data: AuthResponse = await apiClient.login(email, password);

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ): Promise<void> => {
    try {
      const data: AuthResponse = await apiClient.register(
        email,
        username,
        password
      );

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const updateProfile = async (
    email: string,
    username: string,
    password?: string
  ): Promise<void> => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const updatedUser: User = await apiClient.updateProfile(
        token,
        email,
        username,
        password
      );
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const checkProfile = async (): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      const { user: profileUser, isAuthenticated: isValid } =
        await apiClient.checkProfile(token);

      if (!isValid) {
        console.log(
          "Profile check failed - user not authenticated, logging out"
        );
        logout();
      } else if (profileUser) {
        // Update user data if profile is valid
        setUser(profileUser);
        localStorage.setItem("auth_user", JSON.stringify(profileUser));
      }
    } catch (error) {
      console.error("Profile check failed:", error);
      // Only logout on 401 errors, not on network errors
      if ((error as any)?.status === 401) {
        console.log("401 error during profile check - logging out");
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
