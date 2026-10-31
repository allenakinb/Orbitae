import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/supabase";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await requireAdmin(request);
    if (!client) return NextResponse.json({ error: "Accesso riservato agli amministratori." }, { status: 403 });
    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return NextResponse.json({ error: "Membro non valido." }, { status: 400 });
    const { data: member, error } = await client.from("profiles").select("id,name,role").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!member) return NextResponse.json({ error: "Membro non trovato. Aggiorna l’elenco." }, { status: 404 });
    if (member.role === "admin") return NextResponse.json({ error: "Gli account amministratori sono protetti e non possono essere eliminati da qui." }, { status: 403 });
    const body = await request.json();
    if (body?.confirmName !== member.name) return NextResponse.json({ error: "Scrivi il nome completo del membro per confermare." }, { status: 400 });
    // Remove the Auth identity too: deleting only the profile leaves a login orphan.
    // The database cascades profiles, attendance and invitations from this identity.
    const { error: deletionError } = await client.auth.admin.deleteUser(id);
    if (deletionError) return NextResponse.json({ error: "Eliminazione non riuscita. Il membro potrebbe avere contenuti collegati: verifica e riprova." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Servizio non disponibile. Riprova tra poco." }, { status: 503 }); }
}
