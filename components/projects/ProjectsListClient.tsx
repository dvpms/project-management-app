"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProjectStatusAction } from "@/actions/project-actions";
import type { ProjectStatus } from "@/app/generated/prisma/enums";
import { ProjectCreateModal } from "@/components/projects/ProjectCreateModal";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  Icon,
  Select,
  useToast,
} from "@/components/ui";
import { PROGRESS_TRANSITION, VIEW_SWITCH_TRANSITION } from "@/lib/motion";
import {
  PROJECT_COLOR_DOT,
  PROJECT_STATUS_META,
} from "@/lib/project-constants";
import type { ProjectSummaryItem } from "@/services/project-service";
import { cn } from "@/lib/utils";

const FILTER_TABS: Array<{ value: "ALL" | ProjectStatus; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "ON_HOLD", label: "Ditunda" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

export function ProjectsListClient({
  projects,
}: {
  projects: ProjectSummaryItem[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<"ALL" | ProjectStatus>("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered =
    statusFilter === "ALL"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  const handleStatusChange = (projectId: string, nextStatus: ProjectStatus) => {
    startTransition(async () => {
      const res = await updateProjectStatusAction({
        projectId,
        status: nextStatus,
      });
      if (!res.ok) {
        showToast({
          title: "Gagal mengubah status",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Status proyek diperbarui", variant: "success" });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-extrabold leading-9 tracking-[-0.02em] text-ink">
            Daftar Proyek
          </h1>
          <p className="mt-1 font-sans text-[14px] font-medium text-ink-muted">
            Klik kartu proyek untuk membuka detailnya. Hanya proyek berstatus Aktif yang tampil di Dashboard Harian.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Icon name="add" size="sm" />}
          onClick={() => setCreateOpen(true)}
        >
          Proyek Baru
        </Button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {FILTER_TABS.map((tab) => (
          <Chip
            key={tab.value}
            active={statusFilter === tab.value}
            tone="theme"
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Icon name="folder_open" size="xl" className="text-ink-muted" />
          <h2 className="font-display text-[18px] font-bold text-ink">
            Belum ada proyek di kategori ini
          </h2>
          <p className="max-w-md font-sans text-[13px] font-medium text-ink-muted">
            Mulai buat proyek pertamamu agar tugas dapat terorganisir di Space Kanban.
          </p>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Icon name="add" size="sm" />}
            onClick={() => setCreateOpen(true)}
          >
            Proyek Baru
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project) => {
              const pct =
                project.totalTasks > 0
                  ? Math.round((project.doneTasks / project.totalTasks) * 100)
                  : 0;
              const statusMeta = PROJECT_STATUS_META[project.status];

              return (
                <motion.div
                  key={project.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={VIEW_SWITCH_TRANSITION}
                  className="h-full"
                >
                  <Card
                    interactive
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="group flex h-full flex-col justify-between p-1"
                  >
                    <CardHeader className="pb-1">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 rounded-full",
                            PROJECT_COLOR_DOT[project.color]
                          )}
                        />
                        <CardTitle className="truncate group-hover:text-primary">
                          {project.name}
                        </CardTitle>
                      </div>
                      <Badge variant={statusMeta.badgeVariant}>
                        {statusMeta.label}
                      </Badge>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-4 py-4">
                      <p className="line-clamp-2 min-h-[36px] font-sans text-[13px] font-medium text-ink-muted">
                        {project.summary || "Belum ada deskripsi singkat."}
                      </p>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-mono text-[11px] font-bold text-ink">
                          <span>Progres Tugas</span>
                          <span>
                            {project.doneTasks}/{project.totalTasks} ({pct}%)
                          </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full border border-border-soft bg-surface-subtle">
                          <motion.div
                            className="h-full rounded-full bg-[#16A34A]"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={PROGRESS_TRANSITION}
                          />
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter onClick={(e) => e.stopPropagation()}>
                      <Select
                        aria-label={`Ubah status ${project.name}`}
                        value={project.status}
                        onChange={(e) =>
                          handleStatusChange(
                            project.id,
                            e.target.value as ProjectStatus
                          )
                        }
                        className="h-9 rounded-xl px-2.5 py-1 text-[13px]"
                      >
                        <option value="ACTIVE">Aktif</option>
                        <option value="ON_HOLD">Ditunda</option>
                        <option value="COMPLETED">Selesai</option>
                        <option value="ARCHIVED">Diarsipkan</option>
                      </Select>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ProjectCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
