import { CalendarDays, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import type { ClubEvent, EventPerson } from "@/lib/data/types";
import { formatDate, formatDayMonth } from "@/lib/format";
import { EventRecap } from "./EventRecap";

function PeopleGroup({ label, people }: { label: string; people: EventPerson[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {people.map((p) => (
          <li key={p.name} className="text-sm text-ink">
            {p.name}
            {p.role && <span className="text-ink-muted"> — {p.role}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: ClubEvent;
  onEdit?: (event: ClubEvent) => void;
  onDelete?: (event: ClubEvent) => void;
}) {
  const [day, month] = formatDayMonth(event.date).split(" ");
  const hasPeople = event.speakers.length > 0 || event.moderators.length > 0;
  const canManage = !!onEdit || !!onDelete;

  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:p-6">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
          <span className="text-base font-bold leading-none">{day}</span>
          <span className="mt-0.5 text-[0.62rem] uppercase leading-none">
            {month}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg text-ink sm:text-xl">
              {event.title}
            </h3>
            {canManage && (
              <div className="flex shrink-0 items-center gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    aria-label="Modifica evento"
                    className="rounded-[var(--radius)] p-1.5 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(event)}
                    aria-label="Elimina evento"
                    className="rounded-[var(--radius)] p-1.5 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
          {event.subtitle && (
            <p className="mt-0.5 text-sm text-ink-muted">{event.subtitle}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} className="text-ink-faint" />
              {formatDate(event.date)}
            </span>
            {event.time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="text-ink-faint" />
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} className="text-ink-faint" />
                {event.location}
              </span>
            )}
          </div>
          {event.summary && <EventRecap text={event.summary} />}
          {hasPeople && (
            <div className="mt-4 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
              {event.speakers.length > 0 && (
                <PeopleGroup label="Relatori" people={event.speakers} />
              )}
              {event.moderators.length > 0 && (
                <PeopleGroup label="Moderatori" people={event.moderators} />
              )}
            </div>
          )}
          {event.mapUrl && (
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent-hover"
            >
              <MapPin size={15} />
              Apri in Google Maps
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
