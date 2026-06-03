import React, { createContext, useContext, useState, useEffect } from "react";
import { adminService, AdminProfile } from "../utils/adminService";

export interface AuthContextType {
  isAuthenticated: boolean;
  currentAdmin: AdminProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for persistent login session
    const storedAuth = localStorage.getItem("at_is_authenticated");
    if (storedAuth === "true") {
      const storedProfile = adminService.getAdminProfile();
      setIsAuthenticated(true);
      setCurrentAdmin(storedProfile);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulating call to server
    await new Promise((resolve) => setTimeout(resolve, 800));

    const activeProfile = adminService.getAdminProfile();

    // Support multiple simple dummy emails for easy testing
    const emailMatches =
      email.toLowerCase().trim() === activeProfile.email.toLowerCase().trim() ||
      email.toLowerCase().trim() === "admin@bagzone.com" ||
      email.toLowerCase().trim() === "admin@admin.com" ||
      email.toLowerCase().trim() === "admin@gmail.com" ||
      email.toLowerCase().trim() === "admin";

    // Standard high-security or super easy password check
    const passwordMatches = password === "admin123" || password === "admin";

    if (emailMatches && passwordMatches) {
      localStorage.setItem("at_is_authenticated", "true");
      setIsAuthenticated(true);
      setCurrentAdmin(activeProfile);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem("at_is_authenticated");
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
