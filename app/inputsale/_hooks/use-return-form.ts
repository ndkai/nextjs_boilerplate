"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/di/app-runtime";
import { clearMasterCache } from "../_lib/cache/master-cache";
import { useReturnRepository } from "../_lib/repository";
import type {
  OutputSaleRes,
  OutputSaleDetailRes,
  PromotionReturnReceiptRes,
  OutputSaleReturnValidateRes,
  PaymentTypeRes,
  DeliveryTypeRes,
} from "../_lib/types";
import {
  buildInitLines,
  calcSummary,
  filterProductDetails,
  findByBarcode,
  getReturnableDetails,
  type LineState,
} from "../_lib/domain/return-calculations";
import { createReturnReceipt } from "../_lib/use-cases/create-return-receipt";

declare global {
  interface Window {
    __POS_ORDER_CODE__?: string;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/** Đọc mã đơn POS bơm kèm để tự nạp data khi mở màn hình */
function usePosOrderCode(): string | null {
  const [orderCode] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const urlCode = new URLSearchParams(window.location.search).get("code");
    return window.__POS_ORDER_CODE__ ?? urlCode ?? null;
  });
  return orderCode;
}

export function useReturnForm() {
  const { token } = useAuth();
  const orderCode = usePosOrderCode();
  const repository = useReturnRepository();

  const [code, setCode] = useState("ONL123456789");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [order, setOrder] = useState<OutputSaleRes | null>(null);
  const [validate, setValidate] = useState<OutputSaleReturnValidateRes | null>(null);
  const [promo, setPromo] = useState<PromotionReturnReceiptRes | null>(null);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeRes[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryTypeRes[]>([]);
  const [refundId, setRefundId] = useState<number>(0);
  const [note, setNote] = useState("");

  const [lines, setLines] = useState<Record<number, LineState>>({});
  const [creating, setCreating] = useState(false);
  const [prodFilter, setProdFilter] = useState("");
  const [flashPid, setFlashPid] = useState<number | null>(null);

  const returnableDetails = useMemo<OutputSaleDetailRes[]>(
    () => getReturnableDetails(order?.OutputSaleDetail),
    [order]
  );

  const visibleDetails = useMemo(
    () => filterProductDetails(returnableDetails, prodFilter),
    [returnableDetails, prodFilter]
  );

  const applyOrder = useCallback((os: OutputSaleRes) => {
    setOrder(os);
    if (os.PaymentTypeID) setRefundId(os.PaymentTypeID);
    setLines(buildInitLines(os.OutputSaleDetail ?? []));
  }, []);

  const handleSearch = useCallback(
    async (override?: string) => {
      const c = (override ?? code).trim();
      if (!c) return;
      if (override && override !== code) setCode(override);
      setLoading(true);
      setError(null);
      setInfo(null);
      setOrder(null);
      setValidate(null);
      setPromo(null);
      try {
        const os = await repository.loadOrderByReturnCode(c);
        if (!os) {
          setError("Không tìm thấy đơn hàng tương ứng với mã đã nhập.");
          return;
        }
        applyOrder(os);
        if (os.OFSID) repository.loadReturnValidation(os.OFSID).then(setValidate).catch(() => {});
        if (os.OSID) repository.loadPromotionReturnReceipt(os.OSID).then(setPromo).catch(() => {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi tải đơn hàng.");
      } finally {
        setLoading(false);
      }
    },
    [repository, code, applyOrder]
  );

  // Tự tìm đơn khi POS bơm sẵn orderCode
  const autoSearchedRef = useRef(false);
  useEffect(() => {
    if (autoSearchedRef.current) return;
    if (token && orderCode) {
      autoSearchedRef.current = true;
      const timer = window.setTimeout(() => {
        void handleSearch(orderCode);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [token, orderCode, handleSearch]);

  const loadMasterData = useCallback(() => {
    repository
      .loadPaymentTypes()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setPaymentTypes(arr);
        if (arr.length) setRefundId((cur) => (cur ? cur : arr[0].PaymentTypeID));
      })
      .catch(() => {});
    repository
      .loadDeliveryTypes()
      .then((list) => setDeliveryTypes(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, [repository]);

  useEffect(() => {
    if (!token) return;
    loadMasterData();
  }, [token, loadMasterData]);

  const handleClearCache = useCallback(() => {
    clearMasterCache();
    setError(null);
    loadMasterData();
    setInfo("Đã xóa cache master data và nạp lại từ server.");
  }, [loadMasterData]);

  const setQty = useCallback((d: OutputSaleDetailRes, q: number) => {
    const clamped = Math.max(0, Math.min(d.QuantityCanInput, q));
    setLines((prev) => ({ ...prev, [d.Pid]: { ...prev[d.Pid], qty: clamped } }));
  }, []);

  const toggle = useCallback((d: OutputSaleDetailRes, on: boolean) => {
    setLines((prev) => ({ ...prev, [d.Pid]: { ...prev[d.Pid], selected: on } }));
  }, []);

  const summary = useMemo(
    () => calcSummary(returnableDetails, lines),
    [returnableDetails, lines]
  );

  const promoTotal = useMemo(() => {
    if (!promo) return 0;
    const p = (promo.Promotions ?? []).reduce((s, x) => s + (x.DiscountAmount ?? 0), 0);
    const v = (promo.EVouchers ?? []).reduce((s, x) => s + (x.Amount ?? 0), 0);
    return p + v;
  }, [promo]);

  const comboForced = returnableDetails.some((d) => d.IsReturnWithCombo);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);
    setInfo(null);
    try {
      const result = await createReturnReceipt({
        repository,
        order,
        returnableDetails,
        lines,
        refundId,
        note,
      });
      setInfo(`Đã tạo phiếu nhập trả thành công${result.inputSaleId ? `: ${result.inputSaleId}` : ""}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo phiếu nhập trả thất bại.");
    } finally {
      setCreating(false);
    }
  }, [repository, order, returnableDetails, lines, refundId, note]);

  const processScan = useCallback(
    (raw: string) => {
      const codeStr = raw.trim();
      if (!codeStr || !order) return;
      const match = findByBarcode(codeStr, returnableDetails);
      if (!match) {
        setError(`Không tìm thấy sản phẩm "${codeStr}" trong đơn (hoặc đã trả đủ).`);
        setInfo(null);
        return;
      }
      setLines((prev) => {
        const cur = prev[match.Pid] ?? { qty: 0, selected: false };
        const nextQty = Math.min(match.QuantityCanInput, (cur.qty || 0) + 1);
        return { ...prev, [match.Pid]: { qty: nextQty, selected: true } };
      });
      setProdFilter("");
      setFlashPid(match.Pid);
      setError(null);
      setInfo(`Đã quét: ${match.ProductName} (+1)`);
      requestAnimationFrame(() =>
        document.getElementById(`isr-row-${match.Pid}`)?.scrollIntoView({ block: "nearest" })
      );
    },
    [order, returnableDetails]
  );

  // Tắt flash sau 1.2s
  useEffect(() => {
    if (flashPid == null) return;
    const t = setTimeout(() => setFlashPid(null), 1200);
    return () => clearTimeout(t);
  }, [flashPid]);

  const reset = useCallback(() => {
    setOrder(null);
    setInfo(null);
    setError(null);
  }, []);

  // Labels hiển thị
  const deliveryTypeName = order?.DeliveryTypeID
    ? deliveryTypes.find((d) => d.DeliveryTypeID === order.DeliveryTypeID)?.DeliveryTypeName
    : undefined;
  const deliveryLabel = order
    ? promo?.DeliveryFullName || deliveryTypeName || (order.DeliveryTypeID ? `Giao hàng (ID: ${order.DeliveryTypeID})` : "—")
    : "—";
  const paymentLabel = order
    ? promo?.PaymentTypeName ||
      paymentTypes.find((p) => p.PaymentTypeID === order.PaymentTypeID)?.PaymentTypeName ||
      (order.PaymentTypeID ? `Mã ${order.PaymentTypeID}` : "—")
    : "—";

  return {
    code, setCode,
    loading,
    error, setError,
    info, setInfo,
    order, setOrder,
    validate, promo,
    paymentTypes, deliveryTypes,
    refundId, setRefundId,
    note, setNote,
    lines,
    creating,
    prodFilter, setProdFilter,
    flashPid,
    returnableDetails, visibleDetails,
    summary, promoTotal, comboForced,
    deliveryLabel, paymentLabel,
    handleSearch, handleClearCache,
    setQty, toggle, handleCreate, processScan, reset,
  };
}
