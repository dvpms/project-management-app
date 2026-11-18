"use client";

import Link from "next/link";
import { Badge, Button, Card, Icon } from "@/components/ui";
import {
  PROJECT_COLOR_DOT,
  PROJECT_STATUS_META,
} from "@/lib/project-constants";
import type { ProjectDetailData } from "@/services/project-service";
import { cn } from "@/lib/utils";

interface ProjectDetailHeaderProps {
  project: Pick<
    ProjectDetailData,
    "id" | "name" | "summary" | "status" | "color"
  >;
  activeTab: "overview" | "milestones";
  activeTasksCount: number;
  totalTasksCount: number;
  doneTasksCount: number;
  milestonesCount: number;
  onTabChange: (tab: "overview" | "milestones") => void;
  onAddTask: () => void;
}

export function ProjectDetailHeader({
  project,
  activeTab,
  activeTasksCount,
  totalTasksCount,
  doneTasksCount,
  milestonesCount,
  onTabChange,
  onAddTask,
}: ProjectDetailHeaderProps) {
  const statusMeta = PROJECT_STATUS_META[project.status];
  const pct =
    totalTasksCount > 0
      ? Math.round((doneTasksCount / totalTasksCount) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/projects"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-border-soft border-b-[5px] border-b-border-lip bg-surface-container px-3.5 font-display text-[13px] font-bold text-ink transition-all duration-100 hover:bg-surface-hover active:translate-y-[3px] active:border-b-2"
        >
          <Icon name="arrow_back" size="sm" />
          Semua Proyek
        </Link>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === "overview" ? "primary" : "outline"}
            onClick={() => onTabChange("overview")}
          >
            Tugas &amp; Catatan ({activeTasksCount})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "milestones" ? "primary" : "outline"}
            onClick={() => onTabChange("milestones")}
          >
            Milestones ({milestonesCount})
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full",
                  PROJECT_COLOR_DOT[project.color]
                )}
              />
              <h1 className="font-display text-[28px] font-extrabold leading-9 tracking-[-0.02em] text-ink">
                {project.name}
              </h1>
            </div>
            <p className="max-w-2xl font-sans text-[14px] font-medium leading-6 text-ink-muted">
              {project.summary || "Belum ada deskripsi singkat untuk proyek ini."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-border-soft bg-surface-subtle px-5 py-3.5">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-bold text-ink-muted">
                Tugas Tuntas
              </span>
              <span className="font-display text-[20px] font-extrabold text-ink">
                {doneTasksCount} / {totalTasksCount}
              </span>
            </div>
            <div className="h-9 w-[2px] bg-border-soft" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-bold text-ink-muted">
                Selesai
              </span>
              <span className="font-display text-[20px] font-extrabold text-ink">
                {pct}%
              </span>
            </div>
            <Button
              variant="primary"
              leftIcon={<Icon name="add" size="sm" />}
              onClick={onAddTask}
            >
              Tugas Baru
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
