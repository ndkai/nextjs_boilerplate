"use client";

import { useApiClient } from "@/lib/di/app-runtime";

export function useApi() {
  return useApiClient();
}
