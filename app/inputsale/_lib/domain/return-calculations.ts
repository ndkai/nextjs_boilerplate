import type { OutputSaleDetailRes } from "../types";

export interface LineState {
  qty: number;
  selected: boolean;
}

export interface ReturnSummary {
  total: number;
  qtySum: number;
  prodCount: number;
}

/** Khởi tạo trạng thái dòng từ danh sách sản phẩm. */
export function buildInitLines(details: OutputSaleDetailRes[]): Record<number, LineState> {
  const result: Record<number, LineState> = {};
  for (const d of details) {
    if (d.QuantityCanInput > 0) {
      result[d.Pid] = d.IsReturnWithCombo
        ? { qty: d.QuantityCanInput, selected: true }
        : { qty: 0, selected: false };
    }
  }
  return result;
}

export function calcSummary(
  details: OutputSaleDetailRes[],
  lines: Record<number, LineState>
): ReturnSummary {
  let total = 0;
  let qtySum = 0;
  let prodCount = 0;
  for (const d of details) {
    const ls = lines[d.Pid];
    if (!ls?.selected) continue;
    prodCount += 1;
    qtySum += ls.qty;
    total += ls.qty * (d.SalePriceVat ?? 0);
  }
  return { total, qtySum, prodCount };
}

export function calcTotalTax(
  details: OutputSaleDetailRes[],
  lines: Record<number, LineState>
): number {
  return details.reduce(
    (sum, detail) => sum + (detail.TaxAmount ?? 0) * (lines[detail.Pid]?.qty ?? 0),
    0
  );
}

export function findByBarcode(
  codeStr: string,
  details: OutputSaleDetailRes[]
): OutputSaleDetailRes | undefined {
  const norm = codeStr.trim().toLowerCase();
  if (!norm) return undefined;
  const exact = details.find(
    (d) =>
      d.ReferenceId?.toLowerCase() === norm ||
      d.ProductId?.toLowerCase() === norm
  );
  return (
    exact ??
    details.find(
      (d) =>
        d.ReferenceId?.toLowerCase().includes(norm) ||
        d.ProductId?.toLowerCase().includes(norm) ||
        d.ProductName?.toLowerCase().includes(norm)
    )
  );
}

export function getReturnableDetails(details: OutputSaleDetailRes[] = []): OutputSaleDetailRes[] {
  return details.filter((d) => d.QuantityCanInput > 0);
}

export function filterProductDetails(
  details: OutputSaleDetailRes[],
  keyword: string
): OutputSaleDetailRes[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return details;
  return details.filter(
    (d) =>
      d.ProductName?.toLowerCase().includes(kw) ||
      d.ProductId?.toLowerCase().includes(kw) ||
      d.ReferenceId?.toLowerCase().includes(kw)
  );
}
