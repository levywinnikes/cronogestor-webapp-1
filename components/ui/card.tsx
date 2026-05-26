import { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ── Card ─────────────────────────────────────────────────────── */

type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "gradient";
};

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variant === "default" &&
          "bg-surface-elevated border border-border shadow-sm",
        variant === "elevated" &&
          "bg-surface-elevated border border-border shadow-md",
        variant === "gradient" &&
          "bg-gradient-to-br from-primary to-primary-700 text-white shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── CardHeader ───────────────────────────────────────────────── */

type CardHeaderProps = {
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  action?: ReactNode;
};

export function CardHeader({
  children,
  className,
  icon,
  title,
  action,
}: CardHeaderProps) {
  if (title || icon) {
    return (
      <div
        className={cn(
          "px-6 py-4 border-b border-border-light flex items-center justify-between",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="text-primary flex-shrink-0">{icon}</span>
          ) : null}
          <h3 className="font-bold text-text-primary text-sm">{title}</h3>
        </div>
        {action ?? null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-border-light",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── CardContent ──────────────────────────────────────────────── */

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

/* ── CardFooter ───────────────────────────────────────────────── */

type CardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-border-light bg-gray-50/50 rounded-b-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
