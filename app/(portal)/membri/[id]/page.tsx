"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { LinkedinIcon } from "@/components/brand/LinkedinIcon";
import { useProfile } from "@/lib/data/hooks";
import { repo } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import type { MemberStatus, Profile, Tier } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { resizeToDataUrl, ACCEPTED_IMAGE } from "@/lib/brand/image";
import { PageContainer } from "@/components/shell/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { TierBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <Icon size={16} className="mt-0.5 shrink-0 text-ink-faint" />
      <span className="min-w-0">
        <span className="block text-xs text-ink-faint">{label}</span>
        <span className="block truncate text-sm text-ink">{value}</span>
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      className="flex gap-3 transition-colors hover:text-accent"
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {content}
    </a>
  ) : (
    <div className="flex gap-3">{content}</div>
  );
}

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const profile = useProfile(params.id);
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!profile) {
    return (
      <PageContainer>
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="font-display text-xl text-ink">Membro non trovato</p>
          <Link
            href="/membri"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            ← Torna alla directory
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isAdmin = can(user?.role, "manageMembers");
  const isOwn = user?.id === profile.id;
  const canEdit = isAdmin || isOwn;

  return (
    <PageContainer>
      <Link
        href="/membri"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Directory
      </Link>

      {editing ? (
        <EditForm
          key={profile.id}
          profile={profile}
          isAdmin={isAdmin}
          onClose={() => setEditing(false)}
        />
      ) : (
        <div className="mt-5">
          {/* Header */}
          <div className="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
            <Avatar profile={profile} size={104} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl text-ink">{profile.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TierBadge tier={profile.tier} />
              </div>
              {profile.company && (
                <p className="mt-3 text-sm text-ink-muted">{profile.company}</p>
              )}
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Modifica
              </Button>
            )}
          </div>

          {profile.bio && (
            <p className="mt-6 max-w-prose text-[0.95rem] leading-relaxed text-ink-muted">
              {profile.bio}
            </p>
          )}

          {/* Info grid */}
          <div className="mt-6 grid gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:grid-cols-2">
            <InfoRow icon={Briefcase} label="Settore" value={profile.sector} />
            <InfoRow icon={MapPin} label="Città" value={profile.city} />
            {profile.company && (
              <InfoRow icon={Building2} label="Azienda" value={profile.company} />
            )}
            <InfoRow
              icon={CalendarDays}
              label="Iscritto dal"
              value={formatDate(profile.joinedAt)}
            />
            <InfoRow
              icon={Mail}
              label="Email"
              value={profile.email}
              href={`mailto:${profile.email}`}
            />
            {profile.phone && (
              <InfoRow
                icon={Phone}
                label="Telefono"
                value={profile.phone}
                href={`tel:${profile.phone}`}
              />
            )}
            {profile.linkedin && (
              <InfoRow
                icon={LinkedinIcon}
                label="LinkedIn"
                value="Profilo LinkedIn"
                href={profile.linkedin}
                external
              />
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function EditForm({
  profile,
  isAdmin,
  onClose,
}: {
  profile: Profile;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: profile.name,
    company: profile.company ?? "",
    sector: profile.sector,
    city: profile.city,
    phone: profile.phone ?? "",
    linkedin: profile.linkedin ?? "",
    bio: profile.bio ?? "",
    tier: profile.tier,
    status: profile.status,
  });
  const [avatar, setAvatar] = useState<string | null>(profile.avatarUrl);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setAvatar(await resizeToDataUrl(file));
    } finally {
      setBusy(false);
    }
  }

  function save() {
    repo.updateProfile(profile.id, {
      name: form.name.trim() || profile.name,
      company: form.company.trim() || undefined,
      sector: form.sector.trim(),
      city: form.city.trim(),
      phone: form.phone.trim() || undefined,
      linkedin: form.linkedin.trim() || undefined,
      bio: form.bio.trim() || undefined,
      avatarUrl: avatar,
      ...(isAdmin
        ? { tier: form.tier as Tier, status: form.status as MemberStatus }
        : {}),
    });
    onClose();
  }

  return (
    <div className="mt-5 rounded-[var(--radius-xl)] border border-border bg-surface p-6 sm:p-8">
      <h2 className="font-display text-xl text-ink">Modifica profilo</h2>

      {/* Avatar */}
      <div className="mt-5 flex items-center gap-4">
        <Avatar profile={{ ...profile, avatarUrl: avatar }} size={72} />
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
              onClick={() => setAvatar(null)}
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <Trash2 size={15} /> Rimuovi
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="f-name">
          <Input
            id="f-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Azienda" htmlFor="f-company">
          <Input
            id="f-company"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </Field>
        <Field label="Settore" htmlFor="f-sector">
          <Input
            id="f-sector"
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
          />
        </Field>
        <Field label="Città" htmlFor="f-city">
          <Input
            id="f-city"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field label="Telefono" htmlFor="f-phone">
          <Input
            id="f-phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="LinkedIn" htmlFor="f-linkedin">
          <Input
            id="f-linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/…"
            value={form.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
          />
        </Field>
        {isAdmin && (
          <>
            <Field label="Etichetta" htmlFor="f-tier">
              <Select
                id="f-tier"
                value={form.tier}
                onChange={(e) => set("tier", e.target.value as Tier)}
              >
                <option value="founder">Founder</option>
                <option value="ambassador">Ambassador</option>
                <option value="member">Member</option>
              </Select>
            </Field>
            <Field label="Stato" htmlFor="f-status">
              <Select
                id="f-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as MemberStatus)}
              >
                <option value="active">Attivo</option>
                <option value="suspended">Sospeso</option>
                <option value="expired">Scaduto</option>
                <option value="pending">In attesa</option>
              </Select>
            </Field>
          </>
        )}
      </div>

      <div className="mt-4">
        <Field label="Bio" htmlFor="f-bio">
          <Textarea
            id="f-bio"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Una breve presentazione…"
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Annulla
        </Button>
        <Button onClick={save} disabled={busy}>
          Salva modifiche
        </Button>
      </div>
    </div>
  );
}
