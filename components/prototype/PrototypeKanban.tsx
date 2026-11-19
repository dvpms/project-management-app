"use client";

import { useId, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Icon,
  IconButton,
  SurfaceColumn,
} from "@/components/ui";
import {
  KANBAN_COLUMNS,
  PRIORITY_META,
  type ProtoMilestone,
  type ProtoProject,
  type ProtoTask,
  type TaskStatus,
} from "@/lib/prototype-data";
import { cn } from "@/lib/utils";

interface PrototypeKanbanProps {
  tasks: ProtoTask[];
  projects: ProtoProject[];
  milestones: ProtoMilestone[];
  onTasksChange: (nextTasks: ProtoTask[]) => void;
  onSelectTask: (task: ProtoTask) => void;
  onArchiveAllDone: () => void;
  onCreateTaskInStatus: (status: TaskStatus) => void;
}

function TaskCardContent({
  task,
  project,
  milestone,
  isOverlay = false,
}: {
  task: ProtoTask;
  project?: ProtoProject;
  milestone?: ProtoMilestone;
  isOverlay?: boolean;
}) {
  const priorityMeta = PRIORITY_META[task.priority];

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
            <Badge variant={project.tone} className="max-w-[150px] truncate">
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

        {(task.dueDate || milestone) && (
          <div className="flex flex-wrap items-center gap-3 pt-0.5 font-mono text-[11px] font-bold text-ink-muted">
            {task.dueDate && (
              <span className="inline-flex items-center gap-1">
                <Icon name="calendar_today" size="sm" className="text-[14px]" />
                {task.dueDate}
              </span>
            )}
            {milestone && (
              <span className="inline-flex items-center gap-1 truncate">
                <Icon name="flag" size="sm" className="text-[14px]" />
                {milestone.title}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SortableKanbanCard({
  task,
  project,
  milestone,
  onSelect,
}: {
  task: ProtoTask;
  project?: ProtoProject;
  milestone?: ProtoMilestone;
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
      <TaskCardContent task={task} project={project} milestone={milestone} />
    </div>
  );
}

function DroppableKanbanColumn({
  id,
  label,
  dotColor,
  tasks,
  projectsById,
  milestonesById,
  onSelectTask,
  onArchiveAllDone,
  onQuickCreate,
}: {
  id: TaskStatus;
  label: string;
  dotColor: string;
  tasks: ProtoTask[];
  projectsById: Map<string, ProtoProject>;
  milestonesById: Map<string, ProtoMilestone>;
  onSelectTask: (task: ProtoTask) => void;
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
        "flex min-h-[340px] min-w-[260px] flex-1 flex-col gap-4 p-5 transition-colors duration-100",
        isOver && "border-primary bg-surface-column-over"
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-1">
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

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3.5">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border-soft bg-surface p-6 text-center">
              <p className="font-sans text-[12px] font-semibold text-ink-muted">
                Seret kartu ke sini
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableKanbanCard
                key={task.id}
                task={task}
                project={projectsById.get(task.projectId)}
                milestone={
                  task.milestoneId ? milestonesById.get(task.milestoneId) : undefined
                }
                onSelect={() => onSelectTask(task)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </SurfaceColumn>
  );
}

export function PrototypeKanban({
  tasks,
  projects,
  milestones,
  onTasksChange,
  onSelectTask,
  onArchiveAllDone,
  onCreateTaskInStatus,
}: PrototypeKanbanProps) {
  const dndContextId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const milestonesById = new Map(milestones.map((m) => [m.id, m]));
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : undefined;

  const getColumnTasks = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  const findContainer = (id: string): TaskStatus | null => {
    if (KANBAN_COLUMNS.some((c) => c.id === id)) return id as TaskStatus;
    return tasks.find((t) => t.id === id)?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeTaskId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const updated = tasks.map((t) =>
      t.id === activeTaskId
        ? { ...t, status: overContainer, order: getColumnTasks(overContainer).length }
        : t
    );
    onTasksChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);
    const container = findContainer(activeTaskId);
    const overContainer = findContainer(overId);
    if (!container || !overContainer) return;

    const colTasks = getColumnTasks(container);
    const oldIndex = colTasks.findIndex((t) => t.id === activeTaskId);
    const newIndex = colTasks.findIndex((t) => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reordered = arrayMove(colTasks, oldIndex, newIndex).map((t, idx) => ({
        ...t,
        order: idx,
      }));
      const reorderedMap = new Map(reordered.map((t) => [t.id, t]));
      onTasksChange(tasks.map((t) => reorderedMap.get(t.id) ?? t));
    }
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMNS.map((col) => (
          <DroppableKanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            dotColor={col.dotColor}
            tasks={getColumnTasks(col.id)}
            projectsById={projectsById}
            milestonesById={milestonesById}
            onSelectTask={onSelectTask}
            onArchiveAllDone={onArchiveAllDone}
            onQuickCreate={() => onCreateTaskInStatus(col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCardContent
            task={activeTask}
            project={projectsById.get(activeTask.projectId)}
            milestone={
              activeTask.milestoneId
                ? milestonesById.get(activeTask.milestoneId)
                : undefined
            }
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
