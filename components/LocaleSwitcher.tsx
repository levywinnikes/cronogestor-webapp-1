"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";

const locales = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale =
    locales.find((l) => l.code === i18n.language) || locales[0];

  const handleChangeLocale = (locale: string) => {
    i18n.changeLanguage(locale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/30"
      >
        <span className="text-lg" suppressHydrationWarning>{currentLocale.flag}</span>
        <span className="hidden sm:inline" suppressHydrationWarning>{currentLocale.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[160px]">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleChangeLocale(locale.code)}
              className={`w-full px-4 py-3 text-sm font-medium flex items-center gap-2 transition-all ${
                i18n.language === locale.code
                  ? "bg-[#002f5c] text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{locale.flag}</span>
              <span>{locale.label}</span>
              {i18n.language === locale.code && (
                <span className="ml-auto text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
