import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/lib/app/app-providers";

export const metadata: Metadata = {
  title: { default: "Con Cưng SCA", template: "%s | Con Cưng SCA" },
  description: "Hệ thống quản lý nhập trả hàng — Con Cưng SCA",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      {/* suppressHydrationWarning: trình duyệt mở rộng (vd Bitdefender) chèn
          attribute như bis_register/__processed_* vào <body> trước khi React
          hydrate, gây mismatch giả. Chỉ suppress đúng một cấp tại <body>. */}
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
