"use client";

import { useTranslation } from "react-i18next";
import { Dialog } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/button";
import type { ConflictPreview } from "@/lib/time-sheet/types";

type TimeSheetConflictModalProps = {
  isOpen: boolean;
  conflicts: ConflictPreview[];
  onConfirm: () => void;
  onCancel: () => void;
  isSaving?: boolean;
};

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function TimeSheetConflictModal({
  isOpen,
  conflicts,
  onConfirm,
  onCancel,
  isSaving = false,
}: TimeSheetConflictModalProps) {
  const { t } = useTranslation();

  if (conflicts.length === 0) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={t("timesheet.conflict.title")}
      className="max-w-2xl"
      stacked
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{t("timesheet.conflict.description")}</p>

        {conflicts.map((conflict) => (
          <div
            key={conflict.workDate}
            className="rounded-xl border border-border-light bg-gray-50/80 p-4 space-y-3"
          >
            <p className="text-sm font-bold text-text-primary">
              {t("timesheet.conflict.dateLabel", {
                date: conflict.workDate.split("-").reverse().join("/"),
              })}
            </p>

            <p className="text-sm text-warning bg-warning-100 border border-warning/20 rounded-lg px-3 py-2">
              {t("timesheet.conflict.conflictingTime", {
                hours: formatHours(conflict.conflictingMinutes),
                physical: formatHours(conflict.physicalUniqueMinutes),
              })}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border-light">
                    <th className="py-2 pr-2">{t("timesheet.table.project")}</th>
                    <th className="py-2 pr-2">{t("timesheet.conflict.declared")}</th>
                    <th className="py-2">{t("timesheet.conflict.effective")}</th>
                  </tr>
                </thead>
                <tbody>
                  {conflict.projects.map((project) => (
                    <tr key={project.projectId} className="border-b border-border-light/60">
                      <td className="py-2 pr-2">
                        <span className="font-semibold">{project.projectCode}</span>
                        <span className="text-text-muted"> — {project.projectName}</span>
                      </td>
                      <td className="py-2 pr-2">{formatHours(project.declaredMinutes)}</td>
                      <td className="py-2 font-semibold text-primary">
                        {formatHours(project.effectiveMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {conflict.overlapRanges.length > 0 && (
              <ul className="text-xs text-text-secondary space-y-1">
                {conflict.overlapRanges.map((range) => (
                  <li key={`${range.start}-${range.end}-${range.projectIds.join("-")}`}>
                    {t("timesheet.conflict.rangeLine", {
                      start: range.start,
                      end: range.end,
                      hours: formatHours(range.durationMinutes),
                      count: range.projectIds.length,
                    })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <AppButton variant="secondary" onClick={onCancel} disabled={isSaving}>
            {t("timesheet.conflict.cancel")}
          </AppButton>
          <AppButton onClick={onConfirm} loading={isSaving} disabled={isSaving}>
            {t("timesheet.conflict.confirm")}
          </AppButton>
        </div>
      </div>
    </Dialog>
  );
}
