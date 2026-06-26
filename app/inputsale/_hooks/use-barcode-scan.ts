"use client";

import { useEffect, useRef } from "react";

/**
 * Phát hiện máy quét mã vạch kiểu keyboard-wedge:
 * ký tự gõ rất nhanh liên tiếp (<120ms/ký tự) rồi kết thúc bằng Enter,
 * khi không đang focus vào ô nhập liệu.
 *
 * @param enabled  Chỉ lắng nghe khi đơn hàng đã được nạp (enabled=true)
 * @param onScan   Callback nhận chuỗi mã vạch sau khi phát hiện
 */
export function useBarcodeScanner(
  enabled: boolean,
  onScan: (raw: string) => void
) {
  // Dùng ref để luôn gọi onScan mới nhất mà không cần re-add event listener
  const onScanRef = useRef(onScan);
  useEffect(() => { onScanRef.current = onScan; });

  const bufRef = useRef({ buf: "", t: 0 });

  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const now = Date.now();
      const st = bufRef.current;

      if (e.key === "Enter") {
        if (!inField && st.buf.length >= 3 && now - st.t < 120) {
          e.preventDefault();
          onScanRef.current(st.buf);
        }
        st.buf = "";
        return;
      }
      if (e.key.length === 1) {
        if (now - st.t > 120) st.buf = ""; // gõ chậm (người) → reset buffer
        st.buf += e.key;
        st.t = now;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
