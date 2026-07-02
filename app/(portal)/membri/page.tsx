"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProfiles } from "@/lib/data/hooks";
import type { MemberStatus } from "@/lib/data/types";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionTitle } from "@/components/ui/Card";
import { MemberCard } from "@/components/content/MemberCard";
import { Input, Select } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const STATUS_FILTERS: { value: MemberStatus | "all"; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "active", label: "Attivi" },
  { value: "suspended", label: "Sospesi" },
  { value: "expired", label: "Scaduti" },
  { value: "pending", label: "In attesa" },
];

export default function MembriPage() {
  const profiles = useProfiles();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [sector, setSector] = useState("all");

  const sectors = useMemo(
    () => Array.from(new Set(profiles.map((p) => p.sector))).sort(),
    [profiles],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => (sector === "all" ? true : p.sector === sector))
      .filter((p) =>
        q
          ? [p.name, p.sector, p.city, p.company ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name, "it"));
  }, [profiles, query, status, sector]);

  return (
    <PageContainer wide>
      <SectionTitle
        title="Membri"
        subtitle="La directory completa del network. Cerca per nome, settore o città."
      />

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
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
        <Select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          aria-label="Filtra per settore"
          className="lg:w-56"
        >
          <option value="all">Tutti i settori</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {/* Status segmented filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === f.value
                ? "border-transparent bg-accent text-accent-ink"
                : "border-border text-ink-muted hover:border-border-strong hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-ink-muted">
        {results.length}{" "}
        {results.length === 1 ? "membro trovato" : "membri trovati"}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="font-display text-lg text-ink">Nessun risultato</p>
          <p className="mt-1 text-sm text-ink-muted">
            Prova a modificare la ricerca o i filtri.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
