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
  IconButton,
  Input,
  Modal,
  Select,
  Textarea,
  useConfirm,
  useToast,
} from "@/components/ui";
import {
  PRIORITY_META,
  PROJECT_COLOR_DOT,
  PROJECT_STATUS_META,
  TASK_STATUS_META,
  type ProjectColorTone,
  type ProjectStatus,
  type ProtoMilestone,
  type ProtoProject,
  type ProtoProjectAttribute,
  type ProtoTask,
  type TaskStatus,
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

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

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
  const [summary, setSummary] = useState("");

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
      summary: summary.trim() || "Ringkasan proyek baru.",
      notes: "",
      attributes: [],
    });
    setName("");
    setSummary("");
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
            Klik kartu proyek mana saja untuk membuka detailnya. Hanya proyek Aktif yang tampil di Dashboard.
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
            <Card
              key={project.id}
              interactive
              onClick={() => onOpenProject(project.id)}
              className="group flex flex-col justify-between p-1"
            >
              <CardHeader className="pb-1">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 rounded-full",
                      PROJECT_COLOR_DOT[project.tone]
                    )}
                  />
                  <CardTitle className="group-hover:text-primary">
                    {project.name}
                  </CardTitle>
                </div>
                <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 py-4">
                <p className="line-clamp-2 font-sans text-[13px] font-medium text-ink-muted">
                  {project.summary}
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
              </CardContent>
              <CardFooter
                className="gap-2"
                onClick={(e) => e.stopPropagation()}
              >
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
          <FormField label="Deskripsi Singkat" htmlFor="new-proj-desc">
            <Textarea
              id="new-proj-desc"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
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
  onUpdateProjectConfig,
  onUpdateNotes,
  onDeleteProject,
  onAddMilestone,
  onRestoreTask,
  onSelectTask,
  onCreateTaskForProject,
}: {
  project: ProtoProject;
  milestones: ProtoMilestone[];
  tasks: ProtoTask[];
  onBack: () => void;
  onUpdateProjectConfig: (
    projectId: string,
    patch: Partial<Pick<ProtoProject, "name" | "summary" | "status" | "attributes">>
  ) => void;
  onUpdateNotes: (projectId: string, notes: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAddMilestone: (projectId: string, title: string) => void;
  onRestoreTask: (taskId: string) => void;
  onSelectTask: (task: ProtoTask) => void;
  onCreateTaskForProject: (projectId: string, milestoneId?: string) => void;
}) {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState<"overview" | "milestones">("overview");
  const [taskFilter, setTaskFilter] = useState<"ALL" | TaskStatus | "ARCHIVED">("ALL");

  const [notesMode, setNotesMode] = useState<"preview" | "edit">("preview");
  const [notesDraft, setNotesDraft] = useState(project.notes);
  const [newMilestone, setNewMilestone] = useState("");

  // Edit Konfigurasi Modal (atribut dinamis + metadata proyek)
  const [configOpen, setConfigOpen] = useState(false);
  const [cfgName, setCfgName] = useState(project.name);
  const [cfgSummary, setCfgSummary] = useState(project.summary);
  const [cfgStatus, setCfgStatus] = useState<ProjectStatus>(project.status);
  const [cfgAttrs, setCfgAttrs] = useState<ProtoProjectAttribute[]>(project.attributes);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const doneCount = projectTasks.filter((t) => t.status === "DONE").length;
  const pct =
    projectTasks.length > 0
      ? Math.round((doneCount / projectTasks.length) * 100)
      : 0;

  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const milestonesById = new Map(projectMilestones.map((m) => [m.id, m]));

  const filteredTasks = projectTasks.filter((t) => {
    if (taskFilter === "ARCHIVED") return t.isArchived;
    if (t.isArchived) return false;
    if (taskFilter === "ALL") return true;
    return t.status === taskFilter;
  });

  const openConfigModal = () => {
    setCfgName(project.name);
    setCfgSummary(project.summary);
    setCfgStatus(project.status);
    setCfgAttrs(project.attributes.map((a) => ({ ...a })));
    setConfigOpen(true);
  };

  const handleSaveConfig = () => {
    if (!cfgName.trim()) {
      showToast({ title: "Nama proyek wajib diisi", variant: "error" });
      return;
    }
    const cleanAttrs = cfgAttrs
      .map((a) => ({ ...a, label: a.label.trim(), value: a.value.trim() }))
      .filter((a) => a.label && a.value);

    onUpdateProjectConfig(project.id, {
      name: cfgName.trim(),
      summary: cfgSummary.trim(),
      status: cfgStatus,
      attributes: cleanAttrs,
    });
    setConfigOpen(false);
    showToast({ title: "Konfigurasi proyek disimpan", variant: "success" });
  };

  const handleDeleteClick = async () => {
    const ok = await confirm({
      title: `Hapus Proyek "${project.name}"?`,
      message:
        "Seluruh tugas dan milestone di dalam proyek ini akan terhapus permanen.",
      confirmLabel: "Ya, Hapus Proyek",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (ok) {
      onDeleteProject(project.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb kembali */}
      <div className="flex items-center justify-between gap-3">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Icon name="arrow_back" size="sm" />}
          onClick={onBack}
        >
          Semua Proyek
        </Button>

        <div className="flex gap-2">
          {(
            [
              ["overview", `Tugas & Catatan (${projectTasks.filter((t) => !t.isArchived).length})`],
              ["milestones", `Milestones (${projectMilestones.length})`],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              size="sm"
              variant={tab === id ? "primary" : "outline"}
              onClick={() => setTab(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Header Proyek (Mengacu pada gambar referensi) */}
      <Card className="rounded-3xl p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={PROJECT_STATUS_META[project.status].badgeVariant}>
                {PROJECT_STATUS_META[project.status].label}
              </Badge>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full",
                  PROJECT_COLOR_DOT[project.tone]
                )}
              />
              <h1 className="font-display text-[28px] font-extrabold leading-9 tracking-[-0.02em] text-ink">
                {project.name}
              </h1>
            </div>
            <p className="max-w-2xl font-sans text-[14px] font-medium leading-6 text-ink-muted">
              {project.summary}
            </p>
          </div>

          {/* Kanan Header: Statistik + Tombol + Tugas Baru */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-border-soft bg-surface-subtle px-5 py-3.5">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] font-bold text-ink-muted">
                Tugas Tuntas
              </span>
              <span className="font-display text-[20px] font-extrabold text-ink">
                {doneCount} / {projectTasks.length}
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
              onClick={() => onCreateTaskForProject(project.id)}
            >
              Tugas Baru
            </Button>
          </div>
        </div>
      </Card>

      {/* HALAMAN DETAIL AWAL: TUGAS & CATATAN (KIRI) + INFORMASI TEKNIS & ATRIBUT (KANAN) */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Kiri: Daftar Tugas Proyek + Catatan Proyek */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-[18px] font-bold text-ink">
                  <Icon name="checklist" size="md" />
                  Daftar Tugas Proyek ({filteredTasks.length})
                </h2>

                <div className="w-48">
                  <Select
                    aria-label="Filter status tugas proyek"
                    value={taskFilter}
                    onChange={(e) =>
                      setTaskFilter(e.target.value as "ALL" | TaskStatus | "ARCHIVED")
                    }
                    className="h-9 rounded-xl px-3 py-1 text-[13px]"
                  >
                    <option value="ALL">Semua Status (Aktif)</option>
                    <option value="BACKLOG">Belum dikerjakan</option>
                    <option value="ON_PROGRESS">Sedang dikerjakan</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Selesai</option>
                    <option value="ARCHIVED">
                      Riwayat Arsip ({projectTasks.filter((t) => t.isArchived).length})
                    </option>
                  </Select>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="font-sans text-[14px] font-medium text-ink-muted">
                    Belum ada tugas pada filter ini.
                  </p>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Icon name="add" size="sm" />}
                      onClick={() => onCreateTaskForProject(project.id)}
                    >
                      Tambah Tugas Pertama
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredTasks.map((t) => {
                    const statusMeta = TASK_STATUS_META[t.status];
                    const priorityMeta = PRIORITY_META[t.priority];
                    const milestone = t.milestoneId
                      ? milestonesById.get(t.milestoneId)
                      : undefined;
                    const iconName =
                      t.status === "DONE"
                        ? "check_circle"
                        : t.status === "ON_PROGRESS" || t.status === "REVIEW"
                          ? "pending"
                          : "radio_button_unchecked";

                    return (
                      <Card
                        key={t.id}
                        interactive
                        onClick={() => onSelectTask(t)}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <Icon
                            name={iconName}
                            size="md"
                            filled={t.status === "DONE"}
                            className={cn(
                              "mt-0.5 shrink-0",
                              t.status === "DONE"
                                ? "text-[#16A34A]"
                                : t.status === "ON_PROGRESS"
                                  ? "text-[#0284C7]"
                                  : t.status === "REVIEW"
                                    ? "text-[#D97706]"
                                    : "text-ink-muted"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "font-display text-[15px] font-bold text-ink",
                                t.status === "DONE" && "line-through text-ink-muted"
                              )}
                            >
                              {t.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
                              <span className={priorityMeta.textColor}>
                                {priorityMeta.label}
                              </span>
                              {t.dueDate && (
                                <span className="text-ink-muted">
                                  · Tenggat: {t.dueDate}
                                </span>
                              )}
                              {milestone && (
                                <span className="text-ink-muted">
                                  · {milestone.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge variant={statusMeta.badgeVariant}>
                            {statusMeta.label}
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
                                  showToast({
                                    title: "Tugas dipulihkan ke board",
                                    variant: "success",
                                  });
                                }
                              }}
                            >
                              Pulihkan
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Catatan Proyek (Markdown) langsung di halaman detail awal */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="description" size="md" className="text-primary" />
                  Catatan Proyek
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={notesMode === "preview" ? "primary" : "outline"}
                    onClick={() => setNotesMode("preview")}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant={notesMode === "edit" ? "primary" : "outline"}
                    onClick={() => {
                      setNotesDraft(project.notes);
                      setNotesMode("edit");
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notesMode === "edit" ? (
                  <div className="flex flex-col gap-3">
                    <Textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      className="min-h-[160px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={() => {
                          onUpdateNotes(project.id, notesDraft);
                          setNotesMode("preview");
                        }}
                      >
                        Simpan Catatan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[120px] rounded-2xl border-2 border-border-soft bg-surface-subtle p-4 font-sans text-[14px] leading-6 whitespace-pre-wrap text-ink">
                    {project.notes.trim() || "Belum ada catatan proyek."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kanan: Informasi Teknis & Atribut Tambahan (Configurable) */}
          <div className="lg:col-span-4">
            <Card className="rounded-3xl p-5">
              <div className="mb-4 flex items-center gap-2 border-b-2 border-border-soft pb-3">
                <Icon name="code" size="md" className="text-primary" />
                <h2 className="font-display text-[16px] font-bold text-ink">
                  Informasi Teknis &amp; Atribut
                </h2>
              </div>

              {project.attributes.length === 0 ? (
                <p className="py-4 font-sans text-[13px] font-medium text-ink-muted">
                  Belum ada atribut tambahan. Klik Edit Konfigurasi untuk menambahkan link repo, URL deploy, atau catatan teknis.
                </p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {project.attributes.map((attr) => (
                    <div key={attr.id} className="flex flex-col gap-0.5">
                      <span className="font-sans text-[12px] font-semibold text-ink-muted">
                        {attr.label}
                      </span>
                      {isExternalUrl(attr.value) ? (
                        <a
                          href={attr.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-mono text-[12px] font-bold text-primary hover:underline"
                        >
                          {attr.value}
                        </a>
                      ) : (
                        <span className="truncate font-mono text-[12px] font-bold text-ink">
                          {attr.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t-2 border-border-soft pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  leftIcon={<Icon name="tune" size="sm" />}
                  onClick={openConfigModal}
                >
                  Edit Konfigurasi
                </Button>
                <IconButton
                  size="sm"
                  variant="danger"
                  label="Hapus Proyek"
                  icon={<Icon name="delete" size="sm" />}
                  onClick={handleDeleteClick}
                />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES */}
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
              const mPct =
                linked.length > 0 ? Math.round((done / linked.length) * 100) : 0;

              return (
                <Card key={m.id}>
                  <CardHeader>
                    <CardTitle>{m.title}</CardTitle>
                    <Badge
                      variant={mPct === 100 && linked.length > 0 ? "success" : "info"}
                      mono
                    >
                      {mPct}%
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="h-3 w-full overflow-hidden rounded-full border border-border-soft bg-surface-subtle">
                      <div
                        className="h-full rounded-full bg-[#16A34A]"
                        style={{ width: `${mPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[11px] font-bold text-ink-muted">
                        {done}/{linked.length} tugas selesai (termasuk arsip)
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon name="add" size="sm" />}
                        onClick={() => onCreateTaskForProject(project.id, m.id)}
                      >
                        Tugas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL EDIT KONFIGURASI PROYEK & ATRIBUT DINAMIS */}
      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title="Edit Konfigurasi Proyek"
        description="Sesuaikan informasi proyek dan kelola atribut teknis secara bebas."
        size="lg"
        headerTone="blue"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Icon name="save" size="sm" />}
              onClick={handleSaveConfig}
            >
              Simpan Konfigurasi
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormField label="Nama Proyek" htmlFor="cfg-name" required>
              <Input
                id="cfg-name"
                value={cfgName}
                onChange={(e) => setCfgName(e.target.value)}
              />
            </FormField>
            <FormField label="Status Proyek" htmlFor="cfg-status">
              <Select
                id="cfg-status"
                value={cfgStatus}
                onChange={(e) => setCfgStatus(e.target.value as ProjectStatus)}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="ON_HOLD">Ditunda</option>
                <option value="COMPLETED">Selesai</option>
                <option value="ARCHIVED">Diarsipkan</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Deskripsi Singkat" htmlFor="cfg-summary">
            <Input
              id="cfg-summary"
              value={cfgSummary}
              onChange={(e) => setCfgSummary(e.target.value)}
            />
          </FormField>

          {/* Atribut Tambahan Configurable */}
          <div className="flex flex-col gap-2.5 border-t-2 border-border-soft pt-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-[15px] font-bold text-ink">
                Atribut Tambahan (Repo, URL, Endpoint, dll.)
              </span>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon name="add" size="sm" />}
                onClick={() =>
                  setCfgAttrs((prev) => [
                    ...prev,
                    { id: `attr-${Date.now()}`, label: "", value: "" },
                  ])
                }
              >
                Tambah Atribut
              </Button>
            </div>

            {cfgAttrs.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-border-soft p-4 text-center font-sans text-[13px] text-ink-muted">
                Belum ada atribut. Klik &ldquo;Tambah Atribut&rdquo; untuk menambahkan baris baru.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {cfgAttrs.map((attr, idx) => (
                  <div key={attr.id} className="flex items-center gap-2">
                    <Input
                      aria-label={`Label atribut ${idx + 1}`}
                      placeholder="Label (mis. Git Repository)"
                      value={attr.label}
                      onChange={(e) =>
                        setCfgAttrs((prev) =>
                          prev.map((item) =>
                            item.id === attr.id
                              ? { ...item, label: e.target.value }
                              : item
                          )
                        )
                      }
                      className="w-2/5 text-[13px]"
                    />
                    <Input
                      aria-label={`Nilai atribut ${idx + 1}`}
                      placeholder="Nilai atau https://..."
                      value={attr.value}
                      onChange={(e) =>
                        setCfgAttrs((prev) =>
                          prev.map((item) =>
                            item.id === attr.id
                              ? { ...item, value: e.target.value }
                              : item
                          )
                        )
                      }
                      className="flex-1 text-[13px]"
                    />
                    <IconButton
                      size="sm"
                      variant="danger"
                      label={`Hapus atribut ${attr.label || idx + 1}`}
                      icon={<Icon name="delete" size="sm" />}
                      onClick={() =>
                        setCfgAttrs((prev) =>
                          prev.filter((item) => item.id !== attr.id)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
