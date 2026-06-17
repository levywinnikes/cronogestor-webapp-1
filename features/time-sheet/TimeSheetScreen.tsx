"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { Header } from "@/components/Header";
import {
  timeSheetService,
  TimeEntryRecord,
} from "@/app/services/time-sheet.service";
import { projectService } from "@/app/services/project.service";
import { employeeService } from "@/app/services/employee.service";
import { holidayService } from "@/app/services/holiday.service";
import {
  timeSheetApiService,
  TimeSheetConflictError,
} from "@/app/services/time-sheet-api.service";
import { TimeSheetConflictModal } from "@/components/time-sheet/TimeSheetConflictModal";
import { TimeSheetDeleteImpactModal } from "@/components/time-sheet/TimeSheetDeleteImpactModal";
import {
  mapApiEntryToRecord,
  useTimeSheetConflictFlow,
  useTimeSheetDeleteImpactFlow,
} from "@/features/time-sheet/useTimeSheetConflictFlow";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AppButton } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TimeSheetEntryDialog } from "@/features/time-sheet/TimeSheetEntryDialog";
import { useTimeSheetEntryForm } from "@/features/time-sheet/useTimeSheetEntryForm";
import { validateEntriesDayOverlap } from "@/features/time-sheet/time-sheet-entry.validation";
import { TimeSheetFilters } from "@/features/time-sheet/TimeSheetFilters";
import { TimeSheetSummaryCard } from "@/features/time-sheet/TimeSheetSummaryCard";
import { TimeSheetEntriesTable } from "@/features/time-sheet/TimeSheetEntriesTable";
import { formatTimeSheetCurrency } from "@/features/time-sheet/time-sheet.formatters";
import { useAppToast } from "@/lib/use-app-toast";
import type {
  CalculatedTimeEntry,
  EmployeeOption,
  ProjectOption,
} from "@/features/time-sheet/time-sheet-screen.types";

export function TimeSheetScreen() {
  const { t, i18n } = useTranslation();
  const appToast = useAppToast();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [isFetchingContext, setIsFetchingContext] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const [entries, setEntries] = useState<TimeEntryRecord[]>([]);
  const [holidayDates, setHolidayDates] = useState<Map<string, string>>(new Map());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);

  const {
    conflictOpen,
    conflicts,
    confirmConflict,
    cancelConflict,
    saveWithConflictHandling,
  } = useTimeSheetConflictFlow();

  const {
    deleteImpactOpen,
    deleteImpact,
    confirmDeleteImpact,
    cancelDeleteImpact,
    confirmDeleteIfNeeded,
  } = useTimeSheetDeleteImpactFlow();

  const {
    values: entryValues,
    patchValues,
    overlapError: modalOverlapError,
    isSubmitDisabled,
    loadFromEntry,
    buildEntry,
  } = useTimeSheetEntryForm({
    editingEntryId,
    loadContextEntries: true,
    contextEnabled: isModalOpen,
  });

  useEffect(() => {
    const loadContext = async () => {
      try {
        const [projectsData, employeesData, holidaysData] = await Promise.all([
          projectService.getProjects(),
          employeeService.getEmployees(),
          holidayService.getHolidays(),
        ]);

        setProjects(
          projectsData.map((project) => ({
            id: project.id ?? "",
            name: project.name,
          })),
        );
        setEmployees(
          employeesData.map((employee) => ({
            id: employee.id,
            nome: `${employee.firstName} ${employee.lastName}`,
            salario: Number(employee.salary),
            horasPorDia: Number(employee.hoursPerDay),
            encargos: Number(employee.chargesPercent),
            overtime50: 50,
            overtime100: 100,
          })),
        );

        const holidayMap = new Map<string, string>();
        holidaysData.forEach((holiday) => {
          holidayMap.set(holiday.date.split("T")[0], holiday.name);
        });
        setHolidayDates(holidayMap);

        setSelectedProjectId("all");
        setSelectedEmployeeId("all");
      } catch (error) {
        console.error(t("timesheet.errors.loadContextFailed"), error);
        appToast.fromUnknownError(error, "timesheet.errors.loadContextFailed");
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [t]);

  const fetchTimeSheetData = async () => {
    if (!selectedProjectId || !selectedEmployeeId) return;
    setIsFetchingContext(true);
    try {
      const context = await timeSheetApiService.getTimeSheetContext(
        selectedProjectId,
        selectedEmployeeId,
        viewAll ? "all" : periodYear,
        periodMonth,
      );

      if (context && context.entries.length > 0) {
        setEntries(context.entries.map((entry) => mapApiEntryToRecord(entry)));
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error(t("timesheet.errors.loadContextFailed"), error);
      appToast.fromUnknownError(error, "timesheet.errors.loadContextFailed");
      setEntries([]);
    } finally {
      setIsFetchingContext(false);
    }
  };

  useEffect(() => {
    fetchTimeSheetData();
  }, [selectedProjectId, selectedEmployeeId, periodYear, periodMonth, viewAll]);

  useEffect(() => {
    const handleTimesheetChanged = () => {
      fetchTimeSheetData();
    };

    window.addEventListener("timesheet-changed", handleTimesheetChanged);
    return () => {
      window.removeEventListener("timesheet-changed", handleTimesheetChanged);
    };
  }, [selectedProjectId, selectedEmployeeId, periodYear, periodMonth, viewAll]);

  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId);

  const handlePrevMonth = () => {
    if (periodMonth === 1) {
      setPeriodMonth(12);
      setPeriodYear((prev) => prev - 1);
    } else {
      setPeriodMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (periodMonth === 12) {
      setPeriodMonth(1);
      setPeriodYear((prev) => prev + 1);
    } else {
      setPeriodMonth((prev) => prev + 1);
    }
  };

  const overlapError = useMemo(
    () => validateEntriesDayOverlap(entries, t),
    [entries, t],
  );

  const lastOverlapToastRef = useRef<string | null>(null);
  useEffect(() => {
    if (overlapError && overlapError !== lastOverlapToastRef.current) {
      lastOverlapToastRef.current = overlapError;
      appToast.warning(overlapError);
    }
    if (!overlapError) {
      lastOverlapToastRef.current = null;
    }
  }, [overlapError, appToast]);

  const calculatedEntries = useMemo((): CalculatedTimeEntry[] => {
    return entries.map((entry) => {
      const emp =
        selectedEmployee || employees.find((employee) => employee.id === entry.employeeId);
      if (!emp) {
        return {
          ...entry,
          breakdown: {
            totalHours: 0,
            normalHours: 0,
            overtime50: 0,
            overtime100: 0,
            nightShiftHours: 0,
            calculatedCost: 0,
            normalCost: 0,
            overtime50Cost: 0,
            overtime100Cost: 0,
            nightShiftCost: 0,
            breakMinutes: 0,
            isHoliday: false,
            holidayName: "",
            isSunday: false,
            isSaturday: false,
          },
        };
      }
      return {
        ...entry,
        breakdown: timeSheetService.calculateDayCost(entry, emp, holidayDates),
      };
    });
  }, [entries, selectedEmployee, employees, holidayDates]);

  const stats = useMemo(
    () =>
      calculatedEntries.reduce(
        (acc, curr) => ({
          totalHours: acc.totalHours + curr.breakdown.totalHours,
          totalCost: acc.totalCost + curr.breakdown.calculatedCost,
          totalOT:
            acc.totalOT + curr.breakdown.overtime50 + curr.breakdown.overtime100,
          totalNight: acc.totalNight + curr.breakdown.nightShiftHours,
          normalHours: acc.normalHours + curr.breakdown.normalHours,
          normalCost: acc.normalCost + curr.breakdown.normalCost,
          ot50Hours: acc.ot50Hours + curr.breakdown.overtime50,
          ot50Cost: acc.ot50Cost + curr.breakdown.overtime50Cost,
          ot100Hours: acc.ot100Hours + curr.breakdown.overtime100,
          ot100Cost: acc.ot100Cost + curr.breakdown.overtime100Cost,
          nightHours: acc.nightHours + curr.breakdown.nightShiftHours,
          nightCost: acc.nightCost + curr.breakdown.nightShiftCost,
        }),
        {
          totalHours: 0,
          totalCost: 0,
          totalOT: 0,
          totalNight: 0,
          normalHours: 0,
          normalCost: 0,
          ot50Hours: 0,
          ot50Cost: 0,
          ot100Hours: 0,
          ot100Cost: 0,
          nightHours: 0,
          nightCost: 0,
        },
      ),
    [calculatedEntries],
  );

  const handleOpenEditModal = (entry: TimeEntryRecord) => {
    setModalMode("edit");
    setEditingEntryId(entry.id);
    loadFromEntry(entry);
    setIsModalOpen(true);
  };

  const handleSaveModalEntry = async () => {
    if (modalOverlapError || isSubmitDisabled) return;

    const entryData = buildEntry(editingEntryId);

    const persistEntries = async (
      projectId: string,
      employeeId: string,
      year: number,
      month: number,
      payloadEntries: TimeEntryRecord[],
      conflictCheckWorkDates: string[],
    ) => {
      await saveWithConflictHandling({
        projectId,
        employeeId,
        periodYear: year,
        periodMonth: month,
        conflictCheckWorkDates,
        entries: payloadEntries.map((entry) => ({
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
        })),
      });
    };

    setIsSubmitting(true);
    try {
      const parsedDate = new Date(entryValues.workDate);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1;

      if (selectedProjectId === "all") {
        const context = await timeSheetApiService.getTimeSheetContext(
          entryData.projectId,
          entryValues.employeeId,
          year,
          month,
        );
        const existingEntries =
          context?.entries.map((entry) => mapApiEntryToRecord(entry)) ?? [];
        const filtered = existingEntries.filter(
          (entry) => entry.date !== entryValues.workDate,
        );
        await persistEntries(
          entryData.projectId,
          entryValues.employeeId,
          year,
          month,
          [...filtered, entryData],
          [entryValues.workDate],
        );
      } else {
        const updatedEntries =
          modalMode === "create"
            ? [...entries, entryData]
            : entries.map((entry) => (entry.id === editingEntryId ? entryData : entry));
        await persistEntries(
          entryValues.projectId,
          entryValues.employeeId,
          year,
          month,
          updatedEntries,
          [entryValues.workDate],
        );
      }

      await fetchTimeSheetData();
      setIsModalOpen(false);
      appToast.saved();
    } catch (error) {
      if (error instanceof TimeSheetConflictError) return;
      console.error(t("timesheet.errors.saveFailed"), error);
      appToast.fromUnknownError(error, "timesheet.errors.saveFailed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeRemoveEntry = async (id: string) => {
    const entryToRemove = entries.find((entry) => entry.id === id);
    if (!entryToRemove) return;

    const projectIdForOperation =
      selectedProjectId === "all" ? entryToRemove.projectId : selectedProjectId;
    const employeeIdForOperation =
      selectedEmployeeId === "all" ? entryToRemove.employeeId : selectedEmployeeId;

    setIsSubmitting(true);
    try {
      const parsedDate = new Date(entryToRemove.date);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1;

      const shouldFetchContext =
        selectedProjectId === "all" || selectedEmployeeId === "all";

      const payloadEntries = shouldFetchContext
        ? (
            await timeSheetApiService.getTimeSheetContext(
              projectIdForOperation,
              employeeIdForOperation,
              year,
              month,
            )
          )?.entries
            .map((entry) => mapApiEntryToRecord(entry))
            .filter((entry) => entry.id !== id) ?? []
        : entries.filter((entry) => entry.id !== id);

      await saveWithConflictHandling({
        projectId: projectIdForOperation,
        employeeId: employeeIdForOperation,
        periodYear: year,
        periodMonth: month,
        conflictCheckWorkDates: [entryToRemove.date],
        entries: payloadEntries.map((entry) => ({
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
        })),
      });

      await fetchTimeSheetData();
      appToast.deleted();
    } catch (error) {
      console.error(t("timesheet.errors.saveFailed"), error);
      appToast.fromUnknownError(error, "timesheet.errors.saveFailed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntryRequest = async (entry: TimeEntryRecord) => {
    const employeeIdForDelete =
      selectedEmployeeId === "all" ? entry.employeeId : selectedEmployeeId;

    try {
      const deleteImpactResult = await timeSheetApiService.getDeleteImpact(
        entry.id,
        employeeIdForDelete,
      );

      if (deleteImpactResult.requiresConfirmation) {
        const confirmed = await confirmDeleteIfNeeded(
          entry.id,
          employeeIdForDelete,
          deleteImpactResult,
        );
        if (confirmed) {
          await executeRemoveEntry(entry.id);
        }
        return;
      }

      setEntryIdToDelete(entry.id);
      setDeleteConfirmOpen(true);
    } catch (error) {
      console.error(t("timesheet.errors.saveFailed"), error);
      appToast.fromUnknownError(error, "timesheet.errors.saveFailed");
    }
  };

  const handleCloseTimeSheet = async () => {
    if (
      !selectedProjectId ||
      selectedProjectId === "all" ||
      !selectedEmployeeId ||
      entries.length === 0 ||
      overlapError
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await saveWithConflictHandling({
        projectId: selectedProjectId,
        employeeId: selectedEmployeeId,
        periodYear,
        periodMonth,
        entries: entries.map((entry) => ({
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
        })),
      });
      await fetchTimeSheetData();
      appToast.saved();
    } catch (error) {
      console.error(t("timesheet.errors.closeSheetFailed"), error);
      appToast.fromUnknownError(error, "timesheet.errors.closeSheetFailed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    formatTimeSheetCurrency(value, i18n.language);

  return (
    <PageShell className="mb-20 md:mb-0">
      <Header />

      <PageHeader title={t("timesheet.page.title")} icon={<Clock className="h-6 w-6" />} />

      <PageMain className="space-y-6">
        <Card>
          <CardContent className="space-y-0">
            <TimeSheetFilters
              projects={projects}
              employees={employees}
              selectedProjectId={selectedProjectId}
              selectedEmployeeId={selectedEmployeeId}
              onProjectChange={setSelectedProjectId}
              onEmployeeChange={setSelectedEmployeeId}
              periodYear={periodYear}
              periodMonth={periodMonth}
              viewAll={viewAll}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onToggleViewAll={() => setViewAll((current) => !current)}
            />
            <TimeSheetSummaryCard
              isLoading={isLoading}
              isFetchingContext={isFetchingContext}
              stats={stats}
              entryCount={entries.length}
            />
          </CardContent>

          <TimeSheetEntriesTable
            isLoading={isLoading}
            isFetchingContext={isFetchingContext}
            entries={calculatedEntries}
            projects={projects}
            employees={employees}
            selectedProjectId={selectedProjectId}
            selectedEmployeeId={selectedEmployeeId}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteEntryRequest}
          />
        </Card>
      </PageMain>

      <TimeSheetEntryDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? t("timesheet.form.createTitle")
            : t("timesheet.form.editTitle")
        }
        values={entryValues}
        onChange={patchValues}
        projects={projects}
        employees={employees.map(({ id, nome }) => ({ id, nome }))}
        overlapError={modalOverlapError}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSaveModalEntry}
      />

      <TimeSheetConflictModal
        isOpen={conflictOpen}
        conflicts={conflicts}
        onConfirm={confirmConflict}
        onCancel={cancelConflict}
      />

      <TimeSheetDeleteImpactModal
        isOpen={deleteImpactOpen}
        impact={deleteImpact}
        onConfirm={confirmDeleteImpact}
        onCancel={cancelDeleteImpact}
      />

      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("timesheet.form.deleteTitle")}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t("timesheet.form.deleteMessage")}
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
            <AppButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              {t("timesheet.form.cancel")}
            </AppButton>
            <AppButton
              variant="danger"
              loading={isSubmitting}
              onClick={async () => {
                if (entryIdToDelete) {
                  await executeRemoveEntry(entryIdToDelete);
                  setDeleteConfirmOpen(false);
                  setEntryIdToDelete(null);
                }
              }}
            >
              {t("timesheet.buttons.delete")}
            </AppButton>
          </div>
        </div>
      </Dialog>

      <div className="sm:hidden bg-primary text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <div>
          <p className="text-[10px] opacity-70 uppercase font-bold">
            {t("timesheet.list.totalCostMobile")}
          </p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
        </div>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={handleCloseTimeSheet}
          disabled={
            isLoading ||
            Boolean(overlapError) ||
            entries.length === 0 ||
            selectedProjectId === "all"
          }
        >
          {t("timesheet.buttons.save")}
        </AppButton>
      </div>
    </PageShell>
  );
}

export default TimeSheetScreen;
