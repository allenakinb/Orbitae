"use client";

import { supabase } from "@/lib/supabase/client";
import type { AnnouncementInput, Repo, ResourceInput } from "./adapter";
import type {
  Announcement,
  ClubEvent,
  EventPerson,
  MemberStatus,
  Profile,
  Resource,
  Role,
} from "./types";

// ===================================================================
// Supabase-backed store — reactive in-memory cache of the database.
// Implements Repo. Components subscribe via useSyncExternalStore
// (see ./hooks.ts): reads are synchronous against the cache, writes
// update the cache immediately and persist to Supabase in background
// (RLS in /supabase/setup.sql is the real gatekeeper).
// ===================================================================

interface DB {
  profiles: Profile[];
  announcements: Announcement[];
  resources: Resource[];
  events: ClubEvent[];
}

const EMPTY: DB = { profiles: [], announcements: [], resources: [], events: [] };

let db: DB = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

// --- row mapping (snake_case ⇄ camelCase) --------------------------

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  sector: string;
  city: string;
  company: string | null;
  phone: string | null;
  bio: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  joined_at: string;
}

function toProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    status: r.status,
    sector: r.sector,
    city: r.city,
    company: r.company ?? undefined,
    phone: r.phone ?? undefined,
    bio: r.bio ?? undefined,
    linkedin: r.linkedin ?? undefined,
    avatarUrl: r.avatar_url,
    joinedAt: r.joined_at,
  };
}

// Only the keys present in the patch are sent; `undefined` becomes
// SQL null (supabase-js drops undefined values, which would make
// "clear this field" a silent no-op).
function toProfileRow(patch: Partial<Profile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ("name" in patch) row.name = patch.name;
  if ("role" in patch) row.role = patch.role;
  if ("status" in patch) row.status = patch.status;
  if ("sector" in patch) row.sector = patch.sector;
  if ("city" in patch) row.city = patch.city;
  if ("company" in patch) row.company = patch.company ?? null;
  if ("phone" in patch) row.phone = patch.phone ?? null;
  if ("bio" in patch) row.bio = patch.bio ?? null;
  if ("linkedin" in patch) row.linkedin = patch.linkedin ?? null;
  if ("avatarUrl" in patch) row.avatar_url = patch.avatarUrl;
  return row;
}

interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  author_id: string;
  pinned: boolean;
  created_at: string;
}

function toAnnouncement(r: AnnouncementRow): Announcement {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    authorId: r.author_id,
    createdAt: r.created_at,
    pinned: r.pinned || undefined,
  };
}

interface ResourceRow {
  id: string;
  name: string;
  category: Resource["category"];
  file_kind: Resource["fileKind"];
  file_url: string;
  size_label: string | null;
  uploaded_by: string;
  created_at: string;
}

function toResource(r: ResourceRow): Resource {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    fileKind: r.file_kind,
    fileUrl: r.file_url,
    sizeLabel: r.size_label ?? undefined,
    uploadedBy: r.uploaded_by,
    createdAt: r.created_at,
  };
}

interface EventRow {
  id: string;
  title: string;
  subtitle: string | null;
  date: string;
  location: string;
  time: string | null;
  description: string | null;
  summary: string | null;
  speakers: EventPerson[] | null;
  moderators: EventPerson[] | null;
  map_url: string | null;
}

function toClubEvent(r: EventRow): ClubEvent {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    date: r.date,
    location: r.location,
    time: r.time ?? undefined,
    description: r.description ?? undefined,
    summary: r.summary ?? undefined,
    speakers: r.speakers ?? [],
    moderators: r.moderators ?? [],
    mapUrl: r.map_url ?? undefined,
  };
}

// --- lifecycle ------------------------------------------------------

// Fetches everything the portal shows in one round. Called after
// sign-in (RLS only opens the tables to authenticated users).
export async function loadAll(): Promise<boolean> {
  const [p, a, r, e] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("announcements").select("*"),
    supabase.from("resources").select("*"),
    supabase.from("events").select("*"),
  ]);
  const error = p.error ?? a.error ?? r.error ?? e.error;
  if (error) {
    console.error("[orbitae] caricamento dati fallito:", error.message);
    return false;
  }
  db = {
    profiles: (p.data as ProfileRow[]).map(toProfile),
    announcements: (a.data as AnnouncementRow[]).map(toAnnouncement),
    resources: (r.data as ResourceRow[]).map(toResource),
    events: (e.data as EventRow[]).map(toClubEvent),
  };
  emit();
  return true;
}

export function clearStore() {
  db = EMPTY;
  emit();
}

// A failed background write means the cache lied — resync from server.
function persistOrResync(promise: PromiseLike<{ error: { message: string } | null }>) {
  void Promise.resolve(promise).then(({ error }) => {
    if (error) {
      console.error("[orbitae] salvataggio fallito:", error.message);
      void loadAll();
    }
  });
}

// --- subscription surface (used by hooks) -------------------------

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function snapshot(): DB {
  return db;
}

// --- Repo implementation ------------------------------------------

export const repo: Repo = {
  listProfiles() {
    return db.profiles;
  },

  getProfile(pid) {
    return db.profiles.find((p) => p.id === pid);
  },

  updateProfile(pid, patch) {
    const prev = db.profiles.find((x) => x.id === pid);
    if (!prev) return undefined;
    const next = { ...prev, ...patch };
    db = {
      ...db,
      profiles: db.profiles.map((p) => (p.id === pid ? next : p)),
    };
    emit();
    persistOrResync(
      supabase.from("profiles").update(toProfileRow(patch)).eq("id", pid),
    );
    return next;
  },

  setStatus(pid, status: MemberStatus) {
    return this.updateProfile(pid, { status });
  },

  setRole(pid, role: Role) {
    return this.updateProfile(pid, { role });
  },

  listAnnouncements() {
    return [...db.announcements].sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  },

  createAnnouncement(input: AnnouncementInput) {
    const item: Announcement = {
      id: crypto.randomUUID(),
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
    };
    db = { ...db, announcements: [...db.announcements, item] };
    emit();
    persistOrResync(
      supabase.from("announcements").insert({
        id: item.id,
        title: item.title,
        body: item.body,
        author_id: item.authorId,
        created_at: item.createdAt,
      }),
    );
    return item;
  },

  listResources() {
    return [...db.resources].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  createResource(input: ResourceInput) {
    const item: Resource = {
      id: crypto.randomUUID(),
      name: input.name,
      category: input.category,
      fileKind: input.fileKind,
      fileUrl: input.fileUrl,
      sizeLabel: input.sizeLabel,
      uploadedBy: input.uploadedBy,
      createdAt: new Date().toISOString(),
    };
    db = { ...db, resources: [...db.resources, item] };
    emit();
    persistOrResync(
      supabase.from("resources").insert({
        id: item.id,
        name: item.name,
        category: item.category,
        file_kind: item.fileKind,
        file_url: item.fileUrl,
        size_label: item.sizeLabel ?? null,
        uploaded_by: item.uploadedBy,
        created_at: item.createdAt,
      }),
    );
    return item;
  },

  listEvents() {
    const today = new Date().toISOString().slice(0, 10);
    return [...db.events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};
