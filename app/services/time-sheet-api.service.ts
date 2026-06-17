import type { ConflictPreview, DeleteImpactPreview } from "@/lib/time-sheet/types";

export interface TimeSheetEntryInputDto {
  workDate: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number | null;
  startTime2?: string | null;
  endTime2?: string | null;
  startTime3?: string | null;
  endTime3?: string | null;
  startTime4?: string | null;
  endTime4?: string | null;
}

export interface CreateTimeSheetDto {
  projectId: string;
  employeeId: string;
  periodYear?: number | null;
  periodMonth?: number | null;
  conflictAcknowledged?: boolean;
  /** Dias em que validar conflito cross-project; omitido = todos os dias do payload. */
  conflictCheckWorkDates?: string[];
  entries: TimeSheetEntryInputDto[];
}

interface ApiResponse<T> {
  data: T;
}

export class TimeSheetConflictError extends Error {
  conflicts: ConflictPreview[];

  constructor(message: string, conflicts: ConflictPreview[]) {
    super(message);
    this.name = "TimeSheetConflictError";
    this.conflicts = conflicts;
  }
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as {
    message?: string;
    conflicts?: ConflictPreview[];
  } & T;

  if (response.status === 409 && json.conflicts) {
    throw new TimeSheetConflictError(
      json.message ?? "Conflito de horarios entre projetos.",
      json.conflicts,
    );
  }

  if (!response.ok) {
    throw new Error(json.message ?? "Falha ao processar operacao de ficha tempo.");
  }

  return json;
}

export interface SharedConflictSnapshotDto {
  conflictingProjects: {
    projectId: string;
    projectCode: string;
    projectName: string;
    sharedMinutes: number;
    overlapRanges: { start: string; end: string }[];
    splitRatio: number;
  }[];
}

export interface TimeSheetEntryResponseDto {
  id: string;
  projectId: string;
  employeeId: string;
  workDate: string;
  startDateTime: string;
  endDateTime: string;
  breakMinutes: number;
  startDateTime2?: string | null;
  endDateTime2?: string | null;
  startDateTime3?: string | null;
  endDateTime3?: string | null;
  startDateTime4?: string | null;
  endDateTime4?: string | null;
  effectiveMinutes?: number;
  exclusiveMinutes?: number;
  sharedMinutes?: number;
  hasSharedMinutes?: boolean;
  sharedConflictSnapshot?: SharedConflictSnapshotDto | null;
  normalMinutes?: number;
  overtimeFirstTwoMinutes?: number;
  overtimeAfterTwoMinutes?: number;
  saturdayMinutes?: number;
  sundayOrHolidayMinutes?: number;
  calculatedAmount?: number;
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
    periodYear: number | string,
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

  async previewConflict(payload: {
    projectId: string;
    employeeId: string;
    entry: TimeSheetEntryInputDto;
    excludeEntryId?: string;
  }): Promise<{ hasConflict: boolean; conflicts: ConflictPreview[] }> {
    const response = await fetch("/api/time-sheets/conflicts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await parseApiResponse<
      ApiResponse<{ hasConflict: boolean; conflicts: ConflictPreview[] }>
    >(response);
    return result.data;
  }

  async getDeleteImpact(entryId: string, employeeId: string): Promise<{
    requiresConfirmation: boolean;
    impact: DeleteImpactPreview;
  }> {
    const params = new URLSearchParams({ entryId, employeeId });
    const response = await fetch(`/api/time-sheets/conflicts?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    const result = await parseApiResponse<
      ApiResponse<DeleteImpactPreview & { requiresConfirmation: boolean }>
    >(response);

    return {
      requiresConfirmation: result.data.requiresConfirmation,
      impact: result.data,
    };
  }

  async createTimeSheetWithConflictFlow(
    payload: CreateTimeSheetDto,
    onConflict: (conflicts: ConflictPreview[]) => Promise<boolean>,
  ): Promise<void> {
    try {
      await this.createTimeSheet(payload);
    } catch (error) {
      if (error instanceof TimeSheetConflictError) {
        const confirmed = await onConflict(error.conflicts);
        if (!confirmed) {
          throw error;
        }
        await this.createTimeSheet({ ...payload, conflictAcknowledged: true });
        return;
      }
      throw error;
    }
  }
}

export const timeSheetApiService = new TimeSheetApiService();
