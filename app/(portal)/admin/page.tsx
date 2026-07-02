"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { ShieldAlert, UserPlus } from "lucide-react";
import { useProfiles } from "@/lib/data/hooks";
import { repo } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import type { MemberStatus, Role } from "@/lib/data/types";
import { formatDate } from "@/lib/format";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";

export default function AdminPage() {
  const { user } = useAuth();
  const profiles = useProfiles();
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

  if (!can(user?.role, "viewAdmin")) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-10 text-center">
          <ShieldAlert size={28} className="mx-auto text-accent" />
          <p className="mt-4 font-display text-xl text-ink">Accesso riservato</p>
          <p className="mt-2 text-sm text-ink-muted">
            Questa sezione è riservata agli Admin del club.
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
            ? "Gestisci i membri del network: ruolo e stato di ognuno."
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

      {mayManage && (
        <p className="mt-4 flex items-start gap-2.5 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
          <UserPlus size={16} className="mt-0.5 shrink-0 text-ink-faint" />
          <span>
            I nuovi accessi (email + password) si creano con lo script{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
              scripts/create-users.mjs
            </code>{" "}
            o dalla dashboard Supabase. Da qui gestisci ruolo e stato dei
            membri esistenti.
          </span>
        </p>
      )}

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
                        repo.setRole(m.id, e.target.value as Role)
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
