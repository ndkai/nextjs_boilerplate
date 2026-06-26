import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TokenProvider } from "@/lib/auth/token-provider";
import { AuthGate }     from "@/lib/auth/auth-gate";

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
      <body className="min-h-full flex flex-col antialiased">
        <TokenProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </TokenProvider>
      </body>
    </html>
  );
}
