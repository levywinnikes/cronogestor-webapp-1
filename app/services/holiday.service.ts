export type HolidayType = "NACIONAL" | "ESTADUAL" | "MUNICIPAL" | "ORGANIZACAO";

export interface HolidayDto {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
}

interface ApiResponse<T> {
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
  } & T;

  if (!response.ok) {
    throw new Error(json.message ?? "Falha ao processar operacao de feriados.");
  }

  return json;
}

class HolidayService {
  async getHolidays(): Promise<HolidayDto[]> {
    const response = await fetch("/api/holidays", {
      method: "GET",
      credentials: "include",
    });

    const payload = await parseApiResponse<ApiResponse<HolidayDto[]>>(response);
    return payload.data;
  }

  async addHoliday(data: Omit<HolidayDto, "id">): Promise<HolidayDto> {
    const response = await fetch("/api/holidays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const payload = await parseApiResponse<ApiResponse<HolidayDto>>(response);
    return payload.data;
  }

  async deleteHoliday(id: string): Promise<void> {
    const response = await fetch(`/api/holidays/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await parseApiResponse<{ ok: true }>(response);
  }
}

export const holidayService = new HolidayService();
