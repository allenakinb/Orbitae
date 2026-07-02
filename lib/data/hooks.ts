"use client";

import { useMemo, useSyncExternalStore } from "react";
import { snapshot, subscribe } from "./store";

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

export function useUpcomingEvents() {
  const { events } = useDB();
  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);
}
