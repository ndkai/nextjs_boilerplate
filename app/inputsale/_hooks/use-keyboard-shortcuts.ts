"use client";

import { useEffect, useRef } from "react";

interface Shortcuts {
  onF2?: () => void;
  onF3?: () => void;
  onF5?: () => void;
  onEsc?: () => void;
}

/**
 * Đăng ký phím tắt toàn cửa sổ cho màn nhập trả.
 * Dùng ref pattern: effect chạy một lần, luôn gọi handler mới nhất.
 */
export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const ref = useRef(shortcuts);
  useEffect(() => { ref.current = shortcuts; });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F2")     { e.preventDefault(); ref.current.onF2?.(); }
      else if (e.key === "F3") { e.preventDefault(); ref.current.onF3?.(); }
      else if (e.key === "F5") { e.preventDefault(); ref.current.onF5?.(); }
      else if (e.key === "Escape") { ref.current.onEsc?.(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // chạy 1 lần duy nhất
}
