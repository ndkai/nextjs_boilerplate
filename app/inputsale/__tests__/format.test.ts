import { describe, it, expect } from "vitest";
import { fmt, fmtDate } from "../_lib/format";

describe("fmt", () => {
  it("định dạng số theo locale vi-VN", () => {
    expect(fmt(1690000)).toBe("1.690.000đ");
  });

  it("làm tròn số thập phân", () => {
    expect(fmt(1000.6)).toBe("1.001đ");
  });

  it("null/undefined → 0đ", () => {
    expect(fmt(null)).toBe("0đ");
    expect(fmt(undefined)).toBe("0đ");
  });
});

describe("fmtDate", () => {
  it("undefined → —", () => {
    expect(fmtDate(undefined)).toBe("—");
  });

  it("chuỗi rỗng → —", () => {
    expect(fmtDate("")).toBe("—");
  });

  it("ISO string hợp lệ → chuỗi ngày giờ (không rỗng)", () => {
    const result = fmtDate("2024-06-03T09:45:00");
    expect(result).not.toBe("—");
    expect(result.length).toBeGreaterThan(5);
  });

  it("chuỗi không hợp lệ → trả nguyên chuỗi", () => {
    expect(fmtDate("invalid-date")).toBe("invalid-date");
  });
});
