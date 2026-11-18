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
  Icon,
  ThemeProvider,
  ThemeSwitcher,
  ToastProvider,
  useConfirm,
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
import { DEFAULT_THEME_ID, type ThemeId } from "@/lib/theme-presets";

type ActiveScreen = "dashboard" | "projects" | "project-detail" | "login";
type LayoutMode = "split" | "kanban" | "projects";

function PrototypeWorkspace() {
  const { showToast } = useToast();
  const confirm = useConfirm();

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

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const activeProjectIds = new Set(activeProjects.map((p) => p.id));

  const kanbanTasks = tasks.filter(
    (t) =>
      !t.isArchived &&
      activeProjectIds.has(t.projectId) &&
      (projectFilter === "ALL" || t.projectId === projectFilter)
  );

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

  const handleSignOutClick = async () => {
    const ok = await confirm({
      title: "Keluar dari Space Kanban?",
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
        <div className="mb-4">
          <ThemeSwitcher />
        </div>
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
                Space Kanban
              </h1>
              <p className="mt-2 font-sans text-[14px] font-medium text-ink-muted">
                Santai &amp; Fokus. Kelola banyak proyek dan tugas harianmu dalam satu layar solid.
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
      <header className="sticky top-0 z-30 border-b-2 border-border-soft bg-surface-container px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-primary-lip border-b-[4px] bg-primary text-on-primary">
                <Icon name="view_kanban" size="md" />
              </div>
              <span className="font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink">
                Space Kanban
              </span>
            </div>
            <Badge variant="amber" mono>
              PROTOTIPE
            </Badge>
            <Link
              href="/themes"
              className="hidden font-display text-[12px] font-bold text-ink-muted hover:text-ink hover:underline sm:inline-flex"
            >
              Galeri /themes
            </Link>
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
              variant={screen === "projects" ? "primary" : "outline"}
              leftIcon={<Icon name="folder" size="sm" />}
              onClick={() => setScreen("projects")}
            >
              Daftar Proyek
            </Button>
            <Button
              size="sm"
              variant={screen === "project-detail" ? "primary" : "outline"}
              leftIcon={<Icon name="description" size="sm" />}
              onClick={() => setScreen("project-detail")}
            >
              Detail Proyek
            </Button>
            <ThemeSwitcher />
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon name="logout" size="sm" />}
              onClick={handleSignOutClick}
            >
              Keluar
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
                  onClick={() => {
                    setEditingTask(null);
                    setCreateDefaultStatus("BACKLOG");
                    setModalOpen(true);
                  }}
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
                  onCreateTaskInStatus={(status) => {
                    setEditingTask(null);
                    setCreateDefaultStatus(status);
                    setModalOpen(true);
                  }}
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
            onUpdateDescription={(id, desc) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === id ? { ...p, description: desc } : p))
              );
              showToast({ title: "Catatan proyek disimpan", variant: "success" });
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
          />
        )}
      </main>

      <PrototypeTaskModal
        open={modalOpen}
        task={editingTask}
        defaultProjectId={
          projectFilter !== "ALL" ? projectFilter : activeProjects[0]?.id
        }
        defaultStatus={createDefaultStatus}
        projects={projects}
        milestones={milestones}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        onArchive={handleArchiveSingle}
        onDelete={handleDeleteTask}
      />
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
