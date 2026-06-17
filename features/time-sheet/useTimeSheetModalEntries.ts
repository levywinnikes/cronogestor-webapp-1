"use client";

import { useEffect, useState } from "react";
import { timeSheetApiService } from "@/app/services/time-sheet-api.service";
import type { TimeEntryRecord } from "@/app/services/time-sheet.service";
import { mapApiEntryToRecord } from "./useTimeSheetConflictFlow";

/**
 * Carrega lançamentos do projeto/funcionário/mês do formulário para validação de overlap
 * (mesmo projeto + mesma pessoa), independente dos filtros da listagem.
 */
export function useTimeSheetModalEntries(
  projectId: string,
  employeeId: string,
  workDate: string,
  enabled: boolean,
) {
  const [entries, setEntries] = useState<TimeEntryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !projectId || !employeeId || !workDate) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const load = async () => {
      try {
        const parsedDate = new Date(`${workDate}T12:00:00`);
        const context = await timeSheetApiService.getTimeSheetContext(
          projectId,
          employeeId,
          parsedDate.getFullYear(),
          parsedDate.getMonth() + 1,
        );

        if (cancelled) return;

        setEntries(context?.entries.map((entry) => mapApiEntryToRecord(entry)) ?? []);
      } catch {
        if (!cancelled) {
          setEntries([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId, employeeId, workDate, enabled]);

  return { entries, isLoading };
}
