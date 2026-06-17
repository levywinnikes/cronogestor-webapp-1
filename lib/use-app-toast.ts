"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";

/**
 * Hook padronizado para feedback de operações (sucesso, erro, aviso, info).
 * Usar em todas as telas — nunca criar banners inline (bg-green-50 / bg-red-50).
 */
export function useAppToast() {
  const { t } = useTranslation();

  const success = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const error = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const warning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const info = useCallback((message: string) => {
    toast.info(message);
  }, []);

  const saved = useCallback(() => {
    toast.success(t("global.toast.saved"));
  }, [t]);

  const deleted = useCallback(() => {
    toast.success(t("global.toast.deleted"));
  }, [t]);

  const authRequired = useCallback(() => {
    toast.error(t("global.toast.authRequired"));
  }, [t]);

  const fromUnknownError = useCallback(
    (err: unknown, fallbackKey: string) => {
      const message = err instanceof Error ? err.message : t(fallbackKey);
      toast.error(message);
    },
    [t],
  );

  return {
    success,
    error,
    warning,
    info,
    saved,
    deleted,
    authRequired,
    fromUnknownError,
  };
}
