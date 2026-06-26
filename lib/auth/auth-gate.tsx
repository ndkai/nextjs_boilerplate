"use client";

import { type ReactNode } from "react";
import { useToken, type TokenStatus } from "./token-provider";

// ── Shared screen styles ──────────────────────────────────────────────────────

const SCREEN: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  background: "#f0f2f5",
};

const CARD: React.CSSProperties = {
  textAlign: "center",
  background: "#fff",
  padding: "36px 52px",
  borderRadius: 14,
  boxShadow: "0 2px 16px rgba(0,0,0,.09)",
  maxWidth: 380,
  width: "90%",
};

function Screen({
  icon,
  title,
  desc,
  color = "#6b7280",
  action,
}: {
  icon: string;
  title: string;
  desc: string;
  color?: string;
  action?: ReactNode;
}) {
  return (
    <div style={SCREEN}>
      <div style={CARD}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
        {action && <div style={{ marginTop: 20 }}>{action}</div>}
      </div>
    </div>
  );
}

// ── Auth screens per status ───────────────────────────────────────────────────

const SCREENS: Record<Exclude<TokenStatus, "authenticated">, ReactNode> = {
  loading: (
    <Screen
      icon="⏳"
      title="Đang kết nối với POS..."
      desc="Vui lòng chờ trong giây lát."
    />
  ),
  unauthenticated: (
    <Screen
      icon="🔒"
      color="#c62828"
      title="Không tìm thấy token xác thực"
      desc="Vui lòng mở trang này từ ứng dụng POS. Nếu đang dev, thêm ?token=<bearer> vào URL."
    />
  ),
  expired: (
    <Screen
      icon="⚠️"
      color="#f57c00"
      title="Phiên đăng nhập đã hết hạn"
      desc="Token xác thực không còn hiệu lực. Vui lòng quay lại POS và mở lại trang này."
      action={
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#1a73e8",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 24px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Tải lại trang
        </button>
      }
    />
  ),
};

// ── AuthGate ──────────────────────────────────────────────────────────────────

/**
 * Bao bọc toàn bộ app — chỉ render children khi token hợp lệ.
 * Đặt trong root layout để bảo vệ tất cả các route.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useToken();
  if (status !== "authenticated") return SCREENS[status];
  return <>{children}</>;
}
