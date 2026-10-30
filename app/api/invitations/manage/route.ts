import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/supabase";
import { hashInvitationToken, newInvitationToken, publicOrigin, validId, currentInvitationRecipient } from "@/lib/server/invitations";
import { deliverInvitation, emailConfigured } from "@/lib/server/deliver-invitation";

// Reissue a lost link without retaining bearer tokens in the database.
export async function POST(request: Request) {
  try {
    const client = await requireAdmin(request);
    if (!client) return NextResponse.json({ error: "Accesso amministratore richiesto." }, { status: 403 });
    let body;
    try { body = await request.json(); } catch { /* Invalid JSON. */ }
    if (!body || !validId(body.invitationId) || typeof body.sendEmail !== "boolean") return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
    if (body.sendEmail && !emailConfigured()) return NextResponse.json({ error: "Invio email non configurato. Puoi generare un nuovo link da condividere." }, { status: 503 });
    const origin = publicOrigin(request);
    const { data: invite, error } = await client.from("event_invitations").select("id,event_id,profile_id,guest_name,email,status").eq("id", body.invitationId).single();
    if (error || !invite || invite.status === "revoked") return NextResponse.json({ error: "Invito revocato o non disponibile." }, { status: 404 });
    const recipient = await currentInvitationRecipient(invite, id => client.from("profiles").select("name,email,status").eq("id", id).single());
    if (!recipient) return NextResponse.json({ error: "Destinatario non disponibile." }, { status: 400 });
    const { name, email } = recipient;
    if (!email || !name || (body.sendEmail && email.toLowerCase().endsWith("@orbitae.club"))) return NextResponse.json({ error: "Questo invito è disponibile nel portale. Associa una casella personale al profilo prima di inviarlo via email." }, { status: 400 });
    const { data: event, error: eventError } = await client.from("events").select("title").eq("id", invite.event_id).single();
    if (eventError || !event) return NextResponse.json({ error: "Episodio non disponibile." }, { status: 404 });
    const token = newInvitationToken();
    const { data: updated, error: updateError } = await client.from("event_invitations").update({ guest_name: name, email, token_hash: hashInvitationToken(token), expires_at: new Date(Date.now() + 90 * 86400000).toISOString(), sent_at: null })
      .eq("id", invite.id).neq("status", "revoked").select("id").single();
    if (updateError || !updated) return NextResponse.json({ error: "Invito non aggiornato. Ricarica e riprova." }, { status: 409 });
    const inviteUrl = `${origin}/invito/${token}`;
    const delivery = body.sendEmail ? await deliverInvitation(client, { id: invite.id, name, email, title: event.title, inviteUrl }) : { sent: false };
    return NextResponse.json({ inviteUrl, ...delivery }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Servizio non disponibile. Riprova." }, { status: 503 });
  }
}
