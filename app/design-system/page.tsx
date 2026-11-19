import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/components/design-system/DesignSystemShowcase";

export const metadata: Metadata = {
  title: "Design System — DevFlow Cute Solid | Space Kanban",
  description:
    "Katalog komponen dan token visual DevFlow Cute Solid untuk Space Kanban.",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
