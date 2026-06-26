"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { createApiClient, type ApiClient } from "@/lib/api/create-api-client";
import { useToken, type TokenStatus } from "@/lib/auth/token-provider";

export interface AuthService {
  token: string | null;
  status: TokenStatus;
  clearToken: () => void;
}

interface AppRuntime {
  auth: AuthService;
  apiClient: ApiClient;
}

const AppRuntimeCtx = createContext<AppRuntime | null>(null);

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function AppRuntimeProvider({ children }: { children: ReactNode }) {
  const { token, status, clearToken } = useToken();

  const auth = useMemo<AuthService>(
    () => ({ token, status, clearToken }),
    [token, status, clearToken]
  );

  const apiClient = useMemo(
    () =>
      createApiClient({
        baseUrl: BASE_URL,
        getToken: () => token,
        onUnauthorized: clearToken,
      }),
    [token, clearToken]
  );

  const value = useMemo(
    () => ({ auth, apiClient }),
    [auth, apiClient]
  );

  return <AppRuntimeCtx.Provider value={value}>{children}</AppRuntimeCtx.Provider>;
}

export function useAppRuntime(): AppRuntime {
  const value = useContext(AppRuntimeCtx);
  if (!value) {
    throw new Error("useAppRuntime must be used within <AppRuntimeProvider>");
  }
  return value;
}

export function useAuth(): AuthService {
  return useAppRuntime().auth;
}

export function useApiClient(): ApiClient {
  return useAppRuntime().apiClient;
}
