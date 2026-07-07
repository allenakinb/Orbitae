"use client";

import { useEffect } from "react";
import { Briefcase, Building2, Mail, MapPin, X } from "lucide-react";
import type { Profile } from "@/lib/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/Badge";
import { LinkedinIcon } from "@/components/brand/LinkedinIcon";

function Row({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Mail;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <Icon size={15} className="mt-0.5 shrink-0 text-ink-faint" />
      <span className="min-w-0 truncate">{value}</span>
    </>
  );
  return href ? (
    <a
      href={href}
      className="flex items-start gap-2.5 text-sm text-ink transition-colors hover:text-accent"
    >
      {body}
    </a>
  ) : (
    <div className="flex items-start gap-2.5 text-sm text-ink">{body}</div>
  );
}

// Larger member preview shown when an avatar in the orbit is hovered,
// focused or clicked. Persistent (close with the ✕ or Esc) so its email
// and LinkedIn links stay reachable — a hover tooltip would vanish.
export function MemberOrbitCard({
  member,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  member: Profile;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  // Esc closes the card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`Scheda di ${member.name}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="pointer-events-auto fixed inset-x-4 bottom-4 z-[var(--z-drawer)] w-auto rounded-[var(--radius-lg)] border border-border bg-elevated p-5 shadow-2xl motion-safe:animate-fade-rise sm:left-auto sm:right-6 sm:top-1/2 sm:bottom-auto sm:w-[340px] sm:-translate-y-1/2"
    >
      <button
        onClick={onClose}
        aria-label="Chiudi"
        className="absolute right-3 top-3 rounded-[var(--radius)] p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <X size={18} />
      </button>

      <div className="flex items-center gap-4 pr-6">
        <Avatar profile={member} size={64} ring />
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg text-ink">
            {member.name}
          </h3>
          <div className="mt-1.5">
            <RoleBadge role={member.role} />
          </div>
        </div>
      </div>

      {member.bio && (
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          {member.bio}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
        {member.company && <Row icon={Building2} value={member.company} />}
        {member.sector && <Row icon={Briefcase} value={member.sector} />}
        {member.city && <Row icon={MapPin} value={member.city} />}
        {member.email && (
          <Row
            icon={Mail}
            value={member.email}
            href={`mailto:${member.email}`}
          />
        )}
      </div>

      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius)] border border-border-strong px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <LinkedinIcon size={16} /> LinkedIn
        </a>
      )}
    </div>
  );
}
