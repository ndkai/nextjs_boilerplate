"use client";

import type { SortField, SortDir } from "../_hooks/use-returns-list";
import type { ReturnRow } from "../_lib/types";
import { fmt, fmtDate } from "@/lib/format";

interface Props {
  rows: ReturnRow[];
  sortField: SortField;
  sortDir: SortDir;
  page: number;
  totalPages: number;
  onSort: (f: SortField) => void;
  onPage: (p: number) => void;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "Hoàn thành": { bg: "#e6f4ea", color: "#1e8e3e" },
  "Đang xử lý": { bg: "#fef3e2", color: "#f57c00" },
  "Hủy":        { bg: "#fce8e6", color: "#c62828" },
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ret-sort-icon muted">⇅</span>;
  return <span className="ret-sort-icon">{dir === "asc" ? "↑" : "↓"}</span>;
}

export function ReturnsTable({ rows, sortField, sortDir, page, totalPages, onSort, onPage }: Props) {
  const cols: { label: string; field: SortField | null; key: string }[] = [
    { label: "#",            field: null,            key: "idx"      },
    { label: "Mã phiếu",    field: "InputSaleID",   key: "isid"     },
    { label: "Đơn gốc",     field: null,            key: "osid"     },
    { label: "Khách hàng",  field: null,             key: "customer" },
    { label: "Ngày tạo",    field: "CreatedDate",   key: "date"     },
    { label: "SL",          field: "TotalQuantity", key: "qty"      },
    { label: "Số tiền",     field: "TotalAmount",   key: "amount"   },
    { label: "Trạng thái",  field: null,             key: "status"   },
  ];

  return (
    <div className="ret-table-card">
      <table className="ret-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                className={c.field ? "sortable" : ""}
                onClick={() => c.field && onSort(c.field)}
              >
                {c.label}
                {c.field && <SortIcon active={sortField === c.field} dir={sortDir} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="ret-empty">Không tìm thấy phiếu nào phù hợp.</td>
            </tr>
          ) : rows.map((r, i) => {
            const st = r.Status ? STATUS_STYLE[r.Status] : undefined;
            return (
              <tr key={r.ISID} className="ret-row">
                <td className="muted">{(page - 1) * 8 + i + 1}</td>
                <td>
                  <a href={`/inputsale?code=${encodeURIComponent(r.OutputSaleID)}`} className="ret-link">{r.InputSaleID}</a>
                </td>
                <td className="muted">{r.OutputSaleID}</td>
                <td>{r.CustomerName}</td>
                <td className="muted">{fmtDate(r.CreatedDate)}</td>
                <td className="center">{r.TotalQuantity ?? 0}</td>
                <td className="amount">{fmt(r.TotalAmount)}</td>
                <td>
                  <span className="ret-badge" style={{ background: st?.bg, color: st?.color }}>
                    {r.Status ?? "—"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="ret-pagination">
        <button className="ret-page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          ← Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`ret-page-btn ${p === page ? "active" : ""}`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        ))}
        <button className="ret-page-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Tiếp →
        </button>
      </div>
    </div>
  );
}
