"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InputSaleError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[InputSale]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Be Vietnam Pro', sans-serif", background: "#f0f2f5" }}>
      <div style={{ textAlign: "center", color: "#e53935", background: "#fff", padding: "32px 48px", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", maxWidth: 400 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Đã xảy ra lỗi</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
          {error.message || "Lỗi không xác định"}
        </div>
        <button
          onClick={reset}
          style={{ background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
