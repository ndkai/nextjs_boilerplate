import { describe, expect, it, vi } from "vitest";
import { createReturnsRepository } from "../_lib/repository";
import type { ReturnsApi } from "../_lib/api";
import type { ReturnsSearchReq } from "../_lib/types";
import { TEST_RETURNS } from "./fixtures";

describe("createReturnsRepository", () => {
  it("searchReturns ủy quyền sang API search", async () => {
    const api = {
      search: vi.fn().mockResolvedValue({ Data: TEST_RETURNS, TotalRecord: TEST_RETURNS.length }),
    } satisfies Pick<ReturnsApi, "search">;
    const repository = createReturnsRepository(api);
    const request = {
      InputStoreId: 0,
      DateFrom: "2024-01-01",
      DateTo: "2024-12-31",
      Option: 0,
      CustomerId: 0,
      KeySearch: "IS",
      PageIndex: 1,
      PageSize: 8,
      TotalAmount: 0,
    } satisfies ReturnsSearchReq;

    await expect(repository.searchReturns(request)).resolves.toEqual({
      Data: TEST_RETURNS,
      TotalRecord: TEST_RETURNS.length,
    });
    expect(api.search).toHaveBeenCalledWith(request);
  });
});
