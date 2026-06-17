"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TimeEntryRecord } from "@/app/services/time-sheet.service";
import {
  buildEntryFromForm,
  validateEntryFormOverlap,
} from "./time-sheet-entry.validation";
import { useTimeSheetModalEntries } from "./useTimeSheetModalEntries";
import {
  DEFAULT_TIME_SHEET_ENTRY_FORM,
  type TimeSheetEntryFormValues,
} from "./time-sheet-entry.types";

type UseTimeSheetEntryFormOptions = {
  otherEntries?: TimeEntryRecord[];
  editingEntryId?: string | null;
  /** Busca lançamentos do projeto/funcionário/mês do formulário (ignora filtros da listagem). */
  loadContextEntries?: boolean;
  contextEnabled?: boolean;
};

export function useTimeSheetEntryForm(options: UseTimeSheetEntryFormOptions = {}) {
  const { t } = useTranslation();
  const [values, setValues] = useState<TimeSheetEntryFormValues>(
    DEFAULT_TIME_SHEET_ENTRY_FORM,
  );

  const { entries: contextEntries, isLoading: isLoadingContextEntries } =
    useTimeSheetModalEntries(
      values.projectId,
      values.employeeId,
      values.workDate,
      Boolean(options.loadContextEntries && options.contextEnabled),
    );

  const otherEntriesForValidation =
    options.otherEntries ??
    (options.loadContextEntries ? contextEntries : undefined);

  const patchValues = useCallback((patch: Partial<TimeSheetEntryFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  }, []);

  const resetForGlobalCreate = useCallback(() => {
    setValues({
      ...DEFAULT_TIME_SHEET_ENTRY_FORM,
      projectId: "",
      employeeId: "",
      workDate: new Date().toISOString().split("T")[0],
    });
  }, []);

  const resetForCreate = useCallback((workDate: string) => {
    setValues({
      ...DEFAULT_TIME_SHEET_ENTRY_FORM,
      projectId: "",
      employeeId: "",
      workDate,
    });
  }, []);

  const loadFromEntry = useCallback((entry: TimeEntryRecord) => {
    setValues({
      projectId: entry.projectId,
      employeeId: entry.employeeId,
      workDate: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      hasInterval2: Boolean(entry.startTime2 && entry.endTime2),
      startTime2: entry.startTime2 ?? "18:00",
      endTime2: entry.endTime2 ?? "20:00",
      hasInterval3: Boolean(entry.startTime3 && entry.endTime3),
      startTime3: entry.startTime3 ?? "20:30",
      endTime3: entry.endTime3 ?? "22:00",
      hasInterval4: Boolean(entry.startTime4 && entry.endTime4),
      startTime4: entry.startTime4 ?? "22:15",
      endTime4: entry.endTime4 ?? "23:30",
    });
  }, []);

  const overlapError = useMemo(
    () =>
      validateEntryFormOverlap(values, t, {
        otherEntries: otherEntriesForValidation,
        editingEntryId: options.editingEntryId,
      }),
    [values, t, otherEntriesForValidation, options.editingEntryId],
  );

  const isSubmitDisabled =
    !values.projectId ||
    !values.employeeId ||
    Boolean(overlapError) ||
    Boolean(
      options.loadContextEntries &&
        options.contextEnabled &&
        isLoadingContextEntries,
    );

  const buildEntry = useCallback(
    (editingEntryId: string | null) => buildEntryFromForm(values, editingEntryId),
    [values],
  );

  return {
    values,
    setValues,
    patchValues,
    overlapError,
    isSubmitDisabled,
    resetForGlobalCreate,
    resetForCreate,
    loadFromEntry,
    buildEntry,
  };
}
