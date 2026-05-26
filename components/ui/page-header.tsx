import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("bg-surface-elevated border-b border-border sticky top-0 z-10", className)}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center text-text-primary">
          {icon ? (
            <span className="mr-2 text-primary flex-shrink-0">{icon}</span>
          ) : null}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
