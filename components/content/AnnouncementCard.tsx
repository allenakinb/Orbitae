import { Pin } from "lucide-react";
import type { Announcement, Profile } from "@/lib/data/types";
import { relativeTime } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export function AnnouncementCard({
  announcement,
  author,
  compact,
}: {
  announcement: Announcement;
  author?: Profile;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border bg-surface p-5 transition-colors",
        announcement.pinned
          ? "border-accent/35"
          : "border-border hover:border-border-strong",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        {announcement.pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <Pin size={12} className="fill-current" /> In evidenza
          </span>
        )}
        <span className="text-xs text-ink-faint">
          {relativeTime(announcement.createdAt)}
        </span>
      </div>

      <h3 className="font-display text-lg text-ink">{announcement.title}</h3>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed text-ink-muted",
          compact && "line-clamp-2",
        )}
      >
        {announcement.body}
      </p>

      {author && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          <Avatar profile={author} size={26} />
          <span className="text-xs text-ink-muted">
            {author.name}
          </span>
        </div>
      )}
    </article>
  );
}
