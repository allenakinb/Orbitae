"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProfiles } from "@/lib/data/hooks";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { MemberRow } from "@/components/content/MemberCard";
import { Input } from "@/components/ui/Field";

export default function MembriPage() {
  const profiles = useProfiles();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      // I profili in attesa non fanno ancora parte del network.
      .filter((p) => p.status !== "pending")
      .filter((p) =>
        q
          ? [p.name, p.sector, p.city, p.company ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name, "it"));
  }, [profiles, query]);

  return (
    <PageContainer wide>
      <SectionTitle
        title="Membri"
        subtitle="La directory completa del network, in ordine alfabetico."
      />

      <div className="relative mt-6">
        <Search
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <Input
          type="search"
          placeholder="Cerca un membro…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          aria-label="Cerca un membro"
        />
      </div>

      <p className="mt-5 text-sm text-ink-muted">
        {results.length}{" "}
        {results.length === 1 ? "membro trovato" : "membri trovati"}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="font-display text-lg text-ink">Nessun risultato</p>
          <p className="mt-1 text-sm text-ink-muted">
            Prova a modificare la ricerca.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border border-y border-border">
          {results.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
