import type {
  Announcement,
  ClubEvent,
  MemberStatus,
  Profile,
  Resource,
  ResourceCategory,
  Role,
} from "./types";

// ===================================================================
// Repo — the single seam between the UI and the data backend.
//
// Implemented by the Supabase-backed store (./store.ts): synchronous
// reads against a reactive cache, write-through mutations. Auth lives
// in /lib/auth/AuthProvider (Supabase Auth); creating new members
// requires the admin API — see /scripts/create-users.mjs.
// ===================================================================

export interface AnnouncementInput {
  title: string;
  body: string;
  authorId: string;
}

export interface ResourceInput {
  name: string;
  category: ResourceCategory;
  fileKind: Resource["fileKind"];
  fileUrl: string;
  sizeLabel?: string;
  uploadedBy: string;
}

export interface Repo {
  listProfiles(): Profile[];
  getProfile(id: string): Profile | undefined;
  updateProfile(id: string, patch: Partial<Profile>): Profile | undefined;
  setStatus(id: string, status: MemberStatus): Profile | undefined;
  setRole(id: string, role: Role): Profile | undefined;

  listAnnouncements(): Announcement[];
  createAnnouncement(input: AnnouncementInput): Announcement;

  listResources(): Resource[];
  createResource(input: ResourceInput): Resource;

  listEvents(): ClubEvent[];
}
