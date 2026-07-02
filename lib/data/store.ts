"use client";

import type {
  AnnouncementInput,
  InviteInput,
  Repo,
  ResourceInput,
} from "./adapter";
import {
  DEMO_PASSWORD,
  seedAnnouncements,
  seedEvents,
  seedProfiles,
  seedResources,
} from "./seed";
import type {
  Announcement,
  ClubEvent,
  MemberStatus,
  Profile,
  Resource,
  Role,
} from "./types";

// ===================================================================
// Demo backend — reactive in-memory store persisted to localStorage.
// Implements Repo. Components subscribe via useSyncExternalStore
// (see ./hooks.ts) so any mutation re-renders the relevant views.
// ===================================================================

// v2: reseeded with the real Orbitae contact list.
const STORAGE_KEY = "orbitae:db:v2";

interface DB {
  profiles: Profile[];
  announcements: Announcement[];
  resources: Resource[];
  events: ClubEvent[];
}

function freshDB(): DB {
  return {
    profiles: structuredClone(seedProfiles),
    announcements: structuredClone(seedAnnouncements),
    resources: structuredClone(seedResources),
    events: structuredClone(seedEvents),
  };
}

let db: DB = freshDB();
let hydrated = false;
const listeners = new Set<() => void>();

// Hydration is deliberately NOT run during render: the server and the
// first client render both see the seed DB (matching markup), then
// subscribe() pulls persisted data on mount and notifies subscribers.
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) db = JSON.parse(raw) as DB;
  } catch {
    /* corrupt storage — fall back to seed */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* quota / private mode — keep working in memory */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- subscription surface (used by hooks) -------------------------

export function subscribe(listener: () => void) {
  listeners.add(listener);
  // First subscriber on the client pulls persisted state, then refreshes.
  if (!hydrated) {
    const before = db;
    hydrate();
    if (db !== before) listener();
  }
  return () => listeners.delete(listener);
}

export function snapshot(): DB {
  return db;
}

export function resetDemoData() {
  db = freshDB();
  emit();
}

// --- Repo implementation ------------------------------------------

export const demoRepo: Repo = {
  authenticate(email, password) {
    hydrate();
    const profile = db.profiles.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!profile) return null;
    if (password !== DEMO_PASSWORD) return null;
    if (profile.status === "suspended" || profile.status === "expired")
      return null;
    return profile;
  },

  listProfiles() {
    return snapshot().profiles;
  },

  getProfile(pid) {
    return snapshot().profiles.find((p) => p.id === pid);
  },

  updateProfile(pid, patch) {
    const p = db.profiles.find((x) => x.id === pid);
    if (!p) return undefined;
    Object.assign(p, patch);
    emit();
    return p;
  },

  inviteMember(input: InviteInput) {
    const member: Profile = {
      id: id("u"),
      name: input.name,
      email: input.email,
      role: input.role,
      sector: input.sector,
      city: input.city,
      avatarUrl: null,
      status: "pending",
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    db.profiles.push(member);
    emit();
    return member;
  },

  setStatus(pid, status: MemberStatus) {
    return this.updateProfile(pid, { status });
  },

  setRole(pid, role: Role) {
    return this.updateProfile(pid, { role });
  },

  listAnnouncements() {
    return [...snapshot().announcements].sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  },

  createAnnouncement(input: AnnouncementInput) {
    const item: Announcement = {
      id: id("a"),
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
    };
    db.announcements.push(item);
    emit();
    return item;
  },

  listResources() {
    return [...snapshot().resources].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  createResource(input: ResourceInput) {
    const item: Resource = {
      id: id("r"),
      name: input.name,
      category: input.category,
      fileKind: input.fileKind,
      fileUrl: input.fileUrl,
      sizeLabel: input.sizeLabel,
      uploadedBy: input.uploadedBy,
      createdAt: new Date().toISOString(),
    };
    db.resources.push(item);
    emit();
    return item;
  },

  listEvents() {
    const today = new Date().toISOString().slice(0, 10);
    return [...snapshot().events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};
