"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProjectAction } from "@/actions/project-actions";
import { ProjectConfigModal } from "@/components/projects/ProjectConfigModal";
import {
  Button,
  Card,
  Icon,
  IconButton,
  useConfirm,
  useToast,
} from "@/components/ui";
import { isExternalUrl } from "@/lib/project-constants";
import type { ProjectDetailData } from "@/services/project-service";

export function ProjectAttributesPanel({
  project,
}: {
  project: Pick<
    ProjectDetailData,
    "id" | "name" | "summary" | "status" | "color" | "attributes"
  >;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [configOpen, setConfigOpen] = useState(false);

  const handleDeleteProject = async () => {
    const ok = await confirm({
      title: `Hapus Proyek "${project.name}"?`,
      message:
        "Seluruh tugas dan milestone di dalam proyek ini akan terhapus permanen.",
      confirmLabel: "Ya, Hapus Proyek",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      if (!res.ok) {
        showToast({
          title: "Gagal menghapus proyek",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Proyek dihapus", variant: "info" });
      router.push("/projects");
      router.refresh();
    });
  };

  return (
    <>
      <Card className="rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-border-soft pb-3">
          <Icon name="code" size="md" className="text-primary" />
          <h2 className="font-display text-[16px] font-bold text-ink">
            Informasi Teknis &amp; Atribut
          </h2>
        </div>

        {project.attributes.length === 0 ? (
          <p className="py-4 font-sans text-[13px] font-medium text-ink-muted">
            Belum ada atribut tambahan. Klik Edit Konfigurasi untuk menambahkan link repo, URL deploy, atau catatan teknis.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {project.attributes.map((attr) => (
              <div key={attr.id} className="flex flex-col gap-0.5">
                <span className="font-sans text-[12px] font-semibold text-ink-muted">
                  {attr.label}
                </span>
                {isExternalUrl(attr.value) ? (
                  <a
                    href={attr.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-mono text-[12px] font-bold text-primary hover:underline"
                  >
                    {attr.value}
                  </a>
                ) : (
                  <span className="truncate font-mono text-[12px] font-bold text-ink">
                    {attr.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 border-t-2 border-border-soft pt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            leftIcon={<Icon name="tune" size="sm" />}
            onClick={() => setConfigOpen(true)}
            disabled={isPending}
          >
            Edit Konfigurasi
          </Button>
          <IconButton
            size="sm"
            variant="danger"
            label="Hapus Proyek"
            icon={<Icon name="delete" size="sm" />}
            onClick={handleDeleteProject}
            disabled={isPending}
          />
        </div>
      </Card>

      <ProjectConfigModal
        open={configOpen}
        project={project}
        onClose={() => setConfigOpen(false)}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
