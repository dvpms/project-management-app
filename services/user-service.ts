import { prisma } from "@/lib/prisma";
import type { ThemeId } from "@/lib/theme-presets";
import type { UpdateWorkspaceIdentityInput } from "@/lib/validations/user-settings";

export async function updateUserTheme(userId: string, theme: ThemeId) {
  return prisma.user.update({
    where: { id: userId },
    data: { theme },
    select: { id: true, theme: true },
  });
}

export async function updateWorkspaceIdentity(
  userId: string,
  input: UpdateWorkspaceIdentityInput
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      workspaceTitle: input.workspaceTitle,
      workspaceSubtitle: input.workspaceSubtitle,
    },
    select: {
      id: true,
      workspaceTitle: true,
      workspaceSubtitle: true,
    },
  });
}
