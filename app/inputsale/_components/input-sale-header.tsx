"use client";

interface Props {
  onClearCache: () => void;
}

export function InputSaleHeader({ onClearCache }: Props) {
  return (
    <header className="isr-header">
      <div className="isr-header-icon">↩</div>
      <div>
        <div className="isr-header-title">Nhập trả hàng</div>
        <div className="isr-header-sub">Tạo phiếu nhập trả từ đơn hàng online</div>
      </div>
      <button
        className="isr-btn-detail"
        style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}
        onClick={onClearCache}
        title="Xóa cache master data (payment type, delivery type...) và nạp lại từ server"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
        Xóa cache
      </button>
      <div className="isr-header-dots" style={{ marginLeft: 12 }}>
        <div className="isr-dot" style={{ background: "#fbbf24" }} />
        <div className="isr-dot" style={{ background: "#34d399" }} />
        <div className="isr-dot" style={{ background: "#f87171" }} />
      </div>
    </header>
  );
}
