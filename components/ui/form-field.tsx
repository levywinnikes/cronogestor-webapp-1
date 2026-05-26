import {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

/* ── shared label + wrapper styles ────────────────────────────── */

const labelBase =
  "block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5";

const errorText = "text-danger text-xs mt-1 font-medium";
const helperText = "text-xs mt-1 text-text-muted";

type BaseFieldProps = {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: ReactNode;
  wrapperClassName?: string;
};

/* ── TextField ────────────────────────────────────────────────── */

type TextFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  label,
  error,
  helperText: helper,
  required,
  icon,
  wrapperClassName,
  id,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={id} className={labelBase} suppressHydrationWarning>
          {label}
          {required ? <span className="text-danger ml-0.5">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          className={cn(
            "w-full bg-gray-50 border border-border rounded-lg text-sm p-2.5 text-text-primary placeholder:text-text-muted focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition disabled:opacity-50",
            icon && "pl-9",
            error && "border-danger/50 focus:ring-danger/20",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className={errorText} suppressHydrationWarning>
          {error}
        </p>
      ) : null}
      {!error && helper ? (
        <p className={helperText} suppressHydrationWarning>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/* ── SelectField ──────────────────────────────────────────────── */

type SelectFieldProps = BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
  };

export function SelectField({
  label,
  error,
  helperText: helper,
  required,
  icon,
  wrapperClassName,
  options,
  placeholder,
  id,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={id} className={labelBase} suppressHydrationWarning>
          {label}
          {required ? <span className="text-danger ml-0.5">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        ) : null}
        <select
          id={id}
          className={cn(
            "w-full bg-gray-50 border border-border rounded-lg text-sm p-2.5 text-text-primary focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition disabled:opacity-50",
            icon && "pl-9",
            error && "border-danger/50 focus:ring-danger/20",
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className={errorText} suppressHydrationWarning>
          {error}
        </p>
      ) : null}
      {!error && helper ? (
        <p className={helperText} suppressHydrationWarning>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/* ── TextareaField ────────────────────────────────────────────── */

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({
  label,
  error,
  helperText: helper,
  required,
  wrapperClassName,
  id,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label ? (
        <label htmlFor={id} className={labelBase} suppressHydrationWarning>
          {label}
          {required ? <span className="text-danger ml-0.5">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={id}
        className={cn(
          "w-full bg-gray-50 border border-border rounded-lg text-sm p-2.5 text-text-primary placeholder:text-text-muted focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition disabled:opacity-50 min-h-[80px] resize-y",
          error && "border-danger/50 focus:ring-danger/20",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className={errorText} suppressHydrationWarning>
          {error}
        </p>
      ) : null}
      {!error && helper ? (
        <p className={helperText} suppressHydrationWarning>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
