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
  const [editingTask, setEditingTask] = useState<EditableTaskItem | null>(null);
  const [defaultMilestoneId, setDefaultMilestoneId] = useState<
    string | undefined
  >(undefined);

  const activeTasksCount = project.tasks.filter((t) => !t.isArchived).length;
  const doneTasksCount = project.tasks.filter((t) => t.status === "DONE").length;

  const openNewTask = (milestoneId?: string) => {
    setEditingTask(null);
    setDefaultMilestoneId(milestoneId);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <ProjectDetailHeader
        project={project}
        activeTab={activeTab}
        activeTasksCount={activeTasksCount}
        totalTasksCount={project.tasks.length}
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
              onSelectTask={(task) => {
                setEditingTask(task);
                setDefaultMilestoneId(undefined);
                setModalOpen(true);
              }}
              onAddTask={() => openNewTask()}
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
        defaultProjectId={project.id}
        defaultMilestoneId={defaultMilestoneId}
        projects={allProjects}
        milestones={project.milestones.map((m) => ({
          id: m.id,
          projectId: project.id,
          title: m.title,
        }))}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
