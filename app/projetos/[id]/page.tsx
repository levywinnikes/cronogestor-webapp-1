import { ProjectFormScreen } from "@/features/projects/NewProjectScreen";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const { id } = await params;

  return <ProjectFormScreen projectId={id} />;
}
