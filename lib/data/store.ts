"use client";

import { supabase } from "@/lib/supabase/client";
import type {
  AnnouncementInput,
  EventInput,
  Repo,
  ResourceInput,
} from "./adapter";
import type {
  Announcement,
  ClubEvent,
  EventAttendance,
  EventPerson,
  MemberStatus,
  Profile,
  Resource,
  Tier,
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
  attendance: EventAttendance[];
}

const EMPTY: DB = {
  profiles: [],
  announcements: [],
  resources: [],
  events: [],
  attendance: [],
};

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
  role: string; // enum member_role: conserva il valore legacy 'staff'
  tier: Tier | null; // null nella finestra fra deploy e migrazione
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
    // Nessuna riga dovrebbe più valere 'staff', ma l'enum lo permette:
    // qualunque cosa non sia 'admin' entra nella UI come membro.
    role: r.role === "admin" ? "admin" : "member",
    tier: r.tier ?? "member",
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
  if ("tier" in patch) row.tier = patch.tier;
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

interface AttendanceRow {
  event_id: string;
  profile_id: string;
}

function toAttendance(r: AttendanceRow): EventAttendance {
  return { eventId: r.event_id, profileId: r.profile_id };
}

// Only the keys present in the patch are sent (see toProfileRow above);
// jsonb columns take arrays as-is, and `undefined` optional fields become
// SQL null so clearing a field actually persists.
function toEventRow(patch: Partial<ClubEvent>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ("title" in patch) row.title = patch.title;
  if ("subtitle" in patch) row.subtitle = patch.subtitle ?? null;
  if ("date" in patch) row.date = patch.date;
  if ("time" in patch) row.time = patch.time ?? null;
  if ("location" in patch) row.location = patch.location;
  if ("description" in patch) row.description = patch.description ?? null;
  if ("summary" in patch) row.summary = patch.summary ?? null;
  if ("speakers" in patch) row.speakers = patch.speakers ?? [];
  if ("moderators" in patch) row.moderators = patch.moderators ?? [];
  if ("mapUrl" in patch) row.map_url = patch.mapUrl ?? null;
  return row;
}

// --- lifecycle ------------------------------------------------------

// Fetches everything the portal shows in one round. Called after
// sign-in (RLS only opens the tables to authenticated users).
export async function loadAll(): Promise<boolean> {
  const [p, a, r, e, at] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("announcements").select("*"),
    supabase.from("resources").select("*"),
    supabase.from("events").select("*"),
    supabase.from("event_attendees").select("*"),
  ]);
  const error = p.error ?? a.error ?? r.error ?? e.error;
  if (error) {
    console.error("[orbitae] caricamento dati fallito:", error.message);
    return false;
  }
  // Le presenze non sono vitali: se la migration non è ancora passata il
  // portale resta in piedi con l'orbita vuota, invece di non aprirsi.
  if (at.error) {
    console.error("[orbitae] presenze non caricate:", at.error.message);
  }
  db = {
    profiles: (p.data as ProfileRow[]).map(toProfile),
    announcements: (a.data as AnnouncementRow[]).map(toAnnouncement),
    resources: (r.data as ResourceRow[]).map(toResource),
    events: (e.data as EventRow[]).map(toClubEvent),
    attendance: ((at.data as AttendanceRow[] | null) ?? []).map(toAttendance),
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

  setTier(pid, tier: Tier) {
    return this.updateProfile(pid, { tier });
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

  // Tutti gli eventi, dal più recente: il club racconta gli incontri
  // passati, non solo quelli in programma.
  listEvents() {
    return [...db.events].sort((a, b) => b.date.localeCompare(a.date));
  },

  listAttendeeIds(eventId) {
    return db.attendance
      .filter((a) => a.eventId === eventId)
      .map((a) => a.profileId);
  },

  createEvent(input: EventInput) {
    const item: ClubEvent = {
      id: crypto.randomUUID(),
      title: input.title,
      subtitle: input.subtitle,
      date: input.date,
      time: input.time,
      location: input.location,
      description: input.description,
      summary: input.summary,
      speakers: input.speakers ?? [],
      moderators: input.moderators ?? [],
      mapUrl: input.mapUrl,
    };
    db = { ...db, events: [...db.events, item] };
    emit();
    persistOrResync(
      supabase.from("events").insert({ id: item.id, ...toEventRow(item) }),
    );
    return item;
  },

  updateEvent(id, patch) {
    const prev = db.events.find((x) => x.id === id);
    if (!prev) return undefined;
    const next = { ...prev, ...patch };
    db = {
      ...db,
      events: db.events.map((e) => (e.id === id ? next : e)),
    };
    emit();
    persistOrResync(
      supabase.from("events").update(toEventRow(patch)).eq("id", id),
    );
    return next;
  },

  deleteEvent(id) {
    db = { ...db, events: db.events.filter((e) => e.id !== id) };
    emit();
    persistOrResync(supabase.from("events").delete().eq("id", id));
  },
};
