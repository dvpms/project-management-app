import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="font-display text-[14px] font-bold leading-5 text-ink"
      >
        {label}
        {required && <span className="ml-1 text-[#E11D48]">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="font-sans text-[12px] font-semibold text-[#E11D48]">
          {error}
        </p>
      ) : helperText ? (
        <p className="font-sans text-[12px] font-medium text-ink-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL_BASE =
  "w-full rounded-2xl border-2 border-b-[4px] bg-surface-container px-3.5 py-2.5 font-sans text-[14px] font-medium text-ink placeholder:text-ink-muted transition-colors duration-100 focus:outline-none disabled:bg-surface-subtle disabled:text-ink-muted disabled:cursor-not-allowed";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        CONTROL_BASE,
        hasError
          ? "border-[#E11D48] border-b-[#BE123C] focus:border-[#BE123C]"
          : "border-border-soft border-b-border-lip focus:border-outline-focus focus:border-b-primary-lip",
        className
      )}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ hasError = false, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          CONTROL_BASE,
          "min-h-[100px] resize-y",
          hasError
            ? "border-[#E11D48] border-b-[#BE123C] focus:border-[#BE123C]"
            : "border-border-soft border-b-border-lip focus:border-outline-focus focus:border-b-primary-lip",
          className
        )}
        {...props}
      />
    );
  }
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { hasError = false, className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        CONTROL_BASE,
        "cursor-pointer",
        hasError
          ? "border-[#E11D48] border-b-[#BE123C] focus:border-[#BE123C]"
          : "border-border-soft border-b-border-lip focus:border-outline-focus focus:border-b-primary-lip",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
