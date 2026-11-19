"use client";

import { AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { createProjectAction } from "@/actions/project-actions";
import type { ProjectStatus } from "@/app/generated/prisma/enums";
import {
  Button,
  FormField,
  Icon,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  PROJECT_COLOR_OPTIONS,
  type ProjectColorTone,
} from "@/lib/project-constants";

interface ProjectCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

function ProjectCreateModalInner({
  onClose,
  onCreated,
}: Omit<ProjectCreateModalProps, "open">) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [color, setColor] = useState<ProjectColorTone>("sky");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [summary, setSummary] = useState("");
  const [nameError, setNameError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Nama proyek wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await createProjectAction({
        name: name.trim(),
        color,
        status,
        summary: summary.trim(),
      });

      if (!res.ok) {
        showToast({
          title: "Gagal membuat proyek",
          description: res.error,
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Proyek dibuat!",
        description: res.data?.name,
        variant: "success",
      });
      onCreated?.();
      onClose();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Buat Proyek Baru"
      headerTone="blue"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            variant="primary"
            leftIcon={<Icon name="save" size="sm" />}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Proyek"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <FormField
          label="Nama Proyek"
          htmlFor="create-project-name"
          required
          error={nameError}
        >
          <Input
            id="create-project-name"
            hasError={Boolean(nameError)}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            placeholder="Contoh: SaaS Invoice"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Warna Identitas" htmlFor="create-project-color">
            <Select
              id="create-project-color"
              value={color}
              onChange={(e) => setColor(e.target.value as ProjectColorTone)}
            >
              {PROJECT_COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status Awal" htmlFor="create-project-status">
            <Select
              id="create-project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              <option value="ACTIVE">Aktif</option>
              <option value="ON_HOLD">Ditunda</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Deskripsi Singkat" htmlFor="create-project-summary">
          <Textarea
            id="create-project-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Ringkasan singkat tujuan proyek..."
          />
        </FormField>
      </div>
    </Modal>
  );
}

export function ProjectCreateModal(props: ProjectCreateModalProps) {
  return (
    <AnimatePresence>
      {props.open && <ProjectCreateModalInner key="create-project" {...props} />}
    </AnimatePresence>
  );
}
