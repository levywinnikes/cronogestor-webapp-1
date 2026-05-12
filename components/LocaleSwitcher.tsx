"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const { i18n } = useTranslation();

  const currentLocale = i18n.language;
  const isPortuguese = currentLocale.startsWith("pt");

  const handleChangeLocale = (locale: string) => {
    i18n.changeLanguage(locale);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={currentLocale}
        onChange={(e) => handleChangeLocale(e.target.value)}
        className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002f5c]/20 cursor-pointer"
      >
        <option value="pt-BR">🇧🇷 Português (Brasil)</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
}
