"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, UserPlus, X } from "lucide-react";
import { useProfiles } from "@/lib/data/hooks";
import { demoRepo } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import type { MemberStatus, Role } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

export default function AdminPage() {
  const { user } = useAuth();
  const profiles = useProfiles();
  const mayManage = can(user?.role, "manageMembers");
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () => [...profiles].sort((a, b) => a.name.localeCompare(b.name, "it")),
    [profiles],
  );

  const counts = useMemo(
    () => ({
      total: profiles.length,
      active: profiles.filter((p) => p.status === "active").length,
      pending: profiles.filter((p) => p.status === "pending").length,
    }),
    [profiles],
  );

  if (!can(user?.role, "viewAdmin")) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-10 text-center">
          <ShieldAlert size={28} className="mx-auto text-accent" />
          <p className="mt-4 font-display text-xl text-ink">Accesso riservato</p>
          <p className="mt-2 text-sm text-ink-muted">
            Questa sezione è disponibile solo per Admin e Staff.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm text-accent hover:underline"
          >
            ← Torna alla Home
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer wide>
      <SectionTitle
        title="Pannello Admin"
        subtitle={
          mayManage
            ? "Gestisci i membri del network, lo stato e gli inviti."
            : "Consultazione dei membri del network (sola lettura)."
        }
      >
        {mayManage && !open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <UserPlus size={16} /> Invita membro
          </Button>
        )}
      </SectionTitle>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Membri totali", value: counts.total },
          { label: "Attivi", value: counts.active },
          { label: "In attesa", value: counts.pending },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-colors duration-200 hover:border-border-strong"
          >
            <div className="font-display text-2xl tabular-nums text-ink">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-ink-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {mayManage && open && <InviteForm onClose={() => setOpen(false)} />}

      {/* Members table */}
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3 font-semibold">Membro</th>
              <th className="px-4 py-3 font-semibold">Ruolo</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">
                Settore
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Iscritto
              </th>
              <th className="px-4 py-3 font-semibold">Stato</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-surface-2"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/membri/${m.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar profile={m} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">
                        {m.name}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {m.email}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {mayManage ? (
                    <Select
                      value={m.role}
                      onChange={(e) =>
                        demoRepo.setRole(m.id, e.target.value as Role)
                      }
                      aria-label={`Ruolo di ${m.name}`}
                      className="h-9 w-[120px] text-sm"
                    >
                      <option value="member">Membro</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </Select>
                  ) : (
                    <RoleBadge role={m.role} />
                  )}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                  {m.sector}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">
                  {formatDate(m.joinedAt)}
                </td>
                <td className="px-4 py-3">
                  {mayManage ? (
                    <Select
                      value={m.status}
                      onChange={(e) =>
                        demoRepo.setStatus(m.id, e.target.value as MemberStatus)
                      }
                      aria-label={`Stato di ${m.name}`}
                      className="h-9 w-[130px] text-sm"
                    >
                      <option value="active">Attivo</option>
                      <option value="suspended">Sospeso</option>
                      <option value="expired">Scaduto</option>
                      <option value="pending">In attesa</option>
                    </Select>
                  ) : (
                    <StatusBadge status={m.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "member" as Role,
    sector: "",
    city: "",
  });
  const [done, setDone] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    const created = demoRepo.inviteMember({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      sector: form.sector.trim() || "—",
      city: form.city.trim() || "—",
    });
    setDone(created.name);
    setForm({ name: "", email: "", role: "member", sector: "", city: "" });
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5 motion-safe:animate-fade-rise"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Invita un nuovo membro</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="rounded-[var(--radius)] p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      {done && (
        <p className="mb-4 rounded-[var(--radius)] border border-[var(--color-active)]/40 bg-[var(--color-active-soft)] px-3 py-2 text-sm text-[var(--color-active)]">
          Invito creato per <strong>{done}</strong> — il membro è in attesa di
          attivazione.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome e cognome" htmlFor="i-name">
          <Input
            id="i-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Es. Giulia Rossi"
            required
          />
        </Field>
        <Field label="Email" htmlFor="i-email">
          <Input
            id="i-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="nome@azienda.it"
            required
          />
        </Field>
        <Field label="Ruolo" htmlFor="i-role">
          <Select
            id="i-role"
            value={form.role}
            onChange={(e) => set("role", e.target.value as Role)}
          >
            <option value="member">Membro</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <Field label="Settore" htmlFor="i-sector">
          <Input
            id="i-sector"
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
            placeholder="Es. Tecnologia"
          />
        </Field>
        <Field label="Città" htmlFor="i-city">
          <Input
            id="i-city"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Es. Milano"
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Chiudi
        </Button>
        <Button type="submit" disabled={!form.name.trim() || !form.email.trim()}>
          <UserPlus size={16} /> Crea invito
        </Button>
      </div>
    </form>
  );
}
