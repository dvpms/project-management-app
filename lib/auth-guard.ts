import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME_ID, isValidThemeId, type ThemeId } from "@/lib/theme-presets";

export interface WorkspaceUserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  theme: ThemeId;
  workspaceTitle: string;
  workspaceSubtitle: string;
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Sesi tidak valid. Silakan masuk kembali.");
  }
  return userId;
}

export async function requireWorkspaceUser(): Promise<WorkspaceUserProfile> {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      theme: true,
      workspaceTitle: true,
      workspaceSubtitle: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return {
    ...user,
    theme: isValidThemeId(user.theme) ? user.theme : DEFAULT_THEME_ID,
  };
}
