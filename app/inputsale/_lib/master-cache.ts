"use client";

// ============================================================================
// Cache master data (dữ liệu ít thay đổi: payment type, delivery type, ...).
// Đa tầng: in-memory (dedupe trong 1 phiên trang) + localStorage (bền vững qua
// refresh / mỗi lần mở lại WebView). Hiệu lực gắn theo TOKEN (phiên đăng nhập):
// token khác -> key khác -> cache cũ không trúng.
// ============================================================================

// Bump khi đổi cấu trúc dữ liệu master -> vô hiệu toàn bộ cache cũ.
const CACHE_VERSION = 1;
const KEY_PREFIX = "mdcache";
// TTL an toàn để chặn dữ liệu quá cũ (hiệu lực chính vẫn là theo token).
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

// Tầng RAM: kết quả đã có + promise đang bay (chống gọi trùng đồng thời).
const memValue = new Map<string, unknown>();
const inFlight = new Map<string, Promise<unknown>>();

/** Hash ngắn (djb2) để tạo fingerprint cho token — không lộ token trên key. */
function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function fingerprint(token: string | null | undefined): string {
  return token ? hashString(token) : "anon";
}

function storageKey(key: string, token: string | null | undefined): string {
  return `${KEY_PREFIX}:${CACHE_VERSION}:${fingerprint(token)}:${key}`;
}

function readLocal<T>(fullKey: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(fullKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { v: T; savedAt: number };
    if (!parsed || typeof parsed.savedAt !== "number") return undefined;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(fullKey);
      return undefined;
    }
    return parsed.v;
  } catch {
    return undefined;
  }
}

function writeLocal<T>(fullKey: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(fullKey, JSON.stringify({ v: value, savedAt: Date.now() }));
  } catch {
    /* quota / private mode -> bỏ qua, vẫn còn cache RAM */
  }
}

/** Coi kết quả là hợp lệ để cache (bỏ qua null/undefined/mảng rỗng). */
function isCacheable(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Lấy master data có cache. Thứ tự: RAM -> localStorage(đúng token) -> fetcher().
 * @param key       khoá logic, vd "paymentTypes"
 * @param token     token phiên hiện tại (để scope cache)
 * @param fetcher   hàm gọi API thật khi cache miss
 */
export async function getCachedMaster<T>(
  key: string,
  token: string | null | undefined,
  fetcher: () => Promise<T>
): Promise<T> {
  const fullKey = storageKey(key, token);

  // 1) RAM
  if (memValue.has(fullKey)) return memValue.get(fullKey) as T;

  // 2) localStorage (đã scope theo token + còn hạn)
  const local = readLocal<T>(fullKey);
  if (local !== undefined) {
    memValue.set(fullKey, local);
    return local;
  }

  // 3) Dedupe các lời gọi đồng thời
  if (inFlight.has(fullKey)) return inFlight.get(fullKey) as Promise<T>;

  const p = (async () => {
    const result = await fetcher();
    if (isCacheable(result)) {
      memValue.set(fullKey, result);
      writeLocal(fullKey, result);
    }
    return result;
  })().finally(() => inFlight.delete(fullKey));

  inFlight.set(fullKey, p);
  return p;
}

/** Xoá toàn bộ cache master (dùng khi đăng xuất / cần làm mới thủ công). */
export function clearMasterCache(): void {
  memValue.clear();
  inFlight.clear();
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(`${KEY_PREFIX}:`)) toRemove.push(k);
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
