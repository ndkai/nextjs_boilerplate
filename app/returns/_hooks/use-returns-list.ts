"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useReturnsRepository } from "../_lib/repository";
import type { PagingResponse, ReturnRow, ReturnsSearchReq } from "../_lib/types";

export type SortField = "CreatedDate" | "TotalAmount" | "TotalQuantity" | "InputSaleID";
export type SortDir = "asc" | "desc";

// ── Pure helpers (testable without React) ──────────────────────────────────

export function filterReturns(
  list: ReturnRow[],
  keyword: string,
  status: string,
  dateFrom: string,
  dateTo: string,
): ReturnRow[] {
  const kw = keyword.toLowerCase().trim();
  const from = dateFrom ? new Date(dateFrom).getTime() : 0;
  const to = dateTo ? new Date(dateTo + "T23:59:59").getTime() : Infinity;

  return list.filter((r) => {
    if (status && r.Status !== status) return false;
    const t = new Date(r.CreatedDate).getTime();
    if (t < from || t > to) return false;
    if (!kw) return true;
    return (
      r.InputSaleID.toLowerCase().includes(kw) ||
      r.OutputSaleID.toLowerCase().includes(kw) ||
      r.CustomerName.toLowerCase().includes(kw)
    );
  });
}

export function sortReturns(list: ReturnRow[], field: SortField, dir: SortDir): ReturnRow[] {
  return [...list].sort((a, b) => {
    let va: number | string, vb: number | string;
    if (field === "CreatedDate") {
      va = a.CreatedDate; vb = b.CreatedDate;
    } else if (field === "TotalAmount") {
      va = a.TotalAmount ?? 0; vb = b.TotalAmount ?? 0;
    } else if (field === "TotalQuantity") {
      va = a.TotalQuantity ?? 0; vb = b.TotalQuantity ?? 0;
    } else {
      va = a.InputSaleID; vb = b.InputSaleID;
    }
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function calcStats(list: ReturnRow[]) {
  const done   = list.filter((r) => r.Status === "Hoàn thành");
  const pending = list.filter((r) => r.Status === "Đang xử lý");
  const total  = done.reduce((s, r) => s + (r.TotalAmount ?? 0), 0);
  const avg    = done.length ? Math.round(total / done.length) : 0;
  return { total: list.length, done: done.length, pending: pending.length, totalAmount: total, avgAmount: avg };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowsFromResponse(res: PagingResponse<ReturnRow>): ReturnRow[] {
  return res.Data ?? res.Items ?? res.Results ?? [];
}

function totalFromResponse(res: PagingResponse<ReturnRow>, rows: ReturnRow[]): number {
  return res.TotalRecord ?? res.TotalRecords ?? rows[0]?.TotalRecord ?? rows.length;
}

function buildSearchRequest({
  keyword,
  dateFrom,
  dateTo,
  page,
}: {
  keyword: string;
  dateFrom: string;
  dateTo: string;
  page: number;
}): ReturnsSearchReq {
  return {
    InputStoreId: 0,
    DateFrom: dateFrom || "2000-01-01",
    DateTo: dateTo || today(),
    Option: 0,
    CustomerId: 0,
    KeySearch: keyword.trim(),
    PageIndex: page,
    PageSize: PAGE_SIZE,
    TotalAmount: 0,
  };
}

export function useReturnsList() {
  const repository = useReturnsRepository();
  const [keyword, setKeyword]   = useState("");
  const [status, setStatus]     = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [sortField, setSortField] = useState<SortField>("CreatedDate");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [page, setPage]         = useState(1);
  const [rowsSource, setRowsSource] = useState<ReturnRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await repository.searchReturns(buildSearchRequest({ keyword, dateFrom, dateTo, page }));
      const rows = rowsFromResponse(res);
      setRowsSource(rows);
      setTotalRecords(totalFromResponse(res, rows));
    } catch (e) {
      setRowsSource([]);
      setTotalRecords(0);
      setError(e instanceof Error ? e.message : "Không tải được danh sách phiếu nhập trả.");
    } finally {
      setLoading(false);
    }
  }, [repository, keyword, dateFrom, dateTo, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(
    () => filterReturns(rowsSource, "", status, "", ""),
    [rowsSource, status],
  );

  const sorted = useMemo(
    () => sortReturns(filtered, sortField, sortDir),
    [filtered, sortField, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const rows = sorted;

  const stats = useMemo(() => calcStats(filtered), [filtered]);

  function handleSort(field: SortField) {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
    setPage(1);
  }

  function resetFilters() {
    setKeyword(""); setStatus(""); setDateFrom(""); setDateTo(""); setPage(1);
  }

  return {
    keyword, setKeyword,
    status, setStatus,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    sortField, sortDir, handleSort,
    page, setPage, totalPages,
    rows, filtered, stats,
    loading, error, totalRecords,
    refresh: load,
    resetFilters,
  };
}
