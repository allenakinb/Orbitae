import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/supabase";
import { newInvitationToken, hashInvitationToken, publicOrigin, invitationInput } from "@/lib/server/invitations";
import { deliverInvitation, emailConfigured } from "@/lib/server/deliver-invitation";

export async function POST(request: Request) {
  try {
    const client = await requireAdmin(request);
    if (!client) return NextResponse.json({ error: "Accesso amministratore richiesto." }, { status: 403 });
    let body;
    try { body = invitationInput(await request.json()); } catch { /* Invalid JSON. */ }
    if (!body) return NextResponse.json({ error: "Inserisci episodio, nome ed email validi." }, { status: 400 });
    if (body.sendEmail && !emailConfigured()) return NextResponse.json({ error: "Invio email non configurato. Crea un link da condividere oppure configura il mittente." }, { status: 503 });

    let name = body.name ?? "";
    let email = body.email ?? "";
    if (body.profileId) {
      const { data: profile, error } = await client.from("profiles").select("name,email,status").eq("id", body.profileId).single();
      if (error || !profile || ["suspended", "expired"].includes(profile.status)) return NextResponse.json({ error: "Membro non disponibile." }, { status: 400 });
      name = profile.name; email = profile.email;
    }
    if (body.sendEmail && email.toLowerCase().endsWith("@orbitae.club")) return NextResponse.json({ error: "Associa prima una casella personale al profilo oppure invita il membro nel portale." }, { status: 400 });
    const origin = publicOrigin(request);
    const { data: event, error: eventError } = await client.from("events").select("id,title").eq("id", body.eventId).single();
    if (eventError || !event) return NextResponse.json({ error: "Episodio non disponibile." }, { status: 404 });
    const token = newInvitationToken();
    const { data: invitation, error } = await client.from("event_invitations").insert({
      event_id: body.eventId, profile_id: body.profileId ?? null, guest_name: name, email,
      token_hash: hashInvitationToken(token), status: "pending",
    }).select("id").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "Questa persona ha già un invito per l’episodio. Gestiscilo nell’elenco." : "Impossibile creare l’invito. Verifica l’attivazione del database." }, { status: error.code === "23505" ? 409 : 503 });
    const inviteUrl = `${origin}/invito/${token}`;
    const delivery = body.sendEmail ? await deliverInvitation(client, { id: invitation.id, name, email, title: event.title, inviteUrl }) : { sent: false };
    return NextResponse.json({ inviteUrl, ...delivery }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Servizio non disponibile. Verifica la configurazione e riprova." }, { status: 503 });
  }
}
