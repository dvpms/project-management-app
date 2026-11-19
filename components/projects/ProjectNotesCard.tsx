"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProjectNotesAction } from "@/actions/project-actions";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  MarkdownPreview,
  Textarea,
  useToast,
} from "@/components/ui";

export function ProjectNotesCard({
  projectId,
  initialNotes,
}: {
  projectId: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [draft, setDraft] = useState(initialNotes);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateProjectNotesAction({ projectId, notes: draft });
      if (!res.ok) {
        showToast({
          title: "Gagal menyimpan catatan",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Catatan proyek disimpan", variant: "success" });
      setMode("preview");
      router.refresh();
    });
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="description" size="md" className="text-primary" />
          Catatan Proyek
        </CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "preview" ? "primary" : "outline"}
            onClick={() => setMode("preview")}
          >
            Preview
          </Button>
          <Button
            size="sm"
            variant={mode === "edit" ? "primary" : "outline"}
            onClick={() => {
              setDraft(initialNotes);
              setMode("edit");
            }}
          >
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {mode === "edit" ? (
          <div className="flex flex-col gap-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tulis catatan teknis atau rencana proyek dalam format Markdown..."
              className="min-h-[160px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode("preview")}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Icon name="save" size="sm" />}
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[120px] rounded-2xl border-2 border-border-soft bg-surface-subtle p-4">
            <MarkdownPreview content={initialNotes} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
