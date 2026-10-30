import { NextResponse } from "next/server";
import { adminClient } from "@/lib/server/supabase";
import { hashInvitationToken, validInvitationToken } from "@/lib/server/invitations";
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
type Context = { params: Promise<{ token: string }> };
export async function GET(_request: Request, context: Context) {
  const { token } = await context.params;
  if (!validInvitationToken(token)) return NextResponse.json({ error: "Invito non disponibile." }, { status: 404, headers });
  try {
    const client = adminClient();
    const { data, error } = await client.from("event_invitations").select("event_id,guest_name,status,expires_at").eq("token_hash", hashInvitationToken(token)).single();
    if (error || !data || data.status === "revoked" || Date.parse(data.expires_at) <= Date.now()) return NextResponse.json({ error: "Invito scaduto, revocato o non disponibile." }, { status: 404, headers });
    const { data: event, error: eventError } = await client.from("events").select("title,subtitle,date,time,location,description").eq("id", data.event_id).single();
    if (eventError || !event) return NextResponse.json({ error: "Episodio non disponibile." }, { status: 404, headers });
    return NextResponse.json({ name: data.guest_name, status: data.status, event }, { headers });
  } catch { return NextResponse.json({ error: "Servizio temporaneamente non disponibile." }, { status: 503, headers }); }
}
export async function POST(request: Request, context: Context) {
  const { token } = await context.params;
  if (!validInvitationToken(token)) return NextResponse.json({ error: "Invito non disponibile." }, { status: 404, headers });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Risposta non valida." }, { status: 400, headers }); }
  if (!body || typeof body !== "object" || !["accepted", "declined"].includes(body.status)) return NextResponse.json({ error: "Risposta non valida." }, { status: 400, headers });
  try {
    const { data, error } = await adminClient().from("event_invitations").update({ status: body.status, responded_at: new Date().toISOString() })
      .eq("token_hash", hashInvitationToken(token)).neq("status", "revoked").gt("expires_at", new Date().toISOString()).select("id").single();
    if (error || !data) return NextResponse.json({ error: "Invito scaduto, revocato o non disponibile." }, { status: 404, headers });
    return NextResponse.json({ ok: true, status: body.status }, { headers });
  } catch { return NextResponse.json({ error: "Impossibile salvare la risposta. Riprova." }, { status: 503, headers }); }
}
