"use client";

import { useState } from "react";

// Il recap di una serata è lungo diversi paragrafi: in lista viene
// accorciato, ma resta a un click di distanza. `whitespace-pre-line`
// conserva gli a capo del testo originale.
export function EventRecap({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <div className={open ? undefined : "relative max-h-48 overflow-hidden"}>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
          {text}
        </p>
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-surface"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 text-sm text-accent transition-colors hover:text-accent-hover"
      >
        {open ? "Mostra meno" : "Mostra tutto"}
      </button>
    </div>
  );
}
