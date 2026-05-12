import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type BaseFieldProps = {
  label?: string;
  error?: string;
  helperText?: string;
  labelClassName?: string;
  wrapperClassName?: string;
};

type TextFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    inputClassName?: string;
  };

export function TextField({
  label,
  error,
  helperText,
  labelClassName = "",
  wrapperClassName = "",
  inputClassName = "",
  id,
  ...props
}: TextFieldProps) {
  return (
    <div className={wrapperClassName}>
      {label ? (
        <label htmlFor={id} className={labelClassName} suppressHydrationWarning>
          {label}
        </label>
      ) : null}
      <input id={id} className={inputClassName} {...props} />
      {error ? (
        <p className="text-red-500 text-xs mt-1 font-medium" suppressHydrationWarning>
          {error}
        </p>
      ) : null}
      {!error && helperText ? (
        <p className="text-xs mt-1 text-gray-500" suppressHydrationWarning>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

type SelectFieldProps = BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>;
    selectClassName?: string;
  };

export function SelectField({
  label,
  error,
  helperText,
  labelClassName = "",
  wrapperClassName = "",
  selectClassName = "",
  options,
  id,
  ...props
}: SelectFieldProps) {
  return (
    <div className={wrapperClassName}>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <select id={id} className={selectClassName} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      ) : null}
      {!error && helperText ? (
        <p className="text-xs mt-1 text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    textareaClassName?: string;
  };

export function TextareaField({
  label,
  error,
  helperText,
  labelClassName = "",
  wrapperClassName = "",
  textareaClassName = "",
  id,
  ...props
}: TextareaFieldProps) {
  return (
    <div className={wrapperClassName}>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <textarea id={id} className={textareaClassName} {...props} />
      {error ? (
        <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
      ) : null}
      {!error && helperText ? (
        <p className="text-xs mt-1 text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}
