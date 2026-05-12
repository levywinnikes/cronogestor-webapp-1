"use client";

import { useTranslation } from "react-i18next";

export function RegisterHero() {
  const { t } = useTranslation();

  return (
    <>
      <header className="flex justify-center py-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-[var(--color-primary)] font-bold text-xl tracking-wide">
            {t("register.brand")}
          </span>
        </div>
      </header>

      <div className="bg-[var(--color-secondary)] text-white text-center py-3 px-4 rounded-xl shadow-md font-bold mb-8 flex justify-center items-center gap-2">
        <span>{t("register.offer")}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary)] text-center mb-12">
        {t("register.title")}
      </h1>
    </>
  );
}
