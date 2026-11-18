"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { restoreTaskAction } from "@/actions/task-actions";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import {
  Badge,
  Button,
  Card,
  Icon,
  Select,
  useConfirm,
  useToast,
} from "@/components/ui";
import { PRIORITY_META, TASK_STATUS_META } from "@/lib/project-constants";
import type { ProjectDetailData } from "@/services/project-service";
import { cn } from "@/lib/utils";

type ProjectTaskRow = ProjectDetailData["tasks"][number];

export function ProjectTasksSection({
  tasks,
  onSelectTask,
  onAddTask,
}: {
  tasks: ProjectTaskRow[];
  onSelectTask: (task: ProjectTaskRow) => void;
  onAddTask: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | TaskStatus | "ARCHIVED">("ALL");

  const archivedCount = tasks.filter((t) => t.isArchived).length;
  const filteredTasks = tasks.filter((t) => {
    if (filter === "ARCHIVED") return t.isArchived;
    if (t.isArchived) return false;
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  const handleRestore = async (task: ProjectTaskRow) => {
    const ok = await confirm({
      title: "Pulihkan Tugas ke Board?",
      message: `"${task.title}" akan tampil kembali di kolom Selesai pada Space Kanban.`,
      confirmLabel: "Pulihkan",
      cancelLabel: "Batal",
      tone: "primary",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await restoreTaskAction(task.id);
      if (!res.ok) {
        showToast({
          title: "Gagal memulihkan tugas",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Tugas dipulihkan ke board", variant: "success" });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-[18px] font-bold text-ink">
          <Icon name="checklist" size="md" />
          Daftar Tugas Proyek ({filteredTasks.length})
        </h2>

        <div className="w-52">
          <Select
            aria-label="Filter status tugas proyek"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "ALL" | TaskStatus | "ARCHIVED")
            }
            className="h-9 rounded-xl px-3 py-1 text-[13px]"
          >
            <option value="ALL">Semua Status (Aktif)</option>
            <option value="BACKLOG">Belum dikerjakan</option>
            <option value="ON_PROGRESS">Sedang dikerjakan</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Selesai</option>
            <option value="ARCHIVED">Riwayat Arsip ({archivedCount})</option>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-sans text-[14px] font-medium text-ink-muted">
            Belum ada tugas pada filter ini.
          </p>
          {filter !== "ARCHIVED" && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Icon name="add" size="sm" />}
                onClick={onAddTask}
              >
                Tambah Tugas Pertama
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.map((t) => {
            const statusMeta = TASK_STATUS_META[t.status];
            const priorityMeta = PRIORITY_META[t.priority];
            const iconName =
              t.status === "DONE"
                ? "check_circle"
                : t.status === "ON_PROGRESS" || t.status === "REVIEW"
                  ? "pending"
                  : "radio_button_unchecked";

            return (
              <Card
                key={t.id}
                interactive
                onClick={() => onSelectTask(t)}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Icon
                    name={iconName}
                    size="md"
                    filled={t.status === "DONE"}
                    className={cn(
                      "mt-0.5 shrink-0",
                      t.status === "DONE"
                        ? "text-[#16A34A]"
                        : t.status === "ON_PROGRESS"
                          ? "text-[#0284C7]"
                          : t.status === "REVIEW"
                            ? "text-[#D97706]"
                            : "text-ink-muted"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-display text-[15px] font-bold text-ink",
                        t.status === "DONE" && "line-through text-ink-muted"
                      )}
                    >
                      {t.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
                      <span className={priorityMeta.textColor}>
                        {priorityMeta.label}
                      </span>
                      {t.dueDate && (
                        <span className="text-ink-muted">· Tenggat: {t.dueDate}</span>
                      )}
                      {t.milestoneTitle && (
                        <span className="text-ink-muted">· {t.milestoneTitle}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant={statusMeta.badgeVariant}>
                    {statusMeta.label}
                  </Badge>
                  {t.isArchived && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleRestore(t)}
                    >
                      Pulihkan
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
