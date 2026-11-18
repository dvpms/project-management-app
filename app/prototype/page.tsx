import type { Metadata } from "next";
import { PrototypeApp } from "@/components/prototype/PrototypeApp";
import { DEFAULT_THEME_ID, isValidThemeId } from "@/lib/theme-presets";

export const metadata: Metadata = {
  title: "Prototipe Interaktif — Space Kanban",
  description:
    "Prototipe interaktif Space Kanban dengan Sky Tactile 3D dan 6 pilihan tema warna.",
};

export default async function PrototypePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const initialTheme = isValidThemeId(theme) ? theme : DEFAULT_THEME_ID;

  return <PrototypeApp initialTheme={initialTheme} />;
}
