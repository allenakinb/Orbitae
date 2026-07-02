import {
  LayoutGrid,
  Users,
  Megaphone,
  FolderClosed,
  MessagesSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  perm?: Permission;
  soon?: boolean;
}

export const NAV: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutGrid },
  { label: "Membri", href: "/membri", icon: Users, perm: "viewMembers" },
  { label: "Bacheca", href: "/bacheca", icon: Megaphone },
  { label: "Documenti", href: "/documenti", icon: FolderClosed },
  { label: "Forum", href: "/forum", icon: MessagesSquare, soon: true },
  { label: "Admin", href: "/admin", icon: ShieldCheck, perm: "viewAdmin" },
];
