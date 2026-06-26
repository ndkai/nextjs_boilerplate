"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToken } from "../_lib/token-provider";
import { useReturnApi } from "../_lib/api";
import { clearMasterCache } from "../_lib/master-cache";
import type {
  OutputSaleRes,
  OutputSaleDetailRes,
  PromotionReturnReceiptRes,
  OutputSaleReturnValidateRes,
  PaymentTypeRes,
  DeliveryTypeRes,
  InputSaleInsertReq,
  InputSaleDetailInsertReq,
} from "../_lib/types";

declare global {
  interface Window {
    __POS_ORDER_CODE__?: string;
  }
}

export interface LineState {
  qty: number;
  selected: boolean;
}

// ── Pure helpers (exported for unit testing) ──────────────────────────────────

/** Khởi tạo trạng thái dòng từ danh sách sản phẩm.
 *  Combo bắt buộc → chọn sẵn + đủ số lượng. Còn lại → chưa chọn, SL 0. */
export function buildInitLines(details: OutputSaleDetailRes[]): Record<number, LineState> {
  const result: Record<number, LineState> = {};
  for (const d of details) {
    if (d.QuantityCanInput > 0) {
      result[d.Pid] = d.IsReturnWithCombo
        ? { qty: d.QuantityCanInput, selected: true }
        : { qty: 0, selected: false };
    }
  }
  return result;
}

/** Tính tổng tiền / số SP / số lượng từ các dòng đã chọn. */
export function calcSummary(
  details: OutputSaleDetailRes[],
  lines: Record<number, LineState>
) {
  let total = 0;
  let qtySum = 0;
  let prodCount = 0;
  for (const d of details) {
    const ls = lines[d.Pid];
    if (!ls?.selected) continue;
    prodCount += 1;
    qtySum += ls.qty;
    total += ls.qty * (d.SalePriceVat ?? 0);
  }
  return { total, qtySum, prodCount };
}

/** Tìm sản phẩm trong đơn theo mã quét: ưu tiên khớp chính xác SKU/ProductId, sau đó khớp gần đúng. */
export function findByBarcode(
  codeStr: string,
  details: OutputSaleDetailRes[]
): OutputSaleDetailRes | undefined {
  const norm = codeStr.trim().toLowerCase();
  if (!norm) return undefined;
  const exact = details.find(
    (d) =>
      d.ReferenceId?.toLowerCase() === norm ||
      d.ProductId?.toLowerCase() === norm
  );
  return (
    exact ??
    details.find(
      (d) =>
        d.ReferenceId?.toLowerCase().includes(norm) ||
        d.ProductId?.toLowerCase().includes(norm) ||
        d.ProductName?.toLowerCase().includes(norm)
    )
  );
}

// ── Demo order (exported for testing) ────────────────────────────────────────

export const DEMO_ORDER: OutputSaleRes = {
  OSID: 1001,
  OutputSaleID: "ONL123456789",
  ReturnInputCode: "RT-DEMO-001",
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
  const { token } = useToken();
  const orderCode = usePosOrderCode();
  const api = useReturnApi();

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
    () => (order?.OutputSaleDetail ?? []).filter((d) => d.QuantityCanInput > 0),
    [order]
  );

  const visibleDetails = useMemo(() => {
    const kw = prodFilter.trim().toLowerCase();
    if (!kw) return returnableDetails;
    return returnableDetails.filter(
      (d) =>
        d.ProductName?.toLowerCase().includes(kw) ||
        d.ProductId?.toLowerCase().includes(kw) ||
        d.ReferenceId?.toLowerCase().includes(kw)
    );
  }, [returnableDetails, prodFilter]);

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
        const status = await api.readByReturnInputCode(c);
        const os = status?.OutSale;
        if (!os) {
          setError("Không tìm thấy đơn hàng tương ứng với mã đã nhập.");
          return;
        }
        applyOrder(os);
        if (os.OFSID) api.returnValidate(os.OFSID).then(setValidate).catch(() => {});
        if (os.OSID) api.promotionReturnReceipt(os.OSID).then(setPromo).catch(() => {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi tải đơn hàng.");
      } finally {
        setLoading(false);
      }
    },
    [api, code, applyOrder]
  );

  const loadDemo = useCallback(() => {
    setError(null);
    setInfo("Đã nạp đơn DEMO. Quét/nhập SKU 345678 rồi Enter để thấy SL trả tăng (123456/234567 là combo bắt buộc trả, đã khoá).");
    setValidate({ IsFullReturnOutputSale: false, IsHasReturnVideo: true });
    setPromo(null);
    applyOrder(DEMO_ORDER);
  }, [applyOrder]);

  // Tự tìm đơn khi POS bơm sẵn orderCode
  const autoSearchedRef = useRef(false);
  useEffect(() => {
    if (autoSearchedRef.current) return;
    if (token && orderCode) {
      autoSearchedRef.current = true;
      handleSearch(orderCode);
    }
  }, [token, orderCode, handleSearch]);

  const loadMasterData = useCallback(() => {
    api
      .getPaymentTypes()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setPaymentTypes(arr);
        if (arr.length) setRefundId((cur) => (cur ? cur : arr[0].PaymentTypeID));
      })
      .catch(() => {});
    api
      .getDeliveryTypes()
      .then((list) => setDeliveryTypes(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, [api]);

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
    if (!order) return;
    const selected = returnableDetails.filter(
      (d) => lines[d.Pid]?.selected && lines[d.Pid].qty > 0
    );
    if (!selected.length) {
      setError("Vui lòng chọn ít nhất một sản phẩm để nhập trả.");
      return;
    }
    setCreating(true);
    setError(null);
    setInfo(null);
    try {
      const init = await api.init();
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
      const totalTax = selected.reduce(
        (s, d) => s + (d.TaxAmount ?? 0) * lines[d.Pid].qty,
        0
      );
      const body: InputSaleInsertReq = {
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
      const res = await api.create(body);
      const newCode =
        res && typeof res === "object" && "InputSaleId" in res
          ? (res as { InputSaleId: string }).InputSaleId
          : "";
      setInfo(`Đã tạo phiếu nhập trả thành công${newCode ? `: ${newCode}` : ""}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo phiếu nhập trả thất bại.");
    } finally {
      setCreating(false);
    }
  }, [api, order, returnableDetails, lines, refundId, summary, note]);

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
    handleSearch, loadDemo, handleClearCache,
    setQty, toggle, handleCreate, processScan, reset,
  };
}
