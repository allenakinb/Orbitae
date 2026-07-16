"use client";

import { useMemo, useSyncExternalStore } from "react";
import { snapshot, subscribe } from "./store";
import type { Profile } from "./types";

// Stable subscription to the whole DB. Derivations (sort/filter) happen
// in useMemo downstream so getSnapshot stays referentially stable.
function useDB() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function useProfiles() {
  return useDB().profiles;
}

export function useProfile(id: string | undefined) {
  const profiles = useProfiles();
  return useMemo(
    () => (id ? profiles.find((p) => p.id === id) : undefined),
    [profiles, id],
  );
}

export function useAnnouncements() {
  const { announcements } = useDB();
  return useMemo(
    () =>
      [...announcements].sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
        return b.createdAt.localeCompare(a.createdAt);
      }),
    [announcements],
  );
}

export function useResources() {
  const { resources } = useDB();
  return useMemo(
    () => [...resources].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [resources],
  );
}

// Tutti gli eventi, dal più recente: [0] è quello che la Home apre.
export function useEvents() {
  const { events } = useDB();
  return useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  );
}

// I presenti a un evento, in ordine alfabetico. I profili `pending` non
// fanno ancora parte del network e restano fuori dall'orbita.
export function useEventAttendees(eventId: string | undefined): Profile[] {
  const { attendance, profiles } = useDB();
  return useMemo(() => {
    if (!eventId) return [];
    const ids = new Set(
      attendance.filter((a) => a.eventId === eventId).map((a) => a.profileId),
    );
    return profiles
      .filter((p) => ids.has(p.id) && p.status !== "pending")
      .sort((a, b) => a.name.localeCompare(b.name, "it"));
  }, [attendance, profiles, eventId]);
}
