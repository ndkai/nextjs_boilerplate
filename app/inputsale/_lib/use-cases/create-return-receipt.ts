import type { ReturnRepository } from "../repository";
import type { OutputSaleDetailRes, OutputSaleRes } from "../types";
import { buildCreateReturnPayload } from "../mappers/build-create-payload";
import type { LineState } from "../domain/return-calculations";
import { validateReturnSelection } from "../domain/return-validation";

export class ReturnReceiptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReturnReceiptValidationError";
  }
}

interface CreateReturnReceiptArgs {
  repository: Pick<ReturnRepository, "initReceipt" | "createReceipt">;
  order: OutputSaleRes | null;
  returnableDetails: OutputSaleDetailRes[];
  lines: Record<number, LineState>;
  refundId: number;
  note: string;
}

export interface CreateReturnReceiptResult {
  inputSaleId: string;
}

export async function createReturnReceipt({
  repository,
  order,
  returnableDetails,
  lines,
  refundId,
  note,
}: CreateReturnReceiptArgs): Promise<CreateReturnReceiptResult> {
  if (!order) {
    throw new ReturnReceiptValidationError("Không có đơn hàng để tạo phiếu nhập trả.");
  }

  const selection = validateReturnSelection(returnableDetails, lines);
  if (!selection.ok) {
    throw new ReturnReceiptValidationError(selection.message ?? "Dữ liệu nhập trả không hợp lệ.");
  }

  const init = await repository.initReceipt();
  const body = buildCreateReturnPayload({
    init,
    order,
    selected: selection.selected,
    lines,
    refundId,
    note,
  });
  const result = await repository.createReceipt(body);

  return {
    inputSaleId: result?.InputSaleId ?? "",
  };
}
