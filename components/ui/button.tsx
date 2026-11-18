import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary border-primary-lip border-b-primary-lip hover:bg-primary-hover",
  secondary:
    "bg-[#F59E0B] text-[#FFFFFF] border-[#D97706] border-b-[#D97706] hover:bg-[#D97706]",
  accent:
    "bg-[#EC4899] text-[#FFFFFF] border-[#BE185D] border-b-[#BE185D] hover:bg-[#DB2777]",
  outline:
    "bg-surface-container text-ink border-border-soft border-b-border-lip hover:bg-surface-hover",
  success:
    "bg-[#16A34A] text-[#FFFFFF] border-[#15803D] border-b-[#15803D] hover:bg-[#15803D]",
  warning:
    "bg-[#D97706] text-[#FFFFFF] border-[#B45309] border-b-[#B45309] hover:bg-[#B45309]",
  danger:
    "bg-[#E11D48] text-[#FFFFFF] border-[#BE123C] border-b-[#BE123C] hover:bg-[#BE123C]",
  info:
    "bg-[#0284C7] text-[#FFFFFF] border-[#0369A1] border-b-[#0369A1] hover:bg-[#0369A1]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl gap-1.5",
  md: "h-10 px-4 text-[14px] rounded-2xl gap-2",
  lg: "h-12 px-5 text-[15px] rounded-2xl gap-2.5",
};

const BASE_BUTTON =
  "inline-flex items-center justify-center font-display font-bold border-2 border-b-[5px] transition-all duration-100 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none active:translate-y-[3px] active:border-b-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline-focus disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-[5px]";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          BASE_BUTTON,
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon: ReactNode;
  label: string;
}

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-10 w-10 rounded-2xl",
  lg: "h-12 w-12 rounded-2xl",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "outline",
      size = "md",
      icon,
      label,
      className,
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          BASE_BUTTON,
          VARIANT_CLASSES[variant],
          ICON_SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
