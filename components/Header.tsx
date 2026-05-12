"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Always redirect to login even when API logout fails on client.
    }

    router.push("/login");
  };

  return (
    <header className="bg-[#002f5c] shadow-md text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold">
            C
          </div>
          <h1 className="text-xl font-bold tracking-wide">Cronogestor</h1>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link
            href="/dashboard"
            className="text-sm text-blue-100 hover:text-white transition-colors hidden sm:block"
          >
            {t("nav.projects")}
          </Link>
          <Link
            href="/funcionarios"
            className="text-sm text-blue-100 hover:text-white transition-colors hidden sm:block"
          >
            {t("nav.employees")}
          </Link>
          <Link
            href="/ficha-tempo"
            className="text-sm text-blue-100 hover:text-white transition-colors hidden sm:block"
          >
            {t("timesheet.page.title")}
          </Link>
          <Link
            href="/feriados"
            className="text-sm text-blue-100 hover:text-white transition-colors hidden sm:block"
          >
            {t("nav.holidays")}
          </Link>
          <div className="hidden sm:block border-l border-blue-300/30"></div>
          <LocaleSwitcher />
          <button
            onClick={handleLogout}
            className="flex items-center text-blue-100 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            {t("nav.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
