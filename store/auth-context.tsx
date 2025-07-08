"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    thumbnail_url?: string;
    role?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 7 });
    setToken(token);
  };

  const logout = () => {
    Cookies.remove("token");
    setToken(null);
    toast.success("Logged out successfully!");
  };

  const user = {
    id: "12345", // Replace with actual user ID
    name: "John Doe", // Replace with actual user name
    email: " ",
    thumbnail_url: "https://example.com/avatar.jpg",
    role: "User",
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, login, logout, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
