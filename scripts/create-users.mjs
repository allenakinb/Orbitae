// Preview-first passwordless provisioning. No email is sent by this script.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { MEMBERS, EVENTS } from "./members.mjs";
import { planMembers } from "./lib/member-plan.mjs";

const args = process.argv.slice(2);
if (args.includes("--reset")) throw new Error("Il reset delle password è dismesso: i nuovi membri accedono con codice email.");
const apply = args.includes("--apply");
function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error(`Manca il valore di ${name}.`);
  return args[index + 1];
}
const input = option("--input");
const eventId = option("--event");
for (let i = 0; i < args.length; i++) {
  if (["--input", "--event"].includes(args[i])) i++;
  else if (args[i] !== "--apply") throw new Error(`Opzione sconosciuta: ${args[i]}`);
}
if (eventId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) throw new Error("ID episodio non valido.");
const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = resolve(root, ".env.local");
const fileEnv = existsSync(envFile) ? Object.fromEntries(readFileSync(envFile, "utf8").split("\n").flatMap(line => {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  return match ? [[match[1], match[2].replace(/^["']|["']$/g, "")]] : [];
})) : {};
const env = { ...fileEnv, ...process.env };
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configura URL e service-role Supabase solo nell’ambiente server.");
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) }) },
});
async function checked(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}
const users = [];
for (let page = 1; ; page++) {
  const data = await checked(client.auth.admin.listUsers({ page, perPage: 200 }));
  users.push(...data.users);
  if (data.users.length < 200) break;
}
const profiles = await checked(client.from("profiles").select("id,name,email,status"));
// Old registry entries without a personal address cannot become passwordless accounts.
const source = input ? JSON.parse(readFileSync(resolve(input), "utf8")) : MEMBERS.filter(m => m.personalEmail && !m.personalEmail.toLowerCase().endsWith("@orbitae.club"));
const plan = planMembers(source, users, profiles);
const eventIds = new Set();
for (const row of plan) {
  row.eventIds = eventId ? [eventId] : (row.member.events ?? []).map(slug => {
    if (!EVENTS[slug]) throw new Error(`Episodio sconosciuto: ${slug}`);
    return EVENTS[slug];
  });
  row.eventIds.forEach(id => eventIds.add(id));
}
if (eventIds.size) {
  const events = await checked(client.from("events").select("id").in("id", [...eventIds]));
  if (events.length !== eventIds.size) throw new Error("Uno degli episodi non esiste. Crea prima l’episodio corretto dal portale.");
}
console.log(apply ? "Applicazione elenco controllato." : "Anteprima: nessuna modifica al database. Aggiungi --apply per eseguire.");
console.table(plan.map(row => ({ nome: row.name, email: row.email, operazione: row.action === "create" ? "Nuovo account OTP" : row.migrationRequired ? "Account esistente: cambio email autonomo" : "Account esistente", presenze: row.eventIds.length })));
if (apply) {
  for (const row of plan) {
    let id = row.id;
    if (!id) {
      const data = await checked(client.auth.admin.createUser({ email: row.email, email_confirm: true, user_metadata: { name: row.name } }));
      id = data.user.id;
    }
    if (!row.profileExists) {
      await checked(client.from("profiles").insert({
        id, name: row.name, email: row.email, role: "member", tier: ["founder", "ambassador", "member"].includes(row.member.tier) ? row.member.tier : "member",
        status: "active", company: row.member.company || null, bio: row.member.bio || null, linkedin: row.member.linkedin || null,
        sector: row.member.sector || "", city: row.member.city || "",
        ...(row.member.joinedAt && /^\d{4}-\d{2}-\d{2}$/.test(row.member.joinedAt) ? { joined_at: row.member.joinedAt } : {}),
      }));
    }
    if (row.eventIds.length) await checked(client.from("event_attendees").upsert(row.eventIds.map(event_id => ({ event_id, profile_id: id })), { onConflict: "event_id,profile_id", ignoreDuplicates: true }));
  }
  console.log(`Completati ${plan.length} membri. Profili esistenti conservati; nessuna password generata, nessun messaggio inviato.`);
}
