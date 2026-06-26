"use client";

import { fmt } from "@/lib/format";

interface Stats {
  total: number;
  done: number;
  pending: number;
  totalAmount: number;
  avgAmount: number;
}

export function StatsBar({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Tổng phiếu",       value: stats.total,                  color: "#1a73e8", bg: "#e8f0fe", icon: "📋" },
    { label: "Hoàn thành",       value: stats.done,                   color: "#1e8e3e", bg: "#e6f4ea", icon: "✅" },
    { label: "Đang xử lý",      value: stats.pending,                color: "#f57c00", bg: "#fef3e2", icon: "⏳" },
    { label: "Tổng tiền hoàn",   value: fmt(stats.totalAmount),       color: "#c62828", bg: "#fce8e6", icon: "💰" },
  ];

  return (
    <div className="ret-stats">
      {cards.map((c) => (
        <div className="ret-stat-card" key={c.label} style={{ borderTop: `3px solid ${c.color}` }}>
          <div className="ret-stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
          <div className="ret-stat-body">
            <div className="ret-stat-value" style={{ color: c.color }}>
              {typeof c.value === "number" ? c.value : c.value}
            </div>
            <div className="ret-stat-label">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
