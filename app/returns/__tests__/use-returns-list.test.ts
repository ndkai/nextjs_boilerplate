import { describe, it, expect } from "vitest";
import { filterReturns, sortReturns, calcStats } from "../_hooks/use-returns-list";
import { DEMO_RETURNS } from "../_lib/demo-data";

describe("filterReturns", () => {
  it("không lọc → trả toàn bộ", () => {
    expect(filterReturns(DEMO_RETURNS, "", "", "", "")).toHaveLength(DEMO_RETURNS.length);
  });

  it("lọc theo mã phiếu (case-insensitive)", () => {
    const res = filterReturns(DEMO_RETURNS, "IS-2024-110234", "", "", "");
    expect(res).toHaveLength(1);
    expect(res[0].InputSaleID).toBe("IS-2024-110234");
  });

  it("lọc theo tên khách hàng một phần", () => {
    const res = filterReturns(DEMO_RETURNS, "nguyễn", "", "", "");
    expect(res.length).toBeGreaterThanOrEqual(1);
    expect(res.every((r) => r.CustomerName.toLowerCase().includes("nguyễn"))).toBe(true);
  });

  it("lọc theo trạng thái Hủy", () => {
    const res = filterReturns(DEMO_RETURNS, "", "Hủy", "", "");
    expect(res.every((r) => r.Status === "Hủy")).toBe(true);
  });

  it("lọc theo dateFrom → bỏ bản ghi trước ngày", () => {
    const res = filterReturns(DEMO_RETURNS, "", "", "2024-11-12", "");
    expect(res.every((r) => new Date(r.CreatedDate) >= new Date("2024-11-12"))).toBe(true);
  });

  it("lọc theo dateTo → bỏ bản ghi sau ngày", () => {
    const res = filterReturns(DEMO_RETURNS, "", "", "", "2024-11-10");
    expect(res.every((r) => new Date(r.CreatedDate) <= new Date("2024-11-10T23:59:59"))).toBe(true);
  });

  it("keyword + status cùng lúc", () => {
    const res = filterReturns(DEMO_RETURNS, "IS-2024-110234", "Hoàn thành", "", "");
    expect(res).toHaveLength(1);
  });

  it("keyword không khớp → mảng rỗng", () => {
    expect(filterReturns(DEMO_RETURNS, "XXXXXXXX", "", "", "")).toHaveLength(0);
  });
});

describe("sortReturns", () => {
  it("sort TotalAmount desc → dòng đầu có amount lớn nhất", () => {
    const sorted = sortReturns(DEMO_RETURNS, "TotalAmount", "desc");
    expect(sorted[0].TotalAmount).toBeGreaterThanOrEqual(sorted[1].TotalAmount!);
  });

  it("sort TotalAmount asc → dòng đầu có amount nhỏ nhất", () => {
    const sorted = sortReturns(DEMO_RETURNS, "TotalAmount", "asc");
    expect(sorted[0].TotalAmount).toBeLessThanOrEqual(sorted[1].TotalAmount!);
  });

  it("sort CreatedDate desc → ngày mới nhất trước", () => {
    const sorted = sortReturns(DEMO_RETURNS, "CreatedDate", "desc");
    expect(new Date(sorted[0].CreatedDate).getTime()).toBeGreaterThanOrEqual(
      new Date(sorted[1].CreatedDate).getTime()
    );
  });

  it("không biến đổi mảng gốc", () => {
    const original = [...DEMO_RETURNS];
    sortReturns(DEMO_RETURNS, "TotalAmount", "asc");
    expect(DEMO_RETURNS).toEqual(original);
  });
});

describe("calcStats", () => {
  it("đếm đúng done / pending", () => {
    const stats = calcStats(DEMO_RETURNS);
    const done    = DEMO_RETURNS.filter((r) => r.Status === "Hoàn thành").length;
    const pending = DEMO_RETURNS.filter((r) => r.Status === "Đang xử lý").length;
    expect(stats.done).toBe(done);
    expect(stats.pending).toBe(pending);
    expect(stats.total).toBe(done + pending);
  });

  it("totalAmount chỉ tính Hoàn thành", () => {
    const stats = calcStats(DEMO_RETURNS);
    const expected = DEMO_RETURNS
      .filter((r) => r.Status === "Hoàn thành")
      .reduce((s, r) => s + (r.TotalAmount ?? 0), 0);
    expect(stats.totalAmount).toBe(expected);
  });

  it("avgAmount = totalAmount / done", () => {
    const stats = calcStats(DEMO_RETURNS);
    expect(stats.avgAmount).toBe(Math.round(stats.totalAmount / stats.done));
  });

  it("mảng rỗng → tất cả về 0", () => {
    const stats = calcStats([]);
    expect(stats.total).toBe(0);
    expect(stats.totalAmount).toBe(0);
    expect(stats.avgAmount).toBe(0);
  });
});
