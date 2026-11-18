"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge, Card, CardContent, Icon } from "@/components/ui";
import { PRIORITY_META, type ProjectColorTone } from "@/lib/project-constants";
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

  return (
    <Card
      interactive={!isOverlay}
      className={cn(
        "p-4",
        isOverlay && "rotate-1 border-primary border-b-primary-lip"
      )}
    >
      <CardContent className="flex flex-col gap-3 p-0">
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

        <p className="font-display text-[15px] font-bold leading-snug text-ink">
          {task.title}
        </p>

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

export function SortableKanbanTaskCard({
  task,
  project,
  onSelect,
}: {
  task: DashboardTaskItem;
  project?: CardProjectInfo;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={cn("touch-none outline-none", isDragging && "opacity-35")}
    >
      <KanbanTaskCardContent task={task} project={project} />
    </div>
  );
}
