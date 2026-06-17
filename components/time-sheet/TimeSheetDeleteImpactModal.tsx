"use client";

import { useTranslation } from "react-i18next";
import { Dialog } from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/button";
import type { DeleteImpactPreview } from "@/lib/time-sheet/types";

type TimeSheetDeleteImpactModalProps = {
  isOpen: boolean;
  impact: DeleteImpactPreview | null;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving?: boolean;
};

function formatHours(minutes: number): string {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function TimeSheetDeleteImpactModal({
  isOpen,
  impact,
  onConfirm,
  onCancel,
  isSaving = false,
}: TimeSheetDeleteImpactModalProps) {
  const { t } = useTranslation();

  if (!impact) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={t("timesheet.deleteImpact.title")}
      className="max-w-lg"
      stacked
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{t("timesheet.deleteImpact.description")}</p>

        {impact.remainingProjects.length > 0 ? (
          <div className="rounded-xl border border-border-light bg-gray-50/80 p-4 space-y-2">
            {impact.remainingProjects.map((project) => (
              <div key={project.projectId} className="flex justify-between text-sm">
                <span>
                  <span className="font-semibold">{project.projectCode}</span>
                  <span className="text-text-muted"> — {project.projectName}</span>
                </span>
                <span className="font-semibold text-primary">
                  {formatHours(project.effectiveMinutes)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t("timesheet.deleteImpact.noRemaining")}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <AppButton variant="secondary" onClick={onCancel} disabled={isSaving}>
            {t("timesheet.deleteImpact.cancel")}
          </AppButton>
          <AppButton variant="danger" onClick={onConfirm} loading={isSaving} disabled={isSaving}>
            {t("timesheet.deleteImpact.confirm")}
          </AppButton>
        </div>
      </div>
    </Dialog>
  );
}
