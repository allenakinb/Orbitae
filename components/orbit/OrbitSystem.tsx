"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Profile } from "@/lib/data/types";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import { Avatar } from "@/components/ui/Avatar";
import { OrbitMark } from "@/components/brand/OrbitMark";

interface RingDef {
  radius: number; // fraction of half-width (0–1)
  duration: number; // seconds per revolution
  reverse: boolean;
  avatar: number; // avatar px size
  capacity: number;
}

// Inner rings turn a touch faster; outer rings are larger and slower.
const RINGS: RingDef[] = [
  { radius: 0.4, duration: 88, reverse: false, avatar: 52, capacity: 5 },
  { radius: 0.68, duration: 124, reverse: true, avatar: 46, capacity: 9 },
  { radius: 0.95, duration: 168, reverse: false, avatar: 40, capacity: 999 },
];

interface Placed {
  member: Profile;
  ring: RingDef;
  angle: number; // radians
}

function layout(members: Profile[]): { ring: RingDef; items: Placed[] }[] {
  const rings = RINGS.map((r) => ({ ring: r, items: [] as Placed[] }));
  let idx = 0;
  let r = 0;
  for (const m of members) {
    while (r < rings.length - 1 && rings[r].items.length >= rings[r].ring.capacity) {
      r++;
    }
    rings[r].items.push({ member: m, ring: rings[r].ring, angle: 0 });
    idx++;
  }
  // Spread each ring's members evenly, offsetting alternate rings.
  rings.forEach((group, gi) => {
    const n = group.items.length;
    const offset = (gi * Math.PI) / n || 0;
    group.items.forEach((it, i) => {
      it.angle = (i / n) * Math.PI * 2 + offset;
    });
  });
  return rings.filter((g) => g.items.length > 0);
}

export function OrbitSystem({ members }: { members: Profile[] }) {
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const groups = useMemo(() => layout(members), [members]);

  return (
    <div
      className="relative mx-auto aspect-square w-full"
      style={{ maxWidth: "min(88vw, 620px)" }}
      onMouseLeave={() => {
        setPaused(false);
        setHovered(null);
      }}
    >
      {/* Dotted orbit guides — echo the mark's dot-burst. Each ring drifts
          slowly (motion-safe); dots fade with distance from the core. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        fill="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {/* Faint accent halo just outside the luminous core */}
        <circle
          cx="50"
          cy="50"
          r="16"
          stroke="var(--color-accent)"
          strokeOpacity="0.14"
          strokeWidth="0.25"
          strokeDasharray="0.06 1.4"
          strokeLinecap="round"
          className="origin-center motion-safe:animate-[mark-drift_180s_linear_infinite]"
        />
        {groups.map((g, i) => (
          <circle
            key={`guide-${i}`}
            cx="50"
            cy="50"
            r={g.ring.radius * 50}
            stroke="var(--color-border-strong)"
            strokeOpacity={0.5 - i * 0.12}
            strokeWidth="0.25"
            strokeDasharray="0.06 1.8"
            strokeLinecap="round"
            className="origin-center motion-safe:animate-[orbit-spin_var(--guide-dur)_linear_infinite]"
            style={
              {
                "--guide-dur": `${220 + i * 90}s`,
                animationDirection: i % 2 ? "reverse" : "normal",
              } as React.CSSProperties
            }
          />
        ))}
      </svg>

      {/* Luminous core — the mark reads as a lit body at the centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-[orbit-pulse_6s_ease-in-out_infinite]"
        style={{
          width: "clamp(220px, 46vw, 340px)",
          height: "clamp(220px, 46vw, 340px)",
          background:
            "radial-gradient(circle, var(--color-accent-glow), transparent 68%)",
          filter: "blur(6px)",
        }}
      />

      {/* Central mark */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <OrbitMark
          size={150}
          density={1.15}
          spin
          className="opacity-95 [width:clamp(110px,26vw,168px)] [height:clamp(110px,26vw,168px)]"
        />
      </div>

      {/* Rotating rings of members */}
      {groups.map((g, gi) => (
        <div
          key={`ring-${gi}`}
          // pointer-events-none: the stacked full-size ring containers would
          // otherwise swallow clicks meant for avatars on the rings below.
          // The avatar buttons re-enable their own pointer events.
          className="pointer-events-none absolute inset-0 motion-safe:[animation:orbit-spin_var(--dur)_linear_infinite]"
          style={
            {
              "--dur": `${g.ring.duration}s`,
              animationDirection: g.ring.reverse ? "reverse" : "normal",
              animationPlayState: paused ? "paused" : "running",
            } as React.CSSProperties
          }
        >
          {g.items.map(({ member, ring, angle }) => {
            const x = Math.cos(angle) * ring.radius * 50;
            const y = Math.sin(angle) * ring.radius * 50;
            const isHover = hovered === member.id;
            return (
              <div
                key={member.id}
                className="absolute"
                style={{
                  // Precompute the percentage (no calc()) at fixed precision:
                  // the browser normalises inline calc() in the CSSOM, which
                  // breaks hydration matching against React's raw string.
                  left: `${(50 + x).toFixed(4)}%`,
                  top: `${(50 + y).toFixed(4)}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isHover ? 30 : 10,
                }}
              >
                {/* Counter-rotation keeps avatars upright */}
                <div
                  className="motion-safe:[animation:orbit-spin_var(--dur)_linear_infinite]"
                  style={
                    {
                      "--dur": `${ring.duration}s`,
                      animationDirection: ring.reverse ? "normal" : "reverse",
                      animationPlayState: paused ? "paused" : "running",
                    } as React.CSSProperties
                  }
                >
                  <button
                    onMouseEnter={() => {
                      setPaused(true);
                      setHovered(member.id);
                    }}
                    onFocus={() => {
                      setPaused(true);
                      setHovered(member.id);
                    }}
                    onBlur={() => setHovered(null)}
                    onClick={() => router.push(`/membri/${member.id}`)}
                    aria-label={`${member.name} — ${ROLE_LABEL[member.role]}`}
                    className="group pointer-events-auto relative block cursor-pointer rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-[1.16] focus-visible:scale-[1.16]"
                  >
                    <Avatar
                      profile={member}
                      size={ring.avatar}
                      ring
                      className={cn(
                        "transition-shadow duration-300",
                        isHover &&
                          "shadow-[0_0_0_3px_var(--color-bg),0_0_22px_-2px_var(--color-accent-glow)]",
                      )}
                    />
                    {/* Hover label */}
                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-40 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius)] border border-border bg-elevated px-2.5 py-1.5 text-center shadow-xl transition-all duration-200",
                        isHover
                          ? "translate-y-0 opacity-100"
                          : "pointer-events-none translate-y-1 opacity-0",
                      )}
                    >
                      <span className="block text-xs font-semibold text-ink">
                        {member.name}
                      </span>
                      <span className="block text-[0.68rem] text-ink-muted">
                        {ROLE_LABEL[member.role]} · {member.sector}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
