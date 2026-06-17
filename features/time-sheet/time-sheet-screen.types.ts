import type {
  DayCostBreakdown,
  TimeEntryRecord,
} from "@/app/services/time-sheet.service";

export type ProjectOption = {
  id: string;
  name: string;
};

export type EmployeeOption = {
  id: string;
  nome: string;
  salario: number;
  horasPorDia: number;
  encargos: number;
  overtime50: number;
  overtime100: number;
};

export type TimeSheetStats = {
  totalHours: number;
  totalCost: number;
  totalOT: number;
  totalNight: number;
  normalHours: number;
  normalCost: number;
  ot50Hours: number;
  ot50Cost: number;
  ot100Hours: number;
  ot100Cost: number;
  nightHours: number;
  nightCost: number;
};

export type CalculatedTimeEntry = TimeEntryRecord & {
  breakdown: DayCostBreakdown;
};
