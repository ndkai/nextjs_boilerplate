import type { OutputSaleRes } from "../_lib/types";

export const TEST_ORDER: OutputSaleRes = {
  OSID: 1001,
  OutputSaleID: "ONL123456789",
  ReturnInputCode: "RT-TEST-001",
  OutputTypeName: "ONL",
  OutputStoreID: 17,
  CustomerID: 9,
  CustomerName: "Nguyễn Văn A",
  CustomerAddress: "123 Đường ABC, Q.1",
  CustomerPhone: "0999999999",
  CustomerEmail: "",
  TotalQuantity: 6,
  TotalAmount: 1690000,
  CurrencyUnitID: 1,
  CurrencyExchange: 1,
  IsPaymented: true,
  Description: "",
  DeliveryTypeID: 17,
  CreatedDate: "2024-06-03T09:45:00",
  PaymentTypeID: 0,
  OFSID: 0,
  OutputSaleDetail: [
    { OutputSaleDetailId: 1, Osid: 1001, OutputSaleId: "ONL123456789", OutputStoreId: 17, OutputTypeId: 1, Pid: 101, ProductId: "P-APTA2", ReferenceId: "123456", ManagerCode: "", IsCombo: true, IsGift: false, Vat: 0, VatPercent: 0, SalePriceVat: 760000, OutputQuantity: 2, InputQuantity: 0, QuantityCanInput: 2, ProductName: "Sữa bột Aptamil Úc số 2 900g", CategoryId: 1, OutputTypeName: "Bán", ComboID: "C1", ComboName: "Combo sữa+tã", ComboQuantity: 1, IsReturnWithCombo: true },
    { OutputSaleDetailId: 2, Osid: 1001, OutputSaleId: "ONL123456789", OutputStoreId: 17, OutputTypeId: 1, Pid: 102, ProductId: "P-HUGM", ReferenceId: "234567", ManagerCode: "", IsCombo: true, IsGift: false, Vat: 0, VatPercent: 0, SalePriceVat: 930000, OutputQuantity: 1, InputQuantity: 0, QuantityCanInput: 1, ProductName: "Tã quần Huggies Platinum size M 64 miếng", CategoryId: 1, OutputTypeName: "Bán", ComboID: "C1", ComboName: "Combo sữa+tã", ComboQuantity: 1, IsReturnWithCombo: true },
    { OutputSaleDetailId: 3, Osid: 1001, OutputSaleId: "ONL123456789", OutputStoreId: 17, OutputTypeId: 1, Pid: 103, ProductId: "P-WIPE", ReferenceId: "345678", ManagerCode: "", IsCombo: false, IsGift: false, Vat: 0, VatPercent: 0, SalePriceVat: 35000, OutputQuantity: 3, InputQuantity: 0, QuantityCanInput: 3, ProductName: "Khăn ướt Con Cưng không mùi 80 miếng", CategoryId: 2, OutputTypeName: "Bán", ComboID: "", ComboName: "", ComboQuantity: 0, IsReturnWithCombo: false },
  ],
};
