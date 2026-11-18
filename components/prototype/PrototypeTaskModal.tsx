"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  FormField,
  Icon,
  Input,
  Modal,
  Select,
  Textarea,
  useConfirm,
} from "@/components/ui";
import {
  KANBAN_COLUMNS,
  type ProtoMilestone,
  type ProtoProject,
  type ProtoTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/prototype-data";

interface PrototypeTaskModalProps {
  open: boolean;
  task: ProtoTask | null;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
  projects: ProtoProject[];
  milestones: ProtoMilestone[];
  onClose: () => void;
  onSave: (payload: Omit<ProtoTask, "id" | "order" | "isArchived">, existingId?: string) => void;
  onArchive?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

function PrototypeTaskModalInner({
  task,
  defaultProjectId,
  defaultStatus = "BACKLOG",
  projects,
  milestones,
  onClose,
  onSave,
  onArchive,
  onDelete,
}: Omit<PrototypeTaskModalProps, "open">) {
  const confirm = useConfirm();
  const [title, setTitle] = useState(task?.title ?? "");
  const [projectId, setProjectId] = useState(
    task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? ""
  );
  const [milestoneId, setMilestoneId] = useState(task?.milestoneId ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [descTab, setDescTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState("");

  const projectMilestones = milestones.filter((m) => m.projectId === projectId);

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    const stillValid = milestones.some(
      (m) => m.id === milestoneId && m.projectId === nextProjectId
    );
    if (!stillValid) setMilestoneId("");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Judul tugas wajib diisi.");
      return;
    }
    onSave(
      {
        title: title.trim(),
        projectId,
        milestoneId: milestoneId || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        description,
      },
      task?.id
    );
    onClose();
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    const ok = await confirm({
      title: "Hapus Tugas?",
      message: `Tugas "${task.title}" akan dihapus permanen dari proyek dan papan Space Kanban.`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (ok) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? "Detail & Edit Tugas" : "Buat Tugas Baru"}
      description={
        task
          ? "Perubahan langsung tersinkron antara Space Kanban dan kolom Proyek."
          : "Tugas baru otomatis masuk ke papan Space Kanban dan daftar proyek."
      }
      size="lg"
      headerTone={task ? "blue" : "white"}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {task && onDelete && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Icon name="delete" size="sm" />}
                onClick={handleDelete}
              >
                Hapus
              </Button>
            )}
            {task && status === "DONE" && !task.isArchived && onArchive && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Icon name="inventory_2" size="sm" />}
                onClick={() => {
                  onArchive(task.id);
                  onClose();
                }}
              >
                Arsipkan
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Icon name="save" size="sm" />}
              onClick={handleSubmit}
            >
              {task ? "Simpan Perubahan" : "Tambah Tugas"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Judul Tugas" htmlFor="proto-task-title" required error={error}>
          <Input
            id="proto-task-title"
            hasError={Boolean(error)}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="Contoh: Integrasi Google OAuth"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField label="Status Kanban" htmlFor="proto-task-status">
            <Select
              id="proto-task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {KANBAN_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Prioritas" htmlFor="proto-task-priority">
            <Select
              id="proto-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </Select>
          </FormField>

          <FormField label="Proyek" htmlFor="proto-task-project">
            <Select
              id="proto-task-project"
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Milestone (Opsional)" htmlFor="proto-task-milestone">
            <Select
              id="proto-task-milestone"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
            >
              <option value="">Tanpa milestone</option>
              {projectMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Target Tanggal (Opsional)" htmlFor="proto-task-date">
          <Input
            id="proto-task-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-[15px] font-semibold">
              Deskripsi &amp; Catatan
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={descTab === "edit" ? "primary" : "outline"}
                onClick={() => setDescTab("edit")}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant={descTab === "preview" ? "primary" : "outline"}
                onClick={() => setDescTab("preview")}
              >
                Preview
              </Button>
            </div>
          </div>

          {descTab === "edit" ? (
            <Textarea
              id="proto-task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tulis catatan tugas dalam format Markdown..."
            />
          ) : (
            <div className="min-h-[100px] rounded-2xl border-2 border-border-soft bg-surface-subtle p-4">
              {description.trim() ? (
                <div className="flex flex-col gap-1.5 font-sans text-[14px] leading-5 whitespace-pre-wrap text-ink">
                  <Badge variant="neutral" className="w-fit" mono>
                    PREVIEW MARKDOWN
                  </Badge>
                  <p className="mt-1">{description}</p>
                </div>
              ) : (
                <p className="font-sans text-[13px] text-ink-muted">
                  Belum ada catatan.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function PrototypeTaskModal(props: PrototypeTaskModalProps) {
  if (!props.open) return null;
  const modalKey = `${props.task?.id ?? "new"}-${props.defaultStatus ?? "BACKLOG"}-${props.defaultProjectId ?? ""}`;
  return <PrototypeTaskModalInner key={modalKey} {...props} />;
}
