import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-surface flex flex-col font-sans",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageMainProps = {
  children: ReactNode;
  className?: string;
};

export function PageMain({ children, className }: PageMainProps) {
  return (
    <main
      className={cn(
        "flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      {children}
    </main>
  );
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageSection({ children, className }: PageSectionProps) {
  return <section className={cn(className)}>{children}</section>;
}
