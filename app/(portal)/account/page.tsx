"use client";

import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { Camera, Check, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { repo, loadAll } from "@/lib/data/store";
import type { Profile } from "@/lib/data/types";
import { resizeToDataUrl, ACCEPTED_IMAGE } from "@/lib/brand/image";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <PageContainer>
      <SectionTitle
        title="Il mio account"
        subtitle="I tuoi dati personali e le impostazioni di accesso."
      />

      {/* Identity header */}
      <div className="mt-6 flex flex-col gap-5 rounded-[var(--radius-xl)] border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
        <Avatar profile={user} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl text-ink">{user.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TierBadge tier={user.tier} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} className="text-ink-faint" /> {user.email}
            </span>
          </div>
        </div>
      </div>

      <PersonalDataForm key={user.id} user={user} />
      <EmailAccessForm />
    </PageContainer>
  );
}

function PersonalDataForm({ user }: { user: Profile }) {
  const [form, setForm] = useState({
    name: user.name,
    company: user.company ?? "",
    sector: user.sector,
    city: user.city,
    phone: user.phone ?? "",
    bio: user.bio ?? "",
  });
  const [avatar, setAvatar] = useState<string | null>(user.avatarUrl);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setAvatar(await resizeToDataUrl(file));
      setSaved(false);
    } finally {
      setBusy(false);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    repo.updateProfile(user.id, {
      name: form.name.trim() || user.name,
      company: form.company.trim() || undefined,
      sector: form.sector.trim(),
      city: form.city.trim(),
      phone: form.phone.trim() || undefined,
      bio: form.bio.trim() || undefined,
      avatarUrl: avatar,
    });
    setSaved(true);
  }

  return (
    <form
      onSubmit={save}
      className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6"
    >
      <h2 className="font-display text-lg text-ink">Dati personali</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Le informazioni visibili nel tuo profilo del club.
      </p>

      {/* Avatar */}
      <div className="mt-5 flex items-center gap-4">
        <Avatar profile={{ ...user, avatarUrl: avatar }} size={64} />
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-border-strong px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent">
            <Camera size={15} />
            {busy ? "Carico…" : "Carica foto"}
            <input
              type="file"
              accept={ACCEPTED_IMAGE}
              className="hidden"
              onChange={onPick}
            />
          </label>
          {avatar && (
            <button
              type="button"
              onClick={() => {
                setAvatar(null);
                setSaved(false);
              }}
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <Trash2 size={15} /> Rimuovi
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="a-name">
          <Input
            id="a-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Azienda" htmlFor="a-company">
          <Input
            id="a-company"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </Field>
        <Field label="Settore" htmlFor="a-sector">
          <Input
            id="a-sector"
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
          />
        </Field>
        <Field label="Città" htmlFor="a-city">
          <Input
            id="a-city"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field label="Telefono" htmlFor="a-phone">
          <Input
            id="a-phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Bio" htmlFor="a-bio">
          <Textarea
            id="a-bio"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Una breve presentazione…"
          />
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-active)]">
            <Check size={15} /> Salvato
          </span>
        )}
        <Button type="submit" disabled={busy}>
          Salva modifiche
        </Button>
      </div>
    </form>
  );
}

function EmailAccessForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [useCode, setUseCode] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !user) return;
    setPending(true); setMessage("");
    try {
      const nextEmail = email.trim().toLowerCase();
      if (!sent) {
        if (nextEmail.endsWith("@orbitae.club")) { setMessage("Inserisci una casella personale o di lavoro che puoi aprire."); return; }
        const { data: current, error: currentError } = await supabase.auth.getUser();
        if (currentError || !current.user) { setMessage("Sessione scaduta. Accedi nuovamente."); return; }
        if (current.user.email?.toLowerCase() === nextEmail) { setMessage("Questa è già la tua email di accesso."); return; }
        const { error } = await supabase.auth.updateUser({ email: nextEmail }, { emailRedirectTo: `${window.location.origin}/account` });
        if (error) { setMessage("Invio non riuscito: verifica l’indirizzo o attendi qualche minuto prima di riprovare."); return; }
        setEmail(nextEmail); setSent(true);
        setMessage("Apri il link ricevuto sulla nuova email, poi verifica qui la conferma. La vecchia email resta valida fino alla conferma.");
      } else {
        let verifiedId: string | undefined;
        if (useCode) {
          const { data, error } = await supabase.auth.verifyOtp({ email: nextEmail, token: token.trim(), type: "email_change" });
          if (error) { setMessage("Codice non valido o scaduto. Riprova o richiedine uno nuovo."); return; }
          verifiedId = data.user?.id;
        }
        // Dual confirmation can return success without completing the change.
        const { data: verified, error: verifiedError } = await supabase.auth.getUser();
        if (verifiedError || !verified.user || verified.user.id !== user.id || verified.user.email?.toLowerCase() !== nextEmail || (verifiedId && verifiedId !== user.id)) {
          setMessage("Il cambio non è ancora completato. Apri il link sulla nuova email. Se non riesci a confermare, contatta la segreteria."); return;
        }
        const { error: profileError } = await supabase.from("profiles").update({ email: nextEmail }).eq("id", user.id).select("id").single();
        setDone(true); setSent(false); setToken("");
        await loadAll();
        setMessage(profileError ? "Email di accesso confermata. L’email visibile nel profilo non è stata sincronizzata: contatta la segreteria." : "Email confermata. Dal prossimo accesso richiedi un link su questa email. Profilo e presenze sono conservati.");
      }
    } catch { setMessage("Connessione non disponibile. Riprova."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
    <h2 className="font-display text-lg text-ink">Email di accesso</h2>
    <p className="mt-2 text-sm text-ink-muted">Associa una casella personale per ricevere i link di accesso. Il tuo account resta lo stesso.</p>
    <div className="mt-5"><Field label="Email personale o di lavoro" htmlFor="new-email"><Input id="new-email" type="email" autoComplete="email" required disabled={pending || sent || done} value={email} onChange={e => setEmail(e.target.value)} /></Field></div>
    {sent && useCode && <div className="mt-4"><Field label="Codice ricevuto sulla nuova email" htmlFor="email-code"><Input id="email-code" autoComplete="one-time-code" inputMode="numeric" required disabled={pending} value={token} onChange={e => setToken(e.target.value)} /></Field></div>}
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
    {!done && <Button className="mt-5" type="submit" disabled={pending}>{pending ? "Attendi…" : sent ? "Verifica conferma email" : "Invia link alla nuova email"}</Button>}
    {sent && !useCode && <button className="mt-4 block text-sm underline underline-offset-4" type="button" disabled={pending} onClick={() => setUseCode(true)}>Ho ricevuto un codice da inserire</button>}
    {sent && <button className="mt-4 block text-sm underline underline-offset-4" type="button" disabled={pending} onClick={() => { setSent(false); setUseCode(false); setToken(""); setMessage(""); }}>Cambia indirizzo o richiedi un nuovo link</button>}
  </form>;
}
