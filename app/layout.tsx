import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { MotionProvider } from "@/components/layout/MotionProvider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Space Kanban — Kelola Proyek & Tugas Harian",
  description:
    "Workspace Kanban dan manajemen proyek harian dengan desain Soft Tactile 3D.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="sky-blue"
      suppressHydrationWarning
      className={`${nunito.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen bg-surface font-sans text-ink antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
