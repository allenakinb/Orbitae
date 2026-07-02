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
// The demo implementation (./store.ts) keeps everything in memory +
// localStorage. To go live, implement this same interface against
// Supabase (see /supabase/schema.sql) and swap the export in ./index.ts.
// No UI code references the backend directly.
// ===================================================================

export interface InviteInput {
  name: string;
  email: string;
  role: Role;
  sector: string;
  city: string;
}

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
  authenticate(email: string, password: string): Profile | null;

  listProfiles(): Profile[];
  getProfile(id: string): Profile | undefined;
  updateProfile(id: string, patch: Partial<Profile>): Profile | undefined;
  inviteMember(input: InviteInput): Profile;
  setStatus(id: string, status: MemberStatus): Profile | undefined;
  setRole(id: string, role: Role): Profile | undefined;

  listAnnouncements(): Announcement[];
  createAnnouncement(input: AnnouncementInput): Announcement;

  listResources(): Resource[];
  createResource(input: ResourceInput): Resource;

  listEvents(): ClubEvent[];
}
