export interface DayCostBreakdown {
  normalHours: number;
  overtime50: number;
  overtime100: number;
  nightShiftHours: number;
  calculatedCost: number;
  totalHours: number;
}

export interface TimeEntryRecord {
  id: string;
  employeeId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDurationMinutes: number;
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
  ): DayCostBreakdown => {
    // Parser Function
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h + m / 60;
    };

    const start = parseTime(entry.startTime);
    let end = parseTime(entry.endTime);

    // Se passou da meia-noite
    if (end < start) {
      end += 24;
    }

    let totalWorked = end - start - entry.breakDurationMinutes / 60;
    if (totalWorked < 0) totalWorked = 0;

    let normalHours = 0;
    let overtime50 = 0;
    let overtime100 = 0;
    const nightShiftHours = 0; // Simplificado para este MVP

    // Verificando final de semana (Domingo = 0, Sábado = 6)
    const entryDate = new Date(entry.date + "T00:00:00");
    const dayOfWeek = entryDate.getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    if (isSunday) {
      overtime100 = totalWorked;
    } else {
      if (totalWorked > employee.horasPorDia) {
        normalHours = employee.horasPorDia;
        const extra = totalWorked - employee.horasPorDia;
        if (isSaturday) {
          // Simplificação: Sábado as extras podem ter regras específicas, mas vamos usar 50%
          overtime50 = extra;
        } else {
          // Dias de semana
          if (extra > 2) {
            overtime50 = 2;
            overtime100 = extra - 2;
          } else {
            overtime50 = extra;
          }
        }
      } else {
        normalHours = totalWorked;
      }
    }

    // Calculando custo financeiro
    // Salario "Base" no mês, dividido por ex 220 horas para achar a hora.
    // Para simplificar, vamos assumir 220h mensais.
    const hourlyRate = employee.salario / 220;
    // Adicionando os encargos proporcionais
    const hourlyCostBase = hourlyRate * (1 + employee.encargos / 100);

    // Valor da hora com adicional de 50%
    const rate50 = hourlyCostBase * (1 + employee.overtime50 / 100);
    // Valor da hora com adicional de 100%
    const rate100 = hourlyCostBase * (1 + employee.overtime100 / 100);

    const calculatedCost =
      normalHours * hourlyCostBase +
      overtime50 * rate50 +
      overtime100 * rate100;

    return {
      normalHours,
      overtime50,
      overtime100,
      nightShiftHours,
      calculatedCost,
      totalHours: totalWorked,
    };
  },
};
