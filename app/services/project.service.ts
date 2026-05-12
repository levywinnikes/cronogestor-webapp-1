export interface ProjectDto {
  id?: string;
  projectCode?: string;
  name: string;
  responsible?: string;
  contractType?: string;
  contractor?: string;
  startDate: string;
  endDate?: string;
  budgetForecast?: string; // Previsão de custo (Opcional) no lugar do Grupo
  contractNumber?: string;
  status: "NAO_INICIADO" | "EM_ANDAMENTO" | "PARALISADO" | "CONCLUIDO";
  address?: string;
  hasTaskList?: boolean;
}

interface ApiResponse<T> {
  data: T;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as { message?: string } & T;

  if (!response.ok) {
    throw new Error(json.message ?? "Falha ao processar operacao de projetos.");
  }

  return json;
}

class ProjectService {
  async getProjects(): Promise<ProjectDto[]> {
    const response = await fetch("/api/projects", {
      method: "GET",
      credentials: "include",
    });

    const payload = await parseApiResponse<ApiResponse<ProjectDto[]>>(response);
    return payload.data;
  }

  async addProject(project: ProjectDto): Promise<ProjectDto> {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(project),
    });

    const payload = await parseApiResponse<ApiResponse<ProjectDto>>(response);
    return payload.data;
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    const response = await fetch(`/api/projects/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const payload = await parseApiResponse<ApiResponse<ProjectDto>>(response);
    return payload.data;
  }

  async updateProject(id: string, project: ProjectDto): Promise<ProjectDto> {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(project),
    });

    const payload = await parseApiResponse<ApiResponse<ProjectDto>>(response);
    return payload.data;
  }
}

export const projectService = new ProjectService();
