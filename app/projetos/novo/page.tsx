"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { projectService, ProjectDto } from "../../services/project.service";
import Link from "next/link";

// Definição do schema Zod com base na imagem do formulário
const projectSchema = z.object({
  type: z.enum(["COMPLETO", "SIMPLES"]).optional(),
  name: z.string().min(3, "O nome do projeto é obrigatório."),
  responsible: z.string().optional(),
  contractType: z.string().optional(),
  contractor: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória."),
  endDate: z.string().min(1, "Previsão de término é obrigatória."),
  budgetForecast: z.string().optional(),
  contractNumber: z.string().optional(),
  status: z.enum(["NAO_INICIADO", "EM_ANDAMENTO", "PARALISADO", "CONCLUIDO"]).optional(),
  address: z.string().optional(),
  hasTaskList: z.boolean().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const STATUS_OPTIONS = [
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "NAO_INICIADO", label: "Não iniciado" }, // Corrigido para masculino
  { value: "PARALISADO", label: "Paralisado" }, // Corrigido para masculino
  { value: "CONCLUIDO", label: "Concluído" }, // Corrigido para masculino
];

export default function AddProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    mode: "onChange",
    defaultValues: {
      type: "COMPLETO",
      status: "EM_ANDAMENTO",
      hasTaskList: false
    }
  });

  const formType = watch("type");

  // Formatação de Moeda Básica para o budget
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value) {
      value = (parseInt(value, 10) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      setValue("budgetForecast", value, { shouldValidate: true });
    } else {
      setValue("budgetForecast", "");
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Limpar a formatação da moeda antes de salvar (se necessário para banco real)
      const cleanBudget = data.budgetForecast 
        ? data.budgetForecast.replace(/[R$\s.]/g, "").replace(",", ".") 
        : undefined;

      const payload: ProjectDto = {
        hasTaskList: data.hasTaskList || false,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        responsible: data.responsible,
        contractType: data.contractType,
        contractor: data.contractor,
        contractNumber: data.contractNumber,
        address: data.address,
        status: data.status || "EM_ANDAMENTO",
        budgetForecast: cleanBudget,
      };

      await projectService.addProject(payload);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar o projeto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-sans">
      
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </Link>
             <h1 className="text-xl font-medium text-[#e66a33]">Adicionar projeto</h1>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
             <span className="text-xl font-bold">&times;</span>
          </Link>
        </div>

        <div className="p-8">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Type Toggle */}
            <div className="flex gap-8 mb-6 pb-6 border-b border-gray-100">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  value="COMPLETO" 
                  {...register("type")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cadastro completo</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  value="SIMPLES" 
                  {...register("type")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cadastro simples</span>
              </label>
            </div>

            {/* Row 1: Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex.: Shopping Santa Luzia"
                className={`w-full px-3 py-2 text-sm border rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                  errors.name ? "border-red-400" : "border-gray-300"
                }`}
                {...register("name")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

             {/* Row 2: Responsável, Tipo Contrato, Contratante */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex.: Eng. Carlos Silva"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all"
                    {...register("responsible")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Tipo de contrato</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all bg-white"
                    {...register("contractType")}
                  >
                    <option value="">Selecione...</option>
                    <option value="Contratante">Contratante</option>
                    <option value="Empreitada">Empreitada</option>
                    <option value="Administracao">Administração</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Contratante</label>
                  <input
                    type="text"
                    placeholder="Ex.: Prefeitura"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all"
                    {...register("contractor")}
                  />
                </div>
             </div>

             {/* Row 3: Datas e Custo Previsto */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Data início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 text-sm border rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                      errors.startDate ? "border-red-400" : "border-gray-300"
                    }`}
                    {...register("startDate")}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Previsão de término <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 text-sm border rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                      errors.endDate ? "border-red-400" : "border-gray-300"
                    }`}
                    {...register("endDate")}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                </div>
                <div>
                  {/* ALTERADO DE GRUPO PARA CUSTO PREVISTO CONFORME PEDIDO */}
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Previsão de custo da obra <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all"
                    {...register("budgetForecast")}
                    onChange={handleBudgetChange}
                  />
                </div>
             </div>

             {/* Row 4: Contrato e Status */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Nº do contrato</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all"
                    {...register("contractNumber")}
                  />
                </div>
                <div>
                  {/* STATUS NO MASCULINO */}
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 text-sm border rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all bg-white ${
                      errors.status ? "border-red-400" : "border-gray-300"
                    }`}
                    {...register("status")}
                  >
                    {STATUS_OPTIONS.map(opt => (
                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                   {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
             </div>

             {/* Row 5: Endereço */}
             <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Endereço
              </label>
              <input
                type="text"
                placeholder="Ex.: Av. ABC, 100, Centro"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-400 focus:ring-1 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all"
                {...register("address")}
              />
            </div>

            {/* Configurações */}
            <div className="pt-4 border-t border-gray-100">
               <h3 className="text-sm font-semibold text-gray-800 mb-3">Configurações</h3>
               <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    {...register("hasTaskList")}
                  />
                  <span className="ml-2 text-sm text-gray-600">Lista de tarefas</span>
               </label>
            </div>

            {errorMsg && (
              <div className="text-red-600 text-sm font-medium py-2">
                {errorMsg}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
               <Link 
                 href="/dashboard"
                 className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
               >
                  Fechar
               </Link>
               <button
                 type="submit"
                 disabled={isLoading || !isValid}
                 className="px-6 py-2 rounded text-sm font-medium text-white bg-[#2ba347] hover:bg-[#238a3b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
               >
                 {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                 Salvar
               </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
