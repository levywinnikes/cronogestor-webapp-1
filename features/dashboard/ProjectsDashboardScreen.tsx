"use client";

import { Plus, Building2, Calendar, LayoutDashboard } from "lucide-react";
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

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_MAP: Record<string, { label: string; variant: StatusVariant }> = {
  EM_ANDAMENTO: { label: "Em andamento", variant: "info" },
  CONCLUIDO: { label: "Concluído", variant: "success" },
  PARALISADO: { label: "Paralisado", variant: "danger" },
  NAO_INICIADO: { label: "Não iniciado", variant: "neutral" },
};

export default function DashboardPageView() {
  const { t } = useTranslation();
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

  return (
    <PageShell>
      <Header />

      <PageHeader
        title={t("dashboard.title")}
        icon={<LayoutDashboard className="h-6 w-6" />}
        actions={
          <Link href="/projetos/novo">
            <AppButton variant="secondary" icon={<Plus className="w-4 h-4" />}>
              {t("dashboard.buttons.addProject")}
            </AppButton>
          </Link>
        }
      />

      <PageMain className="max-w-7xl">
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
            {projects.map((project) => (
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
            ))}
          </div>
        )}
      </PageMain>
    </PageShell>
  );
}
