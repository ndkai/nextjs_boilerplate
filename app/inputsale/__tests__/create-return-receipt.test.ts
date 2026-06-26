import { describe, expect, it, vi } from "vitest";
import { buildInitLines } from "../_lib/domain/return-calculations";
import {
  createReturnReceipt,
  ReturnReceiptValidationError,
} from "../_lib/use-cases/create-return-receipt";
import type { ReturnRepository } from "../_lib/repository";
import { TEST_ORDER } from "./fixtures";

function createRepositoryMock() {
  return {
    initReceipt: vi.fn().mockResolvedValue({ Isid: 123, InputSaleId: "IS-123" }),
    createReceipt: vi.fn().mockResolvedValue({ Isid: 123, InputSaleId: "IS-123", Status: 1 }),
  } satisfies Pick<ReturnRepository, "initReceipt" | "createReceipt">;
}

describe("createReturnReceipt", () => {
  it("validate lỗi khi chưa có đơn hàng", async () => {
    await expect(
      createReturnReceipt({
        repository: createRepositoryMock(),
        order: null,
        returnableDetails: [],
        lines: {},
        refundId: 1,
        note: "",
      })
    ).rejects.toBeInstanceOf(ReturnReceiptValidationError);
  });

  it("validate lỗi khi chưa chọn sản phẩm", async () => {
    const repository = createRepositoryMock();
    const details = TEST_ORDER.OutputSaleDetail!;

    await expect(
      createReturnReceipt({
        repository,
        order: TEST_ORDER,
        returnableDetails: details,
        lines: { 103: { qty: 0, selected: false } },
        refundId: 1,
        note: "",
      })
    ).rejects.toThrow("Vui lòng chọn ít nhất một sản phẩm để nhập trả.");
    expect(repository.initReceipt).not.toHaveBeenCalled();
    expect(repository.createReceipt).not.toHaveBeenCalled();
  });

  it("build payload và gọi API tạo phiếu", async () => {
    const repository = createRepositoryMock();
    const details = TEST_ORDER.OutputSaleDetail!;
    const lines = buildInitLines(details);

    const result = await createReturnReceipt({
      repository,
      order: TEST_ORDER,
      returnableDetails: details,
      lines,
      refundId: 9,
      note: "Ghi chú nhập trả",
    });

    expect(result.inputSaleId).toBe("IS-123");
    expect(repository.initReceipt).toHaveBeenCalledTimes(1);
    expect(repository.createReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        InputSaleId: "IS-123",
        Isid: 123,
        Osid: TEST_ORDER.OSID,
        PaymentTypeId: 9,
        Description: "Ghi chú nhập trả",
        TotalQuantity: 3,
        ProductDetail: expect.arrayContaining([
          expect.objectContaining({ Pid: 101, Quantity: 2 }),
          expect.objectContaining({ Pid: 102, Quantity: 1 }),
        ]),
      })
    );
  });
});
