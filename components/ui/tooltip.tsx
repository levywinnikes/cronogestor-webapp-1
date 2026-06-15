import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type InfoTooltipProps = {
  content: string | ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  iconClassName?: string;
};

export function InfoTooltip({
  content,
  position = "top",
  className,
  iconClassName,
}: InfoTooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent",
  };

  return (
    <span className={cn("group relative inline-block cursor-help ml-1.5 align-middle select-none", className)}>
      <HelpCircle
        className={cn(
          "w-3.5 h-3.5 text-text-muted hover:text-text-primary transition-colors",
          iconClassName
        )}
      />
      <span
        className={cn(
          "absolute invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 w-64 p-3 bg-gray-900 text-white text-xs font-medium rounded-xl shadow-xl border border-gray-800 leading-relaxed",
          positionClasses[position]
        )}
      >
        {content}
        {/* Subtle arrow */}
        <span
          className={cn(
            "absolute border-4 w-0 h-0",
            arrowClasses[position]
          )}
        />
      </span>
    </span>
  );
}
