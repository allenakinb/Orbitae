import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { escapeHtml } from "./invitations";

type Delivery = { id: string; email: string; name: string; title: string; inviteUrl: string };
export const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.INVITATIONS_FROM_EMAIL);

export async function deliverInvitation(client: SupabaseClient, invitation: Delivery) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `orbitae-${invitation.id}-${invitation.inviteUrl.split("/").pop()}`,
      },
      body: JSON.stringify({
        from: process.env.INVITATIONS_FROM_EMAIL,
        to: [invitation.email],
        subject: `Orbitae · ${invitation.title}`,
        text: `Ciao ${invitation.name}, sei invitato a ${invitation.title}. Visualizza i dettagli e rispondi: ${invitation.inviteUrl}`,
        html: `<h2>${escapeHtml(invitation.title)}</h2><p>Ciao ${escapeHtml(invitation.name)}, sei invitato al prossimo incontro Orbitae.</p><p><a href="${escapeHtml(invitation.inviteUrl)}">Visualizza l’invito e rispondi</a></p>`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { sent: false, warning: "Invito creato, ma invio email non confermato. Puoi condividere il link personale." };
    const { error } = await client.from("event_invitations").update({ sent_at: new Date().toISOString() }).eq("id", invitation.id);
    return { sent: true, warning: error ? "Email accettata dal servizio, ma lo stato di invio non è stato aggiornato. Non ripetere l’invio." : undefined };
  } catch {
    return { sent: false, warning: "Invito creato, ma invio email non confermato. Puoi condividere il link personale." };
  }
}
