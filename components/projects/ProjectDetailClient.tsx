"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectAttributesPanel } from "@/components/projects/ProjectAttributesPanel";
import { ProjectDetailHeader } from "@/components/projects/ProjectDetailHeader";
import { ProjectMilestonesTab } from "@/components/projects/ProjectMilestonesTab";
import { ProjectNotesCard } from "@/components/projects/ProjectNotesCard";
import { ProjectTasksSection } from "@/components/projects/ProjectTasksSection";
import {
  TaskDetailModal,
  type EditableTaskItem,
  type TaskModalProjectOption,
} from "@/components/tasks/TaskDetailModal";
import type { ProjectDetailData } from "@/services/project-service";

export function ProjectDetailClient({
  project,
  allProjects,
}: {
  project: ProjectDetailData;
  allProjects: TaskModalProjectOption[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "milestones">(
    "overview"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSnapshot, setEditingSnapshot] =
    useState<EditableTaskItem | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(
    undefined
  );
  const [defaultMilestoneId, setDefaultMilestoneId] = useState<
    string | undefined
  >(undefined);

  const editingTask = editingTaskId
    ? (project.tasks.find((t) => t.id === editingTaskId) ??
      (editingSnapshot?.id === editingTaskId ? editingSnapshot : null))
    : null;

  const parentIds = new Set(
    project.tasks
      .map((t) => t.parentId)
      .filter((id): id is string => Boolean(id))
  );
  const leafTasks = project.tasks.filter((t) => !parentIds.has(t.id));

  const activeTasksCount = leafTasks.filter((t) => !t.isArchived).length;
  const doneTasksCount = leafTasks.filter((t) => t.status === "DONE").length;

  const openNewTask = (milestoneId?: string, parentId?: string) => {
    setEditingTaskId(null);
    setEditingSnapshot(null);
    setDefaultMilestoneId(milestoneId);
    setDefaultParentId(parentId);
    setModalOpen(true);
  };

  const openTaskModal = (task: EditableTaskItem) => {
    setEditingTaskId(task.id);
    setEditingSnapshot(task);
    setDefaultParentId(undefined);
    setDefaultMilestoneId(undefined);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <ProjectDetailHeader
        project={project}
        activeTab={activeTab}
        activeTasksCount={activeTasksCount}
        totalTasksCount={leafTasks.length}
        doneTasksCount={doneTasksCount}
        milestonesCount={project.milestones.length}
        onTabChange={setActiveTab}
        onAddTask={() => openNewTask()}
      />

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <ProjectTasksSection
              tasks={project.tasks}
              onSelectTask={openTaskModal}
              onAddTask={() => openNewTask()}
              onAddSubtask={(parentId) => openNewTask(undefined, parentId)}
            />

            <ProjectNotesCard
              projectId={project.id}
              initialNotes={project.notes}
            />
          </div>

          <div className="lg:col-span-4">
            <ProjectAttributesPanel project={project} />
          </div>
        </div>
      ) : (
        <ProjectMilestonesTab
          projectId={project.id}
          milestones={project.milestones}
          onAddTaskToMilestone={(milestoneId) => openNewTask(milestoneId)}
        />
      )}

      <TaskDetailModal
        open={modalOpen}
        task={editingTask}
        allTasks={project.tasks}
        defaultProjectId={project.id}
        defaultMilestoneId={defaultMilestoneId}
        defaultParentId={defaultParentId}
        projects={allProjects}
        milestones={project.milestones.map((m) => ({
          id: m.id,
          projectId: project.id,
          title: m.title,
        }))}
        onSelectTask={openTaskModal}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
