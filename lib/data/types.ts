// ===================================================================
// ORBITAE — domain types
// These mirror the Supabase tables (see /supabase/schema.sql) so the
// demo repository can be swapped for a Supabase implementation with no
// changes to the UI layer.
// ===================================================================

export type Role = "admin" | "staff" | "member";

export type MemberStatus = "active" | "suspended" | "expired" | "pending";

export type ResourceCategory = "Verbali" | "Regolamenti" | "Materiali";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  sector: string;
  city: string;
  avatarUrl: string | null; // data-URL (demo) or storage URL (wired)
  status: MemberStatus;
  joinedAt: string; // ISO date
  bio?: string;
  phone?: string;
  company?: string;
  linkedin?: string; // full LinkedIn profile URL
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  createdAt: string; // ISO datetime
  pinned?: boolean;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  fileUrl: string;
  fileKind: "pdf" | "image" | "link" | "doc";
  sizeLabel?: string;
  uploadedBy: string;
  createdAt: string;
}

// Relatore o moderatore di un evento.
export interface EventPerson {
  name: string;
  role?: string; // ruolo / azienda
}

export interface ClubEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // ISO date
  location: string;
  time?: string; // e.g. "20:00"
  description?: string; // blurb breve (card Home)
  summary?: string; // sintesi estesa (Bacheca)
  speakers: EventPerson[]; // relatori
  moderators: EventPerson[]; // moderatori
  mapUrl?: string; // link Google Maps
}

// Shape returned to the UI for the authenticated session.
export interface Session {
  userId: string;
}
