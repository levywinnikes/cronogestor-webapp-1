"use client";

import { AlertCircle, Briefcase, Clock, Plus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui/tooltip";
import type {
  EmployeeOption,
  ProjectOption,
  TimeSheetEntryFormValues,
} from "./time-sheet-entry.types";

type PeriodStyle = {
  container: string;
  title: string;
  icon: string;
  addButton: string;
};

const PERIOD_STYLES: PeriodStyle[] = [
  {
    container: "bg-surface/50 border-border",
    title: "text-text-primary",
    icon: "text-primary",
    addButton: "border-info/30 text-info hover:bg-info-100/30",
  },
  {
    container: "bg-info-100/30 border-info/20",
    title: "text-info",
    icon: "text-info",
    addButton: "border-warning/30 text-warning hover:bg-warning-100/30",
  },
  {
    container: "bg-warning-100/30 border-warning/20",
    title: "text-warning",
    icon: "text-warning",
    addButton: "border-secondary/30 text-secondary hover:bg-secondary-100/30",
  },
  {
    container: "bg-secondary-100/30 border-secondary/20",
    title: "text-secondary",
    icon: "text-secondary",
    addButton: "",
  },
];

type PeriodBlockProps = {
  periodIndex: number;
  values: TimeSheetEntryFormValues;
  onChange: (patch: Partial<TimeSheetEntryFormValues>) => void;
  onRemove?: () => void;
  showIntervalTooltip?: boolean;
};

function PeriodBlock({
  periodIndex,
  values,
  onChange,
  onRemove,
  showIntervalTooltip = false,
}: PeriodBlockProps) {
  const { t } = useTranslation();
  const style = PERIOD_STYLES[periodIndex - 1];

  const startKey = (
    periodIndex === 1 ? "startTime" : `startTime${periodIndex}`
  ) as keyof TimeSheetEntryFormValues;
  const endKey = (
    periodIndex === 1 ? "endTime" : `endTime${periodIndex}`
  ) as keyof TimeSheetEntryFormValues;
  const startValue = String(values[startKey] ?? "");
  const endValue = String(values[endKey] ?? "");

  return (
    <div className={`p-4 border rounded-xl space-y-3 relative ${style.container}`}>
      <span className={`text-xs font-bold uppercase flex items-center ${style.title}`}>
        <Clock className={`w-3.5 h-3.5 mr-1 ${style.icon}`} />
        {t("timesheet.form.period", { number: periodIndex })}
        {showIntervalTooltip ? (
          <InfoTooltip content={t("timesheet.tooltips.periodIntervals")} />
        ) : null}
      </span>

      {onRemove ? (
        <AppButton
          type="button"
          variant="danger-outline"
          size="sm"
          className="absolute top-2.5 right-2.5 h-7 px-2 text-xs"
          onClick={onRemove}
        >
          {t("timesheet.form.removePeriod")}
        </AppButton>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <TextField
          type="time"
          label={
            <span>
              {t("timesheet.form.start")}
              <InfoTooltip content={t("timesheet.tooltips.startTime")} />
            </span>
          }
          value={startValue}
          onChange={(event) =>
            onChange({ [startKey]: event.target.value } as Partial<TimeSheetEntryFormValues>)
          }
          className="font-bold"
        />
        <TextField
          type="time"
          label={
            <span>
              {t("timesheet.form.end")}
              <InfoTooltip content={t("timesheet.tooltips.endTime")} />
            </span>
          }
          value={endValue}
          onChange={(event) =>
            onChange({ [endKey]: event.target.value } as Partial<TimeSheetEntryFormValues>)
          }
          className="font-bold"
        />
      </div>
    </div>
  );
}

export type TimeSheetEntryFormProps = {
  values: TimeSheetEntryFormValues;
  onChange: (patch: Partial<TimeSheetEntryFormValues>) => void;
  projects: ProjectOption[];
  employees: EmployeeOption[];
  overlapError?: string | null;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function TimeSheetEntryForm({
  values,
  onChange,
  projects,
  employees,
  overlapError,
  isSubmitting = false,
  isSubmitDisabled = false,
  onCancel,
  onSubmit,
}: TimeSheetEntryFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-4">
        <SelectField
          label={
            <span>
              {t("timesheet.labels.project")}
              <InfoTooltip content={t("timesheet.tooltips.project")} />
            </span>
          }
          icon={<Briefcase className="w-4 h-4" />}
          value={values.projectId}
          onChange={(event) => onChange({ projectId: event.target.value })}
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
          placeholder={t("timesheet.placeholders.selectProject")}
          required
        />

        <SelectField
          label={
            <span>
              {t("timesheet.labels.employee")}
              <InfoTooltip content={t("timesheet.tooltips.employee")} />
            </span>
          }
          icon={<Users className="w-4 h-4" />}
          value={values.employeeId}
          onChange={(event) => onChange({ employeeId: event.target.value })}
          options={employees.map((employee) => ({
            value: employee.id,
            label: employee.nome,
          }))}
          placeholder={t("timesheet.placeholders.selectEmployee")}
          required
        />
      </div>

      <TextField
        type="date"
        label={
          <span>
            {t("timesheet.form.workDate")}
            <InfoTooltip content={t("timesheet.tooltips.workDate")} />
          </span>
        }
        value={values.workDate}
        onChange={(event) => onChange({ workDate: event.target.value })}
      />

      <PeriodBlock
        periodIndex={1}
        values={values}
        onChange={onChange}
        showIntervalTooltip
      />

      {values.hasInterval2 ? (
        <PeriodBlock
          periodIndex={2}
          values={values}
          onChange={onChange}
          onRemove={() => onChange({ hasInterval2: false })}
        />
      ) : (
        <AppButton
          type="button"
          variant="outline"
          fullWidth
          icon={<Plus className="w-3.5 h-3.5" />}
          className={`border-dashed ${PERIOD_STYLES[0].addButton}`}
          onClick={() => onChange({ hasInterval2: true })}
        >
          {t("timesheet.form.addPeriod", { number: 2 })}
        </AppButton>
      )}

      {values.hasInterval2 ? (
        values.hasInterval3 ? (
          <PeriodBlock
            periodIndex={3}
            values={values}
            onChange={onChange}
            onRemove={() => onChange({ hasInterval3: false })}
          />
        ) : (
          <AppButton
            type="button"
            variant="outline"
            fullWidth
            icon={<Plus className="w-3.5 h-3.5" />}
            className={`border-dashed ${PERIOD_STYLES[1].addButton}`}
            onClick={() => onChange({ hasInterval3: true })}
          >
            {t("timesheet.form.addPeriod", { number: 3 })}
          </AppButton>
        )
      ) : null}

      {values.hasInterval3 ? (
        values.hasInterval4 ? (
          <PeriodBlock
            periodIndex={4}
            values={values}
            onChange={onChange}
            onRemove={() => onChange({ hasInterval4: false })}
          />
        ) : (
          <AppButton
            type="button"
            variant="outline"
            fullWidth
            icon={<Plus className="w-3.5 h-3.5" />}
            className={`border-dashed ${PERIOD_STYLES[2].addButton}`}
            onClick={() => onChange({ hasInterval4: true })}
          >
            {t("timesheet.form.addPeriod", { number: 4 })}
          </AppButton>
        )
      ) : null}

      {overlapError ? (
        <div className="bg-danger-100 p-3.5 border border-danger/20 rounded-xl flex gap-2.5">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-danger leading-snug">{overlapError}</p>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
        <AppButton variant="outline" onClick={onCancel}>
          {t("timesheet.form.cancel")}
        </AppButton>
        <AppButton
          variant="primary"
          disabled={isSubmitDisabled}
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {t("timesheet.form.confirm")}
        </AppButton>
      </div>
    </>
  );
}

export function TimeSheetEntryFormSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-36 w-full" />
      <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
