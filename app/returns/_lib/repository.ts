"use client";

import { useMemo } from "react";
import { useReturnsApi, type ReturnsApi } from "./api";
import type { PagingResponse, ReturnRow, ReturnsSearchReq } from "./types";

export interface ReturnsRepository {
  searchReturns: (body: ReturnsSearchReq) => Promise<PagingResponse<ReturnRow>>;
}

export function createReturnsRepository(
  api: Pick<ReturnsApi, "search">
): ReturnsRepository {
  return {
    searchReturns: (body) => api.search(body),
  };
}

export function useReturnsRepository(): ReturnsRepository {
  const api = useReturnsApi();

  return useMemo(() => createReturnsRepository(api), [api]);
}
