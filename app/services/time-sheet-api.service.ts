export interface TimeSheetEntryInputDto {
  workDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
}

export interface CreateTimeSheetDto {
  projectId: string;
  employeeId: string;
  periodYear: number;
  periodMonth: number;
  entries: TimeSheetEntryInputDto[];
}

interface ApiResponse<T> {
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as { message?: string } & T;

  if (!response.ok) {
    throw new Error(
      json.message ?? "Falha ao processar operacao de ficha tempo.",
    );
  }

  return json;
}

export interface TimeSheetEntryResponseDto {
  id: string;
  workDate: string;
  startDateTime: string;
  endDateTime: string;
  breakMinutes: number;
}

export interface TimeSheetContextResponseDto {
  id: string;
  organizationId: string;
  projectId: string;
  employeeId: string;
  periodYear: number;
  periodMonth: number;
  status: string;
  entries: TimeSheetEntryResponseDto[];
}

class TimeSheetApiService {
  async getTimeSheetContext(
    projectId: string,
    employeeId: string,
    periodYear: number,
    periodMonth: number,
  ): Promise<TimeSheetContextResponseDto | null> {
    const params = new URLSearchParams({
      projectId,
      employeeId,
      periodYear: periodYear.toString(),
      periodMonth: periodMonth.toString(),
    });

    const response = await fetch(`/api/time-sheets/context?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const payload = await parseApiResponse<ApiResponse<TimeSheetContextResponseDto | null>>(response);
    return payload.data;
  }

  async createTimeSheet(payload: CreateTimeSheetDto): Promise<void> {
    const response = await fetch("/api/time-sheets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    await parseApiResponse<ApiResponse<{ id: string }>>(response);
  }
}

export const timeSheetApiService = new TimeSheetApiService();
