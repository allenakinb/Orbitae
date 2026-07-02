// Avatar colors live entirely within the logo's red family. Each member
// gets a deterministic shade (deep maroon → red → warm orange) so the
// orbit reads as one cohesive red constellation — never rainbow.

// Curated stops along the brand-red ramp (OKLCH). Ordered light→deep.
const RAMP = [
  { l: 0.66, c: 0.16, h: 46 }, // warm orange
  { l: 0.62, c: 0.2, h: 38 }, // brand red
  { l: 0.56, c: 0.19, h: 32 }, // red
  { l: 0.5, c: 0.16, h: 27 }, // deep red
  { l: 0.44, c: 0.13, h: 22 }, // maroon
  { l: 0.59, c: 0.18, h: 42 }, // amber-red
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function avatarColor(id: string): string {
  const stop = RAMP[hash(id) % RAMP.length];
  return `oklch(${stop.l} ${stop.c} ${stop.h})`;
}

// Slightly lighter inner tint for the radial sheen on each avatar.
export function avatarSheen(id: string): string {
  const stop = RAMP[hash(id) % RAMP.length];
  return `oklch(${Math.min(stop.l + 0.1, 0.78)} ${stop.c} ${stop.h + 6})`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
