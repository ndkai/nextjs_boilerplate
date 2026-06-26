import { describe, expect, it } from "vitest";
import { buildCreateReturnPayload } from "../_lib/mappers/build-create-payload";
import { buildInitLines } from "../_lib/domain/return-calculations";
import { TEST_ORDER } from "./fixtures";

describe("buildCreateReturnPayload", () => {
  it("map đúng order, dòng sản phẩm và tổng tiền", () => {
    const details = TEST_ORDER.OutputSaleDetail!;
    const selected = details.slice(0, 2);
    const lines = buildInitLines(details);

    const payload = buildCreateReturnPayload({
      init: { Isid: 10, InputSaleId: "IS-10" },
      order: TEST_ORDER,
      selected,
      lines,
      refundId: 5,
      note: "Khách trả hàng",
    });

    expect(payload).toEqual(
      expect.objectContaining({
        Isid: 10,
        InputSaleId: "IS-10",
        Osid: TEST_ORDER.OSID,
        OutputSaleId: TEST_ORDER.OutputSaleID,
        PaymentTypeId: 5,
        TotalQuantity: 3,
        TotalAmountBfvat: 2 * 760000 + 1 * 930000,
        TotalTaxAmount: 0,
        Description: "Khách trả hàng",
      })
    );
    expect(payload.ProductDetail).toHaveLength(2);
    expect(payload.ProductDetail[0]).toEqual(
      expect.objectContaining({
        Pid: 101,
        ProductId: "P-APTA2",
        Quantity: 2,
        SalePriceVat: 760000,
      })
    );
  });
});
