"use client";

import type { OutputSaleRes } from "../_lib/types";
import { fmt, fmtDate } from "../_lib/formatters/format";

interface Props {
  order: OutputSaleRes | null;
  code: string;
  loading: boolean;
  paymentLabel: string;
  deliveryLabel: string;
  onCodeChange: (code: string) => void;
  onSearch: () => void;
}

export function InfoStrip({
  order, code, loading, paymentLabel, deliveryLabel,
  onCodeChange, onSearch,
}: Props) {
  return (
    <div className="isr-info-strip">

      {/* Panel 1 – Thông tin nhập trả */}
      <div className="isr-card">
        <div className="isr-card-title">Thông tin nhập trả</div>
        <div className="isr-search-row">
          <input
            className="isr-search-input"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Nhập mã đơn hàng..."
          />
          <button className="isr-btn-primary" onClick={onSearch} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Tìm đơn
          </button>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Mã phiếu xuất</span>
          <span className="isr-info-value">{order?.OutputSaleID ?? "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Hình thức</span>
          <span className="isr-info-value">{order?.OutputTypeName ?? "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Mã trả</span>
          <span className="isr-info-value">{order?.ReturnInputCode ?? "—"}</span>
        </div>
      </div>

      {/* Panel 2 – Khách hàng trả */}
      <div className="isr-card">
        <div className="isr-card-title">Khách hàng trả</div>
        <div className="isr-info-row">
          <span className="isr-info-label">Tên khách hàng</span>
          <span className="isr-info-value">{order?.CustomerName || "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Địa chỉ</span>
          <span className="isr-info-value">{order?.CustomerAddress || "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Số điện thoại</span>
          <span className="isr-info-value">{order?.CustomerPhone || "—"}</span>
        </div>
      </div>

      {/* Panel 3 – Thông tin đơn hàng */}
      <div className="isr-card">
        <div className="isr-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Thông tin đơn hàng
          {order && (
            <span className={`isr-badge ${order.IsPaymented ? "success" : "warning"}`} style={{ marginLeft: 4 }}>
              {order.IsPaymented ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          )}
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Đơn hàng</span>
          <span className="isr-info-value">{order?.OutputSaleID ?? "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Ngày đặt</span>
          <span className="isr-info-value">{order ? fmtDate(order.CreatedDate) : "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Khách hàng</span>
          <span className="isr-info-value">{order?.CustomerName || "—"}</span>
        </div>
        <div className="isr-info-row">
          <span className="isr-info-label">Tổng tiền đơn</span>
          <span className="isr-info-value primary">{order ? fmt(order.TotalAmount) : "—"}</span>
        </div>
      </div>

      {/* Panel 4 – Thanh toán & giao hàng */}
      <div className="isr-card">
        <div className="isr-card-title">Thanh toán &amp; giao hàng</div>
        <div className="isr-pay-row">
          <div className="isr-pay-icon">TT</div>
          <div className="isr-pay-detail">
            <span className="isr-pay-type">Thanh toán</span>
            <span className="isr-pay-name">{paymentLabel}</span>
          </div>
        </div>
        <div className="isr-pay-row">
          <div className="isr-pay-icon">GH</div>
          <div className="isr-pay-detail">
            <span className="isr-pay-type">Giao hàng</span>
            <span className="isr-pay-name">{deliveryLabel}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
