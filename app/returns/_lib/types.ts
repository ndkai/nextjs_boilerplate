export type ReturnStatus = "Hoàn thành" | "Đang xử lý" | "Hủy";

export interface ReturnRow {
  ISID: number;
  InputSaleID: string;
  OutputSaleID: string;
  CustomerName: string;
  TotalAmount?: number;
  TotalQuantity?: number;
  CreatedDate: string;
  TotalRecord: number;
  Status?: ReturnStatus;
}

export interface ReturnsSearchReq {
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

export interface PagingResponse<T> {
  Data?: T[];
  Items?: T[];
  Results?: T[];
  TotalRecord?: number;
  TotalRecords?: number;
}
