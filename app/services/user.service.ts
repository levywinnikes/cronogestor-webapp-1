export type MembershipRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export type MembershipStatus = "ACTIVE" | "INVITED" | "DISABLED";

export interface UserAccountDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface OrganizationMembershipDto {
  id: string;
  organizationId: string;
  userAccountId: string;
  role: MembershipRole;
  status: MembershipStatus;
  userAccount: UserAccountDto;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
  } & T;

  if (!response.ok) {
    throw new Error(json.message ?? "Falha ao processar operação de usuários.");
  }

  return json;
}

class UserService {
  async getUsers(): Promise<OrganizationMembershipDto[]> {
    const response = await fetch("/api/configuracoes/usuarios", {
      method: "GET",
      credentials: "include",
    });

    const payload = await parseApiResponse<ApiResponse<OrganizationMembershipDto[]>>(response);
    return payload.data;
  }

  async inviteUser(data: { name: string; email: string; role: MembershipRole }): Promise<OrganizationMembershipDto> {
    const response = await fetch("/api/configuracoes/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const payload = await parseApiResponse<ApiResponse<OrganizationMembershipDto>>(response);
    return payload.data;
  }

  async updateUser(data: { membershipId: string; role: MembershipRole; status: MembershipStatus }): Promise<OrganizationMembershipDto> {
    const statusPayload = data.status === "DISABLED" ? "DISABLED" : "ACTIVE";
    const response = await fetch("/api/configuracoes/usuarios", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        membershipId: data.membershipId,
        role: data.role,
        status: statusPayload,
      }),
    });

    const payload = await parseApiResponse<ApiResponse<OrganizationMembershipDto>>(response);
    return payload.data;
  }

  async deleteUser(membershipId: string): Promise<void> {
    const response = await fetch(`/api/configuracoes/usuarios?membershipId=${membershipId}`, {
      method: "DELETE",
      credentials: "include",
    });

    await parseApiResponse<{ ok: true }>(response);
  }
}

export const userService = new UserService();
