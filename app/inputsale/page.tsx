"use client";

import { useReturnForm } from "./_hooks/use-return-form";
import { useBarcodeScanner } from "./_hooks/use-barcode-scan";
import { useKeyboardShortcuts } from "./_hooks/use-keyboard-shortcuts";
import { InputSaleHeader } from "./_components/input-sale-header";
import { InfoStrip }       from "./_components/info-strip";
import { ProductTable }    from "./_components/product-table";
import { Sidebar }         from "./_components/sidebar";
import { FooterBar }       from "./_components/footer-bar";

export default function InputSalePage() {
  const form = useReturnForm();

  useBarcodeScanner(!!form.order, form.processScan);

  useKeyboardShortcuts({
    onF2: () => document.querySelector<HTMLInputElement>(".isr-search-input")?.focus(),
    onF3: () => document.querySelector<HTMLInputElement>(".isr-prod-search")?.focus(),
    onF5: () => { if (form.order && !form.creating && form.summary.prodCount > 0) form.handleCreate(); },
    onEsc: form.reset,
  });

  return (
    <div className="isr-root">
      <div className="isr-window">

        <InputSaleHeader onClearCache={form.handleClearCache} />

        {form.loading && <div className="isr-banner loading">⏳ Đang tải dữ liệu đơn hàng...</div>}
        {form.error  && <div className="isr-banner error">⚠️ {form.error}</div>}
        {form.info   && <div className="isr-banner info">✅ {form.info}</div>}

        <InfoStrip
          order={form.order}
          code={form.code}
          loading={form.loading}
          paymentLabel={form.paymentLabel}
          deliveryLabel={form.deliveryLabel}
          onCodeChange={form.setCode}
          onSearch={() => form.handleSearch()}
          onDemo={form.loadDemo}
        />

        <div className="isr-main">
          <ProductTable
            order={form.order}
            visibleDetails={form.visibleDetails}
            lines={form.lines}
            prodFilter={form.prodFilter}
            flashPid={form.flashPid}
            comboForced={form.comboForced}
            selectedCount={form.summary.prodCount}
            refundTotal={form.summary.total}
            refundId={form.refundId}
            paymentTypes={form.paymentTypes}
            currentPaymentTypeId={form.order?.PaymentTypeID}
            onFilterChange={form.setProdFilter}
            onScan={form.processScan}
            onToggle={form.toggle}
            onSetQty={form.setQty}
            onRefundChange={form.setRefundId}
          />

          <Sidebar
            summary={form.summary}
            promo={form.promo}
            promoTotal={form.promoTotal}
            validate={form.validate}
            note={form.note}
            onNoteChange={form.setNote}
          />
        </div>

        <FooterBar
          order={form.order}
          creating={form.creating}
          prodCount={form.summary.prodCount}
          onCancel={form.reset}
          onCreate={form.handleCreate}
        />

      </div>
    </div>
  );
}
