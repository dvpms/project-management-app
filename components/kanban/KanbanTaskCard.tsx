"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge, Card, CardContent, Icon } from "@/components/ui";
import { PRIORITY_META, type ProjectColorTone } from "@/lib/project-constants";
import { stripMarkdownToPlainText } from "@/lib/task-helpers";
import type { DashboardTaskItem } from "@/services/workspace-service";
import { cn } from "@/lib/utils";

export interface CardProjectInfo {
  id: string;
  name: string;
  color: ProjectColorTone;
}

function isTaskOverdue(dueDate: string | null, status: DashboardTaskItem["status"]): boolean {
  if (!dueDate || status === "DONE") return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function KanbanTaskCardContent({
  task,
  project,
  isOverlay = false,
}: {
  task: DashboardTaskItem;
  project?: CardProjectInfo;
  isOverlay?: boolean;
}) {
  const priorityMeta = PRIORITY_META[task.priority];
  const overdue = isTaskOverdue(task.dueDate, task.status);
  const descriptionPreview = stripMarkdownToPlainText(task.description);

  return (
    <Card
      interactive={!isOverlay}
      className={cn(
        "p-4",
        isOverlay && "border-primary border-b-primary-lip"
      )}
    >
      <CardContent className="flex flex-col gap-2.5 p-0">
        <div className="flex items-center justify-between gap-2">
          {project ? (
            <Badge variant={project.color} className="max-w-[150px] truncate">
              {project.name}
            </Badge>
          ) : (
            <span />
          )}
          <Badge variant={priorityMeta.badgeVariant}>{priorityMeta.label}</Badge>
        </div>

        {task.parentTitle && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-ink-muted">
            <Icon
              name="subdirectory_arrow_right"
              size="sm"
              className="shrink-0 text-[14px] text-primary"
            />
            <span className="truncate">{task.parentTitle}</span>
          </div>
        )}

        <p className="font-display text-[15px] font-bold leading-snug text-ink">
          {task.title}
        </p>

        {descriptionPreview && (
          <p className="line-clamp-2 font-sans text-[12px] font-medium leading-[1.45] text-ink-muted">
            {descriptionPreview}
          </p>
        )}

        {(task.dueDate || task.milestoneTitle) && (
          <div className="flex flex-wrap items-center gap-3 pt-0.5 font-mono text-[11px] font-bold text-ink-muted">
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  overdue && "text-[#E11D48]"
                )}
              >
                <Icon name="calendar_today" size="sm" className="text-[14px]" />
                {task.dueDate}
              </span>
            )}
            {task.milestoneTitle && (
              <span className="inline-flex items-center gap-1 truncate">
                <Icon name="flag" size="sm" className="text-[14px]" />
                {task.milestoneTitle}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DraggableKanbanTaskCard({
  task,
  project,
  onSelect,
}: {
  task: DashboardTaskItem;
  project?: CardProjectInfo;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={cn(
        "shrink-0 touch-none outline-none",
        isDragging && "opacity-35"
      )}
    >
      <KanbanTaskCardContent task={task} project={project} />
    </div>
  );
}
