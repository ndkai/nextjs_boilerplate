"use client";

import { useCallback } from "react";
import { useToken } from "./token-provider";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function useApi() {
  const { token, clearToken } = useToken();

  const request = useCallback(
    async <T = unknown>(path: string, init: RequestInit = {}): Promise<T> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined ?? {}),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE}${path}`, { ...init, headers });

      // Token hết hạn → đưa người dùng về màn hình "expired" ngay lập tức
      if (res.status === 401) {
        clearToken();
        throw new Error("TOKEN_EXPIRED");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`[${res.status}] ${text || res.statusText}`);
      }

      if (res.status === 204) return null as T;
      const text = await res.text();
      if (!text) return null as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    },
    [token, clearToken],
  );

  return { request };
}
