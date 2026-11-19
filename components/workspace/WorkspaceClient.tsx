"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import {
  archiveDoneTasksAction,
  createTaskAction,
  moveTaskAction,
} from "@/actions/task-actions";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import { SpaceKanbanBoard } from "@/components/kanban/SpaceKanbanBoard";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { Badge, Icon, useConfirm, useToast } from "@/components/ui";
import { ActiveProjectsBoard } from "@/components/workspace/ActiveProjectsBoard";
import {
  WorkspaceToolbar,
  type WorkspaceLayoutMode,
} from "@/components/workspace/WorkspaceToolbar";
import type {
  DashboardTaskItem,
  DashboardWorkspaceData,
} from "@/services/workspace-service";

export function WorkspaceClient({ data }: { data: DashboardWorkspaceData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [, startTransition] = useTransition();

  const [optimisticTasks, setOptimisticTasks] = useOptimistic(data.tasks);
  const [layoutMode, setLayoutMode] = useState<WorkspaceLayoutMode>("split");
  const [projectFilter, setProjectFilter] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DashboardTaskItem | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>(
    undefined
  );

  const kanbanTasks =
    projectFilter === "ALL"
      ? optimisticTasks
      : optimisticTasks.filter((t) => t.projectId === projectFilter);

  const openNewTaskModal = (status: TaskStatus = "BACKLOG") => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDefaultProjectId(
      projectFilter !== "ALL" ? projectFilter : data.activeProjects[0]?.id
    );
    setModalOpen(true);
  };

  const handleCommitMove = (
    taskId: string,
    targetStatus: TaskStatus,
    orderedTaskIds: string[],
    nextKanbanSnapshot: DashboardTaskItem[]
  ) => {
    const snapshotMap = new Map(nextKanbanSnapshot.map((t) => [t.id, t]));
    const mergedTasks = optimisticTasks.map((t) => snapshotMap.get(t.id) ?? t);

    startTransition(async () => {
      setOptimisticTasks(mergedTasks);
      const res = await moveTaskAction({
        taskId,
        targetStatus,
        orderedTaskIds,
      });

      if (!res.ok) {
        showToast({
          title: "Gagal memindahkan tugas",
          description: res.error,
          variant: "error",
        });
      }
      router.refresh();
    });
  };

  const handleQuickAddTask = (projectId: string, title: string) => {
    const tempTask: DashboardTaskItem = {
      id: `temp-${Date.now()}`,
      projectId,
      milestoneId: null,
      milestoneTitle: null,
      title,
      description: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      dueDate: null,
      order: optimisticTasks.filter((t) => t.status === "BACKLOG").length,
      isArchived: false,
    };

    startTransition(async () => {
      setOptimisticTasks([...optimisticTasks, tempTask]);
      const res = await createTaskAction({
        projectId,
        title,
        status: "BACKLOG",
        priority: "MEDIUM",
      });

      if (!res.ok) {
        showToast({
          title: "Gagal menambah tugas",
          description: res.error,
          variant: "error",
        });
      } else {
        showToast({
          title: "Tugas ditambahkan!",
          description: `"${title}" masuk ke Belum dikerjakan.`,
          variant: "success",
        });
      }
      router.refresh();
    });
  };

  const handleArchiveAllDone = async () => {
    const doneTasks = kanbanTasks.filter((t) => t.status === "DONE");
    if (doneTasks.length === 0) return;

    const ok = await confirm({
      title: `Arsipkan ${doneTasks.length} Tugas Selesai?`,
      message:
        "Tugas akan disembunyikan dari papan harian dan tetap tersimpan di Riwayat Arsip serta progres Milestone.",
      confirmLabel: "Ya, Arsipkan Semua",
      cancelLabel: "Batal",
      tone: "warning",
    });
    if (!ok) return;

    const doneIds = new Set(doneTasks.map((t) => t.id));
    startTransition(async () => {
      setOptimisticTasks(optimisticTasks.filter((t) => !doneIds.has(t.id)));
      const res = await archiveDoneTasksAction(
        projectFilter !== "ALL" ? projectFilter : null
      );

      if (!res.ok) {
        showToast({
          title: "Gagal mengarsipkan",
          description: res.error,
          variant: "error",
        });
      } else {
        showToast({
          title: "100% Tuntas!",
          description: `${res.data?.count ?? doneTasks.length} tugas Selesai diarsipkan.`,
          variant: "success",
        });
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <WorkspaceToolbar
        activeProjects={data.activeProjects}
        projectFilter={projectFilter}
        layoutMode={layoutMode}
        onFilterChange={setProjectFilter}
        onLayoutChange={setLayoutMode}
        onNewTask={() => openNewTaskModal("BACKLOG")}
      />

      {layoutMode !== "projects" && (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-[24px] font-extrabold leading-8 tracking-[-0.02em] text-ink">
                Space Kanban
              </h1>
              <Badge variant="primary" mono>
                {kanbanTasks.length} TUGAS
              </Badge>
            </div>
            <span className="hidden font-sans text-[13px] font-medium text-ink-muted sm:inline">
              Seret kartu antar kolom atau klik untuk detail
            </span>
          </div>

          <SpaceKanbanBoard
            tasks={kanbanTasks}
            projects={data.activeProjects}
            onCommitMove={handleCommitMove}
            onSelectTask={(task) => {
              setEditingTask(task);
              setModalOpen(true);
            }}
            onArchiveAllDone={handleArchiveAllDone}
            onCreateTaskInStatus={(status) => openNewTaskModal(status)}
          />
        </section>
      )}

      {layoutMode !== "kanban" && (
        <section className="flex flex-col gap-5 border-t-2 border-border-soft pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-[24px] font-extrabold leading-8 tracking-[-0.02em] text-ink">
                Proyek Aktif
              </h2>
              <Badge variant="neutral" mono>
                {data.activeProjects.length} PROYEK
              </Badge>
            </div>

            <Link
              href="/projects"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-border-soft border-b-[5px] border-b-border-lip bg-surface-container px-3.5 font-display text-[13px] font-bold text-ink transition-all duration-100 hover:bg-surface-hover active:translate-y-[3px] active:border-b-2"
            >
              Kelola Semua Proyek
              <Icon name="arrow_forward" size="sm" />
            </Link>
          </div>

          <ActiveProjectsBoard
            projects={data.activeProjects}
            tasks={optimisticTasks}
            onQuickAddTask={handleQuickAddTask}
            onSelectTask={(task) => {
              setEditingTask(task);
              setModalOpen(true);
            }}
          />
        </section>
      )}

      <TaskDetailModal
        open={modalOpen}
        task={editingTask}
        defaultProjectId={defaultProjectId}
        defaultStatus={defaultStatus}
        projects={data.allProjects}
        milestones={data.milestones}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
