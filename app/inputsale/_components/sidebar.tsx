"use client";

import type { PromotionReturnReceiptRes, OutputSaleReturnValidateRes } from "../_lib/types";
import { fmt } from "../_lib/format";

interface Summary {
  total: number;
  qtySum: number;
  prodCount: number;
}

interface Props {
  summary: Summary;
  promo: PromotionReturnReceiptRes | null;
  promoTotal: number;
  validate: OutputSaleReturnValidateRes | null;
  note: string;
  onNoteChange: (note: string) => void;
}

export function Sidebar({ summary, promo, promoTotal, validate, note, onNoteChange }: Props) {
  const hasPromo = (promo?.Promotions?.length ?? 0) + (promo?.EVouchers?.length ?? 0) > 0;

  return (
    <div className="isr-sidebar">

      {/* Total hero */}
      <div className="isr-total-hero">
        <div className="isr-total-label">Tổng tiền nhập trả</div>
        <div className="isr-total-amount">{fmt(summary.total)}</div>
        <div className="isr-total-row">
          <span>Số sản phẩm</span>
          <span>{summary.prodCount}</span>
        </div>
        <div className="isr-total-row">
          <span>Số lượng trả</span>
          <span>{summary.qtySum}</span>
        </div>
      </div>

      {/* Promo info */}
      <div className="isr-promo-card">
        <div className="isr-promo-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Thông tin đền khuyến mãi
        </div>
        {!hasPromo ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Không có khoản đền khuyến mãi.</div>
        ) : (
          <>
            {promo!.Promotions?.map((p, i) => (
              <div className="isr-promo-row" key={`p${i}`}>
                <span>{p.PromotionName || p.ProductName || "Khuyến mãi"}</span>
                <span>{fmt(p.DiscountAmount)}</span>
              </div>
            ))}
            {promo!.EVouchers?.map((v, i) => (
              <div className="isr-promo-row" key={`v${i}`}>
                <span>{v.ProductName || "E-Voucher"}</span>
                <span>{fmt(v.Amount)}</span>
              </div>
            ))}
            <div className="isr-promo-row" style={{ borderTop: "1px solid #f0f0f0", marginTop: 4, paddingTop: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>Tổng đền khuyến mãi</span>
              <span className="isr-promo-total">{fmt(promoTotal)}</span>
            </div>
          </>
        )}
      </div>

      {/* Video */}
      <div className="isr-video-card">
        <div className="isr-video-title">Video xuất hàng</div>
        <div className="isr-video-row">
          <span className={`isr-video-status ${validate?.IsHasReturnVideo ? "" : "none"}`}>
            {validate?.IsHasReturnVideo ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Đã có video
              </>
            ) : (
              "Chưa có video"
            )}
          </span>
          {validate?.IsHasReturnVideo && (
            <a href="#" className="isr-video-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Xem video
            </a>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="isr-note-card">
        <div className="isr-note-title">Ghi chú</div>
        <textarea
          className="isr-note-textarea"
          placeholder="Nhập ghi chú nếu có..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </div>

    </div>
  );
}
