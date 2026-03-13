export interface ProjectDto {
  id?: string;
  name: string;
  responsible?: string;
  contractType?: string;
  contractor?: string;
  startDate: string;
  endDate?: string;
  budgetForecast?: string; // Previsão de custo (Opcional) no lugar do Grupo
  contractNumber?: string;
  status: 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'PARALISADO' | 'CONCLUIDO';
  address?: string;
  hasTaskList?: boolean;
}

// Simulando banco de dados de projetos
let DUMMY_PROJECTS: ProjectDto[] = [
  {
    id: 'proj-1',
    name: 'Shopping Santa Luzia',
    responsible: 'Eng. Carlos Silva',
    contractType: 'Empreitada Global',
    contractor: 'Construtora Alpha',
    startDate: '2026-03-01',
    endDate: '2027-12-01',
    budgetForecast: '1500000.00',
    contractNumber: 'CT-2026/01',
    status: 'EM_ANDAMENTO',
    address: 'Av. ABC, 100, Centro',
    hasTaskList: true
  }
];

class ProjectService {
  async getProjects(): Promise<ProjectDto[]> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    return [...DUMMY_PROJECTS];
  }

  async addProject(project: ProjectDto): Promise<ProjectDto> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    const newProject = {
      ...project,
      id: `proj-${Math.floor(Math.random() * 10000)}`
    };
    
    DUMMY_PROJECTS.push(newProject);
    return newProject;
  }
}

export const projectService = new ProjectService();
