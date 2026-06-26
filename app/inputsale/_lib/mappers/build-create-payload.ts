import type {
  InputSaleDetailInsertReq,
  InputSaleInitRes,
  InputSaleInsertReq,
  OutputSaleDetailRes,
  OutputSaleRes,
} from "../types";
import { calcSummary, calcTotalTax, type LineState } from "../domain/return-calculations";

interface BuildCreatePayloadArgs {
  init: InputSaleInitRes;
  order: OutputSaleRes;
  selected: OutputSaleDetailRes[];
  lines: Record<number, LineState>;
  refundId: number;
  note: string;
}

export function buildCreateReturnPayload({
  init,
  order,
  selected,
  lines,
  refundId,
  note,
}: BuildCreatePayloadArgs): InputSaleInsertReq {
  const summary = calcSummary(selected, lines);
  const totalTax = calcTotalTax(selected, lines);
  const productDetail: InputSaleDetailInsertReq[] = selected.map((d) => ({
    Pid: d.Pid,
    ProductId: d.ProductId,
    ReferenceId: d.ReferenceId,
    Quantity: lines[d.Pid].qty,
    Vat: d.Vat,
    VatPercent: d.VatPercent,
    SalePriceVat: d.SalePriceVat ?? 0,
    Flag: 0,
    OutputTypeId: d.OutputTypeId,
    ComboId: d.ComboID,
    ComboName: d.ComboName,
    ComboQuantity: d.ComboQuantity,
    CategoryID: d.CategoryId,
    PromotionTypeID: d.PromotionTypeID,
  }));

  return {
    Isid: init?.Isid ?? 0,
    InputSaleId: init?.InputSaleId ?? "",
    Osid: order.OSID,
    OutputSaleId: order.OutputSaleID,
    OutputStoreId: order.OutputStoreID ?? 0,
    OutputTypeId: order.OutputTypeID ?? 0,
    StoreId: order.OutputStoreID ?? 0,
    CurrencyUnitId: order.CurrencyUnitID ?? 0,
    CurrencyExchange: order.CurrencyExchange ?? 1,
    PaymentTypeId: refundId,
    TotalQuantity: summary.qtySum,
    TotalAmountBfvat: summary.total - totalTax,
    TotalTaxAmount: totalTax,
    BonusPoint: 0,
    CustomerId: order.CustomerID,
    CustomerName: order.CustomerName,
    CustomerAddress: order.CustomerAddress,
    CustomerPhone: order.CustomerPhone,
    Description: note,
    InputTypeId: 0,
    ProductDetail: productDetail,
  };
}
