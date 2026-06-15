"use client";

import { Plus, Building2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { projectService, ProjectDto } from "@/app/services/project.service";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AppButton } from "@/components/ui/button";

type StatusVariant = "success" | "warning" | "danger" | "neutral" | "info";

const STATUS_MAP: Record<string, { label: string; variant: StatusVariant }> = {
  EM_ANDAMENTO: { label: "Em andamento", variant: "info" },
  CONCLUIDO: { label: "Concluído", variant: "success" },
  PARALISADO: { label: "Paralisado", variant: "danger" },
  NAO_INICIADO: { label: "Não iniciado", variant: "neutral" },
};

export default function ProjectsPageView() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    summary: { totalBudget: number; totalRealized: number; totalHours: number };
    projects: Array<{
      projectId: string;
      projectName: string;
      budgetForecast: number;
      budgetMaterials: number;
      budgetLabor: number;
      budgetOthers: number;
      realizedCost: number;
      realizedHours: number;
    }>;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardAndProjects = async () => {
      try {
        const [projectsData, dashboardRes] = await Promise.all([
          projectService.getProjects(),
          fetch("/api/dashboard").then((res) => res.json()),
        ]);
        setProjects(projectsData);
        setDashboardData(dashboardRes);
      } catch (error) {
        console.error("Erro ao puxar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAndProjects();
  }, []);

  return (
    <PageShell>
      <Header />

      <PageHeader
        title={t("projects.page.listTitle")}
        icon={<Building2 className="h-6 w-6" />}
        actions={
          <Link href="/projetos/novo">
            <AppButton variant="secondary" icon={<Plus className="w-4 h-4" />}>
              {t("projects.buttons.add")}
            </AppButton>
          </Link>
        }
      />

      <PageMain className="max-w-7xl">
        {/* Top Summary Cards */}
        {dashboardData && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card variant="gradient" className="p-6 text-white bg-gradient-to-br from-primary to-primary-700">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">
                Orçamento Previsto Acumulado
              </p>
              <p className="text-3xl font-black">
                {dashboardData.summary.totalBudget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </Card>

            <Card className="p-6 border border-border-light shadow-sm">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Custo Realizado Acumulado
              </p>
              <p
                className={`text-3xl font-black ${
                  dashboardData.summary.totalRealized >
                  dashboardData.summary.totalBudget
                    ? "text-danger"
                    : "text-text-primary"
                }`}
              >
                {dashboardData.summary.totalRealized.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              {dashboardData.summary.totalBudget > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-semibold text-text-secondary mb-1">
                    <span>Percentual Consumido</span>
                    <span>
                      {(
                        (dashboardData.summary.totalRealized /
                          dashboardData.summary.totalBudget) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dashboardData.summary.totalRealized /
                          dashboardData.summary.totalBudget >
                        0.9
                          ? "bg-danger"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(
                          (dashboardData.summary.totalRealized /
                            dashboardData.summary.totalBudget) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border-light shadow-sm">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Total de Horas Realizadas
              </p>
              <p className="text-3xl font-black text-secondary">
                {dashboardData.summary.totalHours.toFixed(1)} h
              </p>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="flex flex-col h-full">
                <CardContent className="flex-1 space-y-4 pt-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                    <div className="pt-3 mt-3 border-t border-border-light flex gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-16 h-16" />}
            title="Nenhum projeto encontrado"
            description="Comece adicionando o seu primeiro projeto ao Cronogestor."
            action={
              <Link href="/projetos/novo">
                <AppButton icon={<Plus className="w-4 h-4" />}>
                  Criar meu primeiro projeto
                </AppButton>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const stats = dashboardData?.projects.find(
                (p) => p.projectId === project.id,
              );
              const percentage =
                stats && stats.budgetForecast > 0
                  ? (stats.realizedCost / stats.budgetForecast) * 100
                  : 0;

              return (
                <Link
                  href={`/projetos/${project.id}`}
                  key={project.id}
                  className="group"
                >
                  <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex-1">
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-3">
                        {project.name}
                      </h3>
                      <div className="space-y-2">
                        {project.responsible ? (
                          <div className="flex items-start text-sm">
                            <span className="text-text-secondary w-24">
                              Responsável:
                            </span>
                            <span className="text-text-primary font-medium">
                              {project.responsible}
                            </span>
                          </div>
                        ) : null}
                        {project.contractor ? (
                          <div className="flex items-start text-sm">
                            <span className="text-text-secondary w-24">
                              Contratante:
                            </span>
                            <span className="text-text-primary">
                              {project.contractor}
                            </span>
                          </div>
                        ) : null}

                        {stats ? (
                          <div className="space-y-2 pt-3 mt-3 border-t border-border-light">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-text-secondary">
                                Realizado:
                              </span>
                              <span
                                className={
                                  stats.realizedCost > stats.budgetForecast
                                    ? "text-danger"
                                    : "text-text-primary"
                                }
                              >
                                {stats.realizedCost.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-text-secondary">
                                Horas Lançadas:
                              </span>
                              <span className="text-text-primary font-semibold">
                                {stats.realizedHours.toFixed(1)} h
                              </span>
                            </div>
                            {stats.budgetForecast > 0 && (
                              <div className="pt-1">
                                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      percentage > 90
                                        ? "bg-danger"
                                        : "bg-primary"
                                    }`}
                                    style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        <div className="flex items-start text-sm mt-3 pt-3 border-t border-border-light">
                          <Calendar className="w-4 h-4 text-text-muted mr-2 mt-0.5" />
                          <span className="text-text-secondary">
                            {new Date(project.startDate).toLocaleDateString(
                              "pt-BR",
                              { timeZone: "UTC" },
                            )}
                            {project.endDate
                              ? ` até ${new Date(project.endDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Badge
                        variant={
                          STATUS_MAP[project.status]?.variant ?? "neutral"
                        }
                      >
                        {STATUS_MAP[project.status]?.label ?? project.status}
                      </Badge>
                      {project.budgetForecast ? (
                        <span className="text-sm font-bold text-text-primary">
                          {project.budgetForecast}
                        </span>
                      ) : null}
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageMain>
    </PageShell>
  );
}
