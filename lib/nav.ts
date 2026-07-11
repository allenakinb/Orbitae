import {
  LayoutGrid,
  Users,
  Megaphone,
  ShieldCheck,
  UserRound,
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
  { label: "Bacheca", href: "/bacheca", icon: Megaphone },
  { label: "Membri", href: "/membri", icon: Users, perm: "viewMembers" },
  { label: "Account", href: "/account", icon: UserRound },
  { label: "Admin", href: "/admin", icon: ShieldCheck, perm: "viewAdmin" },
];
