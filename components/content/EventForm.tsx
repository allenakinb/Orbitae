"use client";

import Link from "next/link";
import { useProfiles } from "@/lib/data/hooks";
import { repo, loadAll } from "@/lib/data/store";
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
  onSubmit: (input: EventInput, attendeeIds: string[], id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!event;
  const profiles = useProfiles();
  const [id] = useState(() => event?.id ?? crypto.randomUUID());
  const [attendeeIds, setAttendeeIds] = useState<string[]>(() => event ? repo.listAttendeeIds(event.id) : []);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const results = query.trim() ? profiles.filter(p => `${p.name} ${p.company ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => a.name.localeCompare(b.name, "it")) : [];

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || pending) return;
    setPending(true); setError("");
    try { await onSubmit({
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
    }, attendeeIds, id);
    } catch (err) { setError(err instanceof Error ? err.message : "Salvataggio non riuscito."); }
    finally { setPending(false); }
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
          disabled={pending}
          aria-label="Chiudi"
          className="rounded-[var(--radius)] p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
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

        <section aria-labelledby="attendees-title" className="space-y-3 border-t border-border pt-4">
          <h3 id="attendees-title" className="text-sm font-medium text-ink">Presenti ({attendeeIds.length})</h3>
          <p className="text-sm text-ink-muted">Seleziona chi ha partecipato all’incontro. Per una persona nuova, crea prima il profilo in <Link href="/membri" target="_blank" rel="noopener noreferrer" className="text-accent underline">Membri (nuova scheda)</Link>, poi aggiorna l’elenco qui sotto.</p>
          <button type="button" className="text-sm text-accent underline" disabled={pending} onClick={async () => { setPending(true); setError(""); try { if (!await loadAll()) setError("Aggiornamento elenco non riuscito. Riprova."); } catch { setError("Aggiornamento elenco non riuscito. Riprova."); } finally { setPending(false); } }}>Aggiorna elenco membri</button>
          <div className="flex flex-wrap gap-2">
            {attendeeIds.map(pid => <button key={pid} type="button" aria-label={`Rimuovi ${profiles.find(p => p.id === pid)?.name ?? "partecipante"}`} onClick={() => setAttendeeIds(ids => ids.filter(x => x !== pid))} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm">{profiles.find(p => p.id === pid)?.name ?? "Partecipante"}<X size={14} /></button>)}
          </div>
          <Input type="search" aria-label="Cerca presenti per nome o azienda" placeholder="Cerca per nome o azienda…" value={query} onChange={e => setQuery(e.target.value)} />
          {query.trim() && <div className="max-h-64 overflow-auto rounded-[var(--radius)] border border-border p-2">
            {results.length ? results.map(p => <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded p-3 hover:bg-surface-2"><input type="checkbox" checked={attendeeIds.includes(p.id)} onChange={e => setAttendeeIds(ids => e.target.checked ? [...new Set([...ids, p.id])] : ids.filter(x => x !== p.id))} /><span className="text-sm">{p.name}{p.company && <span className="block text-xs text-ink-muted">{p.company}</span>}</span></label>) : <p className="p-3 text-sm text-ink-muted">Nessun membro trovato.</p>}
          </div>}
        </section>
        {error && <p role="alert" className="text-sm text-accent">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={!valid || pending}>
            {pending ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Crea evento"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
