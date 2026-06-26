"use client";

// ============================================================================
// Lớp gọi API cho chức năng Nhập trả (Input Sale).
// Mỗi hàm ánh xạ 1-1 tới một endpoint backend SCA đã được xác minh trong source:
//   - InputSale:      CoC.Business.SCA/Implement/SCM/InputSaleService.cs
//   - OutputSale:     CoC.Business.SCA/Implement/SCM/OutputSaleService.cs
//   - OutputFastSale: CoC.Business.SCA/Implement/SCM/OutputFastSaleService.cs
//   - Mdm:            CoC.Business.SCA/Configurations/ApiEndPoint.cs
// ============================================================================

import { useMemo } from "react";
import { useApiClient, useAuth } from "@/lib/di/app-runtime";
import type { ApiClient } from "@/lib/api/create-api-client";
import { getCachedMaster } from "./master-cache";
import type {
  InputSaleInitRes,
  InputSaleCreateRes,
  InputSaleInsertReq,
  InputSaleSearchReq,
  InputSaleRes,
  InputSaleSearchOutputSaleReq,
  InputSaleSearchOutputSaleRes,
  InputSaleGetProductOfferReq,
  InputSaleProductOfferRes,
  InputSaleUpdateOsidReq,
  StatusOutputSale,
  PromotionReturnReceiptRes,
  OutputSaleReturnValidateRes,
  OutputSaleRefundReq,
  PaymentTypeRes,
  DeliveryTypeRes,
  PagingResponse,
} from "./types";

type QV = string | number | boolean | undefined | null;

function qs(params: Record<string, QV>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

// Base path của từng resource (khớp ApiEndPoint.cs)
const INPUT_SALE = "/api/InputSales/";
const OUTPUT_SALE = "/api/OutputSales/";
const OUTPUT_FAST_SALE = "/api/OutputFastSales/";
const PAYMENT_TYPE = "/api/Mdm/PaymentType/";
const STORE_PAYMENT_TYPE = "/api/Mdm/StorePaymentTypes/";
const DELIVERY_TYPE = "/api/Mdm/DeliveryType/";

type MasterCacheFn = typeof getCachedMaster;

export interface ReturnApi {
  init: () => Promise<InputSaleInitRes>;
  create: (body: InputSaleInsertReq) => Promise<InputSaleCreateRes>;
  search: (body: InputSaleSearchReq) => Promise<PagingResponse<InputSaleRes>>;
  readByInputSaleId: (inputSaleId: string) => Promise<unknown>;
  readById: (id: number) => Promise<unknown>;
  getProductOffer: (body: InputSaleGetProductOfferReq) => Promise<InputSaleProductOfferRes[]>;
  updateOutputSale: (body: InputSaleUpdateOsidReq) => Promise<boolean>;
  searchOutputSale: (
    body: InputSaleSearchOutputSaleReq
  ) => Promise<PagingResponse<InputSaleSearchOutputSaleRes>>;
  readByReturnInputCode: (returnInputCode: string) => Promise<StatusOutputSale>;
  promotionReturnReceipt: (osid: number) => Promise<PromotionReturnReceiptRes>;
  reOutputByISID: (ISID: number) => Promise<unknown>;
  createRefund: (body: OutputSaleRefundReq) => Promise<boolean>;
  getOutputSaleAddress: (OSID: number) => Promise<unknown>;
  compensationOrderAutoCreate: (body: {
    OSID: number;
    OFSID: number;
    ISID: number;
  }) => Promise<boolean>;
  returnValidate: (OFSID: number) => Promise<OutputSaleReturnValidateRes>;
  getPaymentTypes: () => Promise<PaymentTypeRes[]>;
  getStorePaymentTypes: () => Promise<PaymentTypeRes[]>;
  getDeliveryTypes: () => Promise<DeliveryTypeRes[]>;
}

interface CreateReturnApiDeps {
  apiClient: ApiClient;
  getToken: () => string | null;
  cacheMaster?: MasterCacheFn;
}

export function createReturnApi({
  apiClient,
  getToken,
  cacheMaster = getCachedMaster,
}: CreateReturnApiDeps): ReturnApi {
  const { request } = apiClient;
  const post = <TRes, TReq>(path: string, body: TReq) =>
    request<TRes>(path, { method: "POST", body: JSON.stringify(body) });

  return {
    // ===================== InputSale (8 API) =====================
    /** [GET] Init — lấy mã phiếu nhập trả mới */
    init: () => request<InputSaleInitRes>(`${INPUT_SALE}Init`),

    /** [POST] Create — tạo phiếu nhập trả */
    create: (body: InputSaleInsertReq) =>
      post<InputSaleCreateRes, InputSaleInsertReq>(`${INPUT_SALE}Create`, body),

    /** [POST] Search — tìm danh sách phiếu nhập trả (phân trang) */
    search: (body: InputSaleSearchReq) =>
      post<PagingResponse<InputSaleRes>, InputSaleSearchReq>(`${INPUT_SALE}Search`, body),

    /** [GET] ReadByInputSaleID — đọc chi tiết theo mã phiếu (string) */
    readByInputSaleId: (inputSaleId: string) =>
      request(`${INPUT_SALE}ReadByInputSaleID${qs({ inputSaleId })}`),

    /** [GET] ReadByID — đọc chi tiết theo ISID (int) */
    readById: (id: number) => request(`${INPUT_SALE}${qs({ id })}`),

    /** [POST] GetProductOffer — sản phẩm khuyến mãi/quà tặng kèm */
    getProductOffer: (body: InputSaleGetProductOfferReq) =>
      post<InputSaleProductOfferRes[], InputSaleGetProductOfferReq>(
        `${INPUT_SALE}GetProductOffer`,
        body
      ),

    /** [POST] UpdateOutputSale — gán/cập nhật đơn bán cho phiếu */
    updateOutputSale: (body: InputSaleUpdateOsidReq) =>
      post<boolean, InputSaleUpdateOsidReq>(`${INPUT_SALE}UpdateOutputSale`, body),

    /** [POST] SearchOutputSale — tìm đơn bán để chọn nhập trả */
    searchOutputSale: (body: InputSaleSearchOutputSaleReq) =>
      post<PagingResponse<InputSaleSearchOutputSaleRes>, InputSaleSearchOutputSaleReq>(
        `${INPUT_SALE}SearchOutputSale`,
        body
      ),

    // ===================== OutputSale (phụ trợ) =====================
    /** [GET] ReadByReturnInputCode — NẠP TOÀN BỘ đơn để nhập trả (master) */
    readByReturnInputCode: (returnInputCode: string) =>
      request<StatusOutputSale>(
        `${OUTPUT_SALE}ReadByReturnInputCode${qs({ returnInputCode })}`
      ),

    /** [GET] PromotionDisplayReturnReceiptReadDetail — thông tin đền khuyến mãi */
    promotionReturnReceipt: (osid: number) =>
      request<PromotionReturnReceiptRes>(
        `${OUTPUT_SALE}PromotionDisplayReturnReceiptReadDetail${qs({ osid })}`
      ),

    /** [GET] ReOutputByISID — đọc lại đơn xuất theo ISID */
    reOutputByISID: (ISID: number) =>
      request(`${OUTPUT_SALE}ReOutputByISID${qs({ ISID })}`),

    /** [POST] CreateOutputSaleRefund — tạo hoàn tiền */
    createRefund: (body: OutputSaleRefundReq) =>
      post<boolean, OutputSaleRefundReq>(`${OUTPUT_SALE}CreateOutputSaleRefund`, body),

    /** [GET] GetOutputSaleAddress — địa chỉ giao của đơn */
    getOutputSaleAddress: (OSID: number) =>
      request(`${OUTPUT_SALE}GetOutputSaleAddress${qs({ OSID })}`),

    /** [POST] CompensationOrderAutoCreate — tự tạo đơn đền khuyến mãi */
    compensationOrderAutoCreate: (body: { OSID: number; OFSID: number; ISID: number }) =>
      post<boolean, { OSID: number; OFSID: number; ISID: number }>(
        `${OUTPUT_SALE}CompensationOrderAutoCreate`,
        body
      ),

    // ===================== OutputFastSale =====================
    /** [GET] OutputSaleReturnValidate — validate trả + cờ có video */
    returnValidate: (OFSID: number) =>
      request<OutputSaleReturnValidateRes>(
        `${OUTPUT_FAST_SALE}OutputSaleReturnValidate${qs({ OFSID })}`
      ),

    // ===================== Master data (có cache theo phiên đăng nhập) =====================
    /** [GET] PaymentType — danh sách phương thức thanh toán/hoàn tiền */
    getPaymentTypes: () =>
      cacheMaster<PaymentTypeRes[]>("paymentTypes", getToken(), () =>
        request<PaymentTypeRes[]>(`${PAYMENT_TYPE}`)
      ),

    /** [GET] StorePaymentTypes — phương thức thanh toán theo cửa hàng */
    getStorePaymentTypes: () =>
      cacheMaster<PaymentTypeRes[]>("storePaymentTypes", getToken(), () =>
        request<PaymentTypeRes[]>(`${STORE_PAYMENT_TYPE}`)
      ),

    /** [GET] DeliveryType — danh sách loại giao hàng (để map tên từ DeliveryTypeID) */
    getDeliveryTypes: () =>
      cacheMaster<DeliveryTypeRes[]>("deliveryTypes", getToken(), () =>
        request<DeliveryTypeRes[]>(`${DELIVERY_TYPE}`)
      ),
  };
}

export function useReturnApi() {
  const apiClient = useApiClient();
  const { token } = useAuth();

  return useMemo(
    () =>
      createReturnApi({
        apiClient,
        getToken: () => token,
      }),
    [apiClient, token]
  );
}
