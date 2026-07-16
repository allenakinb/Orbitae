import type { Role, Tier } from "@/lib/data/types";

// Single source of truth for what each role may do. Mirrors the matrix
// in the plan and is enforced both in the UI and in repo-calling actions.
export type Permission =
  | "viewAdmin" // open the admin panel
  | "viewMembers" // browse the member directory
  | "manageMembers" // edit member data, change status/tier
  | "postAnnouncement" // create/edit Bacheca posts
  | "uploadResource" // upload documents
  | "manageEvents"; // create/edit/delete events

const MATRIX: Record<Permission, Role[]> = {
  // Tutti vedono tutto: la directory è aperta a chiunque abbia un accesso.
  // Mettere mano ai contenuti resta appannaggio dei tre admin.
  viewAdmin: ["admin"],
  viewMembers: ["admin", "member"],
  manageMembers: ["admin"],
  postAnnouncement: ["admin"],
  uploadResource: ["admin"],
  manageEvents: ["admin"],
};

export function can(role: Role | undefined, perm: Permission): boolean {
  if (!role) return false;
  return MATRIX[perm].includes(role);
}

// L'etichetta accanto al nome dice il tier, mai il ruolo d'accesso.
export const TIER_LABEL: Record<Tier, string> = {
  founder: "Founder",
  ambassador: "Ambassador",
  member: "Member",
};
