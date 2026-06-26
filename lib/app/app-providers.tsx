"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/lib/auth/auth-gate";
import { TokenProvider } from "@/lib/auth/token-provider";
import { AppRuntimeProvider } from "@/lib/di/app-runtime";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TokenProvider>
      <AppRuntimeProvider>
        <AuthGate>{children}</AuthGate>
      </AppRuntimeProvider>
    </TokenProvider>
  );
}
