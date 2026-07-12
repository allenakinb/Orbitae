"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  useAnnouncements,
  useProfiles,
  useUpcomingEvents,
} from "@/lib/data/hooks";
import { repo } from "@/lib/data/store";
import type { EventInput } from "@/lib/data/adapter";
import type { ClubEvent } from "@/lib/data/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { AnnouncementCard } from "@/components/content/AnnouncementCard";
import { EventCard } from "@/components/content/EventCard";
import { EventForm } from "@/components/content/EventForm";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

export default function BachecaPage() {
  const announcements = useAnnouncements();
  const events = useUpcomingEvents();
  const profiles = useProfiles();
  const { user } = useAuth();
  const mayPost = can(user?.role, "postAnnouncement");
  const mayManageEvents = can(user?.role, "manageEvents");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // null = form chiuso · "new" = creazione · ClubEvent = modifica
  const [eventDraft, setEventDraft] = useState<ClubEvent | "new" | null>(null);

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

  function submitEvent(input: EventInput) {
    if (eventDraft && eventDraft !== "new") {
      repo.updateEvent(eventDraft.id, input);
    } else {
      repo.createEvent(input);
    }
    setEventDraft(null);
  }

  function removeEvent(ev: ClubEvent) {
    if (window.confirm(`Eliminare l'evento «${ev.title}»?`)) {
      repo.deleteEvent(ev.id);
      if (eventDraft !== "new" && eventDraft?.id === ev.id) setEventDraft(null);
    }
  }

  return (
    <PageContainer>
      <SectionTitle
        title="Bacheca"
        subtitle="Eventi, annunci e comunicazioni ufficiali del club."
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

      {(events.length > 0 || mayManageEvents) && (
        <section aria-label="Prossimi eventi" className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-ink">Prossimi eventi</h2>
            {mayManageEvents && eventDraft === null && (
              <Button size="sm" onClick={() => setEventDraft("new")}>
                <Plus size={16} /> Nuovo evento
              </Button>
            )}
          </div>

          {eventDraft !== null && (
            <div className="mb-4">
              <EventForm
                key={eventDraft === "new" ? "new" : eventDraft.id}
                event={eventDraft === "new" ? undefined : eventDraft}
                onSubmit={submitEvent}
                onCancel={() => setEventDraft(null)}
              />
            </div>
          )}

          {events.length > 0 ? (
            <div className="flex flex-col gap-4">
              {events.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  onEdit={mayManageEvents ? setEventDraft : undefined}
                  onDelete={mayManageEvents ? removeEvent : undefined}
                />
              ))}
            </div>
          ) : (
            mayManageEvents &&
            eventDraft === null && (
              <p className="text-sm text-ink-muted">
                Nessun evento in programma. Crea il primo con «Nuovo evento».
              </p>
            )
          )}
        </section>
      )}

      <section aria-label="Annunci" className="mt-10">
        <h2 className="mb-3 font-display text-lg text-ink">Annunci</h2>
        <div className="flex flex-col gap-4">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              author={byId.get(a.authorId)}
            />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
