"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  FormField,
  Icon,
  Input,
  Modal,
  Select,
  Textarea,
  useConfirm,
  useToast,
} from "@/components/ui";
import {
  PROJECT_COLOR_DOT,
  PROJECT_STATUS_META,
  TASK_STATUS_META,
  type ProjectColorTone,
  type ProjectStatus,
  type ProtoMilestone,
  type ProtoProject,
  type ProtoTask,
} from "@/lib/prototype-data";
import { cn } from "@/lib/utils";

const TONE_OPTIONS: Array<{ value: ProjectColorTone; label: string }> = [
  { value: "sky", label: "Sky Blue" },
  { value: "emerald", label: "Emerald Green" },
  { value: "orange", label: "Warm Orange" },
  { value: "rose", label: "Berry Rose" },
  { value: "amber", label: "Sunny Amber" },
  { value: "teal", label: "Fresh Teal" },
];

export function PrototypeProjectsListView({
  projects,
  tasks,
  onOpenProject,
  onCreateProject,
  onChangeProjectStatus,
}: {
  projects: ProtoProject[];
  tasks: ProtoTask[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: (payload: Omit<ProtoProject, "id">) => void;
  onChangeProjectStatus: (projectId: string, status: ProjectStatus) => void;
}) {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProjectStatus>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [tone, setTone] = useState<ProjectColorTone>("sky");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [techInput, setTechInput] = useState("Next.js, Prisma, PostgreSQL");
  const [description, setDescription] = useState("");

  const filtered =
    statusFilter === "ALL"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  const handleCreate = () => {
    if (!name.trim()) {
      showToast({ title: "Nama proyek wajib diisi", variant: "error" });
      return;
    }
    onCreateProject({
      name: name.trim(),
      tone,
      status,
      description: description.trim() || "Catatan proyek baru.",
      techStack: techInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setName("");
    setDescription("");
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-extrabold leading-9 tracking-[-0.02em] text-ink">
            Daftar Proyek (/projects)
          </h1>
          <p className="mt-1 font-sans text-[14px] font-medium text-ink-muted">
            Hanya proyek berstatus Aktif yang muncul di Dashboard Harian.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Icon name="add" size="sm" />}
          onClick={() => setModalOpen(true)}
        >
          Proyek Baru
        </Button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {(
          [
            ["ALL", "Semua"],
            ["ACTIVE", "Aktif"],
            ["ON_HOLD", "Ditunda"],
            ["COMPLETED", "Selesai"],
            ["ARCHIVED", "Diarsipkan"],
          ] as const
        ).map(([val, label]) => (
          <Chip
            key={val}
            active={statusFilter === val}
            tone="theme"
            onClick={() => setStatusFilter(val)}
          >
            {label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const doneCount = projectTasks.filter((t) => t.status === "DONE").length;
          const pct =
            projectTasks.length > 0
              ? Math.round((doneCount / projectTasks.length) * 100)
              : 0;
          const statusMeta = PROJECT_STATUS_META[project.status];

          return (
            <Card key={project.id} className="flex flex-col justify-between p-1">
              <CardHeader className="pb-1">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 rounded-full",
                      PROJECT_COLOR_DOT[project.tone]
                    )}
                  />
                  <CardTitle>{project.name}</CardTitle>
                </div>
                <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 py-4">
                <p className="line-clamp-2 font-sans text-[13px] font-medium text-ink-muted">
                  {project.description}
                </p>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-mono text-[11px] font-bold text-ink">
                    <span>Progres Tugas</span>
                    <span>
                      {doneCount}/{projectTasks.length} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full border border-border-soft bg-surface-subtle">
                    <div
                      className="h-full rounded-full bg-[#16A34A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="neutral" mono>
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Select
                  aria-label={`Ubah status ${project.name}`}
                  value={project.status}
                  onChange={(e) =>
                    onChangeProjectStatus(project.id, e.target.value as ProjectStatus)
                  }
                  className="h-9 rounded-xl px-2.5 py-1 text-[13px]"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="ON_HOLD">Ditunda</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="ARCHIVED">Diarsipkan</option>
                </Select>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onOpenProject(project.id)}
                  rightIcon={<Icon name="arrow_forward" size="sm" />}
                >
                  Detail
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat Proyek Baru"
        headerTone="blue"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Simpan Proyek
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <FormField label="Nama Proyek" htmlFor="new-proj-name" required>
            <Input
              id="new-proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: SaaS Invoice"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Warna Identitas" htmlFor="new-proj-tone">
              <Select
                id="new-proj-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as ProjectColorTone)}
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status Awal" htmlFor="new-proj-status">
              <Select
                id="new-proj-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="ON_HOLD">Ditunda</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Tech Stack (pisahkan koma)" htmlFor="new-proj-tech">
            <Input
              id="new-proj-tech"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
            />
          </FormField>
          <FormField label="Catatan Singkat" htmlFor="new-proj-desc">
            <Textarea
              id="new-proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan tujuan proyek..."
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

export function PrototypeProjectDetailView({
  project,
  milestones,
  tasks,
  onBack,
  onUpdateDescription,
  onAddMilestone,
  onRestoreTask,
  onSelectTask,
}: {
  project: ProtoProject;
  milestones: ProtoMilestone[];
  tasks: ProtoTask[];
  onBack: () => void;
  onUpdateDescription: (projectId: string, desc: string) => void;
  onAddMilestone: (projectId: string, title: string) => void;
  onRestoreTask: (taskId: string) => void;
  onSelectTask: (task: ProtoTask) => void;
}) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<"overview" | "milestones" | "tasks">("overview");
  const [descMode, setDescMode] = useState<"preview" | "edit">("preview");
  const [descDraft, setDescDraft] = useState(project.description);
  const [newMilestone, setNewMilestone] = useState("");
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const displayedTasks = showArchivedOnly
    ? projectTasks.filter((t) => t.isArchived)
    : projectTasks.filter((t) => !t.isArchived);

  return (
    <div className="flex flex-col gap-7">
      <Card className="flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon name="arrow_back" size="sm" />}
              onClick={onBack}
            >
              Semua Proyek
            </Button>
            <Badge variant={PROJECT_STATUS_META[project.status].badgeVariant}>
              {PROJECT_STATUS_META[project.status].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={cn("h-4 w-4 rounded-full", PROJECT_COLOR_DOT[project.tone])}
            />
            <h1 className="font-display text-[28px] font-extrabold leading-9 tracking-[-0.02em]">
              {project.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((t) => (
              <Badge key={t} variant="neutral" mono>
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["overview", "Overview"],
              ["milestones", `Milestones (${projectMilestones.length})`],
              ["tasks", `Tugas & Arsip (${projectTasks.length})`],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              variant={tab === id ? "primary" : "outline"}
              onClick={() => setTab(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {tab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Catatan &amp; Informasi Proyek</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={descMode === "preview" ? "primary" : "outline"}
                onClick={() => setDescMode("preview")}
              >
                Preview
              </Button>
              <Button
                size="sm"
                variant={descMode === "edit" ? "primary" : "outline"}
                onClick={() => {
                  setDescDraft(project.description);
                  setDescMode("edit");
                }}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {descMode === "edit" ? (
              <div className="flex flex-col gap-3">
                <Textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  className="min-h-[140px]"
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      onUpdateDescription(project.id, descDraft);
                      setDescMode("preview");
                    }}
                  >
                    Simpan Catatan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-border-soft bg-surface-subtle p-4 font-sans text-[14px] leading-6 whitespace-pre-wrap text-ink">
                {project.description}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-border-soft bg-surface-container p-4">
                <span className="font-mono text-[11px] font-bold text-ink-muted">
                  TARGET TANGGAL
                </span>
                <p className="mt-1 font-display text-[16px] font-bold text-ink">
                  {project.targetDate ?? "Belum ditentukan"}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-border-soft bg-surface-container p-4">
                <span className="font-mono text-[11px] font-bold text-ink-muted">
                  REPOSITORY
                </span>
                <p className="mt-1 truncate font-mono text-[12px] font-bold text-[#0284C7]">
                  {project.repoUrl ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-border-soft bg-surface-container p-4">
                <span className="font-mono text-[11px] font-bold text-ink-muted">
                  LIVE URL
                </span>
                <p className="mt-1 truncate font-mono text-[12px] font-bold text-[#16A34A]">
                  {project.liveUrl ?? "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "milestones" && (
        <div className="flex flex-col gap-5">
          <Card>
            <CardContent className="flex flex-wrap gap-3 pt-4">
              <Input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Nama milestone baru (mis. M3: Rilis Beta)..."
                className="flex-1"
              />
              <Button
                variant="primary"
                leftIcon={<Icon name="add" size="sm" />}
                onClick={() => {
                  if (!newMilestone.trim()) return;
                  onAddMilestone(project.id, newMilestone.trim());
                  setNewMilestone("");
                }}
              >
                Tambah Milestone
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {projectMilestones.map((m) => {
              const linked = projectTasks.filter((t) => t.milestoneId === m.id);
              const done = linked.filter((t) => t.status === "DONE").length;
              const pct = linked.length > 0 ? Math.round((done / linked.length) * 100) : 0;

              return (
                <Card key={m.id}>
                  <CardHeader>
                    <CardTitle>{m.title}</CardTitle>
                    <Badge variant={pct === 100 && linked.length > 0 ? "success" : "info"} mono>
                      {pct}%
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="h-3 w-full overflow-hidden rounded-full border border-border-soft bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-[#16A34A]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="font-mono text-[11px] font-bold text-ink-muted">
                      {done}/{linked.length} tugas selesai (termasuk tugas terarsip)
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {showArchivedOnly ? "Riwayat Arsip Tugas" : "Tugas Aktif di Proyek"}
            </CardTitle>
            <div className="flex gap-2">
              <Chip
                active={!showArchivedOnly}
                tone="theme"
                onClick={() => setShowArchivedOnly(false)}
              >
                Aktif di Board
              </Chip>
              <Chip
                active={showArchivedOnly}
                tone="rose"
                onClick={() => setShowArchivedOnly(true)}
              >
                Riwayat Arsip ({projectTasks.filter((t) => t.isArchived).length})
              </Chip>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border-soft">
            {displayedTasks.length === 0 ? (
              <p className="py-8 text-center font-sans text-[13px] font-medium text-ink-muted">
                Tidak ada tugas di daftar ini.
              </p>
            ) : (
              displayedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectTask(t)}
                    className="min-w-0 flex-1 text-left font-display text-[15px] font-bold text-ink hover:text-primary cursor-pointer"
                  >
                    {t.title}
                  </button>
                  <div className="flex items-center gap-2.5">
                    <Badge variant={TASK_STATUS_META[t.status].badgeVariant}>
                      {TASK_STATUS_META[t.status].label}
                    </Badge>
                    {t.isArchived && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Pulihkan Tugas ke Board?",
                            message: `"${t.title}" akan tampil kembali di kolom Selesai pada Space Kanban.`,
                            confirmLabel: "Pulihkan",
                            tone: "primary",
                          });
                          if (ok) {
                            onRestoreTask(t.id);
                            showToast({ title: "Tugas dipulihkan ke board", variant: "success" });
                          }
                        }}
                      >
                        Pulihkan ke Board
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
