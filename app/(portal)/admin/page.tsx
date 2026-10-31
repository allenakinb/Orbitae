"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useProfiles } from "@/lib/data/hooks";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { repo, loadAll } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import type { MemberStatus, Tier, Profile } from "@/lib/data/types";
import { PageContainer } from "@/components/shell/PageContainer";
import { Restricted } from "@/components/content/Restricted";
import { SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, TierBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";

export default function AdminPage() {
  const { user } = useAuth();
  const profiles = useProfiles();
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { if (deleting) document.getElementById("delete-member-name")?.focus(); }, [deleting]);
  async function deleteMember(e: React.FormEvent) {
    e.preventDefault(); if (!deleting || pending || confirmName !== deleting.name) return;
    setPending(true); setMessage("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw Error("Sessione scaduta. Accedi nuovamente.");
      const res = await fetch(`/api/members/${deleting.id}`, { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ confirmName }) });
      const result = await res.json();
      if (!res.ok) throw Error(result.error);
      setDeleting(null); setConfirmName("");
      setMessage(await loadAll() ? "Membro eliminato dal portale, dagli incontri e dagli accessi." : "Membro eliminato. Ricarica la pagina per aggiornare l’elenco.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Eliminazione non riuscita."); }
    finally { setPending(false); }
  }
  const mayManage = can(user?.role, "manageMembers");

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

  if (!can(user?.role, "viewAdmin")) return <Restricted />;

  return (
    <PageContainer wide>
      <SectionTitle
        title="Pannello Admin"
        subtitle={
          mayManage
            ? "Gestisci i membri del network: etichetta e stato di ognuno."
            : "Consultazione dei membri del network (sola lettura)."
        }
      />

      {/* Summary — quiet inline numbers, not a card row */}
      <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-y border-border py-3.5 text-sm text-ink-muted">
        {[
          { label: "membri totali", value: counts.total },
          { label: "attivi", value: counts.active },
          { label: "in attesa", value: counts.pending },
        ].map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <span aria-hidden className="text-ink-faint">
                ·
              </span>
            )}
            <span className="inline-flex items-baseline gap-1.5">
              <span className="font-display text-lg tabular-nums text-ink">
                {s.value}
              </span>
              {s.label}
            </span>
          </Fragment>
        ))}
      </div>

      {message && <p role="status" className="mt-4 text-sm text-ink-muted">{message}</p>}
      {deleting && <form onSubmit={deleteMember} aria-label="Conferma eliminazione membro" className="mt-6 space-y-4 rounded-[var(--radius-lg)] border border-accent bg-surface p-5">
        <h2 className="font-display text-lg">Eliminare {deleting.name}?</h2>
        <p className="text-sm text-ink-muted">L’eliminazione è definitiva: verranno rimossi il profilo, l’accesso, le presenze negli incontri e gli inviti collegati. Gli incontri e gli altri membri restano invariati.</p>
        <Field label={`Scrivi ${deleting.name} per confermare`} htmlFor="delete-member-name"><Input id="delete-member-name" value={confirmName} onChange={e => setConfirmName(e.target.value)} disabled={pending} autoComplete="off" required /></Field>
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="ghost" disabled={pending} onClick={() => { setDeleting(null); setConfirmName(""); }}>Annulla</Button><Button type="submit" disabled={pending || confirmName !== deleting.name}>{pending ? "Eliminazione…" : "Elimina definitivamente"}</Button></div>
      </form>}
      {/* Members table */}
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3 font-semibold">Membro</th>
              <th className="px-4 py-3 font-semibold">Etichetta</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">
                Settore
              </th>
              <th className="px-4 py-3 font-semibold">Stato</th>
              {mayManage && <th className="px-4 py-3 font-semibold">Azioni</th>}
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
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-ink">
                          {m.name}
                        </span>
                        {/* Chi può mettere mano al sito non porta etichette
                            pubbliche: il segno resta qui. */}
                        {m.role === "admin" && (
                          <ShieldCheck
                            size={14}
                            className="shrink-0 text-accent"
                            aria-label="Accesso admin"
                          />
                        )}
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
                      value={m.tier}
                      onChange={(e) =>
                        repo.setTier(m.id, e.target.value as Tier)
                      }
                      aria-label={`Etichetta di ${m.name}`}
                      className="h-9 w-[140px] text-sm"
                    >
                      <option value="founder">Founder</option>
                      <option value="ambassador">Ambassador</option>
                      <option value="member">Member</option>
                    </Select>
                  ) : (
                    <TierBadge tier={m.tier} />
                  )}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                  {m.sector}
                </td>
                <td className="px-4 py-3">
                  {mayManage ? (
                    <Select
                      value={m.status}
                      onChange={(e) =>
                        repo.setStatus(m.id, e.target.value as MemberStatus)
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
                {mayManage && <td className="px-4 py-3">{m.role !== "admin" && <Button size="sm" variant="ghost" disabled={pending} aria-label={`Elimina ${m.name}`} onClick={() => { setDeleting(m); setConfirmName(""); setMessage(""); }}><Trash2 size={15} /> Elimina</Button>}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
