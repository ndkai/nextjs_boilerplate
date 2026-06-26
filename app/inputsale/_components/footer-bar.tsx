"use client";

import type { OutputSaleRes } from "../_lib/types";

interface Props {
  order: OutputSaleRes | null;
  creating: boolean;
  prodCount: number;
  onCancel: () => void;
  onCreate: () => void;
}

export function FooterBar({ order, creating, prodCount, onCancel, onCreate }: Props) {
  return (
    <footer className="isr-footer">
      <span className="isr-shortcut"><kbd>F2</kbd> Tìm đơn</span>
      <span className="isr-shortcut"><kbd>F3</kbd> Quét barcode</span>
      <span className="isr-shortcut"><kbd>F5</kbd> Tạo phiếu</span>
      <span className="isr-shortcut"><kbd>F6</kbd> Xóa dòng</span>
      <span className="isr-shortcut"><kbd>Esc</kbd> Hủy</span>
      <div className="isr-footer-actions">
        <button className="isr-btn-cancel" onClick={onCancel}>
          Hủy (Esc)
        </button>
        <button
          className="isr-btn-submit"
          onClick={onCreate}
          disabled={!order || creating || prodCount === 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {creating ? "Đang tạo..." : "F5 — Tạo phiếu nhập trả"}
        </button>
      </div>
    </footer>
  );
}
