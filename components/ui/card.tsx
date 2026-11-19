import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SurfaceTone = "white" | "subtle" | "column";

const TONE_BG: Record<SurfaceTone, string> = {
  white:
    "bg-surface-container border-2 border-border-soft border-b-[5px] border-b-border-lip",
  subtle:
    "bg-surface-subtle border-2 border-border-soft border-b-[4px] border-b-border-lip",
  column: "bg-surface-column border-2 border-border-column",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  interactive?: boolean;
}

export function Card({
  tone = "white",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl text-ink",
        TONE_BG[tone],
        interactive &&
          "transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 px-4 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-[17px] font-bold leading-6 tracking-[-0.01em] text-ink",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-3 text-[13px] leading-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-2 px-4 pb-4 pt-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SurfaceColumnProps extends HTMLAttributes<HTMLElement> {
  tone?: SurfaceTone;
}

export function SurfaceColumn({
  tone = "column",
  className,
  children,
  ...props
}: SurfaceColumnProps) {
  return (
    <section
      className={cn("rounded-3xl p-5 text-ink", TONE_BG[tone], className)}
      {...props}
    >
      {children}
    </section>
  );
}
