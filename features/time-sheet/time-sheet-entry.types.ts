export type ProjectOption = {
  id: string;
  name: string;
};

export type EmployeeOption = {
  id: string;
  nome: string;
};

export type TimeSheetEntryFormValues = {
  projectId: string;
  employeeId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  hasInterval2: boolean;
  startTime2: string;
  endTime2: string;
  hasInterval3: boolean;
  startTime3: string;
  endTime3: string;
  hasInterval4: boolean;
  startTime4: string;
  endTime4: string;
};

export const DEFAULT_TIME_SHEET_ENTRY_FORM: TimeSheetEntryFormValues = {
  projectId: "",
  employeeId: "",
  workDate: "",
  startTime: "08:00",
  endTime: "17:00",
  hasInterval2: false,
  startTime2: "18:00",
  endTime2: "20:00",
  hasInterval3: false,
  startTime3: "20:30",
  endTime3: "22:00",
  hasInterval4: false,
  startTime4: "22:15",
  endTime4: "23:30",
};
