"use client";

import { useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useProfiles, useResources } from "@/lib/data/hooks";
import { demoRepo } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import type { Resource, ResourceCategory } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

const CATEGORIES: ResourceCategory[] = ["Verbali", "Regolamenti", "Materiali"];

const KIND_ICON = {
  pdf: FileText,
  doc: FileText,
  image: ImageIcon,
  link: LinkIcon,
} as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function DocumentRow({
  resource,
  uploader,
}: {
  resource: Resource;
  uploader?: string;
}) {
  const Icon = KIND_ICON[resource.fileKind];
  const downloadable = resource.fileUrl !== "#";
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius)] bg-accent-soft text-accent">
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {resource.name}
        </p>
        <p className="truncate text-xs text-ink-muted">
          {resource.sizeLabel ? `${resource.sizeLabel} · ` : ""}
          {uploader ? `${uploader} · ` : ""}
          {formatDate(resource.createdAt)}
        </p>
      </div>
      <a
        href={resource.fileUrl}
        download={downloadable ? resource.name : undefined}
        aria-label={`Scarica ${resource.name}`}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-accent hover:text-accent"
      >
        <Download size={15} />
        <span className="hidden sm:inline">Scarica</span>
      </a>
    </div>
  );
}

export default function DocumentiPage() {
  const resources = useResources();
  const profiles = useProfiles();
  const { user } = useAuth();
  const mayUpload = can(user?.role, "uploadResource");

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ResourceCategory>("Verbali");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploaderName = useMemo(
    () => new Map(profiles.map((p) => [p.id, p.name])),
    [profiles],
  );

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name) setName(f.name.replace(/\.[^.]+$/, ""));
  }

  function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !file || !name.trim()) return;
    const kind: Resource["fileKind"] = file.type.startsWith("image/")
      ? "image"
      : file.type === "application/pdf"
        ? "pdf"
        : "doc";
    demoRepo.createResource({
      name: name.trim(),
      category,
      fileKind: kind,
      fileUrl: URL.createObjectURL(file),
      sizeLabel: formatBytes(file.size),
      uploadedBy: user.id,
    });
    setFile(null);
    setName("");
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
  }

  return (
    <PageContainer>
      <SectionTitle
        title="Documenti"
        subtitle="Verbali, regolamenti e materiali del club. Disponibili al download per tutti i membri."
      >
        {mayUpload && !open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={16} /> Carica documento
          </Button>
        )}
      </SectionTitle>

      {mayUpload && open && (
        <form
          onSubmit={upload}
          className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5 motion-safe:animate-fade-rise"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Nuovo documento</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="rounded-[var(--radius)] p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome documento" htmlFor="d-name">
              <Input
                id="d-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Verbale assemblea giugno"
                required
              />
            </Field>
            <Field label="Categoria" htmlFor="d-cat">
              <Select
                id="d-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-dashed border-border-strong px-4 py-3 text-sm text-ink-muted transition-colors hover:border-accent hover:text-ink">
              <Upload size={17} className="text-ink-faint" />
              {file ? file.name : "Seleziona un file (PDF, immagine, documento)"}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={onPick}
                required
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={!file || !name.trim()}>
              Carica
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-7">
        {CATEGORIES.map((cat) => {
          const items = resources.filter((r) => r.category === cat);
          return (
            <section key={cat}>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="font-display text-lg text-ink">{cat}</h2>
                <span className="text-sm text-ink-faint">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 px-5 py-6 text-sm text-ink-muted">
                  Nessun documento in questa categoria.
                </p>
              ) : (
                <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
                  {items.map((r) => (
                    <DocumentRow
                      key={r.id}
                      resource={r}
                      uploader={uploaderName.get(r.uploadedBy)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </PageContainer>
  );
}
