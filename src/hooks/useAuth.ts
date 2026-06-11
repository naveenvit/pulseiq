"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  last_login_at: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

// ─── Token storage helpers ────────────────────────────────────────────────
const TOKEN_KEY = "pulseiq_access_token";
const REFRESH_KEY = "pulseiq_refresh_token";

function saveTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

// ─── Axios instance with auth header ─────────────────────────────────────
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Main hook ────────────────────────────────────────────────────────────
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // On mount — check if we have a stored token and fetch the user
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    fetchCurrentUser(token);
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState({
        user: res.data,
        accessToken: token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      // Token is invalid or expired — try refreshing
      await tryRefreshToken();
    }
  };

  const tryRefreshToken = async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearTokens();
      setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token, user } = res.data;
      saveTokens(access_token, refresh_token);
      setState({
        user,
        accessToken: access_token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      clearTokens();
      setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
    }
  };

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post("/auth/register", data);
    const { access_token, refresh_token, user } = res.data;
    saveTokens(access_token, refresh_token);
    setState({
      user,
      accessToken: access_token,
      isLoading: false,
      isAuthenticated: true,
    });
    return user;
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const res = await api.post("/auth/login", data);
    const { access_token, refresh_token, user } = res.data;
    saveTokens(access_token, refresh_token);
    setState({
      user,
      accessToken: access_token,
      isLoading: false,
      isAuthenticated: true,
    });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the API call fails, clear local tokens
    } finally {
      clearTokens();
      setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  return {
    user: state.user,
    accessToken: state.accessToken,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    register,
    login,
    logout,
    api, // Export the configured axios instance for other hooks to use
  };
}