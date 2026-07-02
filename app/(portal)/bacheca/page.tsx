"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useAnnouncements, useProfiles } from "@/lib/data/hooks";
import { repo } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { AnnouncementCard } from "@/components/content/AnnouncementCard";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

export default function BachecaPage() {
  const announcements = useAnnouncements();
  const profiles = useProfiles();
  const { user } = useAuth();
  const mayPost = can(user?.role, "postAnnouncement");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const byId = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles],
  );

  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !body.trim()) return;
    repo.createAnnouncement({
      title: title.trim(),
      body: body.trim(),
      authorId: user.id,
    });
    setTitle("");
    setBody("");
    setOpen(false);
  }

  return (
    <PageContainer>
      <SectionTitle
        title="Bacheca"
        subtitle="Annunci e comunicazioni ufficiali del club."
      >
        {mayPost && !open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuovo annuncio
          </Button>
        )}
      </SectionTitle>

      {mayPost && open && (
        <form
          onSubmit={publish}
          className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5 motion-safe:animate-fade-rise"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Nuovo annuncio</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="rounded-[var(--radius)] p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Titolo" htmlFor="a-title">
              <Input
                id="a-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Cena di networking — Milano"
                required
              />
            </Field>
            <Field label="Testo" htmlFor="a-body">
              <Textarea
                id="a-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Scrivi il contenuto dell'annuncio…"
                required
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={!title.trim() || !body.trim()}>
                Pubblica
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {announcements.map((a) => (
          <AnnouncementCard
            key={a.id}
            announcement={a}
            author={byId.get(a.authorId)}
          />
        ))}
      </div>
    </PageContainer>
  );
}
