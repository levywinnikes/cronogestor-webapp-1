export interface DayCostBreakdown {
  normalHours: number;
  normalCost: number;
  overtime50: number;
  overtime50Cost: number;
  overtime100: number;
  overtime100Cost: number;
  nightShiftHours: number;
  nightShiftCost: number;
  calculatedCost: number;
  totalHours: number;
  isSunday: boolean;
  isSaturday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  breakMinutes: number;
}

export interface TimeEntryRecord {
  id: string;
  employeeId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDurationMinutes: number;
  startTime2?: string | null;
  endTime2?: string | null;
  startTime3?: string | null;
  endTime3?: string | null;
  startTime4?: string | null;
  endTime4?: string | null;
  effectiveMinutes?: number;
  sharedMinutes?: number;
  hasSharedMinutes?: boolean;
  sharedConflictSnapshot?: {
    conflictingProjects: {
      projectId: string;
      projectCode: string;
      projectName: string;
      sharedMinutes: number;
      overlapRanges: { start: string; end: string }[];
      splitRatio: number;
    }[];
  } | null;
}

type CostCalculationEmployee = {
  salario: number;
  horasPorDia: number;
  encargos: number;
  overtime50: number;
  overtime100: number;
};

export const timeSheetService = {
  calculateDayCost: (
    entry: TimeEntryRecord,
    employee: CostCalculationEmployee,
    holidayDates?: Map<string, string> | Set<string>,
  ): DayCostBreakdown => {
    // Parser Function
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h + m / 60;
    };

    // Gather and sort all valid intervals
    const intervals: { start: number; end: number }[] = [];
    const addInterval = (startStr?: string | null, endStr?: string | null) => {
      if (startStr && endStr) {
        const start = parseTime(startStr);
        let end = parseTime(endStr);
        if (end < start) {
          end += 24; // support overnight shift
        }
        intervals.push({ start, end });
      }
    };

    addInterval(entry.startTime, entry.endTime);
    addInterval(entry.startTime2, entry.endTime2);
    addInterval(entry.startTime3, entry.endTime3);
    addInterval(entry.startTime4, entry.endTime4);

    // Sort intervals by start time
    intervals.sort((a, b) => a.start - b.start);

    // Sum worked hours from intervals
    let totalWorked = 0;
    intervals.forEach((interval) => {
      totalWorked += interval.end - interval.start;
    });

    // Calculate automatic break minutes as gaps between consecutive intervals
    let breakMinutes = 0;
    for (let i = 0; i < intervals.length - 1; i++) {
      const currentEnd = intervals[i].end;
      const nextStart = intervals[i + 1].start;
      if (nextStart > currentEnd) {
        breakMinutes += (nextStart - currentEnd) * 60;
      }
    }

    if (totalWorked < 0) totalWorked = 0;

    const effectiveHours =
      entry.effectiveMinutes != null && entry.effectiveMinutes > 0
        ? entry.effectiveMinutes / 60
        : totalWorked;

    let normalHours = 0;
    let overtime50 = 0;
    let overtime100 = 0;
    const nightShiftHours = 0; // Simplificado para este MVP

    // Verificando final de semana (Domingo = 0, Sábado = 6) e Feriado
    const entryDate = new Date(entry.date + "T00:00:00");
    const dayOfWeek = entryDate.getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    
    let isHoliday = false;
    let holidayName: string | undefined = undefined;

    if (holidayDates) {
      if (holidayDates instanceof Map) {
        isHoliday = holidayDates.has(entry.date);
        holidayName = holidayDates.get(entry.date);
      } else {
        isHoliday = holidayDates.has(entry.date);
      }
    }

    if (isSunday || isHoliday) {
      overtime100 = effectiveHours;
    } else {
      if (effectiveHours > employee.horasPorDia) {
        normalHours = employee.horasPorDia;
        const extra = effectiveHours - employee.horasPorDia;
        if (isSaturday) {
          overtime50 = extra;
        } else {
          if (extra > 2) {
            overtime50 = 2;
            overtime100 = extra - 2;
          } else {
            overtime50 = extra;
          }
        }
      } else {
        normalHours = effectiveHours;
      }
    }

    // Calculando custo financeiro
    const hourlyRate = employee.salario / 220;
    const hourlyCostBase = hourlyRate * (1 + employee.encargos / 100);

    // Valor da hora com adicional de 50%
    const rate50 = hourlyCostBase * (1 + employee.overtime50 / 100);
    // Valor da hora com adicional de 100%
    const rate100 = hourlyCostBase * (1 + employee.overtime100 / 100);

    const normalCost = normalHours * hourlyCostBase;
    const overtime50Cost = overtime50 * rate50;
    const overtime100Cost = overtime100 * rate100;
    const nightShiftCost = 0;

    const calculatedCost = normalCost + overtime50Cost + overtime100Cost;

    return {
      normalHours,
      normalCost,
      overtime50,
      overtime50Cost,
      overtime100,
      overtime100Cost,
      nightShiftHours,
      nightShiftCost,
      calculatedCost,
      totalHours: effectiveHours,
      isSunday,
      isSaturday,
      isHoliday,
      holidayName,
      breakMinutes: Math.round(breakMinutes),
    };
  },
};
