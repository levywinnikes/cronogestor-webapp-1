import { cn } from "@/lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200/80 dark:bg-neutral-800",
        {
          "rounded": variant === "text",
          "rounded-xl": variant === "rectangular",
          "rounded-full": variant === "circular",
        },
        className
      )}
      {...props}
    />
  );
}
