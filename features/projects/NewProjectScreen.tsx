"use client";

import { Input, Select } from "@/components/ui/field-primitives";
import { TextField, SelectField } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save, Paperclip } from "lucide-react";
import { projectService, ProjectDto } from "@/app/services/project.service";
import Link from "next/link";
import { Header } from "@/components/Header";
import { useTranslation } from "react-i18next";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/ui/button";

const createProjectSchema = (t: (key: string) => string) =>
  z.object({
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

const CONTRACT_OPTIONS = [
  { value: "Contratante", label: "Contratante" },
  { value: "Empreitada", label: "Empreitada" },
  { value: "Administracao", label: "Administração" },
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
      status: "EM_ANDAMENTO",
      hasTaskList: false,
    },
  });

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setIsFetchingProject(true);
      setErrorMsg("");
      try {
        const project = await projectService.getProjectById(projectId);
        reset({
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
    <PageShell className="mb-20 md:mb-0">
      <Header />

      <PageHeader
        title={isEditMode ? t("projects.page.editTitle") : t("projects.page.title")}
        icon={<Building2 className="h-6 w-6" />}
        actions={
          <>
            <Link href="/dashboard">
              <AppButton variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                {t("projects.buttons.back")}
              </AppButton>
            </Link>
            <AppButton
              variant="secondary"
              icon={<Save className="w-4 h-4" />}
              loading={isLoading}
              disabled={isFetchingProject || !isValid}
              onClick={handleSubmit(onSubmit)}
            >
              {isEditMode ? t("projects.buttons.update") : t("projects.buttons.save")}
            </AppButton>
          </>
        }
      />

      <PageMain className="max-w-[1000px]">
        <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isFetchingProject ? (
            <div className="space-y-6">
              {/* Basic Info Skeleton */}
              <Card>
                <CardHeader title={t("projects.page.basicInfo")} />
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Planning & Costs Skeleton */}
              <Card>
                <CardHeader title="Planejamento e Custos" />
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-border-light flex gap-2 items-center">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>

          {/* Basic Info */}
          <Card>
            <CardHeader title={t("projects.page.basicInfo")} />
            <CardContent className="space-y-6">
              <TextField
                label={t("projects.labels.name")}
                required
                placeholder="Ex.: Shopping Santa Luzia"
                error={errors.name?.message}
                {...register("name")}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TextField
                  label="Responsável"
                  placeholder="Ex.: Eng. Carlos Silva"
                  {...register("responsible")}
                />
                <SelectField
                  label="Tipo de contrato"
                  placeholder="Selecione..."
                  options={CONTRACT_OPTIONS}
                  {...register("contractType")}
                />
                <TextField
                  label="Contratante"
                  placeholder="Ex.: Prefeitura"
                  {...register("contractor")}
                />
              </div>

              <TextField
                label="Endereço"
                placeholder="Ex.: Av. ABC, 100, Centro"
                {...register("address")}
              />
            </CardContent>
          </Card>

          {/* Planning & Costs */}
          <Card>
            <CardHeader title="Planejamento e Custos" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label="Início"
                      required
                      type="date"
                      {...register("startDate")}
                    />
                    <TextField
                      label="Término"
                      required
                      type="date"
                      {...register("endDate")}
                    />
                  </div>
                  <TextField
                    label="Nº do contrato"
                    {...register("contractNumber")}
                  />
                </div>

                <div className="space-y-6">
                  <SelectField
                    label={t("projects.labels.status")}
                    required
                    options={STATUS_OPTIONS}
                    {...register("status")}
                  />
                  <TextField
                    label="Custo Previsto da Obra (Opcional)"
                    placeholder="R$ 0,00"
                    className="font-semibold"
                    {...register("budgetForecast")}
                    onChange={handleBudgetChange}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border-light flex items-center">
                <label className="flex items-center cursor-pointer group">
                  <Input
                    type="checkbox"
                    className="w-4 h-4 text-secondary bg-gray-100 border-border rounded focus:ring-secondary"
                    {...register("hasTaskList")}
                  />
                  <span className="ml-3 text-sm font-bold text-text-primary group-hover:text-primary transition">
                    Ativar Gestão de Tarefas para este Projeto
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader
              title={t("project.attachments.title")}
              icon={<Paperclip className="w-4 h-4" />}
            />
            <CardContent className="space-y-3">
              <Input
                type="file"
                multiple
                disabled
                className="w-full border-dashed border-border text-text-muted"
              />
              <p className="text-xs text-text-muted">
                {t("project.attachments.placeholder")}
              </p>
            </CardContent>
          </Card>
          </>
          )}

          {errorMsg ? (
            <div className="p-4 bg-danger-100 border border-red-200 rounded-lg text-danger text-sm font-bold">
              {errorMsg}
            </div>
          ) : null}
        </form>
      </PageMain>

      {/* Mobile Footer */}
      <div className="sm:hidden bg-primary text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <span className="text-sm font-bold">
          {isEditMode ? t("projects.page.editTitle") : t("projects.page.title")}
        </span>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={handleSubmit(onSubmit)}
        >
          {isEditMode ? t("projects.buttons.update") : t("projects.buttons.save")}
        </AppButton>
      </div>
    </PageShell>
  );
}

export default function AddProjectPageView() {
  return <ProjectFormScreen />;
}
