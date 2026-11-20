"use client";

import { AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { updateProjectConfigAction } from "@/actions/project-actions";
import type { ProjectStatus } from "@/app/generated/prisma/enums";
import {
  Button,
  FormField,
  Icon,
  IconButton,
  Input,
  Modal,
  Select,
  useToast,
} from "@/components/ui";
import {
  PROJECT_COLOR_OPTIONS,
  type ProjectAttribute,
  type ProjectColorTone,
} from "@/lib/project-constants";
import type { ProjectDetailData } from "@/services/project-service";

interface ProjectConfigModalProps {
  open: boolean;
  project: Pick<
    ProjectDetailData,
    "id" | "name" | "summary" | "status" | "color" | "attributes"
  >;
  onClose: () => void;
  onSaved: () => void;
}

function ProjectConfigModalInner({
  project,
  onClose,
  onSaved,
}: Omit<ProjectConfigModalProps, "open">) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(project.name);
  const [summary, setSummary] = useState(project.summary);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [color, setColor] = useState<ProjectColorTone>(project.color);
  const [attrs, setAttrs] = useState<ProjectAttribute[]>(
    project.attributes.map((a) => ({ ...a }))
  );
  const [nameError, setNameError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setNameError("Nama proyek wajib diisi.");
      return;
    }

    const cleanedAttrs = attrs
      .map((a) => ({ ...a, label: a.label.trim(), value: a.value.trim() }))
      .filter((a) => a.label && a.value);

    startTransition(async () => {
      const res = await updateProjectConfigAction({
        projectId: project.id,
        name: name.trim(),
        summary: summary.trim(),
        status,
        color,
        attributes: cleanedAttrs,
      });

      if (!res.ok) {
        showToast({
          title: "Gagal menyimpan konfigurasi",
          description: res.error,
          variant: "error",
        });
        return;
      }

      showToast({ title: "Konfigurasi proyek disimpan", variant: "success" });
      onSaved();
      onClose();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Konfigurasi Proyek"
      description="Sesuaikan detail proyek dan kelola atribut teknis secara bebas."
      size="lg"
      headerTone="blue"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            variant="primary"
            leftIcon={<Icon name="save" size="sm" />}
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <FormField
            label="Nama Proyek"
            htmlFor="cfg-name"
            required
            error={nameError}
            className="sm:col-span-2"
          >
            <Input
              id="cfg-name"
              hasError={Boolean(nameError)}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
            />
          </FormField>

          <FormField label="Warna" htmlFor="cfg-color">
            <Select
              id="cfg-color"
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
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <FormField
            label="Deskripsi Singkat"
            htmlFor="cfg-summary"
            className="sm:col-span-2"
          >
            <Input
              id="cfg-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FormField>

          <FormField label="Status Proyek" htmlFor="cfg-status">
            <Select
              id="cfg-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              <option value="ACTIVE">Aktif</option>
              <option value="ON_HOLD">Ditunda</option>
              <option value="COMPLETED">Selesai</option>
              <option value="ARCHIVED">Diarsipkan</option>
            </Select>
          </FormField>
        </div>

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
                setAttrs((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), label: "", value: "" },
                ])
              }
            >
              Tambah Atribut
            </Button>
          </div>

          {attrs.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-border-soft p-4 text-center font-sans text-[13px] text-ink-muted">
              Belum ada atribut. Klik &ldquo;Tambah Atribut&rdquo; untuk menambahkan baris baru.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {attrs.map((attr, idx) => (
                <div key={attr.id} className="flex items-center gap-2">
                  <Input
                    aria-label={`Label atribut ${idx + 1}`}
                    placeholder="Label (mis. Git Repository)"
                    value={attr.label}
                    onChange={(e) =>
                      setAttrs((prev) =>
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
                      setAttrs((prev) =>
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
                      setAttrs((prev) => prev.filter((item) => item.id !== attr.id))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function ProjectConfigModal(props: ProjectConfigModalProps) {
  return (
    <AnimatePresence>
      {props.open && (
        <ProjectConfigModalInner key={props.project.id} {...props} />
      )}
    </AnimatePresence>
  );
}
