"use client";

import type { OutputSaleDetailRes, OutputSaleRes, PaymentTypeRes } from "../_lib/types";
import type { LineState } from "../_hooks/use-return-form";
import { fmt } from "../_lib/format";

interface Props {
  order: OutputSaleRes | null;
  visibleDetails: OutputSaleDetailRes[];
  lines: Record<number, LineState>;
  prodFilter: string;
  flashPid: number | null;
  comboForced: boolean;
  selectedCount: number;
  refundTotal: number;
  refundId: number;
  paymentTypes: PaymentTypeRes[];
  currentPaymentTypeId: number | undefined;
  onFilterChange: (v: string) => void;
  onScan: (v: string) => void;
  onToggle: (d: OutputSaleDetailRes, on: boolean) => void;
  onSetQty: (d: OutputSaleDetailRes, q: number) => void;
  onRefundChange: (id: number) => void;
}

export function ProductTable({
  order, visibleDetails, lines, prodFilter, flashPid, comboForced,
  selectedCount, refundTotal, refundId, paymentTypes, currentPaymentTypeId,
  onFilterChange, onScan, onToggle, onSetQty, onRefundChange,
}: Props) {
  return (
    <div className="isr-table-card">

      {/* Table header */}
      <div className="isr-table-header">
        <span className="isr-table-title">Sản phẩm trong đơn</span>
        <input
          className="isr-prod-search"
          placeholder="Tìm / quét barcode sản phẩm"
          value={prodFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onScan(prodFilter);
            }
          }}
        />
        <span className="isr-kbd">F3</span>
        <div className="isr-table-badges">
          <span className="isr-badge info">{selectedCount} được chọn</span>
          {comboForced && <span className="isr-badge danger">Combo bắt buộc trả</span>}
        </div>
      </div>

      {/* Body */}
      {!order ? (
        <div className="isr-empty">
          Nhập mã đơn hàng và bấm <b>Tìm đơn</b> để nạp sản phẩm cần nhập trả.
        </div>
      ) : visibleDetails.length === 0 ? (
        <div className="isr-empty">Không có sản phẩm nào còn có thể nhập trả.</div>
      ) : (
        <table className="isr-table">
          <thead>
            <tr>
              <th></th>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th className="center">Đã mua</th>
              <th className="center">Đã trả</th>
              <th className="center">Còn trả</th>
              <th className="center">SL nhập trả</th>
              <th>Giá nhập trả</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {visibleDetails.map((d, idx) => {
              const ls = lines[d.Pid] ?? { qty: 0, selected: false };
              const forced = d.IsReturnWithCombo;
              const lineTotal = ls.qty * (d.SalePriceVat ?? 0);
              return (
                <tr
                  key={d.Pid}
                  id={`isr-row-${d.Pid}`}
                  className={flashPid === d.Pid ? "isr-row-flash" : undefined}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="isr-checkbox"
                      checked={ls.selected}
                      disabled={forced}
                      onChange={(e) => onToggle(d, e.target.checked)}
                    />
                  </td>
                  <td style={{ color: "var(--muted)", fontWeight: 600 }}>{idx + 1}</td>
                  <td>
                    <div className="isr-prod-name">{d.ProductName}</div>
                    <div className={`isr-prod-sub ${forced ? "" : "muted"}`}>
                      {forced
                        ? "Combo — Bắt buộc trả toàn bộ"
                        : "Có thể chọn nhập trả theo số lượng còn lại"}
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{d.ReferenceId || d.ProductId}</td>
                  <td className="center" style={{ fontWeight: 600 }}>{d.OutputQuantity}</td>
                  <td className="center" style={{ color: "var(--muted)" }}>{d.InputQuantity}</td>
                  <td className="center" style={{ color: "var(--danger)", fontWeight: 700 }}>{d.QuantityCanInput}</td>
                  <td className="center">
                    <div className="isr-stepper">
                      <button
                        onClick={() => onSetQty(d, ls.qty - 1)}
                        disabled={forced || ls.qty <= 0}
                      >−</button>
                      <span className="isr-stepper-val">{ls.qty}</span>
                      <button
                        onClick={() => onSetQty(d, ls.qty + 1)}
                        disabled={forced || ls.qty >= d.QuantityCanInput}
                      >+</button>
                    </div>
                  </td>
                  <td><span className="isr-money">{fmt(d.SalePriceVat)}</span></td>
                  <td><span className="isr-money primary">{fmt(lineTotal)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Footer note */}
      <div className="isr-table-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
        </svg>
        Chỉ hiển thị sản phẩm còn có thể nhập trả. Sản phẩm đã trả đủ không hiển thị.
      </div>

      {/* Refund selector */}
      <div className="isr-refund-row">
        <span className="isr-refund-label">Hoàn tiền về</span>
        <select
          className="isr-refund-select"
          value={refundId}
          onChange={(e) => onRefundChange(Number(e.target.value))}
        >
          {paymentTypes.length === 0 && (
            <option value={0}>— Chưa tải phương thức —</option>
          )}
          {paymentTypes.map((p) => (
            <option key={p.PaymentTypeID} value={p.PaymentTypeID}>
              {p.PaymentTypeName}
              {currentPaymentTypeId === p.PaymentTypeID ? " — Đã thanh toán" : ""}
            </option>
          ))}
        </select>
        <span style={{ flex: 1, color: "var(--muted)", fontSize: 13 }}>Số tiền hoàn</span>
        <span className="isr-refund-amount">{fmt(refundTotal)}</span>
        <button className="isr-btn-detail">Chi tiết</button>
      </div>

    </div>
  );
}
