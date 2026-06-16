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
  Pencil,
  Trash2,
  Save,
  Calculator,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import {
  timeSheetService,
  TimeEntryRecord,
} from "@/app/services/time-sheet.service";
import { projectService } from "@/app/services/project.service";
import { employeeService } from "@/app/services/employee.service";
import { holidayService } from "@/app/services/holiday.service";
import { timeSheetApiService } from "@/app/services/time-sheet-api.service";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { InfoTooltip } from "@/components/ui/tooltip";

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

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function TimeSheetPageView() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Period state initialized to current month/year
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [isFetchingContext, setIsFetchingContext] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const [entries, setEntries] = useState<TimeEntryRecord[]>([]);
  const [holidayDates, setHolidayDates] = useState<Map<string, string>>(new Map());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);

  // Form Fields State inside Modal
  const [formProjectId, setFormProjectId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("17:00");
  const [formBreakMinutes, setFormBreakMinutes] = useState(60);

  const [formHasInterval2, setFormHasInterval2] = useState(false);
  const [formStartTime2, setFormStartTime2] = useState("18:00");
  const [formEndTime2, setFormEndTime2] = useState("20:00");

  const [formHasInterval3, setFormHasInterval3] = useState(false);
  const [formStartTime3, setFormStartTime3] = useState("20:30");
  const [formEndTime3, setFormEndTime3] = useState("22:00");

  const [formHasInterval4, setFormHasInterval4] = useState(false);
  const [formStartTime4, setFormStartTime4] = useState("22:15");
  const [formEndTime4, setFormEndTime4] = useState("23:30");

  // Load projects, employees, and holidays context
  useEffect(() => {
    const loadContext = async () => {
      try {
        const [projectsData, employeesData, holidaysData] = await Promise.all([
          projectService.getProjects(),
          employeeService.getEmployees(),
          holidayService.getHolidays(),
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

        const holidayMap = new Map<string, string>();
        holidaysData.forEach((h) => {
          holidayMap.set(h.date.split("T")[0], h.name);
        });

        setProjects(mappedProjects);
        setEmployees(mappedEmployees);
        setHolidayDates(holidayMap);

        setSelectedProjectId("all");
        setSelectedEmployeeId("all");
      } catch (error) {
        console.error(t("timesheet.errors.loadContextFailed"), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [t]);

  // Fetch timesheet context from API when project, employee, or period changes
  const fetchTimeSheetData = async () => {
    if (!selectedProjectId || !selectedEmployeeId) return;
    setIsFetchingContext(true);
    try {
      const context = await timeSheetApiService.getTimeSheetContext(
        selectedProjectId,
        selectedEmployeeId,
        viewAll ? "all" : periodYear,
        periodMonth
      );

      if (context && context.entries.length > 0) {
        const mappedEntries = context.entries.map((e) => ({
          id: e.id,
          employeeId: e.employeeId,
          projectId: e.projectId,
          date: e.workDate.split("T")[0],
          startTime: new Date(e.startDateTime).toISOString().substring(11, 16),
          endTime: new Date(e.endDateTime).toISOString().substring(11, 16),
          breakDurationMinutes: e.breakMinutes,
          startTime2: e.startDateTime2 ? new Date(e.startDateTime2).toISOString().substring(11, 16) : null,
          endTime2: e.endDateTime2 ? new Date(e.endDateTime2).toISOString().substring(11, 16) : null,
          startTime3: e.startDateTime3 ? new Date(e.startDateTime3).toISOString().substring(11, 16) : null,
          endTime3: e.endDateTime3 ? new Date(e.endDateTime3).toISOString().substring(11, 16) : null,
          startTime4: e.startDateTime4 ? new Date(e.startDateTime4).toISOString().substring(11, 16) : null,
          endTime4: e.endDateTime4 ? new Date(e.endDateTime4).toISOString().substring(11, 16) : null,
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

  // Clear submission error when form values or modal state changes
  useEffect(() => {
    setSubmitError(null);
  }, [
    formProjectId,
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

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Month navigation helpers
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

  // Helper to convert minutes back to HH:mm string
  const minutesToTime = (m: number): string => {
    const hours = Math.floor(m / 60) % 24;
    const mins = m % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

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

    // Check overlap with other entries on the same date (excluding the one being edited)
    const otherEntries = entries.filter((e) => e.id !== editingEntryId && e.date === formDate);
    for (const other of otherEntries) {
      const otherIntervals: { start: number; end: number }[] = [];
      const startOther1 = parseTime(other.startTime);
      let endOther1 = parseTime(other.endTime);
      if (endOther1 < startOther1) endOther1 += 24 * 60;
      otherIntervals.push({ start: startOther1, end: endOther1 });

      if (other.startTime2 && other.endTime2) {
        const startOther2 = parseTime(other.startTime2);
        let endOther2 = parseTime(other.endTime2);
        if (endOther2 < startOther2) endOther2 += 24 * 60;
        otherIntervals.push({ start: startOther2, end: endOther2 });
      }

      if (other.startTime3 && other.endTime3) {
        const startOther3 = parseTime(other.startTime3);
        let endOther3 = parseTime(other.endTime3);
        if (endOther3 < startOther3) endOther3 += 24 * 60;
        otherIntervals.push({ start: startOther3, end: endOther3 });
      }

      if (other.startTime4 && other.endTime4) {
        const startOther4 = parseTime(other.startTime4);
        let endOther4 = parseTime(other.endTime4);
        if (endOther4 < startOther4) endOther4 += 24 * 60;
        otherIntervals.push({ start: startOther4, end: endOther4 });
      }

      for (const cur of intervals) {
        for (const oth of otherIntervals) {
          if (cur.start < oth.end && oth.start < cur.end) {
            return `O horário selecionado colide com outro lançamento já existente no dia ${formDate.split("-").reverse().join("/")} (${minutesToTime(oth.start)} - ${minutesToTime(oth.end)}).`;
          }
        }
      }
    }

    return null;
  }, [formStartTime, formEndTime, formHasInterval2, formStartTime2, formEndTime2, formHasInterval3, formStartTime3, formEndTime3, formHasInterval4, formStartTime4, formEndTime4, formDate, entries, editingEntryId]);

  // Overall page overlap error check (for safety)
  const overlapError = useMemo(() => {
    const dateGroups: { [date: string]: TimeEntryRecord[] } = {};
    for (const entry of entries) {
      if (!dateGroups[entry.date]) {
        dateGroups[entry.date] = [];
      }
      dateGroups[entry.date].push(entry);
    }

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    for (const [date, dayEntries] of Object.entries(dateGroups)) {
      const dayIntervals: { start: number; end: number; entryId: string }[] = [];
      for (const entry of dayEntries) {
        const start1 = parseTime(entry.startTime);
        let end1 = parseTime(entry.endTime);
        if (end1 < start1) end1 += 24 * 60;
        dayIntervals.push({ start: start1, end: end1, entryId: entry.id });

        if (entry.startTime2 && entry.endTime2) {
          const start2 = parseTime(entry.startTime2);
          let end2 = parseTime(entry.endTime2);
          if (end2 < start2) end2 += 24 * 60;
          dayIntervals.push({ start: start2, end: end2, entryId: entry.id });
        }

        if (entry.startTime3 && entry.endTime3) {
          const start3 = parseTime(entry.startTime3);
          let end3 = parseTime(entry.endTime3);
          if (end3 < start3) end3 += 24 * 60;
          dayIntervals.push({ start: start3, end: end3, entryId: entry.id });
        }

        if (entry.startTime4 && entry.endTime4) {
          const start4 = parseTime(entry.startTime4);
          let end4 = parseTime(entry.endTime4);
          if (end4 < start4) end4 += 24 * 60;
          dayIntervals.push({ start: start4, end: end4, entryId: entry.id });
        }
      }

      for (let i = 0; i < dayIntervals.length; i++) {
        for (let j = i + 1; j < dayIntervals.length; j++) {
          const a = dayIntervals[i];
          const b = dayIntervals[j];
          if (a.start < b.end && b.start < a.end) {
            const formattedDate = date.split("-").reverse().join("/");
            return `Conflito geral de horários no dia ${formattedDate}. Por favor, revise os períodos.`;
          }
        }
      }
    }
    return null;
  }, [entries]);

  const calculatedEntries = useMemo(() => {
    return entries.map((entry) => {
      const emp = selectedEmployee || employees.find((e) => e.id === entry.employeeId);
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

  const stats = useMemo(() => {
    return calculatedEntries.reduce(
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
    );
  }, [calculatedEntries]);

  // Open modal in creation mode
  const handleOpenCreateModal = () => {
    const lastEntry = entries[entries.length - 1];
    let nextDate = "";

    if (lastEntry) {
      const dateObj = new Date(new Date(lastEntry.date).getTime() + 86400000);
      nextDate = dateObj.toISOString().split("T")[0];
    } else {
      const formattedMonth = periodMonth.toString().padStart(2, "0");
      nextDate = `${periodYear}-${formattedMonth}-01`;
    }

    setModalMode("create");
    setEditingEntryId(null);
    setFormDate(nextDate);
    setFormStartTime("08:00");
    setFormEndTime("17:00");
    setFormBreakMinutes(0);
    setFormHasInterval2(false);
    setFormStartTime2("18:00");
    setFormEndTime2("20:00");
    setFormHasInterval3(false);
    setFormStartTime3("20:30");
    setFormEndTime3("22:00");
    setFormHasInterval4(false);
    setFormStartTime4("22:15");
    setFormEndTime4("23:30");
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const handleOpenEditModal = (entry: TimeEntryRecord) => {
    setModalMode("edit");
    setEditingEntryId(entry.id);
    setFormProjectId(entry.projectId);
    setFormDate(entry.date);
    setFormStartTime(entry.startTime);
    setFormEndTime(entry.endTime);
    setFormBreakMinutes(entry.breakDurationMinutes);

    setFormHasInterval2(!!(entry.startTime2 && entry.endTime2));
    setFormStartTime2(entry.startTime2 || "18:00");
    setFormEndTime2(entry.endTime2 || "20:00");

    setFormHasInterval3(!!(entry.startTime3 && entry.endTime3));
    setFormStartTime3(entry.startTime3 || "20:30");
    setFormEndTime3(entry.endTime3 || "22:00");

    setFormHasInterval4(!!(entry.startTime4 && entry.endTime4));
    setFormStartTime4(entry.startTime4 || "22:15");
    setFormEndTime4(entry.endTime4 || "23:30");

    setIsModalOpen(true);
  };

  // Save Modal entry to React state
  const handleSaveModalEntry = async () => {
    if (modalOverlapError) return;

    const entryData: TimeEntryRecord = {
      id: editingEntryId || Math.random().toString(36).substr(2, 9),
      employeeId: selectedEmployeeId,
      projectId: formProjectId || selectedProjectId,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      breakDurationMinutes: 0,
      startTime2: formHasInterval2 && formStartTime2 && formEndTime2 ? formStartTime2 : null,
      endTime2: formHasInterval2 && formStartTime2 && formEndTime2 ? formEndTime2 : null,
      startTime3: formHasInterval3 && formStartTime3 && formEndTime3 ? formStartTime3 : null,
      endTime3: formHasInterval3 && formStartTime3 && formEndTime3 ? formEndTime3 : null,
      startTime4: formHasInterval4 && formStartTime4 && formEndTime4 ? formStartTime4 : null,
      endTime4: formHasInterval4 && formStartTime4 && formEndTime4 ? formEndTime4 : null,
    };

    if (selectedProjectId === "all") {
      setIsSubmitting(true);
      try {
        const parsedDate = new Date(formDate);
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth() + 1;
        const targetProjectId = entryData.projectId;

        // Fetch existing entries for the month/project/employee
        const context = await timeSheetApiService.getTimeSheetContext(targetProjectId, selectedEmployeeId, year, month);
        const existingEntries = context?.entries.map((e) => ({
          id: e.id,
          employeeId: e.employeeId,
          projectId: e.projectId,
          date: e.workDate.split("T")[0],
          startTime: new Date(e.startDateTime).toISOString().substring(11, 16),
          endTime: new Date(e.endDateTime).toISOString().substring(11, 16),
          breakDurationMinutes: e.breakMinutes,
          startTime2: e.startDateTime2 ? new Date(e.startDateTime2).toISOString().substring(11, 16) : null,
          endTime2: e.endDateTime2 ? new Date(e.endDateTime2).toISOString().substring(11, 16) : null,
          startTime3: e.startDateTime3 ? new Date(e.startDateTime3).toISOString().substring(11, 16) : null,
          endTime3: e.endDateTime3 ? new Date(e.endDateTime3).toISOString().substring(11, 16) : null,
          startTime4: e.startDateTime4 ? new Date(e.startDateTime4).toISOString().substring(11, 16) : null,
          endTime4: e.endDateTime4 ? new Date(e.endDateTime4).toISOString().substring(11, 16) : null,
        })) || [];

        // Replace or append
        const filtered = existingEntries.filter((e) => e.date !== formDate);
        const merged = [...filtered, entryData];

        await timeSheetApiService.createTimeSheet({
          projectId: targetProjectId,
          employeeId: selectedEmployeeId,
          periodYear: year,
          periodMonth: month,
          entries: merged.map((entry) => ({
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
        setIsModalOpen(false);
      } catch (error) {
        console.error("Falha ao salvar edição no modo Todos os Projetos:", error);
        const msg = error instanceof Error ? error.message : "Falha ao salvar lançamento de horas.";
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const parsedDate = new Date(formDate);
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth() + 1;
        const targetProjectId = selectedProjectId;

        const updatedEntries = modalMode === "create"
          ? [...entries, entryData]
          : entries.map((e) => (e.id === editingEntryId ? entryData : e));

        await timeSheetApiService.createTimeSheet({
          projectId: targetProjectId,
          employeeId: selectedEmployeeId,
          periodYear: year,
          periodMonth: month,
          entries: updatedEntries.map((entry) => ({
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
        setIsModalOpen(false);
      } catch (error) {
        console.error("Falha ao salvar lançamento de horas:", error);
        const msg = error instanceof Error ? error.message : "Falha ao salvar lançamento de horas.";
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    }

    setIsModalOpen(false);
  };

  const handleRemoveEntry = async (id: string) => {
    const entryToRemove = entries.find((e) => e.id === id);
    if (!entryToRemove) return;

    if (selectedProjectId === "all") {
      setIsSubmitting(true);
      try {
        const parsedDate = new Date(entryToRemove.date);
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth() + 1;
        const targetProjectId = entryToRemove.projectId;

        const context = await timeSheetApiService.getTimeSheetContext(targetProjectId, selectedEmployeeId, year, month);
        const existingEntries = context?.entries.map((e) => ({
          id: e.id,
          employeeId: e.employeeId,
          projectId: e.projectId,
          date: e.workDate.split("T")[0],
          startTime: new Date(e.startDateTime).toISOString().substring(11, 16),
          endTime: new Date(e.endDateTime).toISOString().substring(11, 16),
          breakDurationMinutes: e.breakMinutes,
          startTime2: e.startDateTime2 ? new Date(e.startDateTime2).toISOString().substring(11, 16) : null,
          endTime2: e.endDateTime2 ? new Date(e.endDateTime2).toISOString().substring(11, 16) : null,
          startTime3: e.startDateTime3 ? new Date(e.startDateTime3).toISOString().substring(11, 16) : null,
          endTime3: e.endDateTime3 ? new Date(e.endDateTime3).toISOString().substring(11, 16) : null,
          startTime4: e.startDateTime4 ? new Date(e.startDateTime4).toISOString().substring(11, 16) : null,
          endTime4: e.endDateTime4 ? new Date(e.endDateTime4).toISOString().substring(11, 16) : null,
        })) || [];

        const filtered = existingEntries.filter((e) => e.id !== id);

        await timeSheetApiService.createTimeSheet({
          projectId: targetProjectId,
          employeeId: selectedEmployeeId,
          periodYear: year,
          periodMonth: month,
          entries: filtered.map((entry) => ({
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
      } catch (error) {
        console.error("Falha ao remover lançamento no modo Todos os Projetos:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const filtered = entries.filter((e) => e.id !== id);
        const parsedDate = new Date(entryToRemove.date);
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth() + 1;

        await timeSheetApiService.createTimeSheet({
          projectId: selectedProjectId,
          employeeId: selectedEmployeeId,
          periodYear: year,
          periodMonth: month,
          entries: filtered.map((entry) => ({
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
      } catch (error) {
        console.error("Falha ao remover lançamento:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Persist timesheet changes to Backend API
  const handleCloseTimeSheet = async () => {
    if (!selectedProjectId || selectedProjectId === "all" || !selectedEmployeeId || entries.length === 0 || overlapError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await timeSheetApiService.createTimeSheet({
        projectId: selectedProjectId,
        employeeId: selectedEmployeeId,
        periodYear: periodYear,
        periodMonth: periodMonth,
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

      // Reload context instead of clearing, keeping the records on screen
      await fetchTimeSheetData();
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
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-add-timesheet"));
                }
              }}
            >
              {t("timesheet.buttons.addTimeSheet")}
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
                  label={t("timesheet.labels.project")}
                  icon={<Briefcase className="w-4 h-4" />}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: "all", label: t("timesheet.labels.allProjects") },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />

                <SelectField
                  label={t("timesheet.labels.employee")}
                  icon={<Users className="w-4 h-4" />}
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  options={[
                    { value: "all", label: t("timesheet.labels.allEmployees") },
                    ...employees.map((e) => ({
                      value: e.id,
                      label: e.nome,
                    })),
                  ]}
                />

                {/* Simplified Period Navigator */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                    Mês de Referência
                  </span>
                  <div className="flex items-center justify-between bg-gray-50 border border-border rounded-xl p-2.5">
                    <button
                      onClick={handlePrevMonth}
                      disabled={viewAll}
                      className="p-1 text-text-muted hover:text-text-primary hover:bg-gray-200 rounded-lg transition cursor-pointer disabled:opacity-35"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wide">
                      {viewAll ? "Todos os Lançamentos" : `${MONTH_NAMES[periodMonth - 1]} ${periodYear}`}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      disabled={viewAll}
                      className="p-1 text-text-muted hover:text-text-primary hover:bg-gray-200 rounded-lg transition cursor-pointer disabled:opacity-35"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <AppButton
                    variant={viewAll ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setViewAll(!viewAll)}
                    className="w-full mt-3 text-xs"
                  >
                    {viewAll ? "Filtrar por Mês" : "Ver todos os meses"}
                  </AppButton>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border-light space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase">
                    Resumo da Ficha
                  </span>
                  <Badge variant="success">LIVE</Badge>
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
                    </Card>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 border border-border-light rounded-xl">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">
                          Horas Totais
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
                      
                      <div className="mt-4 pt-4 border-t border-white/20 text-xs space-y-2 text-blue-100">
                        <div className="flex justify-between">
                          <span>Horas Normais:</span>
                          <span className="font-bold">{stats.normalHours.toFixed(1)}h ({formatCurrency(stats.normalCost)})</span>
                        </div>
                        {stats.ot50Hours > 0 && (
                          <div className="flex justify-between">
                            <span>Extra 50%:</span>
                            <span className="font-bold">{stats.ot50Hours.toFixed(1)}h ({formatCurrency(stats.ot50Cost)})</span>
                          </div>
                        )}
                        {stats.ot100Hours > 0 && (
                          <div className="flex justify-between">
                            <span>Extra 100%:</span>
                            <span className="font-bold">{stats.ot100Hours.toFixed(1)}h ({formatCurrency(stats.ot100Cost)})</span>
                          </div>
                        )}
                        {stats.nightHours > 0 && (
                          <div className="flex justify-between">
                            <span>Adicional Noturno:</span>
                            <span className="font-bold">{stats.nightHours.toFixed(1)}h ({formatCurrency(stats.nightCost)})</span>
                          </div>
                        )}
                      </div>

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

          {overlapError && (
            <div className="bg-danger-100 p-4 rounded-2xl border border-red-200 flex gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-danger leading-relaxed">
                {overlapError}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Entry Table (Read-Only) */}
        <div className="xl:col-span-3">
          <Card className="flex flex-col min-h-[500px]">
            <div className="p-5 border-b border-border-light flex justify-between items-center">
              <h3 className="font-bold text-text-primary flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Registros Diários
              </h3>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest w-40">
                      {t("timesheet.table.date")}
                    </th>
                    {selectedEmployeeId === "all" && (
                      <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest w-48">
                        {t("timesheet.table.employee")}
                      </th>
                    )}
                    {selectedProjectId === "all" && (
                      <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest w-48">
                        {t("timesheet.table.project")}
                      </th>
                    )}
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                      {t("timesheet.table.start")} / {t("timesheet.table.end")}
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                      {t("timesheet.table.break")}
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest min-w-[200px]">
                      Breakdown (h)
                    </th>
                    <th className="px-5 py-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                      Custo Dia
                    </th>
                    <th className="px-5 py-3 w-24 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {isLoading || isFetchingContext ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx}>
                        <td className="px-5 py-4"><Skeleton className="h-5 w-24" /></td>
                        {selectedEmployeeId === "all" && <td className="px-5 py-4"><Skeleton className="h-5 w-32" /></td>}
                        {selectedProjectId === "all" && <td className="px-5 py-4"><Skeleton className="h-5 w-32" /></td>}
                        <td className="px-5 py-4"><Skeleton className="h-5 w-48" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-5 w-36" /></td>
                        <td className="px-5 py-4 text-right"><Skeleton className="h-5 w-20 ml-auto" /></td>
                        <td className="px-5 py-4"></td>
                      </tr>
                    ))
                  ) : (
                    calculatedEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-text-primary">
                          {entry.date.split("-").reverse().join("/")}
                        </td>
                        {selectedEmployeeId === "all" && (
                          <td className="px-5 py-4 text-sm font-medium text-text-secondary">
                            {employees.find((e) => e.id === entry.employeeId)?.nome || "N/A"}
                          </td>
                        )}
                        {selectedProjectId === "all" && (
                          <td className="px-5 py-4 text-sm font-medium text-text-secondary">
                            {projects.find((p) => p.id === entry.projectId)?.name || "N/A"}
                          </td>
                        )}
                        <td className="px-5 py-4 text-xs font-medium space-x-1.5">
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-md font-bold">
                            {entry.startTime} - {entry.endTime}
                          </span>
                          {entry.startTime2 && entry.endTime2 && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-800 rounded-md font-bold border border-blue-100">
                              {entry.startTime2} - {entry.endTime2}
                            </span>
                          )}
                          {entry.startTime3 && entry.endTime3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-800 rounded-md font-bold border border-purple-100">
                              {entry.startTime3} - {entry.endTime3}
                            </span>
                          )}
                          {entry.startTime4 && entry.endTime4 && (
                            <span className="inline-flex items-center px-2 py-1 bg-teal-50 text-teal-800 rounded-md font-bold border border-teal-100">
                              {entry.startTime4} - {entry.endTime4}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-text-secondary">
                          {entry.breakdown.breakMinutes} min
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-2 flex-wrap min-w-[200px]">
                              <div title="Horas Normais" className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 cursor-help">
                                Normal: {entry.breakdown.normalHours.toFixed(1)}h
                              </div>
                              {entry.breakdown.overtime50 > 0 && (
                                <div title="Hora Extra 50%" className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100 cursor-help">
                                  Extra 50%: {entry.breakdown.overtime50.toFixed(1)}h
                                </div>
                              )}
                              {entry.breakdown.overtime100 > 0 && (
                                <div title="Hora Extra 100%" className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100 cursor-help">
                                  Extra 100%: {entry.breakdown.overtime100.toFixed(1)}h
                                </div>
                              )}
                            </div>
                            {entry.breakdown.isHoliday && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100 w-max cursor-help" title={entry.breakdown.holidayName}>
                                🎉 Feriado: {entry.breakdown.holidayName}
                              </span>
                            )}
                            {entry.breakdown.isSunday && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 w-max">
                                📅 Domingo
                              </span>
                            )}
                            {entry.breakdown.isSaturday && !entry.breakdown.isHoliday && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 w-max">
                                📅 Sábado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-text-primary">
                            {formatCurrency(entry.breakdown.calculatedCost)}
                          </p>
                          <p className="text-[10px] font-medium text-text-secondary">
                            Total {entry.breakdown.totalHours.toFixed(1)}h
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(entry)}
                              className="p-1.5 text-text-muted hover:text-primary hover:bg-gray-100 rounded transition"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEntryIdToDelete(entry.id);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-100 rounded transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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

      {/* Unified Entry Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "create" ? "Adicionar Lançamento Diário" : "Editar Lançamento Diário"}
      >
        <div className="space-y-5">
          {/* Project selection */}
          <SelectField
            label={t("timesheet.labels.project")}
            icon={<Briefcase className="w-4 h-4" />}
            value={formProjectId || selectedProjectId}
            onChange={(e) => setFormProjectId(e.target.value)}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />

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
              onClick={handleSaveModalEntry}
            >
              Confirmar
            </AppButton>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja excluir este lançamento de horas? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
            <AppButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton
              variant="danger"
              loading={isSubmitting}
              onClick={async () => {
                if (entryIdToDelete) {
                  await handleRemoveEntry(entryIdToDelete);
                  setDeleteConfirmOpen(false);
                  setEntryIdToDelete(null);
                }
              }}
            >
              Excluir
            </AppButton>
          </div>
        </div>
      </Dialog>

      {/* Mobile Footer for quick save */}
      <div className="sm:hidden bg-primary text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <div>
          <p className="text-[10px] opacity-70 uppercase font-bold">
            Custo Total
          </p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
        </div>
        <AppButton 
          variant="secondary" 
          size="sm" 
          onClick={handleCloseTimeSheet}
          disabled={isLoading || Boolean(overlapError) || entries.length === 0 || selectedProjectId === "all"}
        >
          Salvar
        </AppButton>
      </div>
    </PageShell>
  );
}
