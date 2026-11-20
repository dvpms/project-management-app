"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import {
  TaskDetailModal,
  type EditableTaskItem,
} from "@/components/tasks/TaskDetailModal";
import { Badge, Icon, useConfirm, useToast } from "@/components/ui";
import { ActiveProjectsBoard } from "@/components/workspace/ActiveProjectsBoard";
import {
  WorkspaceToolbar,
  type WorkspaceLayoutMode,
} from "@/components/workspace/WorkspaceToolbar";
import { VIEW_SWITCH_TRANSITION } from "@/lib/motion";
import { recomputeOptimisticParents } from "@/lib/task-helpers";
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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSnapshot, setEditingSnapshot] =
    useState<EditableTaskItem | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>(
    undefined
  );

  const editingTask = editingTaskId
    ? (optimisticTasks.find((t) => t.id === editingTaskId) ??
      (editingSnapshot?.id === editingTaskId ? editingSnapshot : null))
    : null;

  const parentIdsWithChildren = new Set(
    optimisticTasks
      .map((t) => t.parentId)
      .filter((id): id is string => Boolean(id))
  );

  const kanbanTasks = optimisticTasks.filter((t) => {
    if (t.isArchived) return false;
    if (parentIdsWithChildren.has(t.id)) return false;
    return projectFilter === "ALL" ? true : t.projectId === projectFilter;
  });

  const openNewTaskModal = (status: TaskStatus = "BACKLOG") => {
    setEditingTaskId(null);
    setEditingSnapshot(null);
    setDefaultStatus(status);
    setDefaultProjectId(
      projectFilter !== "ALL" ? projectFilter : data.activeProjects[0]?.id
    );
    setModalOpen(true);
  };

  const openTaskModal = (task: EditableTaskItem) => {
    setEditingTaskId(task.id);
    setEditingSnapshot(task);
    setModalOpen(true);
  };

  const handleCommitMove = (
    taskId: string,
    targetStatus: TaskStatus,
    nextKanbanSnapshot: DashboardTaskItem[]
  ) => {
    const snapshotMap = new Map(nextKanbanSnapshot.map((t) => [t.id, t]));
    const mergedTasks = recomputeOptimisticParents(
      optimisticTasks.map((t) => snapshotMap.get(t.id) ?? t)
    );

    startTransition(async () => {
      setOptimisticTasks(mergedTasks);
      const res = await moveTaskAction({
        taskId,
        targetStatus,
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
      parentId: null,
      parentTitle: null,
      title,
      description: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      dueDate: null,
      createdAt: new Date().toISOString(),
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
    const nextTasks = recomputeOptimisticParents(
      optimisticTasks.map((t) =>
        doneIds.has(t.id) ? { ...t, isArchived: true } : t
      )
    );

    startTransition(async () => {
      setOptimisticTasks(nextTasks);
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

      <AnimatePresence initial={false}>
        {layoutMode !== "projects" && (
          <motion.section
            key="workspace-kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={VIEW_SWITCH_TRANSITION}
            className="flex flex-col gap-5"
          >
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
              layoutMode={layoutMode}
              onCommitMove={handleCommitMove}
              onSelectTask={openTaskModal}
              onArchiveAllDone={handleArchiveAllDone}
              onCreateTaskInStatus={(status) => openNewTaskModal(status)}
            />
          </motion.section>
        )}

        {layoutMode !== "kanban" && (
          <motion.section
            key="workspace-projects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={VIEW_SWITCH_TRANSITION}
            className="flex flex-col gap-5 border-t-2 border-border-soft pt-8"
          >
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
              onSelectTask={openTaskModal}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <TaskDetailModal
        open={modalOpen}
        task={editingTask}
        allTasks={optimisticTasks}
        defaultProjectId={defaultProjectId}
        defaultStatus={defaultStatus}
        projects={data.allProjects}
        milestones={data.milestones}
        onSelectTask={openTaskModal}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
