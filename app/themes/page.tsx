import type { Metadata } from "next";
import { ThemesGallery } from "@/components/themes/ThemesGallery";

export const metadata: Metadata = {
  title: "Galeri Tema & Gaya 3D — Space Kanban",
  description:
    "Bandingkan 4 pilihan gaya 3D dan tema warna solid untuk aplikasi Space Kanban.",
};

export default function ThemesPage() {
  return <ThemesGallery />;
}
