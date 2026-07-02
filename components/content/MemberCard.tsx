import Link from "next/link";
import type { Profile } from "@/lib/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge, StatusBadge } from "@/components/ui/Badge";

// A register row, not a card: the directory reads as the club's member
// roster — typographic hierarchy and hairline rules instead of a grid of
// identical boxes.
export function MemberRow({ member }: { member: Profile }) {
  return (
    <Link
      href={`/membri/${member.id}`}
      className="group flex items-center gap-4 rounded-[var(--radius)] px-2 py-4 transition-colors hover:bg-surface/70"
    >
      <Avatar profile={member} size={44} />
      <div className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2.5">
          <span className="truncate font-display text-base text-ink transition-colors group-hover:text-accent">
            {member.name}
          </span>
          {member.company && (
            <span className="hidden truncate text-xs text-ink-faint sm:block">
              {member.company}
            </span>
          )}
        </span>
        <p className="mt-0.5 truncate text-sm text-ink-muted">
          {[member.sector, member.city].filter(Boolean).join(" · ") ||
            member.bio}
        </p>
      </div>
      {member.role !== "member" && (
        <span className="hidden sm:block">
          <RoleBadge role={member.role} />
        </span>
      )}
      <StatusBadge status={member.status} />
    </Link>
  );
}
