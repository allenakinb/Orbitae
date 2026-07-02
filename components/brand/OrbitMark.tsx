"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface OrbitMarkProps {
  size: number;
  className?: string;
  spin?: boolean; // slow continuous rotation
  density?: number; // dot spacing multiplier (lower = denser)
}

// Recreates the Orbitae logo: concentric rings of red diamonds bursting
// from a solid core, denser and brighter at the center, fading outward
// with a faint spiral banding. Drawn on a DPR-aware canvas so it stays
// crisp at any size and avoids the white-box of the source PNG on dark.
export function OrbitMark({
  size,
  className,
  spin = false,
  density = 1,
}: OrbitMarkProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = (size / 2) * 0.96;

    // Deterministic jitter — stable across re-renders / HMR.
    let s = 0x9e3779b9;
    const rnd = () => {
      s = (s ^ (s << 13)) >>> 0;
      s = (s ^ (s >> 17)) >>> 0;
      s = (s ^ (s << 5)) >>> 0;
      return s / 0xffffffff;
    };

    const diamond = (x: number, y: number, hs: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x, y - hs);
      ctx.lineTo(x + hs, y);
      ctx.lineTo(x, y + hs);
      ctx.lineTo(x - hs, y);
      ctx.closePath();
      ctx.fill();
    };

    ctx.fillStyle = "#d6360f";

    // Solid core
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.045, 0, Math.PI * 2);
    ctx.fill();

    const step = size * 0.02 * density;
    let spiral = 0;
    for (let r = size * 0.06; r < maxR; r += step) {
      const t = r / maxR; // 0 center → 1 edge
      const circumference = 2 * Math.PI * r;
      const count = Math.max(6, Math.round(circumference / (step * 1.05)));
      const hs = size * (0.014 - 0.009 * t); // shrink outward
      // banding + radial falloff
      const band = 0.6 + 0.4 * Math.abs(Math.sin(r * 0.16));
      const baseAlpha = (1 - t * 0.72) * band;
      spiral += 0.35;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + spiral * 0.04;
        const jr = r + (rnd() - 0.5) * step * 0.6;
        const x = cx + Math.cos(a) * jr;
        const y = cy + Math.sin(a) * jr;
        const alpha = Math.max(
          0.04,
          Math.min(1, baseAlpha * (0.75 + rnd() * 0.5)),
        );
        diamond(x, y, hs, alpha);
      }
    }
    ctx.globalAlpha = 1;
  }, [size, density]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn(spin && "motion-safe:[animation:orbit-spin_120s_linear_infinite]", className)}
      aria-hidden
    />
  );
}
