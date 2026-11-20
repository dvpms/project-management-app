"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import {
  DraggableKanbanTaskCard,
  type CardProjectInfo,
} from "@/components/kanban/KanbanTaskCard";
import { Button, Icon, IconButton, SurfaceColumn } from "@/components/ui";
import type { DashboardTaskItem } from "@/services/workspace-service";
import { cn } from "@/lib/utils";

export function KanbanColumn({
  id,
  label,
  dotColor,
  tasks,
  projectsById,
  scrollAreaClassName = "max-h-[520px]",
  onSelectTask,
  onArchiveAllDone,
  onQuickCreate,
}: {
  id: TaskStatus;
  label: string;
  dotColor: string;
  tasks: DashboardTaskItem[];
  projectsById: Map<string, CardProjectInfo>;
  scrollAreaClassName?: string;
  onSelectTask: (task: DashboardTaskItem) => void;
  onArchiveAllDone: () => void;
  onQuickCreate: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "column", status: id },
  });

  return (
    <SurfaceColumn
      tone="column"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-4 p-5 transition-colors duration-100 md:min-w-[260px]",
        isOver && "border-primary bg-surface-column-over"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn("h-3 w-3 shrink-0 rounded-full", dotColor)}
          />
          <h3 className="font-display text-[16px] font-bold leading-5 text-ink">
            {label}
          </h3>
          <span className="font-mono text-[12px] font-bold text-ink-muted">
            {tasks.length}
          </span>
        </div>

        {id === "DONE" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={tasks.length === 0}
            onClick={onArchiveAllDone}
            leftIcon={<Icon name="inventory_2" size="sm" />}
            className="h-8 px-2.5 text-[12px]"
          >
            Arsipkan
          </Button>
        ) : (
          <IconButton
            size="sm"
            variant="outline"
            label={`Tambah tugas di ${label}`}
            icon={<Icon name="add" size="sm" />}
            onClick={onQuickCreate}
            className="h-8 w-8"
          />
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain pr-1",
          scrollAreaClassName
        )}
      >
        {tasks.length === 0 ? (
          <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border-soft bg-surface p-6 text-center">
            <p className="font-sans text-[12px] font-semibold text-ink-muted">
              Seret kartu ke sini
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableKanbanTaskCard
              key={task.id}
              task={task}
              project={projectsById.get(task.projectId)}
              onSelect={() => onSelectTask(task)}
            />
          ))
        )}
      </div>
    </SurfaceColumn>
  );
}
