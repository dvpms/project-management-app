"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createMilestoneAction,
  deleteMilestoneAction,
} from "@/actions/milestone-actions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  IconButton,
  Input,
  useConfirm,
  useToast,
} from "@/components/ui";
import type { ProjectDetailData } from "@/services/project-service";

export function ProjectMilestonesTab({
  projectId,
  milestones,
  onAddTaskToMilestone,
}: {
  projectId: string;
  milestones: ProjectDetailData["milestones"];
  onAddTaskToMilestone: (milestoneId: string) => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [newTitle, setNewTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) {
      showToast({ title: "Judul milestone wajib diisi", variant: "error" });
      return;
    }

    startTransition(async () => {
      const res = await createMilestoneAction({
        projectId,
        title: newTitle.trim(),
        targetDate: targetDate || null,
      });
      if (!res.ok) {
        showToast({
          title: "Gagal menambah milestone",
          description: res.error,
          variant: "error",
        });
        return;
      }
      setNewTitle("");
      setTargetDate("");
      showToast({ title: "Milestone ditambahkan", variant: "success" });
      router.refresh();
    });
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: `Hapus Milestone "${title}"?`,
      message:
        "Milestone akan dihapus, namun tugas yang tertaut di dalamnya tetap ada.",
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteMilestoneAction(id);
      if (!res.ok) {
        showToast({
          title: "Gagal menghapus milestone",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Milestone dihapus", variant: "info" });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-4">
          <Input
            aria-label="Nama milestone baru"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nama milestone baru (mis. M1: Rilis Beta)..."
            className="min-w-[220px] flex-1"
          />
          <Input
            aria-label="Target tanggal milestone"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-44"
          />
          <Button
            variant="primary"
            leftIcon={<Icon name="add" size="sm" />}
            onClick={handleCreate}
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Tambah Milestone"}
          </Button>
        </CardContent>
      </Card>

      {milestones.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-sans text-[14px] font-medium text-ink-muted">
            Belum ada milestone untuk proyek ini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {milestones.map((m) => {
            const pct =
              m.totalTasks > 0
                ? Math.round((m.doneTasks / m.totalTasks) * 100)
                : 0;

            return (
              <Card key={m.id}>
                <CardHeader>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{m.title}</CardTitle>
                    {m.targetDate && (
                      <p className="mt-1 font-mono text-[11px] font-bold text-ink-muted">
                        Target: {m.targetDate}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={pct === 100 && m.totalTasks > 0 ? "success" : "info"}
                      mono
                    >
                      {pct}%
                    </Badge>
                    <IconButton
                      size="sm"
                      variant="danger"
                      label={`Hapus milestone ${m.title}`}
                      icon={<Icon name="delete" size="sm" />}
                      onClick={() => handleDelete(m.id, m.title)}
                      disabled={isPending}
                    />
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  <div className="h-3 w-full overflow-hidden rounded-full border border-border-soft bg-surface-subtle">
                    <div
                      className="h-full rounded-full bg-[#16A34A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[11px] font-bold text-ink-muted">
                      {m.doneTasks}/{m.totalTasks} tugas selesai (termasuk arsip)
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon name="add" size="sm" />}
                      onClick={() => onAddTaskToMilestone(m.id)}
                    >
                      Tugas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
