import Link from "next/link";

export default function Home() {
  const features = [
    {
      href: "/inputsale",
      icon: "↩",
      title: "Nhập trả hàng",
      desc: "Tìm đơn, quét barcode sản phẩm, tạo phiếu nhập trả. Keyboard shortcuts F2/F3/F5.",
      color: "#1a73e8",
      bg: "#e8f0fe",
    },
    {
      href: "/returns",
      icon: "📋",
      title: "Lịch sử nhập trả",
      desc: "Tra cứu, lọc theo ngày, trạng thái. Sort cột, phân trang, KPI cards.",
      color: "#1e8e3e",
      bg: "#e6f4ea",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🐼</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1c1b1f", marginBottom: 6 }}>Con Cưng SCA</h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Next.js 16 · App Router · Feature-based architecture</p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 720 }}>
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="home-feature-card"
            style={{
              width: 300,
              background: "#fff",
              borderRadius: 14,
              padding: "24px 24px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.04)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              borderTop: `4px solid ${f.color}`,
              transition: "transform .15s, box-shadow .15s",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1b1f" }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{f.desc}</div>
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: f.color }}>
              Mở →
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 40, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
        Token có thể truyền qua URL <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>?token=TEST</code> khi phát triển local.
      </div>

    </div>
  );
}
