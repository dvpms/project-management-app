"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectCreateModal } from "@/components/projects/ProjectCreateModal";
import { Button, Icon, SurfaceColumn } from "@/components/ui";
import { ProjectTasksColumn } from "@/components/workspace/ProjectTasksColumn";
import type {
  DashboardActiveProject,
  DashboardTaskItem,
} from "@/services/workspace-service";

export function ActiveProjectsBoard({
  projects,
  tasks,
  onQuickAddTask,
  onSelectTask,
}: {
  projects: DashboardActiveProject[];
  tasks: DashboardTaskItem[];
  onQuickAddTask: (projectId: string, title: string) => void;
  onSelectTask: (task: DashboardTaskItem) => void;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  if (projects.length === 0) {
    return (
      <>
        <SurfaceColumn className="flex flex-col items-center gap-3 py-12 text-center">
          <Icon name="folder_open" size="xl" className="text-ink-muted" />
          <h3 className="font-display text-[18px] font-bold text-ink">
            Belum ada proyek berstatus Aktif
          </h3>
          <p className="max-w-md font-sans text-[13px] font-medium text-ink-muted">
            Buat proyek baru atau aktifkan proyek di menu Daftar Proyek agar tampil di sini.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2.5">
            <Button
              variant="primary"
              leftIcon={<Icon name="add" size="sm" />}
              onClick={() => setCreateOpen(true)}
            >
              Buat Proyek Pertama
            </Button>
            <Link
              href="/projects"
              className="inline-flex h-10 items-center gap-1.5 rounded-2xl border-2 border-border-soft border-b-[5px] border-b-border-lip bg-surface-container px-4 font-display text-[14px] font-bold text-ink transition-all duration-100 hover:bg-surface-hover active:translate-y-[3px] active:border-b-2"
            >
              Buka Daftar Proyek
            </Link>
          </div>
        </SurfaceColumn>

        <ProjectCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => router.refresh()}
        />
      </>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {projects.map((project) => (
        <ProjectTasksColumn
          key={project.id}
          project={project}
          tasks={tasks.filter((t) => t.projectId === project.id)}
          onQuickAddTask={onQuickAddTask}
          onSelectTask={onSelectTask}
        />
      ))}
    </div>
  );
}
