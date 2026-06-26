// ============================================================================
// Kiểu dữ liệu (DTO) ánh xạ 1-1 từ backend SCA (.NET, Newtonsoft => PascalCase)
// Nguồn: CoC.Business.DTO.SCA/* và CoC.Business.SCA/Configurations/ApiEndPoint.cs
// ============================================================================

/** Bao bọc phân trang (Core.DTO.Response.PagingResponse<T>) — shape phòng thủ */
export interface PagingResponse<T> {
  Data?: T[];
  Items?: T[];
  Results?: T[];
  TotalRecord?: number;
  TotalRecords?: number;
}

// ---------------------------------------------------------------------------
// OutputSale (đơn bán gốc để nhập trả)
// ---------------------------------------------------------------------------

/** Dòng sản phẩm trong đơn bán — chứa số lượng đã mua / đã trả / còn trả */
export interface OutputSaleDetailRes {
  OutputSaleDetailId: number;
  Osid: number;
  OutputSaleId: string;
  OutputStoreId: number;
  OutputTypeId: number;
  Pid: number;
  ProductId: string;
  ReferenceId: string;
  ManagerCode: string;
  IsCombo: boolean;
  IsGift: boolean;
  Quantity?: number;
  Vat: number;
  VatPercent: number;
  SalePriceVat?: number;
  SalePriceBfvat?: number;
  TaxAmount?: number;
  PriceAmount?: number;
  /** Đã mua */
  OutputQuantity: number;
  /** Đã trả */
  InputQuantity: number;
  /** Còn trả */
  QuantityCanInput: number;
  ProductName: string;
  CategoryId: number;
  OutputTypeName: string;
  ComboID: string;
  ComboName: string;
  ComboQuantity: number;
  PromotionTypeID?: number;
  /** Combo bắt buộc trả toàn bộ */
  IsReturnWithCombo: boolean;
}

/** Thông tin đơn bán (OutputSaleRes) */
export interface OutputSaleRes {
  OSID: number;
  OutputSaleID: string;
  ReturnInputCode: string;
  OutputTypeID?: number;
  OutputStoreID?: number;
  CustomerID?: number;
  CustomerName: string;
  CustomerAddress: string;
  CustomerPhone: string;
  CustomerEmail: string;
  TotalQuantity?: number;
  TotalTaxAmount?: number;
  TotalAmount?: number;
  CurrencyUnitID?: number;
  CurrencyExchange?: number;
  IsPaymented: boolean;
  Description: string;
  DeliveryTypeID?: number;
  CreatedDate: string;
  PaymentTypeID: number;
  OutputTypeName: string;
  OFSID: number;
  OutputSaleDetail?: OutputSaleDetailRes[];
}

/** Kết quả ReadByReturnInputCode: ErrorCode + đơn bán */
export interface StatusOutputSale {
  ErrorCode: number;
  OutSale: OutputSaleRes;
}

/** Validate điều kiện trả + cờ có video (OutputFastSale) */
export interface OutputSaleReturnValidateRes {
  IsFullReturnOutputSale: boolean;
  IsHasReturnVideo: boolean;
}

// ---------------------------------------------------------------------------
// Đền khuyến mãi khi trả (PromotionDisplayReturnReceiptReadDetail)
// ---------------------------------------------------------------------------

export interface OutputSalePromotionInfoRes {
  PromotionID?: number;
  PromotionNo: string;
  PromotionName: string;
  PID?: number;
  ProductID: string;
  ProductName: string;
  TypeID: number;
  TypeName: string;
  ComboID: string;
  ComboName: string;
  DiscountAmount?: number;
  Quantity?: number;
}

export interface OutputSaleEVoucherInfoRes {
  OSEVID: number;
  PID: number;
  ProductID: string;
  ProductName: string;
  Amount?: number;
}

export interface PromotionReturnReceiptRes {
  OSID: number;
  OutputSaleID: string;
  OFSID: number;
  TotalAmount: number;
  PaymentTypeName: string;
  DeliveryFullName: string;
  Promotions?: OutputSalePromotionInfoRes[];
  EVouchers?: OutputSaleEVoucherInfoRes[];
}

// ---------------------------------------------------------------------------
// Master data
// ---------------------------------------------------------------------------

export interface PaymentTypeRes {
  PaymentTypeID: number;
  PaymentTypeName: string;
  IsDebtAllowed?: boolean;
  IsActived?: boolean;
}

export interface DeliveryTypeRes {
  DeliveryTypeID: number;
  DeliveryTypeName: string;
  Description?: string;
  IsActived?: boolean;
}

// ---------------------------------------------------------------------------
// InputSale (phiếu nhập trả)
// ---------------------------------------------------------------------------

export interface InputSaleInitRes {
  Isid: number;
  InputSaleId: string;
}

export interface InputSaleCreateRes {
  InputSaleId: string;
  Isid: number;
  Status: number;
}

export interface InputSaleDetailInsertReq {
  Pid: number;
  ProductId: string;
  ReferenceId?: string;
  Quantity: number;
  Vat: number;
  VatPercent: number;
  SalePriceVat: number;
  Flag: number;
  OutputTypeId: number;
  ComboId?: string;
  ComboName?: string;
  ComboQuantity?: number;
  CategoryID?: number;
  PromotionID?: number;
  PromotionTypeID?: number;
}

export interface InputSaleInsertReq {
  Isid: number;
  InputSaleId: string;
  Osid: number;
  OutputSaleId: string;
  OutputStoreId: number;
  OutputTypeId: number;
  StoreId: number;
  CurrencyUnitId: number;
  CurrencyExchange: number;
  PaymentTypeId: number;
  TotalQuantity: number;
  TotalAmountBfvat: number;
  TotalTaxAmount: number;
  BonusPoint: number;
  CustomerId?: number;
  CustomerName?: string;
  CustomerAddress?: string;
  CustomerPhone?: string;
  Description?: string;
  InputTypeId: number;
  ProductDetail: InputSaleDetailInsertReq[];
}

export interface InputSaleSearchReq {
  InputStoreId: number;
  DateFrom: string;
  DateTo: string;
  Option: number;
  CustomerId: number;
  KeySearch: string;
  PageIndex: number;
  PageSize: number;
  TotalAmount: number;
}

export interface InputSaleRes {
  ISID: number;
  InputSaleID: string;
  OutputSaleID: string;
  CustomerName: string;
  TotalAmount?: number;
  TotalQuantity?: number;
  CreatedDate: string;
  TotalRecord: number;
}

export interface InputSaleSearchOutputSaleReq {
  PriceIn: number;
  PhoneIn: number;
  DateIn: string;
  KeySearch: string;
  PageIndex: number;
  PageSize: number;
}

export interface InputSaleSearchOutputSaleRes {
  OSID: number;
  OutputSaleID: string;
  TotalAmount?: number;
  CreatedDate: string;
  CustomerName: string;
  CustomerPhone: string;
  TotalRecord: number;
}

export interface InputSaleProductOfferRes {
  PidOfApply: number;
  PidOfOffer: number;
  Quantity: number;
  ProductId: string;
  IsGift: boolean;
  IsUsed: boolean;
  IsOnline: boolean;
  PromotionID: number;
}

export interface ProductOfferDetail {
  PID: number;
  PromotionID: number;
  ComboID: string;
}

export interface InputSaleGetProductOfferReq {
  OSID: number;
  ProductOfferDetails: ProductOfferDetail[];
}

export interface InputSaleUpdateOsidReq {
  Isid: number;
  OutputSaleId: string;
}

export interface OutputSaleRefundReq {
  OSID: number;
  OutputSaleID: string;
  RefundID: number;
  RefundAmount: number;
  CustomerPhone?: string;
}
