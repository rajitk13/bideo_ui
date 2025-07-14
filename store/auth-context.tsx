"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect, RedirectType } from "next/navigation";
import { getUser } from "@/utility/getRequests";
import { toast } from "sonner";
import Cookies from "js-cookie";

export interface User {
  userId: string;
  user_email: string;
  user_name: string;
  avatar_url: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, uid: string) => void;
  logout: () => void;
  user?: User;
  setUserInfo: (data: User) => void;
  uid: string | null;
  fetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<User | undefined>(undefined);

  // Restore token and uid from localStorage on initial mount
  useEffect(() => {
    const storedToken = Cookies.get("token");
    const storedUid = Cookies.get("uid");

    if (storedToken) setToken(storedToken);
    if (storedUid) setUid(storedUid);
  }, []);

  // Fetch user once token and uid are ready
  useEffect(() => {
    fetchUser();
  }, [uid]);

  const fetchUser = async () => {
    if (uid && !user) {
      try {
        const res = await getUser(uid);
        setUserInfo(res);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
  };

  const login = (token: string, uid: string) => {
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("uid", uid, { expires: 7 });
    setUid(uid);
    setToken(token);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("uid");
    setToken(null);
    setUid(null);
    setUser(undefined);
    toast.success("Logged out successfully!");
    redirect("/auth/login", RedirectType.replace);
  };

  const setUserInfo = (data: User) => {
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        user,
        setUserInfo,
        uid,
        fetchUser,
      }}
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
