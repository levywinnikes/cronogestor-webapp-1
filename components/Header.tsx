"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X, Plus, Clock, Briefcase, Users, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { authService } from "@/app/services/auth.service";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Dialog } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/field-primitives";
import { AppButton } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/tooltip";
import { projectService } from "@/app/services/project.service";
import { employeeService } from "@/app/services/employee.service";
import { timeSheetApiService } from "@/app/services/time-sheet-api.service";

const NAV_LINKS = [
  { href: "/projetos", labelKey: "nav.projects" },
  { href: "/funcionarios", labelKey: "nav.employees" },
  { href: "/ficha-tempo", labelKey: "timesheet.page.title" },
  { href: "/configuracoes", labelKey: "nav.settings" },
] as const;

type ProjectOption = {
  id: string;
  name: string;
};

type EmployeeOption = {
  id: string;
  nome: string;
};

export function Header() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Add Timesheet Entry Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Fields State inside Modal
  const [formProjectId, setFormProjectId] = useState("");
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("17:00");

  const [formHasInterval2, setFormHasInterval2] = useState(false);
  const [formStartTime2, setFormStartTime2] = useState("18:00");
  const [formEndTime2, setFormEndTime2] = useState("20:00");

  const [formHasInterval3, setFormHasInterval3] = useState(false);
  const [formStartTime3, setFormStartTime3] = useState("20:30");
  const [formEndTime3, setFormEndTime3] = useState("22:00");

  const [formHasInterval4, setFormHasInterval4] = useState(false);
  const [formStartTime4, setFormStartTime4] = useState("22:15");
  const [formEndTime4, setFormEndTime4] = useState("23:30");

  // Listen to open-add-timesheet event to trigger the modal globally
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-add-timesheet", handleOpenModal);
    return () => {
      window.removeEventListener("open-add-timesheet", handleOpenModal);
    };
  }, []);

  // Clear submission error when form values or modal state changes
  useEffect(() => {
    setSubmitError(null);
  }, [
    formProjectId,
    formEmployeeId,
    formDate,
    formStartTime,
    formEndTime,
    formStartTime2,
    formEndTime2,
    formStartTime3,
    formEndTime3,
    formStartTime4,
    formEndTime4,
    isModalOpen
  ]);

  // Load projects & employees on mount or when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const loadOptions = async () => {
        setIsLoadingOptions(true);
        try {
          const [projectsData, employeesData] = await Promise.all([
            projectService.getProjects(),
            employeeService.getEmployees(),
          ]);

          const mappedProjects = projectsData.map((project) => ({
            id: project.id ?? "",
            name: project.name,
          }));

          const mappedEmployees = employeesData.map((employee) => ({
            id: employee.id,
            nome: `${employee.firstName} ${employee.lastName}`,
          }));

          setProjects(mappedProjects);
          setEmployees(mappedEmployees);

          if (mappedProjects.length > 0 && !formProjectId) {
            setFormProjectId(mappedProjects[0].id);
          }
          if (mappedEmployees.length > 0 && !formEmployeeId) {
            setFormEmployeeId(mappedEmployees[0].id);
          }
          if (!formDate) {
            setFormDate(new Date().toISOString().split("T")[0]);
          }
        } catch (error) {
          console.error("Erro ao carregar opções para o lançamento de horas:", error);
        } finally {
          setIsLoadingOptions(false);
        }
      };

      loadOptions();
    }
  }, [isModalOpen]);

  // Modal Overlap checking
  const modalOverlapError = useMemo(() => {
    if (!formStartTime || !formEndTime) return null;
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const intervals: { start: number; end: number; label: string }[] = [];
    const start1 = parseTime(formStartTime);
    let end1 = parseTime(formEndTime);
    if (end1 < start1) end1 += 24 * 60;
    intervals.push({ start: start1, end: end1, label: "Período 1" });

    if (formHasInterval2 && formStartTime2 && formEndTime2) {
      const start2 = parseTime(formStartTime2);
      let end2 = parseTime(formEndTime2);
      if (end2 < start2) end2 += 24 * 60;
      intervals.push({ start: start2, end: end2, label: "Período 2" });
    }

    if (formHasInterval3 && formStartTime3 && formEndTime3) {
      const start3 = parseTime(formStartTime3);
      let end3 = parseTime(formEndTime3);
      if (end3 < start3) end3 += 24 * 60;
      intervals.push({ start: start3, end: end3, label: "Período 3" });
    }

    if (formHasInterval4 && formStartTime4 && formEndTime4) {
      const start4 = parseTime(formStartTime4);
      let end4 = parseTime(formEndTime4);
      if (end4 < start4) end4 += 24 * 60;
      intervals.push({ start: start4, end: end4, label: "Período 4" });
    }

    // Check internal overlaps
    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        const a = intervals[i];
        const b = intervals[j];
        if (a.start < b.end && b.start < a.end) {
          return `${a.label} e ${b.label} se sobrepõem no mesmo dia.`;
        }
      }
    }

    return null;
  }, [formStartTime, formEndTime, formHasInterval2, formStartTime2, formEndTime2, formHasInterval3, formStartTime3, formEndTime3, formHasInterval4, formStartTime4, formEndTime4]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Always redirect to login even when API logout fails on client.
    }
    router.push("/login");
  };

  const handleSaveEntry = async () => {
    if (!formProjectId || !formEmployeeId || !formDate || modalOverlapError) return;

    setIsSubmitting(true);
    try {
      const parsedDate = new Date(formDate);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1;

      // Get existing entries for this project, employee and month
      const context = await timeSheetApiService.getTimeSheetContext(formProjectId, formEmployeeId, year, month);
      
      const existingEntries = context?.entries.map((e) => ({
        workDate: e.workDate.split("T")[0],
        startTime: new Date(e.startDateTime).toISOString().substring(11, 16),
        endTime: new Date(e.endDateTime).toISOString().substring(11, 16),
        breakMinutes: 0,
        startTime2: e.startDateTime2 ? new Date(e.startDateTime2).toISOString().substring(11, 16) : null,
        endTime2: e.endDateTime2 ? new Date(e.endDateTime2).toISOString().substring(11, 16) : null,
        startTime3: e.startDateTime3 ? new Date(e.startDateTime3).toISOString().substring(11, 16) : null,
        endTime3: e.endDateTime3 ? new Date(e.endDateTime3).toISOString().substring(11, 16) : null,
        startTime4: e.startDateTime4 ? new Date(e.startDateTime4).toISOString().substring(11, 16) : null,
        endTime4: e.endDateTime4 ? new Date(e.endDateTime4).toISOString().substring(11, 16) : null,
      })) || [];

      // Filter out current date to replace it
      const filteredEntries = existingEntries.filter((e) => e.workDate !== formDate);

      // Create new entry record
      const newEntry = {
        workDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        breakMinutes: 0,
        startTime2: formHasInterval2 && formStartTime2 && formEndTime2 ? formStartTime2 : null,
        endTime2: formHasInterval2 && formStartTime2 && formEndTime2 ? formEndTime2 : null,
        startTime3: formHasInterval3 && formStartTime3 && formEndTime3 ? formStartTime3 : null,
        endTime3: formHasInterval3 && formStartTime3 && formEndTime3 ? formEndTime3 : null,
        startTime4: formHasInterval4 && formStartTime4 && formEndTime4 ? formStartTime4 : null,
        endTime4: formHasInterval4 && formStartTime4 && formEndTime4 ? formEndTime4 : null,
      };

      // Merge and save
      const mergedEntries = [...filteredEntries, newEntry];

      await timeSheetApiService.createTimeSheet({
        projectId: formProjectId,
        employeeId: formEmployeeId,
        periodYear: year,
        periodMonth: month,
        entries: mergedEntries,
      });

      // Dispatch global event for other components to reload
      window.dispatchEvent(new CustomEvent("timesheet-changed"));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Falha ao salvar lançamento de horas:", error);
      const msg = error instanceof Error ? error.message : "Falha ao salvar lançamento de horas.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-primary shadow-md text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold">
              C
            </div>
            <h1 className="text-xl font-bold tracking-wide">Cronogestor</h1>
          </div>

          {/* Desktop nav */}
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
              onClick={() => setIsModalOpen(true)}
              className="h-8 text-xs font-bold"
            >
              <span suppressHydrationWarning>{t("timesheet.buttons.addTimeSheet")}</span>
            </AppButton>
            <div className="border-l border-blue-300/30 h-5" />
            <LocaleSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center text-blue-100 hover:text-white transition-colors text-sm font-medium cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span suppressHydrationWarning>{t("nav.logout")}</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center space-x-2 sm:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer"
              title="Adicionar Ficha Tempo"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
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
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition flex items-center cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span suppressHydrationWarning>{t("nav.logout")}</span>
              </button>
            </nav>
          </div>
        ) : null}
      </header>

      {/* Unified Entry Modal (Global) */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Lançamento Diário"
      >
        <div className="space-y-5">
          {isLoadingOptions ? (
            <div className="py-8 text-center text-text-muted text-sm font-semibold">
              Carregando opções...
            </div>
          ) : (
            <>
              {/* Project and Employee selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label={t("timesheet.labels.project")}
                  icon={<Briefcase className="w-4 h-4" />}
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                />

                <SelectField
                  label={t("timesheet.labels.employee")}
                  icon={<Users className="w-4 h-4" />}
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  options={employees.map((e) => ({ value: e.id, label: e.nome }))}
                />
              </div>

              {/* Work Date */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-1.5">
                  Data de Trabalho
                </label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Turn 1 (Primary Shift) */}
              <div className="bg-gray-50/50 p-4 border border-border rounded-xl space-y-3">
                <span className="text-xs font-bold text-text-primary uppercase flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-primary" /> Período 1
                  <InfoTooltip content="Os intervalos são calculados de forma automática com base no tempo de descanso entre a saída de um período e a entrada do período seguinte." />
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                      Entrada
                    </label>
                    <Input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                      Saída
                    </label>
                    <Input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Turn 2 (Optional) */}
              {formHasInterval2 ? (
                <div className="bg-blue-50/30 p-4 border border-blue-100 rounded-xl space-y-3 relative">
                  <span className="text-xs font-bold text-blue-900 uppercase flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-blue-700" /> Período 2
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormHasInterval2(false)}
                    className="absolute top-2.5 right-2.5 text-xs text-red-600 font-bold hover:underline"
                  >
                    Remover
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                        Entrada
                      </label>
                      <Input
                        type="time"
                        value={formStartTime2}
                        onChange={(e) => setFormStartTime2(e.target.value)}
                        className="w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                        Saída
                      </label>
                      <Input
                        type="time"
                        value={formEndTime2}
                        onChange={(e) => setFormEndTime2(e.target.value)}
                        className="w-full font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setFormHasInterval2(true)}
                  className="w-full py-2 border border-dashed border-blue-200 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50/50 transition"
                >
                  + Adicionar Período 2
                </button>
              )}

              {/* Turn 3 (Optional) */}
              {formHasInterval2 && (
                formHasInterval3 ? (
                  <div className="bg-purple-50/30 p-4 border border-purple-100 rounded-xl space-y-3 relative">
                    <span className="text-xs font-bold text-purple-900 uppercase flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-purple-700" /> Período 3
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormHasInterval3(false)}
                      className="absolute top-2.5 right-2.5 text-xs text-red-600 font-bold hover:underline"
                    >
                      Remover
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                          Entrada
                        </label>
                        <Input
                          type="time"
                          value={formStartTime3}
                          onChange={(e) => setFormStartTime3(e.target.value)}
                          className="w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                          Saída
                        </label>
                        <Input
                          type="time"
                          value={formEndTime3}
                          onChange={(e) => setFormEndTime3(e.target.value)}
                          className="w-full font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormHasInterval3(true)}
                    className="w-full py-2 border border-dashed border-purple-200 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50/50 transition"
                  >
                    + Adicionar Período 3
                  </button>
                )
              )}

              {/* Turn 4 (Optional) */}
              {formHasInterval3 && (
                formHasInterval4 ? (
                  <div className="bg-teal-50/30 p-4 border border-teal-100 rounded-xl space-y-3 relative">
                    <span className="text-xs font-bold text-teal-900 uppercase flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-teal-700" /> Período 4
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormHasInterval4(false)}
                      className="absolute top-2.5 right-2.5 text-xs text-red-600 font-bold hover:underline"
                    >
                      Remover
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                          Entrada
                        </label>
                        <Input
                          type="time"
                          value={formStartTime4}
                          onChange={(e) => setFormStartTime4(e.target.value)}
                          className="w-full font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">
                          Saída
                        </label>
                        <Input
                          type="time"
                          value={formEndTime4}
                          onChange={(e) => setFormEndTime4(e.target.value)}
                          className="w-full font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFormHasInterval4(true)}
                    className="w-full py-2 border border-dashed border-teal-200 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50/50 transition"
                  >
                    + Adicionar Período 4
                  </button>
                )
              )}

              {/* Modal Overlap Warning */}
              {modalOverlapError && (
                <div className="bg-danger-100 p-3.5 border border-red-200 rounded-xl flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-danger leading-snug">
                    {modalOverlapError}
                  </p>
                </div>
              )}

              {/* API Submission Error */}
              {submitError && (
                <div className="bg-danger-100 p-3.5 border border-red-200 rounded-xl flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-danger leading-snug">
                    {submitError}
                  </p>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
                <AppButton variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </AppButton>
                <AppButton
                  variant="primary"
                  disabled={Boolean(modalOverlapError)}
                  loading={isSubmitting}
                  onClick={handleSaveEntry}
                >
                  Confirmar
                </AppButton>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
