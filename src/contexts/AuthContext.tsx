"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from "react";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  date_of_birth?: string | null;
  gender?: string | null;
  created_at: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function saveTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async (): Promise<void> => {
    setUser(null);
    try {
      const res = await apiClient.get<User>("/auth/me");
      setUser(res.data);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  async function login(email: string, password: string): Promise<void> {
    clearTokens();
    setUser(null);
    const formBody = new URLSearchParams();
    formBody.append("username", email.trim());
    formBody.append("password", password);
    const tokenRes = await apiClient.post("/auth/login", formBody);
    saveTokens(tokenRes.data.access_token, tokenRes.data.refresh_token);
    await fetchUser();
    router.push("/dashboard");
  }

  async function register(email: string, password: string, fullName?: string): Promise<void> {
    const body: Record<string, string> = { email: email.trim(), password };
    if (fullName && fullName.trim()) body.full_name = fullName.trim();
    await apiClient.post("/auth/register", body);
    await login(email, password);
  }

  function logout(): void {
    clearTokens();
    setUser(null);
    router.push("/login");
  }

  async function refreshUser(): Promise<void> {
    await fetchUser();
  }

  // Called by settings page after a successful profile update
  function updateUser(updated: User): void {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
