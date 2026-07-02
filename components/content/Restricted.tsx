import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageContainer } from "@/components/shell/PageContainer";

// Shown when a signed-in member opens a section outside their role.
export function Restricted({
  detail = "Questa sezione è disponibile solo per Admin e Staff.",
}: {
  detail?: string;
}) {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-10 text-center">
        <ShieldAlert size={28} className="mx-auto text-accent" />
        <p className="mt-4 font-display text-xl text-ink">Accesso riservato</p>
        <p className="mt-2 text-sm text-ink-muted">{detail}</p>
        <Link
          href="/"
          className="mt-5 inline-block text-sm text-accent hover:underline"
        >
          ← Torna alla Home
        </Link>
      </div>
    </PageContainer>
  );
}
