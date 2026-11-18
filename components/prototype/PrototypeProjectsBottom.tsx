"use client";

import { useState, type FormEvent } from "react";
import {
  Badge,
  Button,
  Card,
  Icon,
  IconButton,
  Input,
  SurfaceColumn,
} from "@/components/ui";
import {
  PROJECT_COLOR_DOT,
  TASK_STATUS_META,
  sortProjectActiveTasks,
  type ProtoProject,
  type ProtoTask,
} from "@/lib/prototype-data";
import { cn } from "@/lib/utils";

interface PrototypeProjectsBottomProps {
  projects: ProtoProject[];
  tasks: ProtoTask[];
  onQuickAddTask: (projectId: string, title: string) => void;
  onSelectTask: (task: ProtoTask) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onOpenCreateProject: () => void;
}

function ProjectCardColumn({
  project,
  tasks,
  onQuickAdd,
  onSelectTask,
  onOpenDetail,
}: {
  project: ProtoProject;
  tasks: ProtoTask[];
  onQuickAdd: (title: string) => void;
  onSelectTask: (task: ProtoTask) => void;
  onOpenDetail: () => void;
}) {
  const [quickTitle, setQuickTitle] = useState("");
  const [showDone, setShowDone] = useState(false);

  const activeTasks = sortProjectActiveTasks(
    tasks.filter((t) => t.status !== "DONE")
  );
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAdd(quickTitle.trim());
    setQuickTitle("");
  };

  return (
    <Card className="flex w-[340px] shrink-0 flex-col gap-4 rounded-3xl p-5 sm:w-[370px]">
      {/* Klik header proyek langsung masuk ke Detail Proyek (tanpa tombol Detail terpisah) */}
      <button
        type="button"
        onClick={onOpenDetail}
        className="group flex w-full items-center justify-between gap-2 border-b-2 border-border-soft pb-3 text-left cursor-pointer"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "h-3.5 w-3.5 shrink-0 rounded-full",
              PROJECT_COLOR_DOT[project.tone]
            )}
          />
          <h3 className="truncate font-display text-[17px] font-bold leading-6 text-ink group-hover:text-primary">
            {project.name}
          </h3>
          <span className="font-mono text-[12px] font-bold text-ink-muted">
            {activeTasks.length}
          </span>
        </div>
        <Icon
          name="chevron_right"
          size="md"
          className="shrink-0 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </button>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          aria-label={`Tambah tugas cepat di ${project.name}`}
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Tambah tugas cepat..."
          className="h-10 rounded-xl px-3 py-2 text-[13px]"
        />
        <IconButton
          type="submit"
          variant="primary"
          label={`Simpan tugas cepat di ${project.name}`}
          icon={<Icon name="add" size="sm" />}
          className="h-10 w-10 shrink-0 rounded-xl"
        />
      </form>

      <div className="flex flex-col divide-y divide-border-soft">
        {activeTasks.length === 0 ? (
          <p className="py-5 text-center font-sans text-[13px] font-medium text-ink-muted">
            Semua tugas proyek ini sudah beres!
          </p>
        ) : (
          activeTasks.map((task) => {
            const statusMeta = TASK_STATUS_META[task.status];
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelectTask(task)}
                className="group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-3 text-left transition-colors duration-100 hover:bg-surface-hover cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14px] font-bold text-ink group-hover:text-primary">
                    {task.title}
                  </p>
                  {task.priority === "HIGH" && (
                    <span className="font-mono text-[11px] font-bold text-[#E11D48]">
                      Prioritas Tinggi
                    </span>
                  )}
                </div>
                <Badge variant={statusMeta.badgeVariant}>
                  {statusMeta.label}
                </Badge>
              </button>
            );
          })
        )}
      </div>

      {doneTasks.length > 0 && (
        <div className="border-t-2 border-border-soft pt-3">
          <button
            type="button"
            onClick={() => setShowDone((prev) => !prev)}
            aria-expanded={showDone}
            className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 font-display text-[13px] font-bold text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Icon
                name={showDone ? "expand_more" : "chevron_right"}
                size="sm"
              />
              Selesai ({doneTasks.length})
            </span>
            <Badge variant="success">Tuntas</Badge>
          </button>

          {showDone && (
            <div className="mt-1.5 flex flex-col divide-y divide-border-soft">
              {doneTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelectTask(task)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-hover cursor-pointer"
                >
                  <span className="truncate font-sans text-[13px] font-medium text-ink-muted line-through">
                    {task.title}
                  </span>
                  <Icon
                    name="check_circle"
                    size="sm"
                    filled
                    className="shrink-0 text-[#16A34A]"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function PrototypeProjectsBottom({
  projects,
  tasks,
  onQuickAddTask,
  onSelectTask,
  onOpenProjectDetail,
  onOpenCreateProject,
}: PrototypeProjectsBottomProps) {
  const activeProjects = projects.filter((p) => p.status === "ACTIVE");

  if (activeProjects.length === 0) {
    return (
      <SurfaceColumn className="flex flex-col items-center gap-3 py-12 text-center">
        <Icon name="folder_open" size="xl" />
        <h3 className="font-display text-[18px] font-bold text-ink">
          Belum ada proyek berstatus Aktif
        </h3>
        <p className="max-w-md font-sans text-[13px] font-medium text-ink-muted">
          Buat proyek baru atau aktifkan proyek di menu Daftar Proyek agar tampil di sini.
        </p>
        <Button
          variant="primary"
          leftIcon={<Icon name="add" size="sm" />}
          onClick={onOpenCreateProject}
        >
          Buat Proyek Pertama
        </Button>
      </SurfaceColumn>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {activeProjects.map((project) => (
        <ProjectCardColumn
          key={project.id}
          project={project}
          tasks={tasks.filter(
            (t) => t.projectId === project.id && !t.isArchived
          )}
          onQuickAdd={(title) => onQuickAddTask(project.id, title)}
          onSelectTask={onSelectTask}
          onOpenDetail={() => onOpenProjectDetail(project.id)}
        />
      ))}
    </div>
  );
}
