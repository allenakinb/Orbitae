"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAnnouncements, useEvents, useProfiles } from "@/lib/data/hooks";
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

export default function BachecaPage() {
  const announcements = useAnnouncements();
  const events = useEvents();
  const profiles = useProfiles();
  const { user } = useAuth();
  const mayManageEvents = can(user?.role, "manageEvents");

  // null = form chiuso · "new" = creazione · ClubEvent = modifica
  const [eventDraft, setEventDraft] = useState<ClubEvent | "new" | null>(null);

  const byId = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles],
  );

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
      />

      {(events.length > 0 || mayManageEvents) && (
        <section aria-label="Eventi" className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-ink">Eventi</h2>
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
                Nessun evento. Crea il primo con «Nuovo evento».
              </p>
            )
          )}
        </section>
      )}

      {/* Il racconto delle serate vive nelle card evento: la sezione
          annunci compare solo se c'è qualcosa da dire. */}
      {announcements.length > 0 && (
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
      )}
    </PageContainer>
  );
}
