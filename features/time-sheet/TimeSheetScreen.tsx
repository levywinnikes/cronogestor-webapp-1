"use client";

import { Input } from "@/components/ui/field-primitives";
import { SelectField } from "@/components/ui/form-field";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Calendar,
  Users,
  Briefcase,
  Plus,
  Trash2,
  Save,
  Calculator,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Moon,
} from "lucide-react";
import { Header } from "@/components/Header";
import {
  timeSheetService,
  TimeEntryRecord,
} from "@/app/services/time-sheet.service";
import { projectService } from "@/app/services/project.service";
import { employeeService } from "@/app/services/employee.service";
import { timeSheetApiService } from "@/app/services/time-sheet-api.service";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ProjectOption = {
  id: string;
  name: string;
};

type EmployeeOption = {
  id: string;
  nome: string;
  salario: number;
  horasPorDia: number;
  encargos: number;
  overtime50: number;
  overtime100: number;
};

export default function TimeSheetPageView() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [isFetchingContext, setIsFetchingContext] = useState(false);

  const [entries, setEntries] = useState<TimeEntryRecord[]>([]);

  useEffect(() => {
    const loadContext = async () => {
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
          salario: Number(employee.salary),
          horasPorDia: Number(employee.hoursPerDay),
          encargos: Number(employee.chargesPercent),
          overtime50: 50,
          overtime100: 100,
        }));

        setProjects(mappedProjects);
        setEmployees(mappedEmployees);

        const nextProjectId = mappedProjects[0]?.id ?? "";
        const nextEmployeeId = mappedEmployees[0]?.id ?? "";

        setSelectedProjectId(nextProjectId);
        setSelectedEmployeeId(nextEmployeeId);
      } catch (error) {
        console.error(t("timesheet.errors.loadContextFailed"), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [t]);

  useEffect(() => {
    if (!selectedProjectId || !selectedEmployeeId) return;

    const fetchContext = async () => {
      setIsFetchingContext(true);
      try {
        const context = await timeSheetApiService.getTimeSheetContext(
          selectedProjectId,
          selectedEmployeeId,
          periodYear,
          periodMonth
        );

        if (context && context.entries.length > 0) {
          const mappedEntries = context.entries.map((e) => ({
            id: e.id,
            employeeId: selectedEmployeeId,
            projectId: selectedProjectId,
            date: e.workDate.split("T")[0],
            startTime: new Date(e.startDateTime).toISOString().substring(11, 16),
            endTime: new Date(e.endDateTime).toISOString().substring(11, 16),
            breakDurationMinutes: e.breakMinutes,
          }));
          setEntries(mappedEntries);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error("Erro ao carregar contexto", error);
        setEntries([]);
      } finally {
        setIsFetchingContext(false);
      }
    };

    fetchContext();
  }, [selectedProjectId, selectedEmployeeId, periodYear, periodMonth]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const calculatedEntries = useMemo(() => {
    if (!selectedEmployee) return [];
    return entries.map((entry) => ({
      ...entry,
      breakdown: timeSheetService.calculateDayCost(entry, selectedEmployee),
    }));
  }, [entries, selectedEmployee]);

  const stats = useMemo(() => {
    return calculatedEntries.reduce(
      (acc, curr) => ({
        totalHours: acc.totalHours + curr.breakdown.totalHours,
        totalCost: acc.totalCost + curr.breakdown.calculatedCost,
        totalOT:
          acc.totalOT + curr.breakdown.overtime50 + curr.breakdown.overtime100,
        totalNight: acc.totalNight + curr.breakdown.nightShiftHours,
      }),
      { totalHours: 0, totalCost: 0, totalOT: 0, totalNight: 0 },
    );
  }, [calculatedEntries]);

  const handleAddEntry = () => {
    const lastEntry = entries[entries.length - 1];
    
    let nextDate = "";
    if (lastEntry) {
       const dateObj = new Date(new Date(lastEntry.date).getTime() + 86400000);
       nextDate = dateObj.toISOString().split("T")[0];
    } else {
       const formattedMonth = periodMonth.toString().padStart(2, "0");
       nextDate = `${periodYear}-${formattedMonth}-01`;
    }

    setEntries([
      ...entries,
      {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: selectedEmployeeId,
        projectId: selectedProjectId,
        date: nextDate,
        startTime: "08:00",
        endTime: "17:00",
        breakDurationMinutes: 60,
      },
    ]);
  };

  const handleUpdateEntry = (
    id: string,
    field: keyof TimeEntryRecord,
    value: TimeEntryRecord[keyof TimeEntryRecord],
  ) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleCloseTimeSheet = async () => {
    if (!selectedProjectId || !selectedEmployeeId || entries.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const firstDate = entries[0].date;
      const [year, month] = firstDate.split("-").map(Number);

      await timeSheetApiService.createTimeSheet({
        projectId: selectedProjectId,
        employeeId: selectedEmployeeId,
        periodYear: year,
        periodMonth: month,
        entries: entries.map((entry) => ({
          workDate: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
          breakMinutes: entry.breakDurationMinutes,
        })),
      });
    } catch (error) {
      console.error(t("timesheet.errors.closeSheetFailed"), error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell className="mb-20 md:mb-0">
      <Header />

      <PageHeader
        title={t("timesheet.page.title")}
        icon={<Clock className="h-6 w-6" />}
        actions={
          <>
            <AppButton variant="outline">Exportar PDF</AppButton>
            <AppButton
              variant="secondary"
              icon={<Save className="w-4 h-4" />}
              loading={isSubmitting}
              disabled={isLoading}
              onClick={handleCloseTimeSheet}
            >
              {t("timesheet.buttons.closeSheet")}
            </AppButton>
          </>
        }
      />

      <PageMain className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-[1600px]">
        {/* Left Side: Context Selectors & Stats */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <SelectField
                  label="Projeto Alvo"
                  icon={<Briefcase className="w-4 h-4" />}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                />

                <SelectField
                  label="Colaborador"
                  icon={<Users className="w-4 h-4" />}
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.nome,
                  }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Mês"
                    value={periodMonth.toString()}
                    onChange={(e) => setPeriodMonth(Number(e.target.value))}
                    options={[
                      { value: "1", label: "Janeiro" },
                      { value: "2", label: "Fevereiro" },
                      { value: "3", label: "Março" },
                      { value: "4", label: "Abril" },
                      { value: "5", label: "Maio" },
                      { value: "6", label: "Junho" },
                      { value: "7", label: "Julho" },
                      { value: "8", label: "Agosto" },
                      { value: "9", label: "Setembro" },
                      { value: "10", label: "Outubro" },
                      { value: "11", label: "Novembro" },
                      { value: "12", label: "Dezembro" },
                    ]}
                  />
                  <SelectField
                    label="Ano"
                    value={periodYear.toString()}
                    onChange={(e) => setPeriodYear(Number(e.target.value))}
                    options={[
                      { value: "2025", label: "2025" },
                      { value: "2026", label: "2026" },
                      { value: "2027", label: "2027" },
                    ]}
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border-light space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase">
                    Resumo da Ficha
                  </span>
                  <Badge variant="success" className="animate-pulse">
                    LIVE
                  </Badge>
                </div>

                {isLoading || isFetchingContext ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 border border-border-light rounded-xl space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div className="p-3 bg-gray-50 border border-border-light rounded-xl space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                    <Card variant="gradient" className="p-5 space-y-3">
                      <Skeleton className="h-3 w-28 bg-white/20" />
                      <Skeleton className="h-8 w-36 bg-white/30" />
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3 w-3 bg-white/20 rounded-full" />
                        <Skeleton className="h-3 w-40 bg-white/20" />
                      </div>
                    </Card>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 border border-border-light rounded-xl">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">
                          {t("timesheet.table.date")}
                        </p>
                        <p className="text-xl font-bold text-text-primary">
                          {stats.totalHours.toFixed(1)}h
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 border border-border-light rounded-xl">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">
                          Extras (OT)
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {stats.totalOT.toFixed(1)}h
                        </p>
                      </div>
                    </div>

                    <Card variant="gradient" className="p-5">
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1.5">
                        Custo Estimado
                      </p>
                      <p className="text-3xl font-black">
                        {formatCurrency(stats.totalCost)}
                      </p>
                      <div className="mt-3 flex items-center text-[10px] font-medium text-[#4ade80]">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>Incluindo encargos e extras</span>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              Certifique-se de que o intervalo de descanso está correto para
              evitar cálculos de hora extra indevidos.
            </p>
          </div>
        </div>

        {/* Right Side: Entry Table */}
        <div className="xl:col-span-3">
          <Card className="flex flex-col min-h-[500px]">
            <div className="p-5 border-b border-border-light flex justify-between items-center">
              <h3 className="font-bold text-text-primary flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Registros Diários
              </h3>
              <AppButton
                variant="secondary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddEntry}
              >
                Adicionar Dia
              </AppButton>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest w-40">
                      Data
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                      Entrada / Saída
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                      Intervalo
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest min-w-[200px]">
                      Breakdown (h)
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                      Custo Dia
                    </th>
                    <th className="px-5 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {isLoading || isFetchingContext ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx}>
                        <td className="px-5 py-4">
                          <Skeleton className="h-8 w-28" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-16" />
                            <ArrowRight className="w-3 h-3 text-text-muted opacity-40" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-14" />
                            <span className="text-[10px] font-bold text-text-secondary uppercase">min</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-block space-y-1.5">
                            <Skeleton className="h-4 w-20 ml-auto" />
                            <Skeleton className="h-3 w-14 ml-auto" />
                          </div>
                        </td>
                        <td className="px-5 py-4"></td>
                      </tr>
                    ))
                  ) : (
                    calculatedEntries.map((entry) => (
                      <tr
                      key={entry.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) =>
                            handleUpdateEntry(entry.id, "date", e.target.value)
                          }
                          className="bg-transparent border border-transparent hover:border-border rounded p-1 text-sm font-medium focus:ring-1 w-32 transition"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={entry.startTime}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "startTime",
                                e.target.value,
                              )
                            }
                            className="bg-gray-50 p-1.5 text-xs font-bold w-[76px]"
                          />
                          <ArrowRight className="w-3 h-3 text-text-muted" />
                          <Input
                            type="time"
                            value={entry.endTime}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "endTime",
                                e.target.value,
                              )
                            }
                            className="bg-gray-50 p-1.5 text-xs font-bold w-[76px]"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={entry.breakDurationMinutes}
                            onChange={(e) =>
                              handleUpdateEntry(
                                entry.id,
                                "breakDurationMinutes",
                                Number(e.target.value),
                              )
                            }
                            className="bg-gray-50 p-1.5 text-xs font-bold w-16 text-center"
                          />
                          <span className="text-[10px] font-bold text-text-secondary uppercase">
                            min
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 flex-wrap min-w-[200px]">
                          <div title="Horas Normais" className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 cursor-help">
                            N: {entry.breakdown.normalHours.toFixed(1)}
                          </div>
                          {entry.breakdown.overtime50 > 0 && (
                            <div title="Hora Extra 50%" className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100 cursor-help">
                              50%: {entry.breakdown.overtime50.toFixed(1)}
                            </div>
                          )}
                          {entry.breakdown.overtime100 > 0 && (
                            <div title="Hora Extra 100%" className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100 cursor-help">
                              100%: {entry.breakdown.overtime100.toFixed(1)}
                            </div>
                          )}
                          {entry.breakdown.nightShiftHours > 0 && (
                            <div title="Adicional Noturno" className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-100 flex items-center gap-1 cursor-help">
                              <Moon className="w-2.5 h-2.5" />{" "}
                              {entry.breakdown.nightShiftHours.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p className="text-sm font-bold text-text-primary">
                          {formatCurrency(entry.breakdown.calculatedCost)}
                        </p>
                        <p className="text-[10px] font-medium text-text-secondary">
                          Total {entry.breakdown.totalHours.toFixed(1)}h
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-100 rounded transition-colors group-hover:opacity-100 md:opacity-0"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>

              {!isLoading && !isFetchingContext && entries.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-text-muted">
                  <Calculator className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-bold opacity-60 uppercase tracking-widest">
                    {t("timesheet.emptyState")}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border-light flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">
                    {t("timesheet.footer.totalWorked")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-text-primary">
                      {stats.totalHours.toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary">
                      horas
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">
                    Média por Dia
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-text-primary">
                      {(entries.length > 0
                        ? stats.totalHours / entries.length
                        : 0
                      ).toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary">
                      h/dia
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">
                  Total da Ficha
                </p>
                <p className="text-2xl font-black text-secondary">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </PageMain>

      {/* Mobile Footer for quick save */}
      <div className="sm:hidden bg-primary text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <div>
          <p className="text-[10px] opacity-70 uppercase font-bold">
            Custo Total
          </p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
        </div>
        <AppButton variant="secondary" size="sm" onClick={handleCloseTimeSheet}>
          Salvar
        </AppButton>
      </div>
    </PageShell>
  );
}
