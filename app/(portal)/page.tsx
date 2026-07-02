"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Megaphone, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  useAnnouncements,
  useProfiles,
  useResources,
  useUpcomingEvents,
} from "@/lib/data/hooks";
import { PageContainer } from "@/components/shell/PageContainer";
import { OrbitSystem } from "@/components/orbit/OrbitSystem";
import { Stat } from "@/components/ui/Stat";
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

  const inOrbit = profiles.filter((p) => p.status !== "pending");
  const activeCount = profiles.filter((p) => p.status === "active").length;
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <PageContainer wide>
      {/* Welcome */}
      <header className="text-center motion-safe:animate-fade-rise">
        <p className="text-sm text-ink-muted">{greeting()},</p>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          {firstName}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          Ecco la tua orbita. {inOrbit.length} membri compongono il network
          Orbitae — passa sopra un avatar per scoprirli.
        </p>
      </header>

      {/* Orbit hero */}
      <section className="my-6 sm:my-8" aria-label="I membri del network in orbita">
        <OrbitSystem members={inOrbit} />
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Users} value={activeCount} label="Membri attivi" />
        <Stat icon={CalendarDays} value={events.length} label="Prossimi eventi" />
        <Stat icon={Megaphone} value={announcements.length} label="Annunci" />
        <Stat icon={FileText} value={resources.length} label="Documenti" />
      </section>

      {/* Feed + events */}
      <section className="mt-7 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
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
            {announcements.slice(0, 3).map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                author={byId.get(a.authorId)}
                compact
              />
            ))}
          </div>
        </div>

        <div>
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
                    className={
                      i > 0 ? "border-t border-border" : undefined
                    }
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
        </div>
      </section>
    </PageContainer>
  );
}
