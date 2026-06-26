export const fmt = (n?: number | null) =>
  `${Math.round(n ?? 0).toLocaleString("vi-VN")}đ`;

export const fmtDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString("vi-VN");
};
