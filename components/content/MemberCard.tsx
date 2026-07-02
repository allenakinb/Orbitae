import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import type { Profile } from "@/lib/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";

export function MemberCard({ member }: { member: Profile }) {
  return (
    <Link
      href={`/membri/${member.id}`}
      className="group flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-all duration-200 hover:border-border-strong hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <Avatar profile={member} size={52} />
        <StatusBadge status={member.status} />
      </div>

      <h3 className="mt-4 font-display text-lg leading-tight text-ink transition-colors group-hover:text-accent">
        {member.name}
      </h3>
      <div className="mt-1">
        <RoleBadge role={member.role} />
      </div>

      <dl className="mt-4 flex flex-col gap-1.5 text-sm text-ink-muted">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="shrink-0 text-ink-faint" />
          <span className="truncate">{member.sector}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0 text-ink-faint" />
          <span className="truncate">{member.city}</span>
        </div>
      </dl>
    </Link>
  );
}
