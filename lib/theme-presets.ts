export type ThemeId =
  | "sky-blue"
  | "emerald-mint"
  | "warm-cream"
  | "berry-rose"
  | "pink-purple"
  | "sakura-pink"
  | "midnight-dark";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tag: string;
  description: string;
  primaryHex: string;
  swatches: [string, string, string, string];
  badgeVariant: "primary" | "emerald" | "orange" | "rose" | "info" | "neutral";
  isDark?: boolean;
}

export const DEFAULT_THEME_ID: ThemeId = "sky-blue";

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "sky-blue",
    name: "Sky Blue",
    tag: "DEFAULT",
    description: "Putih sejuk bersih dengan aksen biru cerah dan bibir 3D tajam.",
    primaryHex: "#2563EB",
    swatches: ["#F7F8FC", "#EEF2F6", "#FFFFFF", "#2563EB"],
    badgeVariant: "primary",
  },
  {
    id: "emerald-mint",
    name: "Emerald Mint",
    tag: "FRESH",
    description: "Mint sejuk yang menenangkan mata dengan tombol emerald 3D.",
    primaryHex: "#059669",
    swatches: ["#F3FAF6", "#E3F3EA", "#FFFFFF", "#059669"],
    badgeVariant: "emerald",
  },
  {
    id: "warm-cream",
    name: "Warm Cream Coral",
    tag: "COZY",
    description: "Krem kertas hangat bebas silau dengan aksen oranye-coral cerah.",
    primaryHex: "#EA580C",
    swatches: ["#FAF6EE", "#F1E9DA", "#FFFDF9", "#EA580C"],
    badgeVariant: "orange",
  },
  {
    id: "berry-rose",
    name: "Berry Rose",
    tag: "SWEET",
    description: "Nuansa rose lembut dengan aksen berry cerah yang playful.",
    primaryHex: "#E11D48",
    swatches: ["#FFF5F7", "#FCE7EC", "#FFFFFF", "#E11D48"],
    badgeVariant: "rose",
  },
  {
    id: "pink-purple",
    name: "Pink Purple",
    tag: "CUTE POP",
    description: "Lavender-pink cerah yang manis dengan tombol magenta-ungu 3D.",
    primaryHex: "#C026D3",
    swatches: ["#FDF7FF", "#F5E8FA", "#FFFFFF", "#C026D3"],
    badgeVariant: "rose",
  },
  {
    id: "sakura-pink",
    name: "Sakura Pink",
    tag: "PINK CUTE",
    description: "Pink sakura lembut dan ceria dengan tombol pink cerah 3D.",
    primaryHex: "#EC4899",
    swatches: ["#FFF6FA", "#FCE7F3", "#FFFFFF", "#EC4899"],
    badgeVariant: "rose",
  },
  {
    id: "midnight-dark",
    name: "Midnight Dark 3D",
    tag: "DARK SOLID",
    description: "Mode gelap 100% solid kontras tinggi dengan kedalaman 3D nyaman di malam hari.",
    primaryHex: "#3B82F6",
    swatches: ["#0B1120", "#162032", "#1E293B", "#3B82F6"],
    badgeVariant: "info",
    isDark: true,
  },
];

export const THEME_MAP: Record<ThemeId, ThemeOption> = Object.fromEntries(
  THEME_OPTIONS.map((t) => [t.id, t])
) as Record<ThemeId, ThemeOption>;

export function isValidThemeId(value: string | null | undefined): value is ThemeId {
  return Boolean(value && value in THEME_MAP);
}
