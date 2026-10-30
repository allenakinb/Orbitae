import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const client = await requireAdmin(request);
    if (!client) return NextResponse.json({ error: "Accesso riservato agli amministratori." }, { status: 403 });
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    if (!name || name.length > 160 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith("@orbitae.club") || company.length > 300)
      return NextResponse.json({ error: "Inserisci nome e cognome e un’email personale o di lavoro valida." }, { status: 400 });
    const { data: existing, error: lookupError } = await client.from("profiles").select("id").eq("email", email).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return NextResponse.json({ error: "Esiste già un membro con questa email. Selezionalo dall’elenco." }, { status: 409 });
    const { data, error } = await client.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name } });
    if (error || !data.user) return NextResponse.json({ error: "Account non creato. L’email potrebbe essere già registrata: verifica l’elenco prima di riprovare." }, { status: 409 });
    const { error: profileError } = await client.from("profiles").insert({ id: data.user.id, name, email, company: company || null, role: "member", tier: "member", status: "active", sector: "", city: "" });
    if (profileError) {
      const { error: cleanupError } = await client.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: cleanupError ? "Profilo non creato. L’account richiede una verifica amministrativa prima di riprovare." : "Profilo non creato. Nessun nuovo account conservato: riprova." }, { status: 503 });
    }
    return NextResponse.json({ id: data.user.id }, { status: 201 });
  } catch { return NextResponse.json({ error: "Servizio non disponibile. Riprova tra poco." }, { status: 503 }); }
}
