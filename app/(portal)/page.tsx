"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { can } from "@/lib/auth/permissions";
import {
  useAnnouncements,
  useProfiles,
  useResources,
  useUpcomingEvents,
} from "@/lib/data/hooks";
import { PageContainer } from "@/components/shell/PageContainer";
import { OrbitSystem } from "@/components/orbit/OrbitSystem";
import { AnnouncementCard } from "@/components/content/AnnouncementCard";
import { formatDayMonth } from "@/lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 13) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default function HomePage() {
  const { user } = useAuth();
  const profiles = useProfiles();
  const announcements = useAnnouncements();
  const resources = useResources();
  const events = useUpcomingEvents();

  // Compute the time-based greeting after mount to avoid an SSR/client
  // hydration mismatch; "Bentornato" is a stable, time-neutral default.
  const [greet, setGreet] = useState("Bentornato");
  useEffect(() => setGreet(greeting()), []);

  const inOrbit = profiles.filter((p) => p.status !== "pending");
  const activeCount = profiles.filter((p) => p.status === "active").length;
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <PageContainer wide>
      {/* Keyboard/AT: skip the orbit straight to the live feed */}
      <a
        href="#novita"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-sticky)] focus:rounded-[var(--radius)] focus:border focus:border-border-strong focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        Salta al contenuto
      </a>

      {/* First screen — orbit and the live feed share the fold */}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_minmax(320px,380px)]">
        <section
          aria-label="I membri del network in orbita"
          className="min-w-0 motion-safe:animate-fade-rise"
        >
          <header className="text-center">
            <p className="text-sm text-ink-muted" suppressHydrationWarning>
              {greet},
            </p>
            <h1 className="font-display text-3xl text-ink sm:text-4xl">
              {firstName}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              La tua orbita — {inOrbit.length} membri nel network. Passa sopra
              un avatar per scoprirli.
            </p>
          </header>
          <div className="mx-auto mt-4 w-full max-w-[520px]">
            <OrbitSystem members={inOrbit} />
          </div>
        </section>

        {/* Live feed */}
        <section
          id="novita"
          aria-label="Novità dalla bacheca"
          className="min-w-0 scroll-mt-20 motion-safe:animate-fade-rise"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Dalla bacheca</h2>
            <Link
              href="/bacheca"
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-accent"
            >
              Vedi tutti <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {announcements.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/50 p-6 text-center">
                <p className="text-sm text-ink-muted">Ancora nessun annuncio.</p>
                <p className="mt-1 text-xs text-ink-faint">
                  Le comunicazioni del club appariranno qui.
                </p>
              </div>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <AnnouncementCard
                  key={a.id}
                  announcement={a}
                  author={byId.get(a.authorId)}
                  compact
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Quick numbers — a quiet editorial strip, not a card row */}
      <section
        aria-label="I numeri del club"
        className="mt-10 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 border-y border-border py-4"
      >
        {[
          {
            value: activeCount,
            label: "membri attivi",
            // La directory è riservata ad Admin/Staff: per i membri il
            // numero resta, il link punta all'orbita stessa.
            href: can(user?.role, "viewMembers") ? "/membri" : "#novita",
          },
          { value: events.length, label: "prossimi eventi", href: "#eventi" },
          { value: announcements.length, label: "annunci", href: "/bacheca" },
          { value: resources.length, label: "documenti", href: "/documenti" },
        ].map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <span aria-hidden className="text-ink-faint">
                ·
              </span>
            )}
            <Link
              href={s.href}
              className="group inline-flex items-baseline gap-1.5 px-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <span className="font-display text-lg tabular-nums text-ink transition-colors group-hover:text-accent">
                {s.value}
              </span>
              {s.label}
            </Link>
          </Fragment>
        ))}
      </section>

      {/* Upcoming events */}
      <section id="eventi" className="mt-8 scroll-mt-6">
        <h2 className="mb-3 font-display text-lg text-ink">Prossimi eventi</h2>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface">
          {events.length === 0 ? (
            <p className="p-5 text-sm text-ink-muted">
              Nessun evento in programma.
            </p>
          ) : (
            <ul>
              {events.map((e, i) => (
                <li
                  key={e.id}
                  className={i > 0 ? "border-t border-border" : undefined}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent">
                      <span className="text-sm font-bold leading-none">
                        {formatDayMonth(e.date).split(" ")[0]}
                      </span>
                      <span className="text-[0.62rem] uppercase leading-none mt-0.5">
                        {formatDayMonth(e.date).split(" ")[1]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {e.title}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {e.location}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
