import { describe, expect, it, vi } from "vitest";
import { createReturnRepository } from "../_lib/repository";
import type { ReturnApi } from "../_lib/api";
import { TEST_ORDER } from "./fixtures";

function createApiMock() {
  return {
    readByReturnInputCode: vi.fn().mockResolvedValue({ ErrorCode: 0, OutSale: TEST_ORDER }),
    returnValidate: vi.fn().mockResolvedValue({ IsFullReturnOutputSale: false, IsHasReturnVideo: true }),
    promotionReturnReceipt: vi.fn().mockResolvedValue({ OSID: TEST_ORDER.OSID, OutputSaleID: TEST_ORDER.OutputSaleID }),
    getPaymentTypes: vi.fn().mockResolvedValue([{ PaymentTypeID: 1, PaymentTypeName: "Tiền mặt" }]),
    getDeliveryTypes: vi.fn().mockResolvedValue([{ DeliveryTypeID: 1, DeliveryTypeName: "Giao hàng" }]),
    init: vi.fn().mockResolvedValue({ Isid: 1, InputSaleId: "IS-1" }),
    create: vi.fn().mockResolvedValue({ Isid: 1, InputSaleId: "IS-1", Status: 1 }),
  } satisfies Pick<
    ReturnApi,
    | "readByReturnInputCode"
    | "returnValidate"
    | "promotionReturnReceipt"
    | "getPaymentTypes"
    | "getDeliveryTypes"
    | "init"
    | "create"
  >;
}

describe("createReturnRepository", () => {
  it("loadOrderByReturnCode trả order domain từ response status", async () => {
    const api = createApiMock();
    const repository = createReturnRepository(api);

    await expect(repository.loadOrderByReturnCode("ONL123")).resolves.toBe(TEST_ORDER);
    expect(api.readByReturnInputCode).toHaveBeenCalledWith("ONL123");
  });

  it("initReceipt và createReceipt ủy quyền sang API request layer", async () => {
    const api = createApiMock();
    const repository = createReturnRepository(api);
    const body = { Isid: 1, InputSaleId: "IS-1" } as Parameters<ReturnApi["create"]>[0];

    await repository.initReceipt();
    await repository.createReceipt(body);

    expect(api.init).toHaveBeenCalledTimes(1);
    expect(api.create).toHaveBeenCalledWith(body);
  });
});
