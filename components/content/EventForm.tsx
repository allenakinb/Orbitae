"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { EventInput } from "@/lib/data/adapter";
import type { ClubEvent, EventPerson } from "@/lib/data/types";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

// Editor per una lista di persone (relatori o moderatori): righe
// aggiungibili/rimovibili con nome + ruolo.
function PeopleEditor({
  label,
  people,
  onChange,
}: {
  label: string;
  people: EventPerson[];
  onChange: (next: EventPerson[]) => void;
}) {
  function update(i: number, patch: Partial<EventPerson>) {
    onChange(people.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...people, { name: "", role: "" }])}
          className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover"
        >
          <Plus size={15} /> Aggiungi
        </button>
      </div>
      {people.length === 0 ? (
        <p className="text-xs text-ink-faint">Nessuno indicato.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {people.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Nome"
                className="flex-1"
              />
              <Input
                value={p.role ?? ""}
                onChange={(e) => update(i, { role: e.target.value })}
                placeholder="Ruolo / azienda"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => onChange(people.filter((_, idx) => idx !== i))}
                aria-label="Rimuovi"
                className="shrink-0 rounded-[var(--radius)] p-2 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
}: {
  event?: ClubEvent;
  onSubmit: (input: EventInput) => void;
  onCancel: () => void;
}) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [subtitle, setSubtitle] = useState(event?.subtitle ?? "");
  const [date, setDate] = useState(event?.date ?? "");
  const [time, setTime] = useState(event?.time ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [mapUrl, setMapUrl] = useState(event?.mapUrl ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [summary, setSummary] = useState(event?.summary ?? "");
  const [speakers, setSpeakers] = useState<EventPerson[]>(
    event?.speakers ?? [],
  );
  const [moderators, setModerators] = useState<EventPerson[]>(
    event?.moderators ?? [],
  );

  const valid = title.trim().length > 0 && date.length > 0;

  function clean(people: EventPerson[]): EventPerson[] {
    return people
      .map((p) => ({ name: p.name.trim(), role: p.role?.trim() || undefined }))
      .filter((p) => p.name.length > 0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      date,
      time: time.trim() || undefined,
      location: location.trim(),
      description: description.trim() || undefined,
      summary: summary.trim() || undefined,
      speakers: clean(speakers),
      moderators: clean(moderators),
      mapUrl: mapUrl.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 motion-safe:animate-fade-rise"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">
          {isEdit ? "Modifica evento" : "Nuovo evento"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Chiudi"
          className="rounded-[var(--radius)] p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Titolo" htmlFor="e-title">
          <Input
            id="e-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Cena di networking"
            required
          />
        </Field>

        <Field label="Sottotitolo" htmlFor="e-subtitle">
          <Input
            id="e-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Facoltativo"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data" htmlFor="e-date">
            <Input
              id="e-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Field>
          <Field label="Ora" htmlFor="e-time">
            <Input
              id="e-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Luogo" htmlFor="e-location">
          <Input
            id="e-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Es. Palazzo Cordusio, Milano"
          />
        </Field>

        <Field
          label="Posizione (link Google Maps)"
          htmlFor="e-map"
          hint="Incolla il link della mappa: comparirà il pulsante «Apri in Google Maps»."
        >
          <Input
            id="e-map"
            type="url"
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            placeholder="https://maps.google.com/…"
          />
        </Field>

        <Field label="Descrizione breve" htmlFor="e-description">
          <Input
            id="e-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una riga per la Home"
          />
        </Field>

        <Field label="Sintesi" htmlFor="e-summary">
          <Textarea
            id="e-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Descrizione estesa mostrata in Bacheca…"
          />
        </Field>

        <PeopleEditor label="Relatori" people={speakers} onChange={setSpeakers} />
        <PeopleEditor
          label="Moderatori"
          people={moderators}
          onChange={setModerators}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={!valid}>
            {isEdit ? "Salva modifiche" : "Crea evento"}
          </Button>
        </div>
      </div>
    </form>
  );
}
