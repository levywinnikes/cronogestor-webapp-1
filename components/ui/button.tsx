import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-700 focus:ring-primary",
        secondary:
          "bg-secondary text-white hover:bg-secondary-700 focus:ring-secondary",
        outline:
          "border border-border bg-white text-text-primary hover:bg-gray-50 focus:ring-primary",
        ghost:
          "bg-transparent text-text-primary hover:bg-gray-100 focus:ring-primary",
        danger:
          "bg-danger text-white hover:bg-red-700 focus:ring-danger",
        "danger-outline":
          "border border-danger/30 bg-white text-danger hover:bg-danger-100 focus:ring-danger",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    icon?: ReactNode;
    loading?: boolean;
  };

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant, size, fullWidth, icon, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : icon ? (
          <span className="mr-2 flex items-center">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

AppButton.displayName = "AppButton";
