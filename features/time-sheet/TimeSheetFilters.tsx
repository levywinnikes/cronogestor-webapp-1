"use client";

import { Briefcase, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/ui/button";
import { SelectField } from "@/components/ui/form-field";
import { InfoTooltip } from "@/components/ui/tooltip";
import { formatReferencePeriod } from "./time-sheet.formatters";
import type { EmployeeOption, ProjectOption } from "./time-sheet-screen.types";

type TimeSheetFiltersProps = {
  projects: ProjectOption[];
  employees: EmployeeOption[];
  selectedProjectId: string;
  selectedEmployeeId: string;
  onProjectChange: (projectId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  periodYear: number;
  periodMonth: number;
  viewAll: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleViewAll: () => void;
};

export function TimeSheetFilters({
  projects,
  employees,
  selectedProjectId,
  selectedEmployeeId,
  onProjectChange,
  onEmployeeChange,
  periodYear,
  periodMonth,
  viewAll,
  onPrevMonth,
  onNextMonth,
  onToggleViewAll,
}: TimeSheetFiltersProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-end">
      <SelectField
        label={
          <span>
            {t("timesheet.labels.project")}
            <InfoTooltip content={t("timesheet.tooltips.filterProject")} />
          </span>
        }
        icon={<Briefcase className="w-4 h-4" />}
        value={selectedProjectId}
        onChange={(event) => onProjectChange(event.target.value)}
        options={[
          { value: "all", label: t("timesheet.labels.allProjects") },
          ...projects.map((project) => ({ value: project.id, label: project.name })),
        ]}
      />

      <SelectField
        label={
          <span>
            {t("timesheet.labels.employee")}
            <InfoTooltip content={t("timesheet.tooltips.filterEmployee")} />
          </span>
        }
        icon={<Users className="w-4 h-4" />}
        value={selectedEmployeeId}
        onChange={(event) => onEmployeeChange(event.target.value)}
        options={[
          { value: "all", label: t("timesheet.labels.allEmployees") },
          ...employees.map((employee) => ({
            value: employee.id,
            label: employee.nome,
          })),
        ]}
      />

      <div className="md:col-span-2 xl:col-span-1 space-y-1.5">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide block">
          {t("timesheet.list.referenceMonth")}
          <InfoTooltip content={t("timesheet.tooltips.referenceMonth")} />
        </span>
        <div className="flex items-stretch rounded-lg border border-border bg-gray-50 overflow-hidden min-h-[42px]">
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none border-r border-border h-auto w-10 shrink-0 px-0"
            disabled={viewAll}
            onClick={onPrevMonth}
            aria-label={t("timesheet.list.filterByMonth")}
          >
            <ChevronLeft className="w-4 h-4" />
          </AppButton>

          <div className="flex flex-1 items-center justify-center px-3 min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate">
              {viewAll
                ? t("timesheet.list.allEntries")
                : formatReferencePeriod(periodMonth, periodYear, i18n.language)}
            </span>
          </div>

          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none border-r border-border h-auto w-10 shrink-0 px-0"
            disabled={viewAll}
            onClick={onNextMonth}
            aria-label={t("timesheet.list.viewAllMonths")}
          >
            <ChevronRight className="w-4 h-4" />
          </AppButton>

          <AppButton
            type="button"
            variant={viewAll ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none h-auto shrink-0 px-3 text-xs whitespace-nowrap"
            onClick={onToggleViewAll}
          >
            {viewAll
              ? t("timesheet.list.filterByMonth")
              : t("timesheet.list.viewAllMonths")}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
