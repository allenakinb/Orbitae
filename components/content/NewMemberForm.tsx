"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { loadAll } from "@/lib/data/store";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function NewMemberForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (pending || created) return;
    setPending(true); setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw Error("Sessione scaduta. Accedi nuovamente.");
      const res = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ name, email, company }) });
      const result = await res.json();
      if (!res.ok) throw Error(result.error);
      setCreated(true);
      if (!await loadAll()) { setError("Membro creato. Ricarica la pagina per aggiornare l’elenco."); return; }
      onCreated();
    } catch (err) { setError(err instanceof Error ? err.message : "Creazione non riuscita."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mt-6 space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
    <h2 className="font-display text-lg">Nuovo membro</h2>
    <p className="text-sm text-ink-muted">Crea il profilo, poi selezionalo tra i presenti dell’incontro in Bacheca. Non viene inviata nessuna email.</p>
    <Field label="Nome e cognome" htmlFor="member-name"><Input id="member-name" required maxLength={160} value={name} onChange={e => setName(e.target.value)} disabled={pending || created} /></Field>
    <Field label="Email personale o di lavoro" htmlFor="member-email"><Input id="member-email" type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} disabled={pending || created} /></Field>
    <Field label="Azienda" htmlFor="member-company"><Input id="member-company" maxLength={300} value={company} onChange={e => setCompany(e.target.value)} disabled={pending || created} /></Field>
    {error && <p role="alert" className="text-sm text-accent">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>{created ? "Chiudi" : "Annulla"}</Button><Button type="submit" disabled={pending || created}>{pending ? "Creazione…" : created ? "Membro creato" : "Crea membro"}</Button></div>
  </form>;
}
