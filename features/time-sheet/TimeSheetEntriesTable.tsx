"use client";



import { Calculator, Pencil, Trash2 } from "lucide-react";

import { useTranslation } from "react-i18next";

import { SharedHoursIndicator } from "@/components/time-sheet/SharedHoursIndicator";
import { AppButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import { CardContent, CardHeader } from "@/components/ui/card";

import { EmptyState } from "@/components/ui/empty-state";

import { Skeleton } from "@/components/ui/skeleton";

import { HoverTooltip } from "@/components/ui/tooltip";
import {
  formatDisplayDate,
  formatTimeEntrySpan,
  formatTimeSheetCurrency,
  getTimeEntryPeriods,
} from "./time-sheet.formatters";

import type {

  CalculatedTimeEntry,

  EmployeeOption,

  ProjectOption,

} from "./time-sheet-screen.types";



type TimeSheetEntriesTableProps = {

  isLoading: boolean;

  isFetchingContext: boolean;

  entries: CalculatedTimeEntry[];

  projects: ProjectOption[];

  employees: EmployeeOption[];

  selectedProjectId: string;

  selectedEmployeeId: string;

  onEdit: (entry: CalculatedTimeEntry) => void;

  onDelete: (entry: CalculatedTimeEntry) => void;

};



function EntryPeriods({ entry }: { entry: CalculatedTimeEntry }) {
  const { t } = useTranslation();
  const periods = getTimeEntryPeriods(entry);
  const span = formatTimeEntrySpan(periods);

  if (!span) {
    return null;
  }

  const timeDisplay = (
    <span
      className={cn(
        "font-mono text-sm text-text-primary tabular-nums",
        periods.length > 1 &&
          "underline decoration-dotted decoration-text-muted/50 underline-offset-2",
      )}
    >
      {span}
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {periods.length > 1 ? (
        <HoverTooltip
          content={
            <div className="space-y-1">
              <p className="font-semibold">{t("timesheet.list.periodsDetail")}</p>
              {periods.map(([start, end], index) => (
                <p key={`${start}-${end}-${index}`}>
                  {t("timesheet.list.periodRange", { start, end })}
                </p>
              ))}
            </div>
          }
        >
          {timeDisplay}
        </HoverTooltip>
      ) : (
        timeDisplay
      )}
      {entry.hasSharedMinutes ? (
        <SharedHoursIndicator
          sharedMinutes={entry.sharedMinutes ?? 0}
          snapshot={entry.sharedConflictSnapshot}
        />
      ) : null}
    </div>
  );
}



function EntryBreakdown({ entry }: { entry: CalculatedTimeEntry }) {

  const { t } = useTranslation();

  const { breakdown } = entry;



  const contextLabels: string[] = [];

  if (breakdown.isHoliday) {

    contextLabels.push(

      t("timesheet.list.holiday", { name: breakdown.holidayName ?? "" }),

    );

  } else if (breakdown.isSunday) {

    contextLabels.push(t("timesheet.list.sunday"));

  } else if (breakdown.isSaturday) {

    contextLabels.push(t("timesheet.list.saturday"));

  }



  return (

    <div className="space-y-1 min-w-[160px]">

      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">

        <span>

          <span className="text-text-muted">{t("timesheet.breakdown.normal")}</span>{" "}

          <span className="font-medium tabular-nums text-text-primary">

            {breakdown.normalHours.toFixed(1)}h

          </span>

        </span>

        {breakdown.overtime50 > 0 ? (

          <span>

            <span className="text-text-muted">{t("timesheet.breakdown.overtime50")}</span>{" "}

            <span className="font-medium tabular-nums text-warning">

              {breakdown.overtime50.toFixed(1)}h

            </span>

          </span>

        ) : null}

        {breakdown.overtime100 > 0 ? (

          <span>

            <span className="text-text-muted">{t("timesheet.breakdown.overtime100")}</span>{" "}

            <span className="font-medium tabular-nums text-danger">

              {breakdown.overtime100.toFixed(1)}h

            </span>

          </span>

        ) : null}

      </div>

      {contextLabels.length > 0 ? (

        <p className="text-xs text-text-muted">{contextLabels.join(" · ")}</p>

      ) : null}

    </div>

  );

}



export function TimeSheetEntriesTable({

  isLoading,

  isFetchingContext,

  entries,

  projects,

  employees,

  selectedProjectId,

  selectedEmployeeId,

  onEdit,

  onDelete,

}: TimeSheetEntriesTableProps) {

  const { t, i18n } = useTranslation();

  const formatCurrency = (value: number) =>

    formatTimeSheetCurrency(value, i18n.language);



  const showEmpty = !isLoading && !isFetchingContext && entries.length === 0;

  const showTable = !showEmpty;



  return (

    <>

      <CardHeader

        title={t("timesheet.list.dailyRecords")}

        action={

          !isLoading && !isFetchingContext ? (

            <span className="text-xs font-medium text-text-secondary">

              {t("timesheet.list.entryCount", { count: entries.length })}

            </span>

          ) : null

        }

      />



      {showTable ? (

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="border-b border-border-light bg-gray-50/50 text-xs font-semibold text-text-secondary uppercase tracking-wider">

                <th className="px-6 py-3.5 w-36">{t("timesheet.table.date")}</th>

                {selectedEmployeeId === "all" ? (

                  <th className="px-6 py-3.5">{t("timesheet.table.employee")}</th>

                ) : null}

                {selectedProjectId === "all" ? (

                  <th className="px-6 py-3.5">{t("timesheet.table.project")}</th>

                ) : null}

                <th className="px-6 py-3.5">

                  {t("timesheet.table.start")} / {t("timesheet.table.end")}

                </th>

                <th className="px-6 py-3.5 w-24">{t("timesheet.table.break")}</th>

                <th className="px-6 py-3.5 min-w-[180px]">{t("timesheet.table.breakdown")}</th>

                <th className="px-6 py-3.5 text-right w-32">{t("timesheet.table.dayCost")}</th>

                <th className="px-6 py-3.5 text-right w-28">{t("timesheet.table.actions")}</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-border-light text-sm">

              {isLoading || isFetchingContext

                ? Array.from({ length: 5 }).map((_, index) => (

                    <tr key={index}>

                      <td className="px-6 py-4">

                        <Skeleton className="h-4 w-24" />

                      </td>

                      {selectedEmployeeId === "all" ? (

                        <td className="px-6 py-4">

                          <Skeleton className="h-4 w-32" />

                        </td>

                      ) : null}

                      {selectedProjectId === "all" ? (

                        <td className="px-6 py-4">

                          <Skeleton className="h-4 w-32" />

                        </td>

                      ) : null}

                      <td className="px-6 py-4">

                        <Skeleton className="h-4 w-40" />

                      </td>

                      <td className="px-6 py-4">

                        <Skeleton className="h-4 w-12" />

                      </td>

                      <td className="px-6 py-4">

                        <Skeleton className="h-4 w-36" />

                      </td>

                      <td className="px-6 py-4 text-right">

                        <Skeleton className="h-4 w-20 ml-auto" />

                      </td>

                      <td className="px-6 py-4 text-right">

                        <Skeleton className="h-8 w-16 ml-auto" />

                      </td>

                    </tr>

                  ))

                : entries.map((entry) => (

                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">

                      <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">

                        {formatDisplayDate(entry.date, i18n.language)}

                      </td>

                      {selectedEmployeeId === "all" ? (

                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary">

                          {employees.find((employee) => employee.id === entry.employeeId)

                            ?.nome ?? t("timesheet.list.notAvailable")}

                        </td>

                      ) : null}

                      {selectedProjectId === "all" ? (

                        <td className="px-6 py-4 whitespace-nowrap text-text-secondary">

                          {projects.find((project) => project.id === entry.projectId)

                            ?.name ?? t("timesheet.list.notAvailable")}

                        </td>

                      ) : null}

                      <td className="px-6 py-4">

                        <EntryPeriods entry={entry} />

                      </td>

                      <td className="px-6 py-4 whitespace-nowrap tabular-nums text-text-secondary">

                        {t("timesheet.list.minutesShort", {

                          minutes: entry.breakdown.breakMinutes,

                        })}

                      </td>

                      <td className="px-6 py-4">

                        <EntryBreakdown entry={entry} />

                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">

                        <p className="font-semibold tabular-nums text-text-primary">

                          {formatCurrency(entry.breakdown.calculatedCost)}

                        </p>

                        <p className="text-xs text-text-muted tabular-nums">

                          {t("timesheet.list.totalHoursShort", {

                            hours: entry.breakdown.totalHours.toFixed(1),

                          })}

                        </p>

                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">

                        <div className="inline-flex gap-2">

                          <AppButton

                            type="button"

                            variant="outline"

                            size="sm"

                            className="h-8 w-8 p-0"

                            onClick={() => onEdit(entry)}

                            aria-label={t("timesheet.buttons.edit")}

                            title={t("timesheet.buttons.edit")}

                          >

                            <Pencil className="w-3.5 h-3.5" />

                          </AppButton>

                          <AppButton

                            type="button"

                            variant="danger-outline"

                            size="sm"

                            className="h-8 w-8 p-0"

                            onClick={() => onDelete(entry)}

                            aria-label={t("timesheet.buttons.delete")}

                            title={t("timesheet.buttons.delete")}

                          >

                            <Trash2 className="w-3.5 h-3.5" />

                          </AppButton>

                        </div>

                      </td>

                    </tr>

                  ))}

            </tbody>

          </table>

        </div>

      ) : null}



      {showEmpty ? (

        <CardContent>

          <EmptyState

            className="border-0 shadow-none py-10"

            icon={<Calculator className="w-10 h-10 opacity-30" />}

            title={t("timesheet.emptyState")}

          />

        </CardContent>

      ) : null}

    </>

  );

}

