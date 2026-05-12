"use client";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ptBrCommon from "@/locales/pt-BR/common.json";
import enCommon from "@/locales/en/common.json";

const resources = {
  "pt-BR": { common: ptBrCommon },
  en: { common: enCommon },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "pt-BR",
      supportedLngs: ["pt-BR", "en"],
      defaultNS: "common",
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["querystring", "localStorage", "navigator"],
        caches: ["localStorage"],
      },
    });
}

export { i18n };
