import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return <div className={className}>{children}</div>;
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageSection({ children, className = "" }: PageSectionProps) {
  return <section className={className}>{children}</section>;
}

type PageMainProps = {
  children: ReactNode;
  className?: string;
};

export function PageMain({ children, className = "" }: PageMainProps) {
  return <main className={className}>{children}</main>;
}
