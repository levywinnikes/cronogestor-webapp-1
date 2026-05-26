import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border",
  {
    variants: {
      variant: {
        success: "bg-success-100 text-green-800 border-green-200",
        warning: "bg-warning-100 text-amber-800 border-amber-200",
        danger: "bg-danger-100 text-red-800 border-red-200",
        info: "bg-info-100 text-blue-800 border-blue-200",
        neutral: "bg-gray-100 text-gray-800 border-gray-200",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}
