"use client";

import { motion } from "framer-motion";
import { useId, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import {
  KanbanTaskCardContent,
  type CardProjectInfo,
} from "@/components/kanban/KanbanTaskCard";
import type { WorkspaceLayoutMode } from "@/components/workspace/WorkspaceToolbar";
import { SPRING_PICKUP } from "@/lib/motion";
import { KANBAN_COLUMNS } from "@/lib/project-constants";
import type { DashboardTaskItem } from "@/services/workspace-service";

interface SpaceKanbanBoardProps {
  tasks: DashboardTaskItem[];
  projects: CardProjectInfo[];
  layoutMode?: WorkspaceLayoutMode;
  onCommitMove: (
    taskId: string,
    targetStatus: TaskStatus,
    orderedTaskIds: string[],
    nextSnapshot: DashboardTaskItem[]
  ) => void;
  onSelectTask: (task: DashboardTaskItem) => void;
  onArchiveAllDone: () => void;
  onCreateTaskInStatus: (status: TaskStatus) => void;
}

export function SpaceKanbanBoard({
  tasks,
  projects,
  layoutMode = "split",
  onCommitMove,
  onSelectTask,
  onArchiveAllDone,
  onCreateTaskInStatus,
}: SpaceKanbanBoardProps) {
  const dndContextId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTasks, setDragTasks] = useState<DashboardTaskItem[] | null>(null);

  const displayedTasks = dragTasks ?? tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const activeTask = activeId
    ? displayedTasks.find((t) => t.id === activeId)
    : undefined;

  const getColumnTasks = (source: DashboardTaskItem[], status: TaskStatus) =>
    source
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  const findContainer = (
    source: DashboardTaskItem[],
    id: string
  ): TaskStatus | null => {
    if (KANBAN_COLUMNS.some((c) => c.id === id)) return id as TaskStatus;
    return source.find((t) => t.id === id)?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setDragTasks(tasks);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    setDragTasks((current) => {
      const base = current ?? tasks;
      const activeTaskId = String(active.id);
      const overId = String(over.id);
      const fromCol = findContainer(base, activeTaskId);
      const toCol = findContainer(base, overId);

      if (!fromCol || !toCol || fromCol === toCol) return base;

      const targetOrder = getColumnTasks(base, toCol).length;
      return base.map((t) =>
        t.id === activeTaskId ? { ...t, status: toCol, order: targetOrder } : t
      );
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const base = dragTasks ?? tasks;
    setActiveId(null);
    setDragTasks(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);
    const targetStatus = findContainer(base, activeTaskId);
    const overContainer = findContainer(base, overId);
    if (!targetStatus || !overContainer) return;

    const colTasks = getColumnTasks(base, targetStatus);
    const oldIndex = colTasks.findIndex((t) => t.id === activeTaskId);
    const newIndex = colTasks.findIndex((t) => t.id === overId);

    const reordered =
      oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex
        ? arrayMove(colTasks, oldIndex, newIndex)
        : colTasks;

    const normalized = reordered.map((t, idx) => ({ ...t, order: idx }));
    const normalizedMap = new Map(normalized.map((t) => [t.id, t]));
    const nextSnapshot = base.map((t) => normalizedMap.get(t.id) ?? t);

    onCommitMove(
      activeTaskId,
      targetStatus,
      normalized.map((t) => t.id),
      nextSnapshot
    );
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setDragTasks(null);
  };

  const scrollAreaClassName =
    layoutMode === "kanban"
      ? "max-h-[calc(100vh-240px)] min-h-[420px]"
      : "max-h-[520px]";

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            dotColor={col.dotColor}
            tasks={getColumnTasks(displayedTasks, col.id)}
            projectsById={projectsById}
            scrollAreaClassName={scrollAreaClassName}
            onSelectTask={onSelectTask}
            onArchiveAllDone={onArchiveAllDone}
            onQuickCreate={() => onCreateTaskInStatus(col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: 1.03, rotate: 1.5 }}
            transition={SPRING_PICKUP}
          >
            <KanbanTaskCardContent
              task={activeTask}
              project={projectsById.get(activeTask.projectId)}
              isOverlay
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
