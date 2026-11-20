"use client";

import { motion } from "framer-motion";
import { Button, Chip, Icon } from "@/components/ui";
import { SPRING_PILL } from "@/lib/motion";
import type { DashboardActiveProject } from "@/services/workspace-service";
import { cn } from "@/lib/utils";

export type WorkspaceLayoutMode = "split" | "kanban" | "projects";

interface WorkspaceToolbarProps {
  activeProjects: DashboardActiveProject[];
  projectFilter: string;
  layoutMode: WorkspaceLayoutMode;
  onFilterChange: (projectId: string) => void;
  onLayoutChange: (mode: WorkspaceLayoutMode) => void;
  onNewTask: () => void;
}

const LAYOUT_OPTIONS: Array<{ mode: WorkspaceLayoutMode; label: string }> = [
  { mode: "split", label: "Split" },
  { mode: "kanban", label: "Fokus Kanban" },
  { mode: "projects", label: "Fokus Proyek" },
];

export function WorkspaceToolbar({
  activeProjects,
  projectFilter,
  layoutMode,
  onFilterChange,
  onLayoutChange,
  onNewTask,
}: WorkspaceToolbarProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border-soft pb-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="mr-1 font-display text-[14px] font-bold text-ink-muted">
          Filter:
        </span>
        <Chip
          active={projectFilter === "ALL"}
          tone="theme"
          onClick={() => onFilterChange("ALL")}
        >
          Semua Proyek ({activeProjects.length})
        </Chip>
        {activeProjects.map((project) => (
          <Chip
            key={project.id}
            active={projectFilter === project.id}
            tone={project.color}
            onClick={() => onFilterChange(project.id)}
          >
            {project.name}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Mode tampilan workspace"
          className="flex rounded-2xl border-2 border-border-soft border-b-[4px] border-b-border-lip bg-surface-container p-1"
        >
          {LAYOUT_OPTIONS.map((opt) => {
            const isActive = layoutMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                aria-pressed={isActive}
                onClick={() => onLayoutChange(opt.mode)}
                className={cn(
                  "relative rounded-xl px-3 py-1 font-display text-[13px] font-bold transition-colors duration-150 cursor-pointer",
                  isActive ? "text-on-primary" : "text-ink-muted hover:text-ink"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="workspace-layout-pill"
                    transition={SPRING_PILL}
                    className="absolute inset-0 rounded-xl bg-primary"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="primary"
          disabled={activeProjects.length === 0}
          leftIcon={<Icon name="add" size="sm" />}
          onClick={onNewTask}
        >
          Tugas Baru
        </Button>
      </div>
    </section>
  );
}
