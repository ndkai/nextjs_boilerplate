"use client";

import { useMemo } from "react";
import { useApiClient } from "@/lib/di/app-runtime";
import type { ApiClient } from "@/lib/api/create-api-client";
import type { PagingResponse, ReturnRow, ReturnsSearchReq } from "./types";

const INPUT_SALE = "/api/InputSales/";

export interface ReturnsApi {
  search: (body: ReturnsSearchReq) => Promise<PagingResponse<ReturnRow>>;
}

export function createReturnsApi({ apiClient }: { apiClient: ApiClient }): ReturnsApi {
  const { request } = apiClient;

  return {
    search: (body) =>
      request<PagingResponse<ReturnRow>>(`${INPUT_SALE}Search`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  };
}

export function useReturnsApi(): ReturnsApi {
  const apiClient = useApiClient();

  return useMemo(
    () => createReturnsApi({ apiClient }),
    [apiClient]
  );
}
