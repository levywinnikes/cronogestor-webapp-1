import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-surface-elevated rounded-xl shadow-sm border border-border p-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="flex justify-center mb-4 text-text-muted">{icon}</div>
      ) : null}
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      {description ? (
        <p className="text-text-secondary mb-6">{description}</p>
      ) : null}
      {action ?? null}
    </div>
  );
}
