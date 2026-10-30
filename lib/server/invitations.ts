import { createHash, randomBytes } from "node:crypto";
export const newInvitationToken = () => randomBytes(32).toString("hex");
export const hashInvitationToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const validInvitationToken = (token: string) => /^[a-f0-9]{64}$/.test(token);
export const validId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
type RecipientProfile = { name: string; email: string; status: string };
export async function currentInvitationRecipient(
  invite: { profile_id: string | null; guest_name: string | null; email: string | null },
  lookup: (id: string) => PromiseLike<{ data: RecipientProfile | null; error: unknown }>,
) {
  if (invite.profile_id) {
    const { data, error } = await lookup(invite.profile_id);
    if (error || !data || ["suspended", "expired"].includes(data.status)) return null;
    return { name: data.name, email: data.email };
  }
  return invite.guest_name && invite.email ? { name: invite.guest_name, email: invite.email } : null;
}
export function invitationInput(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (!validId(body.eventId) || (body.sendEmail !== undefined && typeof body.sendEmail !== "boolean")) return null;
  if (body.profileId !== undefined) {
    return validId(body.profileId) ? { eventId: body.eventId, profileId: body.profileId, sendEmail: body.sendEmail === true } : null;
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name || name.length > 150 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { eventId: body.eventId, name, email, sendEmail: body.sendEmail === true };
}
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
export function publicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Configure an HTTPS NEXT_PUBLIC_SITE_URL");
    return url.origin;
  }
  const url = new URL(request.url);
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname)) return url.origin;
  throw new Error("Configure NEXT_PUBLIC_SITE_URL");
}
