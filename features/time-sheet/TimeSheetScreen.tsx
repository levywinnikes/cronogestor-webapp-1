"use client";

import { Input, Select } from "@/components/ui/field-primitives";
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

  const [entries, setEntries] = useState<TimeEntryRecord[]>([
    {
      id: "1",
      employeeId: "",
      projectId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "17:00",
      breakDurationMinutes: 60,
    },
  ]);

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
        setEntries((current) =>
          current.map((entry) => ({
            ...entry,
            projectId: nextProjectId,
            employeeId: nextEmployeeId,
          })),
        );
      } catch (error) {
        console.error(t("timesheet.errors.loadContextFailed"), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [t]);

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
    const nextDate = lastEntry
      ? new Date(new Date(lastEntry.date).getTime() + 86400000)
          .toISOString()
          .split("T")[0]
      : new Date().toISOString().split("T")[0];

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans mb-20 md:mb-0">
      {/* Top Header */}
      <Header />

      {/* Action Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-gray-800">
            <Clock className="h-6 w-6 mr-2 text-[#002f5c]" />
            <h2 className="text-2xl font-bold">{t("timesheet.page.title")}</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition flex items-center shadow-sm">
              Exportar PDF
            </button>
            <button
              onClick={handleCloseTimeSheet}
              disabled={isSubmitting || isLoading}
              className="px-6 py-2.5 bg-[#002f5c] hover:bg-[#001f3f] text-white rounded-lg text-sm font-bold shadow-md transition flex items-center disabled:opacity-60"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("timesheet.buttons.closeSheet")}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Side: Context Selectors & Stats */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Projeto Alvo
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#002f5c]/20 transition"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Colaborador
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#002f5c]/20 transition"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nome}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Resumo da Ficha
                </span>
                <div className="px-2 py-0.5 bg-green-50 text-[#2c9644] rounded text-[10px] font-bold border border-green-200 animate-pulse">
                  LIVE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    {t("timesheet.table.date")}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalHours.toFixed(1)}h
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Extras (OT)
                  </p>
                  <p className="text-xl font-bold text-orange-600">
                    {stats.totalOT.toFixed(1)}h
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-[#002f5c] to-[#001f3f] rounded-2xl text-white shadow-lg">
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
              </div>
            </div>
          </div>

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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#002f5c]" />
                Registros Diários
              </h3>
              <button
                onClick={handleAddEntry}
                className="p-1.5 bg-[#2c9644] text-white rounded-md hover:bg-[#237c37] transition shadow-sm"
                title="Adicionar Dia"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-40">
                      Data
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Entrada / Saída
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Intervalo
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest min-w-[200px]">
                      Breakdown (h)
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                      Custo Dia
                    </th>
                    <th className="px-5 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {calculatedEntries.map((entry) => (
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
                          className="bg-transparent border border-transparent hover:border-gray-200 rounded p-1 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#002f5c]/20 w-32 transition"
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
                            className="bg-gray-50 border border-gray-200 rounded-md p-1.5 text-xs font-bold w-[76px] focus:bg-white focus:outline-none transition"
                          />
                          <ArrowRight className="w-3 h-3 text-gray-400" />
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
                            className="bg-gray-50 border border-gray-200 rounded-md p-1.5 text-xs font-bold w-[76px] focus:bg-white focus:outline-none transition"
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
                            className="bg-gray-50 border border-gray-200 rounded-md p-1.5 text-xs font-bold w-16 text-center focus:bg-white focus:outline-none transition"
                          />
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            min
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                            N: {entry.breakdown.normalHours.toFixed(1)}
                          </div>
                          {entry.breakdown.overtime50 > 0 && (
                            <div className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100">
                              50%: {entry.breakdown.overtime50.toFixed(1)}
                            </div>
                          )}
                          {entry.breakdown.overtime100 > 0 && (
                            <div className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100">
                              100%: {entry.breakdown.overtime100.toFixed(1)}
                            </div>
                          )}
                          {entry.breakdown.nightShiftHours > 0 && (
                            <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                              <Moon className="w-2.5 h-2.5" />{" "}
                              {entry.breakdown.nightShiftHours.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(entry.breakdown.calculatedCost)}
                        </p>
                        <p className="text-[10px] font-medium text-gray-500">
                          Total {entry.breakdown.totalHours.toFixed(1)}h
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors group-hover:opacity-100 md:opacity-0"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {entries.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300">
                  <Calculator className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-bold opacity-60 uppercase tracking-widest">
                    {t("timesheet.emptyState")}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    {t("timesheet.footer.totalWorked")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {stats.totalHours.toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      horas
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                    Média por Dia
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {(entries.length > 0
                        ? stats.totalHours / entries.length
                        : 0
                      ).toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      h/dia
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                  Total da Ficha
                </p>
                <p className="text-2xl font-black text-[#2c9644]">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Footer for quick save */}
      <div className="sm:hidden bg-[#002f5c] text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <div>
          <p className="text-[10px] opacity-70 uppercase font-bold">
            Custo Total
          </p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
        </div>
        <button className="bg-[#2c9644] px-4 py-2 rounded-lg font-bold text-sm">
          Salvar
        </button>
      </div>
    </div>
  );
}
