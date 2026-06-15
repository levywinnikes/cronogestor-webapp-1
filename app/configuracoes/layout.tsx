"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Building2, CalendarDays, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/configuracoes/empresa",
      label: "Empresa",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      href: "/configuracoes/feriados",
      label: "Feriados",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      href: "/configuracoes/usuarios",
      label: "Usuários",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <PageShell className="mb-20 md:mb-0">
      <Header />
      <PageHeader
        title="Configurações"
        icon={<Settings className="h-6 w-6" />}
      />
      <PageMain className="max-w-[1600px] flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Card className="p-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </Card>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </PageMain>
    </PageShell>
  );
}
