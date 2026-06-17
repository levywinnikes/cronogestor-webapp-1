"use client";

import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeSheetCurrency } from "./time-sheet.formatters";
import type { TimeSheetStats } from "./time-sheet-screen.types";

type TimeSheetSummaryCardProps = {
  isLoading: boolean;
  isFetchingContext: boolean;
  stats: TimeSheetStats;
  entryCount: number;
};

export function TimeSheetSummaryCard({
  isLoading,
  isFetchingContext,
  stats,
  entryCount,
}: TimeSheetSummaryCardProps) {
  const { t, i18n } = useTranslation();
  const formatCurrency = (value: number) =>
    formatTimeSheetCurrency(value, i18n.language);

  const avgPerDay = entryCount > 0 ? stats.totalHours / entryCount : 0;

  if (isLoading || isFetchingContext) {
    return (
      <div className="-mx-6 mt-6 border-t border-border-light bg-gray-50/50 px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: t("timesheet.list.totalHours"),
      value: `${stats.totalHours.toFixed(1)}h`,
      accent: false,
    },
    {
      label: t("timesheet.list.overtimeHours"),
      value: `${stats.totalOT.toFixed(1)}h`,
      accent: stats.totalOT > 0,
    },
    {
      label: t("timesheet.list.estimatedCost"),
      value: formatCurrency(stats.totalCost),
      accent: false,
    },
    {
      label: t("timesheet.list.avgPerDay"),
      value: `${avgPerDay.toFixed(1)} ${t("timesheet.list.hoursPerDay")}`,
      accent: false,
    },
  ];

  return (
    <div className="-mx-6 mt-6 border-t border-border-light bg-gray-50/50 px-6 py-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <p className="text-xs font-medium text-text-secondary mb-1">{kpi.label}</p>
            <p
              className={`text-xl font-semibold tabular-nums tracking-tight truncate ${
                kpi.accent ? "text-warning" : "text-text-primary"
              }`}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
