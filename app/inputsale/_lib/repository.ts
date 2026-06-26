"use client";

import { useMemo } from "react";
import { useReturnApi, type ReturnApi } from "./api";
import type {
  DeliveryTypeRes,
  InputSaleCreateRes,
  InputSaleInitRes,
  InputSaleInsertReq,
  OutputSaleRes,
  OutputSaleReturnValidateRes,
  PaymentTypeRes,
  PromotionReturnReceiptRes,
} from "./types";

export interface ReturnRepository {
  loadOrderByReturnCode: (code: string) => Promise<OutputSaleRes | null>;
  loadReturnValidation: (ofsid: number) => Promise<OutputSaleReturnValidateRes>;
  loadPromotionReturnReceipt: (osid: number) => Promise<PromotionReturnReceiptRes>;
  loadPaymentTypes: () => Promise<PaymentTypeRes[]>;
  loadDeliveryTypes: () => Promise<DeliveryTypeRes[]>;
  initReceipt: () => Promise<InputSaleInitRes>;
  createReceipt: (body: InputSaleInsertReq) => Promise<InputSaleCreateRes>;
}

type ReturnRepositoryApi = Pick<
  ReturnApi,
  | "readByReturnInputCode"
  | "returnValidate"
  | "promotionReturnReceipt"
  | "getPaymentTypes"
  | "getDeliveryTypes"
  | "init"
  | "create"
>;

export function createReturnRepository(api: ReturnRepositoryApi): ReturnRepository {
  return {
    loadOrderByReturnCode: async (code) => {
      const status = await api.readByReturnInputCode(code);
      return status?.OutSale ?? null;
    },
    loadReturnValidation: (ofsid) => api.returnValidate(ofsid),
    loadPromotionReturnReceipt: (osid) => api.promotionReturnReceipt(osid),
    loadPaymentTypes: () => api.getPaymentTypes(),
    loadDeliveryTypes: () => api.getDeliveryTypes(),
    initReceipt: () => api.init(),
    createReceipt: (body) => api.create(body),
  };
}

export function useReturnRepository(): ReturnRepository {
  const api = useReturnApi();

  return useMemo(() => createReturnRepository(api), [api]);
}
