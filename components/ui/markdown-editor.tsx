"use client";

import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 font-display text-[20px] font-extrabold text-ink first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 font-display text-[17px] font-bold text-ink first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2.5 font-display text-[15px] font-bold text-ink first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 font-sans text-[14px] leading-6 text-ink last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 font-sans text-[14px] text-ink">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 font-sans text-[14px] text-ink">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-6">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-primary pl-3 text-ink-muted">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-xl border-2 border-border-soft bg-surface-container p-3 font-mono text-[12px] text-ink">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    return isBlock ? (
      <code className={cn("font-mono text-[12px]", className)}>{children}</code>
    ) : (
      <code className="rounded-md border border-border-soft bg-surface-container px-1.5 py-0.5 font-mono text-[12px] font-bold text-ink">
        {children}
      </code>
    );
  },
};

export function MarkdownPreview({
  content,
  emptyText = "Belum ada catatan.",
  className,
}: {
  content: string;
  emptyText?: string;
  className?: string;
}) {
  if (!content.trim()) {
    return (
      <p className={cn("font-sans text-[13px] font-medium text-ink-muted", className)}>
        {emptyText}
      </p>
    );
  }

  return (
    <div className={cn("min-w-0 break-words", className)}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={MARKDOWN_COMPONENTS}>
        {content}
      </Markdown>
    </div>
  );
}

interface MarkdownEditorProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeightClass?: string;
  defaultTab?: "edit" | "preview";
}

export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  placeholder = "Tulis catatan dalam format Markdown...",
  minHeightClass = "min-h-[140px]",
  defaultTab = "edit",
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">(defaultTab);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        {label ? (
          <label
            htmlFor={id}
            className="font-display text-[14px] font-bold leading-5 text-ink"
          >
            {label}
          </label>
        ) : (
          <span />
        )}
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={tab === "edit" ? "primary" : "outline"}
            onClick={() => setTab("edit")}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant={tab === "preview" ? "primary" : "outline"}
            onClick={() => setTab("preview")}
          >
            Preview
          </Button>
        </div>
      </div>

      {tab === "edit" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={minHeightClass}
        />
      ) : (
        <div
          className={cn(
            "rounded-2xl border-2 border-border-soft bg-surface-subtle p-4",
            minHeightClass
          )}
        >
          <MarkdownPreview content={value} />
        </div>
      )}
    </div>
  );
}
