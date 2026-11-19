import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "sky"
  | "emerald"
  | "orange"
  | "rose"
  | "amber"
  | "teal";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  mono?: boolean;
  icon?: ReactNode;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  primary: "bg-primary text-on-primary",
  neutral: "bg-[#475569] text-[#FFFFFF]",
  success: "bg-[#16A34A] text-[#FFFFFF]",
  warning: "bg-[#D97706] text-[#FFFFFF]",
  danger: "bg-[#E11D48] text-[#FFFFFF]",
  info: "bg-[#0284C7] text-[#FFFFFF]",
  sky: "bg-[#0284C7] text-[#FFFFFF]",
  emerald: "bg-[#059669] text-[#FFFFFF]",
  orange: "bg-[#EA580C] text-[#FFFFFF]",
  rose: "bg-[#E11D48] text-[#FFFFFF]",
  amber: "bg-[#D97706] text-[#FFFFFF]",
  teal: "bg-[#0D9488] text-[#FFFFFF]",
};

export function Badge({
  variant = "primary",
  mono = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] leading-4 whitespace-nowrap",
        mono ? "font-mono font-bold" : "font-display font-bold",
        BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

export type ChipTone =
  | "theme"
  | "blue"
  | "sky"
  | "emerald"
  | "orange"
  | "rose"
  | "amber"
  | "teal";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tone?: ChipTone;
  icon?: ReactNode;
  mono?: boolean;
}

const CHIP_ACTIVE_TONES: Record<ChipTone, string> = {
  theme: "bg-primary text-on-primary border-primary-lip border-b-primary-lip",
  blue: "bg-[#2563EB] text-[#FFFFFF] border-[#1D4ED8] border-b-[#1D4ED8]",
  sky: "bg-[#0284C7] text-[#FFFFFF] border-[#0369A1] border-b-[#0369A1]",
  emerald: "bg-[#059669] text-[#FFFFFF] border-[#047857] border-b-[#047857]",
  orange: "bg-[#EA580C] text-[#FFFFFF] border-[#C2410C] border-b-[#C2410C]",
  rose: "bg-[#E11D48] text-[#FFFFFF] border-[#BE123C] border-b-[#BE123C]",
  amber: "bg-[#D97706] text-[#FFFFFF] border-[#B45309] border-b-[#B45309]",
  teal: "bg-[#0D9488] text-[#FFFFFF] border-[#0F766E] border-b-[#0F766E]",
};

export function Chip({
  active = false,
  tone = "theme",
  icon,
  mono = false,
  className,
  children,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-b-[4px] px-3.5 py-1.5 text-[12px] leading-4 transition-all duration-100 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none active:translate-y-[2px] active:border-b-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline-focus",
        mono ? "font-mono font-bold" : "font-display font-bold",
        active
          ? CHIP_ACTIVE_TONES[tone]
          : "bg-surface-container text-ink border-border-soft border-b-border-lip hover:bg-surface-hover",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
