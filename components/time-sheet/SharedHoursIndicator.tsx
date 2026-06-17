"use client";

import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/ui/tooltip";
import type { SharedConflictSnapshotDto } from "@/app/services/time-sheet-api.service";

type SharedHoursIndicatorProps = {
  sharedMinutes: number;
  snapshot?: SharedConflictSnapshotDto | null;
};

function formatHoursFromMinutes(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

export function SharedHoursIndicator({
  sharedMinutes,
  snapshot,
}: SharedHoursIndicatorProps) {
  const { t } = useTranslation();

  if (sharedMinutes <= 0) return null;

  const tooltipContent = (
    <div className="space-y-2">
      <p className="font-semibold">
        {t("timesheet.sharedHours.tooltipIntro", {
          hours: formatHoursFromMinutes(sharedMinutes),
        })}
      </p>
      {(snapshot?.conflictingProjects ?? []).map((project) => (
        <div key={project.projectId} className="border-t border-white/10 pt-1">
          <p>
            {t("timesheet.sharedHours.projectLine", {
              code: project.projectCode,
              name: project.projectName,
              hours: formatHoursFromMinutes(project.sharedMinutes),
              percent: Math.round(project.splitRatio * 100),
              range:
                project.overlapRanges[0]
                  ? `${project.overlapRanges[0].start} – ${project.overlapRanges[0].end}`
                  : "",
            })}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
      {t("timesheet.sharedHours.label")}
      <InfoTooltip content={tooltipContent} />
    </span>
  );
}
