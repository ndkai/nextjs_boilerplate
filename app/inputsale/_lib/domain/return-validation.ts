import type { OutputSaleDetailRes } from "../types";
import type { LineState } from "./return-calculations";

export interface ReturnSelection {
  ok: boolean;
  selected: OutputSaleDetailRes[];
  message?: string;
}

export function getSelectedReturnDetails(
  details: OutputSaleDetailRes[],
  lines: Record<number, LineState>
): OutputSaleDetailRes[] {
  return details.filter((d) => lines[d.Pid]?.selected && lines[d.Pid].qty > 0);
}

export function validateReturnSelection(
  details: OutputSaleDetailRes[],
  lines: Record<number, LineState>
): ReturnSelection {
  const selected = getSelectedReturnDetails(details, lines);
  if (!selected.length) {
    return {
      ok: false,
      selected,
      message: "Vui lòng chọn ít nhất một sản phẩm để nhập trả.",
    };
  }
  return { ok: true, selected };
}
