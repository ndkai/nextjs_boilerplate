import { describe, expect, it, vi } from "vitest";
import { createReturnApi } from "../_lib/api";
import type { ApiClient } from "@/lib/api/create-api-client";

function createApiClientMock() {
  return {
    request: vi.fn(),
  } satisfies ApiClient;
}

describe("createReturnApi", () => {
  it("map init() đúng endpoint", async () => {
    const apiClient = createApiClientMock();
    apiClient.request.mockResolvedValue({ Isid: 1, InputSaleId: "IS-1" });

    const api = createReturnApi({
      apiClient,
      getToken: () => "token-A",
    });

    await api.init();

    expect(apiClient.request).toHaveBeenCalledWith("/api/InputSales/Init");
  });

  it("getPaymentTypes dùng cache function với token hiện tại", async () => {
    const apiClient = createApiClientMock();
    apiClient.request.mockResolvedValue([{ PaymentTypeID: 1 }]);
    const cacheMaster = vi.fn().mockImplementation((_key, _token, fetcher) => fetcher());

    const api = createReturnApi({
      apiClient,
      getToken: () => "token-B",
      cacheMaster,
    });

    await api.getPaymentTypes();

    expect(cacheMaster).toHaveBeenCalledTimes(1);
    expect(cacheMaster).toHaveBeenCalledWith(
      "paymentTypes",
      "token-B",
      expect.any(Function)
    );
    expect(apiClient.request).toHaveBeenCalledWith("/api/Mdm/PaymentType/");
  });
});
