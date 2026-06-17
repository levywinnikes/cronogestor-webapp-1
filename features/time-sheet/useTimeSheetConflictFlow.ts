"use client";

import { useCallback, useRef, useState } from "react";
import type { ConflictPreview, DeleteImpactPreview } from "@/lib/time-sheet/types";
import {
  timeSheetApiService,
  type CreateTimeSheetDto,
} from "@/app/services/time-sheet-api.service";

export function useTimeSheetConflictFlow() {
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictPreview[]>([]);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const waitForConflictConfirmation = useCallback((items: ConflictPreview[]) => {
    setConflicts(items);
    setConflictOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmConflict = useCallback(() => {
    setConflictOpen(false);
    resolverRef.current?.(true);
    resolverRef.current = null;
  }, []);

  const cancelConflict = useCallback(() => {
    setConflictOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  const saveWithConflictHandling = useCallback(
    async (payload: CreateTimeSheetDto) => {
      await timeSheetApiService.createTimeSheetWithConflictFlow(
        payload,
        waitForConflictConfirmation,
      );
    },
    [waitForConflictConfirmation],
  );

  return {
    conflictOpen,
    conflicts,
    confirmConflict,
    cancelConflict,
    saveWithConflictHandling,
  };
}

export function useTimeSheetDeleteImpactFlow() {
  const [deleteImpactOpen, setDeleteImpactOpen] = useState(false);
  const [deleteImpact, setDeleteImpact] = useState<DeleteImpactPreview | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const waitForDeleteConfirmation = useCallback((impact: DeleteImpactPreview) => {
    setDeleteImpact(impact);
    setDeleteImpactOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmDeleteImpact = useCallback(() => {
    setDeleteImpactOpen(false);
    resolverRef.current?.(true);
    resolverRef.current = null;
  }, []);

  const cancelDeleteImpact = useCallback(() => {
    setDeleteImpactOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  const confirmDeleteIfNeeded = useCallback(
    async (
      entryId: string,
      employeeId: string,
      prefetched?: {
        requiresConfirmation: boolean;
        impact: DeleteImpactPreview;
      },
    ) => {
      const { requiresConfirmation, impact } =
        prefetched ?? (await timeSheetApiService.getDeleteImpact(entryId, employeeId));

      if (!requiresConfirmation) return true;
      return waitForDeleteConfirmation(impact);
    },
    [waitForDeleteConfirmation],
  );

  return {
    deleteImpactOpen,
    deleteImpact,
    confirmDeleteImpact,
    cancelDeleteImpact,
    confirmDeleteIfNeeded,
  };
}

export function mapApiEntryToRecord(
  e: import("@/app/services/time-sheet-api.service").TimeSheetEntryResponseDto,
) {
  return {
    id: e.id,
    employeeId: e.employeeId,
    projectId: e.projectId,
    date: e.workDate.split("T")[0],
    startTime: new Date(e.startDateTime).toISOString().substring(11, 16),
    endTime: new Date(e.endDateTime).toISOString().substring(11, 16),
    breakDurationMinutes: e.breakMinutes,
    startTime2: e.startDateTime2
      ? new Date(e.startDateTime2).toISOString().substring(11, 16)
      : null,
    endTime2: e.endDateTime2
      ? new Date(e.endDateTime2).toISOString().substring(11, 16)
      : null,
    startTime3: e.startDateTime3
      ? new Date(e.startDateTime3).toISOString().substring(11, 16)
      : null,
    endTime3: e.endDateTime3
      ? new Date(e.endDateTime3).toISOString().substring(11, 16)
      : null,
    startTime4: e.startDateTime4
      ? new Date(e.startDateTime4).toISOString().substring(11, 16)
      : null,
    endTime4: e.endDateTime4
      ? new Date(e.endDateTime4).toISOString().substring(11, 16)
      : null,
    effectiveMinutes: e.effectiveMinutes,
    sharedMinutes: e.sharedMinutes,
    hasSharedMinutes: e.hasSharedMinutes,
    sharedConflictSnapshot: e.sharedConflictSnapshot ?? null,
  };
}

export function mapRecordToPayloadEntry(entry: {
  date: string;
  startTime: string;
  endTime: string;
  startTime2?: string | null;
  endTime2?: string | null;
  startTime3?: string | null;
  endTime3?: string | null;
  startTime4?: string | null;
  endTime4?: string | null;
}) {
  return {
    workDate: entry.date,
    startTime: entry.startTime,
    endTime: entry.endTime,
    breakMinutes: 0,
    startTime2: entry.startTime2 || null,
    endTime2: entry.endTime2 || null,
    startTime3: entry.startTime3 || null,
    endTime3: entry.endTime3 || null,
    startTime4: entry.startTime4 || null,
    endTime4: entry.endTime4 || null,
  };
}
