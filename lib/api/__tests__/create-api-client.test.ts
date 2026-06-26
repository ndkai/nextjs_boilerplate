import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../create-api-client";

describe("createApiClient", () => {
  it("đính kèm bearer token vào request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "https://example.test",
      fetchImpl,
      getToken: () => "abc123",
      onUnauthorized: vi.fn(),
    });

    await client.request("/ping");

    expect(fetchImpl).toHaveBeenCalledWith("https://example.test/ping", {
      headers: {
        Authorization: "Bearer abc123",
        "Content-Type": "application/json",
      },
    });
  });

  it("gọi onUnauthorized và ném TOKEN_EXPIRED khi 401", async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient({
      fetchImpl: vi.fn().mockResolvedValue(new Response("", { status: 401 })),
      getToken: () => "expired",
      onUnauthorized,
    });

    await expect(client.request("/secure")).rejects.toThrow("TOKEN_EXPIRED");
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("trả text thô nếu body không phải JSON hợp lệ", async () => {
    const client = createApiClient({
      fetchImpl: vi.fn().mockResolvedValue(new Response("plain text", { status: 200 })),
      getToken: () => null,
      onUnauthorized: vi.fn(),
    });

    await expect(client.request<string>("/text")).resolves.toBe("plain text");
  });
});
