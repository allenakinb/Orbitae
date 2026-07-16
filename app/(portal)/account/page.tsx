"use client";

import { useState } from "react";
import { Camera, Check, KeyRound, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { repo } from "@/lib/data/store";
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
      <PasswordForm />
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

function PasswordForm() {
  const { changePassword } = useAuth();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (pw.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (pw !== confirm) {
      setError("Le due password non coincidono.");
      return;
    }
    setPending(true);
    const res = await changePassword(pw);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "Aggiornamento non riuscito.");
      return;
    }
    setPw("");
    setConfirm("");
    setDone(true);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-6"
    >
      <h2 className="inline-flex items-center gap-2 font-display text-lg text-ink">
        <KeyRound size={17} className="text-ink-faint" /> Cambia password
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Dalla prossima volta accederai con la nuova password.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nuova password" htmlFor="pw-new">
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Minimo 8 caratteri"
            required
          />
        </Field>
        <Field label="Conferma password" htmlFor="pw-confirm">
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ripeti la nuova password"
            required
          />
        </Field>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-[var(--radius)] border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-hover"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-end gap-3">
        {done && (
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-active)]">
            <Check size={15} /> Password aggiornata
          </span>
        )}
        <Button type="submit" disabled={pending || !pw || !confirm}>
          {pending ? "Aggiorno…" : "Aggiorna password"}
        </Button>
      </div>
    </form>
  );
}
