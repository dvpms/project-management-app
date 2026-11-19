import { cn } from "@/lib/utils";

export interface IconProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  filled?: boolean;
  className?: string;
  label?: string;
}

const SIZE_CLASSES: Record<NonNullable<IconProps["size"]>, string> = {
  sm: "text-[16px]",
  md: "text-[20px]",
  lg: "text-[24px]",
  xl: "text-[28px]",
};

export function Icon({
  name,
  size = "md",
  filled = false,
  className,
  label,
}: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-rounded",
        SIZE_CLASSES[size],
        filled && "icon-filled",
        className
      )}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {name}
    </span>
  );
}
