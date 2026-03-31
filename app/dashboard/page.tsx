"use client";

import { useRouter } from "next/navigation";
import { LogOut, Plus, Building2, Calendar, LayoutDashboard, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { projectService, ProjectDto } from "../services/project.service";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Erro ao puxar projetos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCLUIDO': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARALISADO': return 'bg-red-100 text-red-800 border-red-200';
      case 'NAO_INICIADO': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EM_ANDAMENTO': return 'Em andamento';
      case 'CONCLUIDO': return 'Concluído';
      case 'PARALISADO': return 'Paralisado';
      case 'NAO_INICIADO': return 'Não iniciado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex flex-col font-sans">
      <Header />

      {/* Sub-header / Page Title & Actions */}
      <div className="bg-white border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-8">
               <div className="flex items-center text-gray-800">
                  <LayoutDashboard className="h-6 w-6 mr-2 text-[#002f5c]" />
                  <h2 className="text-2xl font-bold">Projetos</h2>
               </div>
               <Link 
                 href="/funcionarios"
                 className="flex items-center text-gray-600 hover:text-[#002f5c] transition-colors font-medium text-sm"
               >
                 <Users className="h-4 w-4 mr-1.5" />
                 Funcionários
               </Link>
            </div>
            
            <Link 
              href="/projetos/novo"
              className="px-4 py-2 bg-[#2c9644] hover:bg-[#237836] text-white rounded-lg text-sm font-bold shadow-sm transition flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar projeto
            </Link>
         </div>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002f5c]"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum projeto encontrado</h3>
            <p className="text-gray-500 mb-6">Comece adicionando o seu primeiro projeto ao Cronogestor.</p>
            <Link 
              href="/projetos/novo"
              className="inline-flex items-center px-4 py-2 bg-[#002f5c] hover:bg-[#001f3f] text-white rounded-lg text-sm font-medium transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar meu primeiro projeto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col cursor-pointer group">
                 <div className="p-5 border-b border-gray-50 flex-1">
                    <div className="flex justify-between items-start mb-3">
                       <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#002f5c] transition-colors line-clamp-2">
                         {project.name}
                       </h3>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                       {project.responsible && (
                         <div className="flex items-start text-sm">
                           <span className="text-gray-500 w-24">Responsável:</span>
                           <span className="text-gray-800 font-medium">{project.responsible}</span>
                         </div>
                       )}
                       {project.contractor && (
                         <div className="flex items-start text-sm">
                           <span className="text-gray-500 w-24">Contratante:</span>
                           <span className="text-gray-800">{project.contractor}</span>
                         </div>
                       )}
                       <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-50">
                           <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                           <span className="text-gray-600">
                             {new Date(project.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC'})} 
                             {project.endDate ? ` até ${new Date(project.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : ''}
                           </span>
                       </div>
                    </div>
                 </div>
                 <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                       {getStatusLabel(project.status)}
                    </span>
                    {project.budgetForecast && (
                      <span className="text-sm font-bold text-gray-700">
                        {project.budgetForecast}
                      </span>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
