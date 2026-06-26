"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TokenStatus =
  | "loading"          // Đang chờ POS inject (chưa quá timeout)
  | "authenticated"    // Token nhận được và còn hạn
  | "unauthenticated"  // Timeout 5s — không nhận được token
  | "expired";         // API trả 401 → clearToken() được gọi

interface TokenCtx {
  token: string | null;
  status: TokenStatus;
  clearToken: () => void;
}

const Ctx = createContext<TokenCtx>({
  token: null,
  status: "loading",
  clearToken: () => {},
});

// ── WebView2 globals ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    /** Injected by WebView2 via AddScriptToExecuteOnDocumentCreatedAsync */
    __POS_TOKEN__?: string;
    chrome?: {
      webview?: {
        addEventListener: (event: string, handler: (e: { data: unknown }) => void) => void;
      };
    };
  }
}

// ── Session persistence ───────────────────────────────────────────────────────

const SESSION_KEY = "pos:token";

function readSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { v, exp } = JSON.parse(raw) as { v: string; exp: number };
    if (Date.now() > exp) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

function writeSession(token: string): void {
  if (typeof window === "undefined") return;
  try {
    // Dùng JWT exp nếu có, fallback 4h
    let exp = Date.now() + 4 * 60 * 60 * 1000;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (typeof payload.exp === "number") exp = payload.exp * 1000;
    } catch { /* không phải JWT */ }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ v: token, exp }));
  } catch { /* private mode hoặc storage đầy */ }
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TokenStatus>("loading");
  const resolvedRef = useRef(false);

  const receive = useCallback((t: string) => {
    if (resolvedRef.current && status === "authenticated") return; // đã có token, bỏ qua
    resolvedRef.current = true;
    writeSession(t);
    setToken(t);
    setStatus("authenticated");
  }, [status]);

  const clearToken = useCallback(() => {
    clearSession();
    setToken(null);
    setStatus("expired");
    resolvedRef.current = false; // cho phép nhận token mới nếu POS inject lại
  }, []);

  useEffect(() => {
    // 1) Session storage — token còn hạn từ lần mở trước (tránh flash khi React remount)
    const stored = readSession();
    if (stored) { receive(stored); return; }

    // 2) window.__POS_TOKEN__ — WebView2 inject trước khi page load
    if (window.__POS_TOKEN__) { receive(window.__POS_TOKEN__); return; }

    // 3) ?token= URL param — dùng trong dev / testing
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("token");
      window.history.replaceState(null, "", clean.toString());
      receive(urlToken);
      return;
    }

    // 4) window.postMessage / chrome.webview — POS gửi sau NavigationCompleted
    const onWindowMsg = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.type === "pos-token" && typeof data.token === "string") {
          receive(data.token as string);
        }
      } catch { /* ignore non-JSON */ }
    };
    window.addEventListener("message", onWindowMsg);

    window.chrome?.webview?.addEventListener("message", (e) => {
      try {
        const data = typeof e.data === "string"
          ? JSON.parse(e.data as string)
          : (e.data as Record<string, unknown>);
        if (data?.type === "pos-token" && typeof data.token === "string") {
          receive(data.token as string);
        }
      } catch { /* ignore */ }
    });

    // 5) Timeout 5s — không nhận được token → hiển thị màn hình lỗi
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) setStatus("unauthenticated");
    }, 5000);

    return () => {
      window.removeEventListener("message", onWindowMsg);
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chạy 1 lần duy nhất khi mount

  return (
    <Ctx.Provider value={{ token, status, clearToken }}>
      {children}
    </Ctx.Provider>
  );
}

export const useToken = () => useContext(Ctx);
