import { describe, it, expect } from "vitest";
import { TEST_ORDER } from "./fixtures";
import { buildInitLines, calcSummary, findByBarcode } from "../_lib/domain/return-calculations";
import type { OutputSaleDetailRes } from "../_lib/types";

const details = TEST_ORDER.OutputSaleDetail!;
const [, , wipe] = details; // Pid: 103

describe("buildInitLines", () => {
  it("combo (IsReturnWithCombo) → chọn sẵn, SL đầy", () => {
    const lines = buildInitLines(details);
    expect(lines[101]).toEqual({ qty: 2, selected: true });  // milk, combo
    expect(lines[102]).toEqual({ qty: 1, selected: true });  // diaper, combo
  });

  it("non-combo → chưa chọn, SL 0", () => {
    const lines = buildInitLines(details);
    expect(lines[103]).toEqual({ qty: 0, selected: false }); // wipe
  });

  it("bỏ qua sản phẩm QuantityCanInput <= 0", () => {
    const zeroQty: OutputSaleDetailRes = { ...wipe, Pid: 999, QuantityCanInput: 0 };
    const lines = buildInitLines([...details, zeroQty]);
    expect(lines[999]).toBeUndefined();
  });
});

describe("calcSummary", () => {
  it("tính đúng total / qtySum / prodCount từ dòng đã chọn", () => {
    const lines = buildInitLines(details);
    // combo đã chọn sẵn: milk 2×760000 + diaper 1×930000 = 2450000
    const s = calcSummary(details, lines);
    expect(s.prodCount).toBe(2);
    expect(s.qtySum).toBe(3);
    expect(s.total).toBe(2 * 760000 + 1 * 930000);
  });

  it("không đếm dòng chưa chọn", () => {
    const lines = { 103: { qty: 2, selected: false } };
    const s = calcSummary([wipe], lines);
    expect(s.prodCount).toBe(0);
    expect(s.total).toBe(0);
  });

  it("không đếm dòng đã chọn nhưng qty = 0", () => {
    const lines = { 103: { qty: 0, selected: true } };
    const s = calcSummary([wipe], lines);
    expect(s.prodCount).toBe(1); // đã chọn
    expect(s.qtySum).toBe(0);
    expect(s.total).toBe(0);
  });
});

describe("findByBarcode", () => {
  it("khớp chính xác ReferenceId", () => {
    expect(findByBarcode("123456", details)?.Pid).toBe(101);
  });

  it("khớp chính xác ProductId", () => {
    expect(findByBarcode("P-HUGM", details)?.Pid).toBe(102);
  });

  it("khớp một phần tên sản phẩm", () => {
    expect(findByBarcode("khăn ướt", details)?.Pid).toBe(103);
  });

  it("không tìm thấy → undefined", () => {
    expect(findByBarcode("UNKNOWN-SKU", details)).toBeUndefined();
  });

  it("chuỗi rỗng → undefined", () => {
    expect(findByBarcode("", details)).toBeUndefined();
  });

  it("ưu tiên khớp chính xác hơn khớp gần đúng", () => {
    // "123456" khớp chính xác ReferenceId của milk; không nhảy sang partial match khác
    expect(findByBarcode("123456", details)?.Pid).toBe(101);
  });
});
