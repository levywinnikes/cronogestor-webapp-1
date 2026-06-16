"use client";

import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@/lib/i18n/client";

type AppI18nProviderProps = {
  children: ReactNode;
};

// Global fetch interceptor to handle 401 Unauthorized responses and redirect to /login
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 401 && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    return response;
  };
}

export function AppI18nProvider({ children }: AppI18nProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
