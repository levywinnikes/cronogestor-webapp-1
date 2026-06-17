"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { authService } from "@/app/services/auth.service";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { AppButton } from "@/components/ui/button";
import { projectService } from "@/app/services/project.service";
import { employeeService } from "@/app/services/employee.service";
import { timeSheetApiService, TimeSheetConflictError } from "@/app/services/time-sheet-api.service";
import { TimeSheetConflictModal } from "@/components/time-sheet/TimeSheetConflictModal";
import { useTimeSheetConflictFlow } from "@/features/time-sheet/useTimeSheetConflictFlow";
import { TimeSheetEntryDialog } from "@/features/time-sheet/TimeSheetEntryDialog";
import { useTimeSheetEntryForm } from "@/features/time-sheet/useTimeSheetEntryForm";
import type {
  EmployeeOption,
  ProjectOption,
} from "@/features/time-sheet/time-sheet-entry.types";
import { useAppToast } from "@/lib/use-app-toast";

const NAV_LINKS = [
  { href: "/projetos", labelKey: "nav.projects" },
  { href: "/funcionarios", labelKey: "nav.employees" },
  { href: "/ficha-tempo", labelKey: "timesheet.page.title" },
  { href: "/configuracoes", labelKey: "nav.settings" },
] as const;

export function Header() {
  const router = useRouter();
  const { t } = useTranslation();
  const appToast = useAppToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    conflictOpen,
    conflicts,
    confirmConflict,
    cancelConflict,
    saveWithConflictHandling,
  } = useTimeSheetConflictFlow();

  const {
    values,
    patchValues,
    resetForGlobalCreate,
    overlapError,
    isSubmitDisabled,
    buildEntry,
  } = useTimeSheetEntryForm({
    loadContextEntries: true,
    contextEnabled: isModalOpen,
  });

  const openEntryModal = useCallback(() => {
    resetForGlobalCreate();
    setIsModalOpen(true);
  }, [resetForGlobalCreate]);

  useEffect(() => {
    window.addEventListener("open-add-timesheet", openEntryModal);
    return () => {
      window.removeEventListener("open-add-timesheet", openEntryModal);
    };
  }, [openEntryModal]);

  useEffect(() => {
    if (!isModalOpen) return;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [projectsData, employeesData] = await Promise.all([
          projectService.getProjects(),
          employeeService.getEmployees(),
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
          })),
        );

        if (!values.workDate) {
          patchValues({
            workDate: new Date().toISOString().split("T")[0],
          });
        }
      } catch (error) {
        console.error(t("timesheet.errors.loadContextFailed"), error);
        appToast.fromUnknownError(error, "timesheet.errors.loadContextFailed");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isModalOpen, patchValues, values.workDate, t]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Always redirect to login even when API logout fails on client.
    }
    router.push("/login");
  };

  const handleSaveEntry = async () => {
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    try {
      const parsedDate = new Date(values.workDate);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1;

      const context = await timeSheetApiService.getTimeSheetContext(
        values.projectId,
        values.employeeId,
        year,
        month,
      );

      const existingEntries =
        context?.entries.map((entry) => ({
          workDate: entry.workDate.split("T")[0],
          startTime: new Date(entry.startDateTime).toISOString().substring(11, 16),
          endTime: new Date(entry.endDateTime).toISOString().substring(11, 16),
          breakMinutes: 0,
          startTime2: entry.startDateTime2
            ? new Date(entry.startDateTime2).toISOString().substring(11, 16)
            : null,
          endTime2: entry.endDateTime2
            ? new Date(entry.endDateTime2).toISOString().substring(11, 16)
            : null,
          startTime3: entry.startDateTime3
            ? new Date(entry.startDateTime3).toISOString().substring(11, 16)
            : null,
          endTime3: entry.endDateTime3
            ? new Date(entry.endDateTime3).toISOString().substring(11, 16)
            : null,
          startTime4: entry.startDateTime4
            ? new Date(entry.startDateTime4).toISOString().substring(11, 16)
            : null,
          endTime4: entry.endDateTime4
            ? new Date(entry.endDateTime4).toISOString().substring(11, 16)
            : null,
        })) ?? [];

      const filteredEntries = existingEntries.filter(
        (entry) => entry.workDate !== values.workDate,
      );

      const newEntry = buildEntry(null);

      await saveWithConflictHandling({
        projectId: values.projectId,
        employeeId: values.employeeId,
        periodYear: year,
        periodMonth: month,
        conflictCheckWorkDates: [newEntry.date],
        entries: [
          ...filteredEntries,
          {
            workDate: newEntry.date,
            startTime: newEntry.startTime,
            endTime: newEntry.endTime,
            breakMinutes: 0,
            startTime2: newEntry.startTime2 ?? null,
            endTime2: newEntry.endTime2 ?? null,
            startTime3: newEntry.startTime3 ?? null,
            endTime3: newEntry.endTime3 ?? null,
            startTime4: newEntry.startTime4 ?? null,
            endTime4: newEntry.endTime4 ?? null,
          },
        ],
      });

      window.dispatchEvent(new CustomEvent("timesheet-changed"));
      setIsModalOpen(false);
      appToast.saved();
    } catch (error) {
      if (error instanceof TimeSheetConflictError) {
        return;
      }
      console.error(t("timesheet.errors.saveFailed"), error);
      appToast.fromUnknownError(error, "timesheet.errors.saveFailed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-primary shadow-md text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold">
              C
            </div>
            <h1 className="text-xl font-bold tracking-wide">Cronogestor</h1>
          </div>

          <div className="hidden sm:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-blue-100 hover:text-white transition-colors"
              >
                <span suppressHydrationWarning>{t(link.labelKey)}</span>
              </Link>
            ))}
            <div className="border-l border-blue-300/30 h-5" />
            <AppButton
              variant="secondary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openEntryModal}
              className="h-8 text-xs font-bold"
            >
              <span suppressHydrationWarning>{t("timesheet.buttons.addTimeSheet")}</span>
            </AppButton>
            <div className="border-l border-blue-300/30 h-5" />
            <LocaleSwitcher />
            <AppButton
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-blue-100 hover:text-white hover:bg-white/10 h-auto px-0 font-medium"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span suppressHydrationWarning>{t("nav.logout")}</span>
            </AppButton>
          </div>

          <div className="flex items-center space-x-2 sm:hidden">
            <AppButton
              variant="ghost"
              size="sm"
              icon={<Plus className="w-5 h-5" />}
              onClick={openEntryModal}
              className="text-white bg-white/10 hover:bg-white/20"
              aria-label={t("timesheet.buttons.addTimeSheet")}
            />
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 h-9 w-9 p-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("nav.toggleMenu")}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </AppButton>
          </div>
        </div>

        {mobileOpen ? (
          <div className="sm:hidden bg-primary-700 border-t border-white/10 animate-in slide-in-from-top">
            <nav className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <span suppressHydrationWarning>{t(link.labelKey)}</span>
                </Link>
              ))}
              <div className="border-t border-white/10 my-2" />
              <div className="px-4 py-2">
                <LocaleSwitcher />
              </div>
              <AppButton
                variant="ghost"
                fullWidth
                className="justify-start text-blue-100 hover:text-white hover:bg-white/10 px-4 py-3 h-auto font-medium"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span suppressHydrationWarning>{t("nav.logout")}</span>
              </AppButton>
            </nav>
          </div>
        ) : null}
      </header>

      <TimeSheetEntryDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("timesheet.form.createTitle")}
        isLoading={isLoadingOptions}
        values={values}
        onChange={patchValues}
        projects={projects}
        employees={employees}
        overlapError={overlapError}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSaveEntry}
      />

      <TimeSheetConflictModal
        isOpen={conflictOpen}
        conflicts={conflicts}
        onConfirm={confirmConflict}
        onCancel={cancelConflict}
      />
    </>
  );
}
