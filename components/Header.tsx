"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { authService } from "@/app/services/auth.service";
import { LocaleSwitcher } from "./LocaleSwitcher";

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "nav.projects" },
  { href: "/funcionarios", labelKey: "nav.employees" },
  { href: "/ficha-tempo", labelKey: "timesheet.page.title" },
  { href: "/feriados", labelKey: "nav.holidays" },
] as const;

export function Header() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Always redirect to login even when API logout fails on client.
    }
    router.push("/login");
  };

  return (
    <header className="bg-primary shadow-md text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold">
            C
          </div>
          <h1 className="text-xl font-bold tracking-wide">Cronogestor</h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center space-x-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              <span suppressHydrationWarning>{t(link.labelKey)}</span>
            </Link>
          ))}
          <div className="border-l border-blue-300/30 h-5" />
          <LocaleSwitcher />
          <button
            onClick={handleLogout}
            className="flex items-center text-blue-100 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span suppressHydrationWarning>{t("nav.logout")}</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="sm:hidden bg-primary-700 border-t border-white/10 animate-in slide-in-from-top">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <span suppressHydrationWarning>{t(link.labelKey)}</span>
              </Link>
            ))}
            <div className="border-t border-white/10 my-2" />
            <div className="px-4 py-2">
              <LocaleSwitcher />
            </div>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition flex items-center cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span suppressHydrationWarning>{t("nav.logout")}</span>
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
