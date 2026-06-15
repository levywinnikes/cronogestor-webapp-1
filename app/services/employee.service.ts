export type EmployeeRegime = "DIA" | "QUINZENA" | "MES";

export interface EmployeeDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  document: string;
  roleName?: string | null;
  salary: string;
  regime: EmployeeRegime;
  hoursPerDay: string;
  chargesPercent: string;
  benefitsAmount: string;
  isActive: boolean;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  bankAccountDigit?: string | null;
  bankSwift?: string | null;
  bankIban?: string | null;
  pixKey?: string | null;
  vtEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeUpsertDto {
  firstName: string;
  lastName: string;
  document: string;
  roleName?: string;
  salary: number;
  regime: EmployeeRegime;
  hoursPerDay: number;
  chargesPercent: number;
  benefitsAmount: number;
  isActive?: boolean;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  bankAccountDigit?: string | null;
  bankSwift?: string | null;
  bankIban?: string | null;
  pixKey?: string | null;
  vtEnabled?: boolean;
}

interface ApiResponse<T> {
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as { message?: string } & T;

  if (!response.ok) {
    throw new Error(
      json.message ?? "Falha ao processar operacao de funcionarios.",
    );
  }

  return json;
}

class EmployeeService {
  async getEmployees(): Promise<EmployeeDto[]> {
    const response = await fetch("/api/employees", {
      method: "GET",
      credentials: "include",
    });

    const payload =
      await parseApiResponse<ApiResponse<EmployeeDto[]>>(response);
    return payload.data;
  }

  async createEmployee(data: EmployeeUpsertDto): Promise<EmployeeDto> {
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const payload = await parseApiResponse<ApiResponse<EmployeeDto>>(response);
    return payload.data;
  }

  async updateEmployee(
    id: string,
    data: EmployeeUpsertDto,
  ): Promise<EmployeeDto> {
    const response = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const payload = await parseApiResponse<ApiResponse<EmployeeDto>>(response);
    return payload.data;
  }

  async deleteEmployee(id: string): Promise<void> {
    const response = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await parseApiResponse<{ ok: true }>(response);
  }
}

export const employeeService = new EmployeeService();
