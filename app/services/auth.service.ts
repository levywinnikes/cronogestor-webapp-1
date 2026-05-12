export interface LoginDto {
  email: string;
  password: string;
  organizationId?: string;
}

export interface RegisterDto {
  type: "PF" | "PJ";
  planId: "BASIC" | "PREMIUM" | "FULL";
  document: string;
  name: string;
  email: string;
  challenge: string;
  password: string;
}

export interface TenantSummary {
  id: string;
  name: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  planType?: "FREE" | "PREMIUM" | "FULL";
  isActive: boolean;
}

export interface AuthResponseDto {
  user: User;
  activeOrganization: {
    id: string;
    name: string;
  };
  organizations: TenantSummary[];
}

interface ApiError {
  message?: string;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as ApiError & T;

  if (!response.ok) {
    throw new Error(json.message ?? "Falha na autenticacao.");
  }

  return json as T;
}

class AuthService {
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return parseApiResponse<AuthResponseDto>(response);
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return parseApiResponse<AuthResponseDto>(response);
  }

  async logout(): Promise<void> {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    await parseApiResponse<{ ok: true }>(response);
  }

  async refresh(): Promise<void> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    await parseApiResponse<{ ok: true }>(response);
  }

  async session(): Promise<AuthResponseDto> {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    return parseApiResponse<AuthResponseDto>(response);
  }

  async switchTenant(organizationId: string): Promise<void> {
    const response = await fetch("/api/auth/switch-tenant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ organizationId }),
    });

    await parseApiResponse<{ activeOrganization: { id: string; name: string } }>(response);
  }

  async forgotPassword(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.info(`Recuperacao de senha solicitada para ${email}.`);
  }
}

export const authService = new AuthService();
