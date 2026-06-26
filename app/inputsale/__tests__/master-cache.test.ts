import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCachedMaster, clearMasterCache } from "../_lib/master-cache";

beforeEach(() => {
  clearMasterCache();
  localStorage.clear();
});

describe("getCachedMaster", () => {
  it("gọi fetcher lần đầu khi cache miss", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    const result = await getCachedMaster("key1", "token", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it("trả kết quả từ RAM mà không gọi fetcher lần 2", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    await getCachedMaster("key1", "token", fetcher);
    await getCachedMaster("key1", "token", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("gọi fetcher lại khi token khác (cache scope khác)", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    await getCachedMaster("key1", "token-A", fetcher);
    await getCachedMaster("key1", "token-B", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("không cache mảng rỗng — gọi fetcher lại lần sau", async () => {
    const fetcher = vi.fn().mockResolvedValue([]);
    await getCachedMaster("key1", "token", fetcher);
    await getCachedMaster("key1", "token", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("không cache null", async () => {
    const fetcher = vi.fn().mockResolvedValue(null);
    await getCachedMaster("key1", "token", fetcher);
    await getCachedMaster("key1", "token", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("dedupe: 2 lời gọi đồng thời chỉ gọi fetcher 1 lần", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    const [r1, r2] = await Promise.all([
      getCachedMaster("key1", "token", fetcher),
      getCachedMaster("key1", "token", fetcher),
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(r2);
  });

  it("gọi fetcher lại sau khi clearMasterCache()", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    await getCachedMaster("key1", "token", fetcher);
    clearMasterCache();
    await getCachedMaster("key1", "token", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("TTL hết hạn → bỏ qua localStorage, gọi lại fetcher", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    await getCachedMaster("key1", "token", fetcher);

    // Giả lập savedAt cũ hơn 24h
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      const raw = localStorage.getItem(k);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      parsed.savedAt = Date.now() - 25 * 60 * 60 * 1000; // 25h trước
      localStorage.setItem(k, JSON.stringify(parsed));
    });

    clearMasterCache(); // xoá RAM, giữ localStorage (đã cũ)
    await getCachedMaster("key1", "token", fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
