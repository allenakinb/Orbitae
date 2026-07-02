import type { Role } from "@/lib/data/types";

// Single source of truth for what each role may do. Mirrors the matrix
// in the plan and is enforced both in the UI and in repo-calling actions.
export type Permission =
  | "viewAdmin" // open the admin panel
  | "viewMembers" // browse the member directory
  | "manageMembers" // edit member data, change status/role
  | "postAnnouncement" // create/edit Bacheca posts
  | "uploadResource"; // upload documents

const MATRIX: Record<Permission, Role[]> = {
  viewAdmin: ["admin", "staff"],
  viewMembers: ["admin", "staff"],
  manageMembers: ["admin"],
  postAnnouncement: ["admin", "staff"],
  uploadResource: ["admin", "staff"],
};

export function can(role: Role | undefined, perm: Permission): boolean {
  if (!role) return false;
  return MATRIX[perm].includes(role);
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  member: "Membro",
};
