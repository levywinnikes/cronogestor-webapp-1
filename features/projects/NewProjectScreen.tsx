"use client";

import { Input, Select } from "@/components/ui/field-primitives";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Building2, Save, Paperclip } from "lucide-react";
import { projectService, ProjectDto } from "@/app/services/project.service";
import Link from "next/link";
import { Header } from "@/components/Header";
import { useTranslation } from "react-i18next";

// Definição do schema Zod com base na imagem do formulário
const createProjectSchema = (t: (key: string) => string) =>
  z.object({
    type: z.enum(["COMPLETO", "SIMPLES"]).optional(),
    name: z.string().min(3, t("projects.errors.nameRequired")),
    responsible: z.string().optional(),
    contractType: z.string().optional(),
    contractor: z.string().optional(),
    startDate: z.string().min(1, t("projects.errors.startDateRequired")),
    endDate: z.string().min(1, t("projects.errors.endDateRequired")),
    budgetForecast: z.string().optional(),
    contractNumber: z.string().optional(),
    status: z
      .enum(["NAO_INICIADO", "EM_ANDAMENTO", "PARALISADO", "CONCLUIDO"])
      .optional(),
    address: z.string().optional(),
    hasTaskList: z.boolean().optional(),
  });

type ProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>;

const STATUS_OPTIONS = [
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "NAO_INICIADO", label: "Não iniciado" },
  { value: "PARALISADO", label: "Paralisado" },
  { value: "CONCLUIDO", label: "Concluído" },
];

type ProjectFormScreenProps = {
  projectId?: string;
};

export function ProjectFormScreen({ projectId }: ProjectFormScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProject, setIsFetchingProject] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const isEditMode = Boolean(projectId);
  const projectSchema = createProjectSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    mode: "onChange",
    defaultValues: {
      type: "COMPLETO",
      status: "EM_ANDAMENTO",
      hasTaskList: false,
    },
  });

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const loadProject = async () => {
      setIsFetchingProject(true);
      setErrorMsg("");

      try {
        const project = await projectService.getProjectById(projectId);

        reset({
          type: "COMPLETO",
          name: project.name,
          responsible: project.responsible ?? "",
          contractType: project.contractType ?? "",
          contractor: project.contractor ?? "",
          startDate: project.startDate
            ? new Date(project.startDate).toISOString().slice(0, 10)
            : "",
          endDate: project.endDate
            ? new Date(project.endDate).toISOString().slice(0, 10)
            : "",
          budgetForecast: project.budgetForecast ?? "",
          contractNumber: project.contractNumber ?? "",
          status: project.status,
          address: project.address ?? "",
          hasTaskList: project.hasTaskList ?? false,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t("projects.errors.loadFailed");
        setErrorMsg(message);
      } finally {
        setIsFetchingProject(false);
      }
    };

    loadProject();
  }, [projectId, reset, t]);

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

      if (isEditMode && projectId) {
        await projectService.updateProject(projectId, payload);
      } else {
        await projectService.addProject(payload);
      }
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("projects.errors.saveFailed");
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans mb-20 md:mb-0">
      {/* Top Header */}
      <Header />

      {/* Action Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-gray-800">
            <Building2 className="h-6 w-6 mr-2 text-[#002f5c]" />
            <h2 className="text-2xl font-bold">
              {isEditMode
                ? t("projects.page.editTitle")
                : t("projects.page.title")}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("projects.buttons.back")}
            </Link>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading || isFetchingProject || !isValid}
              className="px-6 py-2.5 bg-[#2c9644] hover:bg-[#237836] text-white rounded-lg text-sm font-bold shadow-md transition flex items-center disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditMode
                ? t("projects.buttons.update")
                : t("projects.buttons.save")}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1000px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <form
          id="project-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {isFetchingProject ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#002f5c]" />
            </div>
          ) : null}

          {/* Main Info Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
              {t("projects.page.basicInfo")}
            </h3>

            {/* Type Toggle */}
            <div className="flex gap-8 mb-6">
              <label className="flex items-center cursor-pointer">
                <Input
                  type="radio"
                  value="COMPLETO"
                  {...register("type")}
                  className="w-4 h-4 text-[#002f5c] bg-gray-100 border-gray-300 focus:ring-[#002f5c]"
                />
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {t("projects.registration.full")}
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <Input
                  type="radio"
                  value="SIMPLES"
                  {...register("type")}
                  className="w-4 h-4 text-[#002f5c] bg-gray-100 border-gray-300 focus:ring-[#002f5c]"
                />
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {t("projects.registration.simple")}
                </span>
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  {t("projects.labels.name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ex.: Shopping Santa Luzia"
                  className={`w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/20 outline-none transition ${
                    errors.name ? "border-red-400" : ""
                  }`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Responsável
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex.: Eng. Carlos Silva"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/20 outline-none transition"
                    {...register("responsible")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Tipo de contrato
                  </label>
                  <Select
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/20 outline-none transition"
                    {...register("contractType")}
                  >
                    <option value="">Selecione...</option>
                    <option value="Contratante">Contratante</option>
                    <option value="Empreitada">Empreitada</option>
                    <option value="Administracao">Administração</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Contratante
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex.: Prefeitura"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/20 outline-none transition"
                    {...register("contractor")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Endereço
                </label>
                <Input
                  type="text"
                  placeholder="Ex.: Av. ABC, 100, Centro"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/20 outline-none transition"
                  {...register("address")}
                />
              </div>
            </div>
          </div>

          {/* Logistics & Planning Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
              Planejamento e Custos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Início <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white transition"
                      {...register("startDate")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Término <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white transition"
                      {...register("endDate")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nº do contrato
                  </label>
                  <Input
                    type="text"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white transition"
                    {...register("contractNumber")}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    {t("projects.labels.status")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white transition"
                    {...register("status")}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Custo Previsto da Obra (Opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white transition font-semibold text-gray-900"
                    {...register("budgetForecast")}
                    onChange={handleBudgetChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center">
              <label className="flex items-center cursor-pointer group">
                <Input
                  type="checkbox"
                  className="w-4 h-4 text-[#2c9644] bg-gray-100 border-gray-300 rounded focus:ring-[#2c9644]"
                  {...register("hasTaskList")}
                />
                <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-gray-900">
                  Ativar Gestão de Tarefas para este Projeto
                </span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100 flex items-center">
              <Paperclip className="w-4 h-4 mr-2 text-[#002f5c]" />
              {t("project.attachments.title")}
            </h3>
            <div className="space-y-3">
              <Input
                type="file"
                multiple
                disabled
                className="w-full p-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500"
              />
              <p className="text-xs text-gray-500">
                {t("project.attachments.placeholder")}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold">
              {errorMsg}
            </div>
          )}
        </form>
      </main>

      {/* Mobile Footer Area Placeholder */}
      <div className="sm:hidden bg-[#002f5c] text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <span className="text-sm font-bold">
          {isEditMode ? t("projects.page.editTitle") : t("projects.page.title")}
        </span>
        <button
          onClick={handleSubmit(onSubmit)}
          className="bg-[#2c9644] px-5 py-2 rounded-lg font-bold text-sm"
        >
          {isEditMode
            ? t("projects.buttons.update")
            : t("projects.buttons.save")}
        </button>
      </div>
    </div>
  );
}

export default function AddProjectPageView() {
  return <ProjectFormScreen />;
}
