"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Chip,
  ConfirmModalProvider,
  FormField,
  Icon,
  Input,
  Modal,
  ThemeProvider,
  ToastProvider,
  useConfirm,
  useTheme,
  useToast,
} from "@/components/ui";
import { PrototypeKanban } from "@/components/prototype/PrototypeKanban";
import { PrototypeProjectsBottom } from "@/components/prototype/PrototypeProjectsBottom";
import {
  PrototypeProjectDetailView,
  PrototypeProjectsListView,
} from "@/components/prototype/PrototypeProjectsManager";
import { PrototypeTaskModal } from "@/components/prototype/PrototypeTaskModal";
import {
  INITIAL_MILESTONES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  type ProjectStatus,
  type ProtoMilestone,
  type ProtoProject,
  type ProtoTask,
  type TaskStatus,
} from "@/lib/prototype-data";
import {
  DEFAULT_THEME_ID,
  THEME_OPTIONS,
  type ThemeId,
} from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

type ActiveScreen = "dashboard" | "projects" | "project-detail" | "login";
type LayoutMode = "split" | "kanban" | "projects";

function PrototypeWorkspace() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const { theme, setTheme } = useTheme();

  const [workspaceTitle, setWorkspaceTitle] = useState("Space Kanban");
  const [workspaceSubtitle, setWorkspaceSubtitle] = useState(
    "Kelola proyek & tugas harian secara sinkron"
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(workspaceTitle);
  const [draftSubtitle, setDraftSubtitle] = useState(workspaceSubtitle);

  const [screen, setScreen] = useState<ActiveScreen>("dashboard");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [projectFilter, setProjectFilter] = useState<string>("ALL");

  const [projects, setProjects] = useState<ProtoProject[]>(INITIAL_PROJECTS);
  const [milestones, setMilestones] = useState<ProtoMilestone[]>(INITIAL_MILESTONES);
  const [tasks, setTasks] = useState<ProtoTask[]>(INITIAL_TASKS);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("p1");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProtoTask | null>(null);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [createProjectId, setCreateProjectId] = useState<string | undefined>(undefined);
  const [createMilestoneId, setCreateMilestoneId] = useState<string | undefined>(undefined);

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const activeProjectIds = new Set(activeProjects.map((p) => p.id));

  const kanbanTasks = tasks.filter(
    (t) =>
      !t.isArchived &&
      activeProjectIds.has(t.projectId) &&
      (projectFilter === "ALL" || t.projectId === projectFilter)
  );

  const openNewTaskModal = (
    status: TaskStatus = "BACKLOG",
    projId?: string,
    msId?: string
  ) => {
    setEditingTask(null);
    setCreateDefaultStatus(status);
    setCreateProjectId(projId);
    setCreateMilestoneId(msId);
    setModalOpen(true);
  };

  const handleKanbanTasksChange = (updatedKanbanTasks: ProtoTask[]) => {
    const updatedMap = new Map(updatedKanbanTasks.map((t) => [t.id, t]));
    setTasks((prev) => prev.map((t) => updatedMap.get(t.id) ?? t));
  };

  const handleQuickAddTask = (projectId: string, title: string) => {
    const newTask: ProtoTask = {
      id: `t-${Date.now()}`,
      projectId,
      title,
      description: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      order: tasks.filter((t) => t.status === "BACKLOG" && !t.isArchived).length,
      isArchived: false,
    };
    setTasks((prev) => [...prev, newTask]);
    showToast({
      title: "Tugas ditambahkan!",
      description: `"${title}" masuk ke Belum dikerjakan.`,
      variant: "success",
    });
  };

  const handleSaveTask = (
    payload: Omit<ProtoTask, "id" | "order" | "isArchived">,
    existingId?: string
  ) => {
    if (existingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...payload } : t))
      );
      showToast({ title: "Perubahan tugas disimpan", variant: "success" });
    } else {
      const newTask: ProtoTask = {
        id: `t-${Date.now()}`,
        ...payload,
        order: tasks.filter((t) => t.status === payload.status && !t.isArchived).length,
        isArchived: false,
      };
      setTasks((prev) => [...prev, newTask]);
      showToast({ title: "Tugas baru dibuat!", variant: "success" });
    }
  };

  const handleArchiveSingle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isArchived: true } : t))
    );
    showToast({ title: "Tugas diarsipkan ke Riwayat Arsip", variant: "info" });
  };

  const handleArchiveAllDone = async () => {
    const doneIds = new Set(
      kanbanTasks.filter((t) => t.status === "DONE").map((t) => t.id)
    );
    if (doneIds.size === 0) return;

    const ok = await confirm({
      title: `Arsipkan ${doneIds.size} Tugas Selesai?`,
      message:
        "Tugas akan disembunyikan dari papan harian dan tetap tersimpan di Riwayat Arsip serta progres Milestone.",
      confirmLabel: "Ya, Arsipkan Semua",
      cancelLabel: "Batal",
      tone: "warning",
    });

    if (!ok) return;
    setTasks((prev) =>
      prev.map((t) => (doneIds.has(t.id) ? { ...t, isArchived: true } : t))
    );
    showToast({
      title: "100% Tuntas!",
      description: `${doneIds.size} tugas Selesai dipindahkan ke arsip.`,
      variant: "success",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast({ title: "Tugas dihapus", variant: "info" });
  };

  const handleOpenSettings = () => {
    setDraftTitle(workspaceTitle);
    setDraftSubtitle(workspaceSubtitle);
    setSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    if (!draftTitle.trim()) {
      showToast({ title: "Judul workspace wajib diisi", variant: "error" });
      return;
    }
    setWorkspaceTitle(draftTitle.trim());
    setWorkspaceSubtitle(draftSubtitle.trim());
    setSettingsOpen(false);
    showToast({ title: "Pengaturan akun & workspace disimpan", variant: "success" });
  };

  const handleSignOutClick = async () => {
    setSettingsOpen(false);
    const ok = await confirm({
      title: `Keluar dari ${workspaceTitle}?`,
      message: "Ini adalah simulasi dialog konfirmasi keluar akun.",
      confirmLabel: "Ya, Keluar",
      cancelLabel: "Tetap di Sini",
      tone: "primary",
    });
    if (ok) {
      setScreen("login");
      showToast({ title: "Berhasil keluar (simulasi)", variant: "info" });
    }
  };

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? projects[0];

  if (screen === "login") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6 text-ink">
        <Card className="w-full max-w-md rounded-3xl p-4">
          <CardContent className="flex flex-col items-center gap-6 py-8 text-center">
            <Badge variant="primary" mono>
              PROTOTIPE ROUTE (auth)/login
            </Badge>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-primary-lip border-b-[5px] bg-primary text-on-primary">
              <Icon name="view_kanban" size="xl" />
            </div>
            <div>
              <h1 className="font-display text-[30px] font-extrabold leading-9 tracking-[-0.02em] text-ink">
                {workspaceTitle}
              </h1>
              <p className="mt-2 font-sans text-[14px] font-medium text-ink-muted">
                {workspaceSubtitle || "Santai & Fokus. Kelola proyek dan tugas harianmu dalam satu layar solid."}
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              className="w-full"
              leftIcon={<Icon name="login" size="md" />}
              onClick={() => {
                setScreen("dashboard");
                showToast({
                  title: "Selamat datang kembali!",
                  description: "Simulasi login Google OAuth sukses.",
                  variant: "success",
                });
              }}
            >
              Masuk dengan Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink transition-colors duration-150">
      <header className="sticky top-0 z-30 border-b-2 border-border-soft bg-surface-container px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          {/* Brand Title & Configurable Short Description */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen("dashboard")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-lip border-b-[4px] bg-primary text-on-primary cursor-pointer active:translate-y-[2px] active:border-b-2"
              aria-label="Kembali ke Dashboard"
            >
              <Icon name="view_kanban" size="md" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-[19px] font-extrabold leading-6 tracking-[-0.015em] text-ink">
                  {workspaceTitle}
                </span>
                <Badge variant="amber" mono>
                  PROTOTIPE
                </Badge>
              </div>
              {workspaceSubtitle && (
                <p className="truncate font-sans text-[12px] font-medium leading-4 text-ink-muted">
                  {workspaceSubtitle}
                </p>
              )}
            </div>
          </div>

          <nav aria-label="Navigasi prototipe" className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={screen === "dashboard" ? "primary" : "outline"}
              leftIcon={<Icon name="dashboard" size="sm" />}
              onClick={() => setScreen("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              variant={screen === "projects" || screen === "project-detail" ? "primary" : "outline"}
              leftIcon={<Icon name="folder" size="sm" />}
              onClick={() => setScreen("projects")}
            >
              Daftar Proyek
            </Button>
            <Link
              href="/themes"
              className="hidden h-9 items-center gap-1.5 rounded-xl border-2 border-border-soft border-b-[5px] border-b-border-lip bg-surface-container px-3 font-display text-[13px] font-bold text-ink transition-all duration-100 hover:bg-surface-hover active:translate-y-[3px] active:border-b-2 md:inline-flex"
            >
              <Icon name="grid_view" size="sm" />
              /themes
            </Link>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon name="manage_accounts" size="sm" />}
              onClick={handleOpenSettings}
            >
              Akun &amp; Tema
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-8 sm:px-8 lg:px-10">
        {screen === "dashboard" && (
          <>
            <section className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border-soft pb-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="mr-1 font-display text-[14px] font-bold text-ink-muted">
                  Filter:
                </span>
                <Chip
                  active={projectFilter === "ALL"}
                  tone="theme"
                  onClick={() => setProjectFilter("ALL")}
                >
                  Semua Proyek ({activeProjects.length})
                </Chip>
                {activeProjects.map((project) => (
                  <Chip
                    key={project.id}
                    active={projectFilter === project.id}
                    tone={project.tone}
                    onClick={() => setProjectFilter(project.id)}
                  >
                    {project.name}
                  </Chip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-2xl border-2 border-border-soft border-b-[4px] border-b-border-lip bg-surface-container p-1">
                  {(
                    [
                      ["split", "Split"],
                      ["kanban", "Fokus Kanban"],
                      ["projects", "Fokus Proyek"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setLayoutMode(mode)}
                      className={
                        layoutMode === mode
                          ? "rounded-xl bg-primary px-3 py-1 font-display text-[13px] font-bold text-on-primary cursor-pointer"
                          : "rounded-xl px-3 py-1 font-display text-[13px] font-bold text-ink-muted hover:text-ink cursor-pointer"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Icon name="add" size="sm" />}
                  onClick={() =>
                    openNewTaskModal(
                      "BACKLOG",
                      projectFilter !== "ALL" ? projectFilter : undefined
                    )
                  }
                >
                  Tugas Baru
                </Button>
              </div>
            </section>

            {layoutMode !== "projects" && (
              <section className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="font-display text-[24px] font-extrabold leading-8 tracking-[-0.02em] text-ink">
                      Space Kanban
                    </h1>
                    <Badge variant="primary" mono>
                      {kanbanTasks.length} TUGAS
                    </Badge>
                  </div>
                  <span className="hidden font-sans text-[13px] font-medium text-ink-muted sm:inline">
                    Seret kartu antar kolom atau klik untuk detail
                  </span>
                </div>

                <PrototypeKanban
                  tasks={kanbanTasks}
                  projects={activeProjects}
                  milestones={milestones}
                  onTasksChange={handleKanbanTasksChange}
                  onSelectTask={(task) => {
                    setEditingTask(task);
                    setModalOpen(true);
                  }}
                  onArchiveAllDone={handleArchiveAllDone}
                  onCreateTaskInStatus={(status) =>
                    openNewTaskModal(
                      status,
                      projectFilter !== "ALL" ? projectFilter : undefined
                    )
                  }
                />
              </section>
            )}

            {layoutMode !== "kanban" && (
              <section className="flex flex-col gap-5 border-t-2 border-border-soft pt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-[24px] font-extrabold leading-8 tracking-[-0.02em] text-ink">
                      Proyek Aktif
                    </h2>
                    <Badge variant="neutral" mono>
                      {activeProjects.length} PROYEK
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setScreen("projects")}
                    rightIcon={<Icon name="arrow_forward" size="sm" />}
                  >
                    Kelola Semua Proyek
                  </Button>
                </div>

                <PrototypeProjectsBottom
                  projects={projects}
                  tasks={tasks}
                  onQuickAddTask={handleQuickAddTask}
                  onSelectTask={(task) => {
                    setEditingTask(task);
                    setModalOpen(true);
                  }}
                  onOpenProjectDetail={(id) => {
                    setSelectedProjectId(id);
                    setScreen("project-detail");
                  }}
                  onOpenCreateProject={() => setScreen("projects")}
                />
              </section>
            )}
          </>
        )}

        {screen === "projects" && (
          <PrototypeProjectsListView
            projects={projects}
            tasks={tasks}
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setScreen("project-detail");
            }}
            onCreateProject={(payload) => {
              const created: ProtoProject = {
                id: `p-${Date.now()}`,
                ...payload,
              };
              setProjects((prev) => [...prev, created]);
              showToast({
                title: "Proyek dibuat!",
                description: created.name,
                variant: "success",
              });
            }}
            onChangeProjectStatus={(id, status: ProjectStatus) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status } : p))
              );
              showToast({ title: "Status proyek diperbarui", variant: "success" });
            }}
          />
        )}

        {screen === "project-detail" && selectedProject && (
          <PrototypeProjectDetailView
            project={selectedProject}
            milestones={milestones}
            tasks={tasks}
            onBack={() => setScreen("projects")}
            onUpdateProjectConfig={(id, patch) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
              );
            }}
            onUpdateNotes={(id, notes) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === id ? { ...p, notes } : p))
              );
              showToast({ title: "Catatan proyek disimpan", variant: "success" });
            }}
            onDeleteProject={(id) => {
              setProjects((prev) => prev.filter((p) => p.id !== id));
              setTasks((prev) => prev.filter((t) => t.projectId !== id));
              setMilestones((prev) => prev.filter((m) => m.projectId !== id));
              setScreen("projects");
              showToast({ title: "Proyek dihapus", variant: "info" });
            }}
            onAddMilestone={(projectId, title) => {
              setMilestones((prev) => [
                ...prev,
                { id: `m-${Date.now()}`, projectId, title },
              ]);
              showToast({ title: "Milestone ditambahkan", variant: "success" });
            }}
            onRestoreTask={(taskId) => {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === taskId ? { ...t, isArchived: false } : t
                )
              );
            }}
            onSelectTask={(task) => {
              setEditingTask(task);
              setModalOpen(true);
            }}
            onCreateTaskForProject={(projId, msId) =>
              openNewTaskModal("BACKLOG", projId, msId)
            }
          />
        )}
      </main>

      {/* Modal Detail / Edit Tugas */}
      <PrototypeTaskModal
        open={modalOpen}
        task={editingTask}
        defaultProjectId={
          createProjectId ??
          (projectFilter !== "ALL" ? projectFilter : activeProjects[0]?.id)
        }
        defaultMilestoneId={createMilestoneId}
        defaultStatus={createDefaultStatus}
        projects={projects}
        milestones={milestones}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        onArchive={handleArchiveSingle}
        onDelete={handleDeleteTask}
      />

      {/* Modal Pengaturan Akun, Judul Navbar, Deskripsi & 7 Tema Warna */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Pengaturan Akun & Workspace"
        description="Atur identitas Navbar, tema warna Sky Tactile 3D, atau keluar dari akun."
        size="md"
        headerTone="blue"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Icon name="logout" size="sm" />}
              onClick={handleSignOutClick}
            >
              Keluar Akun
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                leftIcon={<Icon name="save" size="sm" />}
                onClick={handleSaveSettings}
              >
                Simpan
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3.5">
            <FormField label="Judul pada Navbar" htmlFor="ws-title" required>
              <Input
                id="ws-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Mis. Space Kanban"
              />
            </FormField>

            <FormField
              label="Deskripsi Singkat (di bawah judul)"
              htmlFor="ws-subtitle"
            >
              <Input
                id="ws-subtitle"
                value={draftSubtitle}
                onChange={(e) => setDraftSubtitle(e.target.value)}
                placeholder="Mis. Kelola proyek & tugas harian secara sinkron"
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-2.5 border-t-2 border-border-soft pt-4">
            <span className="font-display text-[14px] font-bold text-ink">
              Pilih Tema Warna (Sky Tactile 3D)
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {THEME_OPTIONS.map((option) => {
                const isSelected = option.id === theme;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-2xl border-2 border-b-[4px] px-3.5 py-2.5 text-left transition-all duration-100 cursor-pointer active:translate-y-[2px] active:border-b-2",
                      isSelected
                        ? "border-primary-lip bg-primary text-on-primary"
                        : "border-border-soft border-b-border-lip bg-surface-container text-ink hover:bg-surface-hover"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: option.primaryHex }}
                        className="h-4 w-4 shrink-0 rounded-full border-2 border-[#FFFFFF]"
                      />
                      <span className="truncate font-display text-[13px] font-bold">
                        {option.name}
                      </span>
                    </div>
                    {isSelected && <Icon name="check" size="sm" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function PrototypeApp({
  initialTheme = DEFAULT_THEME_ID,
}: {
  initialTheme?: ThemeId;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ToastProvider>
        <ConfirmModalProvider>
          <PrototypeWorkspace />
        </ConfirmModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
