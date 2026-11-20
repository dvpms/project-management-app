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
  type DragStartEvent,
} from "@dnd-kit/core";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import {
  KanbanTaskCardContent,
  type CardProjectInfo,
} from "@/components/kanban/KanbanTaskCard";
import type { WorkspaceLayoutMode } from "@/components/workspace/WorkspaceToolbar";
import { SPRING_PICKUP } from "@/lib/motion";
import { KANBAN_COLUMNS } from "@/lib/project-constants";
import { sortTasksBySchedule } from "@/lib/task-sorting";
import type { DashboardTaskItem } from "@/services/workspace-service";

interface SpaceKanbanBoardProps {
  tasks: DashboardTaskItem[];
  projects: CardProjectInfo[];
  layoutMode?: WorkspaceLayoutMode;
  onCommitMove: (
    taskId: string,
    targetStatus: TaskStatus,
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId)
    : undefined;

  const getColumnTasks = (status: TaskStatus) =>
    sortTasksBySchedule(tasks.filter((t) => t.status === status));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);
    if (!KANBAN_COLUMNS.some((c) => c.id === overId)) return;

    const targetStatus = overId as TaskStatus;
    const currentTask = tasks.find((t) => t.id === activeTaskId);
    if (!currentTask || currentTask.status === targetStatus) return;

    const nextSnapshot = tasks.map((t) =>
      t.id === activeTaskId ? { ...t, status: targetStatus } : t
    );

    onCommitMove(activeTaskId, targetStatus, nextSnapshot);
  };

  const handleDragCancel = () => {
    setActiveId(null);
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
            tasks={getColumnTasks(col.id)}
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
