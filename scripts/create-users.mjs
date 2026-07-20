// ===================================================================
// ORBITAE — provisioning degli accessi reali.
//
//   node scripts/create-users.mjs           crea gli utenti mancanti
//   node scripts/create-users.mjs --reset   rigenera TUTTE le password
//
// Da eseguire DOPO supabase/migration-tier-presenze.sql (che crea la
// colonna `tier`, la tabella `event_attendees` e i due eventi).
//
// Per ogni persona in scripts/members.mjs:
//   1. crea l'utente Supabase Auth (email confermata) con una password
//      generata leggibile, oppure lo salta se esiste già (--reset la
//      rigenera);
//   2. upserta la riga in `profiles` (accesso, etichetta, stato, azienda);
//   3. registra le presenze agli eventi;
//   4. se la tabella è vuota, semina i documenti di partenza.
//
// Al termine scrive le credenziali sulla Scrivania:
//   ~/Desktop/Credenziali-Orbitae.html  (documento consegnabile)
//   ~/Desktop/credenziali-orbitae.csv   (per mail merge / import)
//
// Richiede in .env.local (o nell'ambiente) oltre alle chiavi pubbliche:
//   SUPABASE_SERVICE_ROLE_KEY=...   ← Dashboard → Settings → API keys.
//   Chiave admin: NON committarla e non metterla in NEXT_PUBLIC_*.
// ===================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomInt } from "node:crypto";
import dns from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";
import { createClient } from "@supabase/supabase-js";
import { EVENTS, MEMBERS } from "./members.mjs";

// --- fetch resiliente al DNS -----------------------------------------
// La cache DNS di macOS a volte serve SERVFAIL per i domini *.supabase.co
// appena creati: se getaddrinfo fallisce, risolviamo direttamente via
// Cloudflare/Google DNS e proseguiamo.

const fallbackResolver = new dns.promises.Resolver();
fallbackResolver.setServers(["1.1.1.1", "8.8.8.8"]);

const dnsAgent = new Agent({
  connect: {
    lookup(hostname, options, callback) {
      dns.lookup(hostname, options, (err, address, family) => {
        if (!err) return callback(err, address, family);
        fallbackResolver.resolve4(hostname).then(
          (addrs) => {
            if (!addrs.length) return callback(err, address, family);
            if (options.all) {
              callback(null, addrs.map((a) => ({ address: a, family: 4 })));
            } else {
              callback(null, addrs[0], 4);
            }
          },
          () => callback(err, address, family),
        );
      });
    },
  },
});

const dnsFetch = (input, init) =>
  undiciFetch(input, { ...init, dispatcher: dnsAgent });

const RESET = process.argv.includes("--reset");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- env -----------------------------------------------------------

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...loadEnvLocal(), ...process.env };
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !SERVICE_KEY) {
  console.error(
    "✗ Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Aggiungi in .env.local:  SUPABASE_SERVICE_ROLE_KEY=<service_role>\n" +
      "  (Supabase Dashboard → Project Settings → API keys → service_role)",
  );
  process.exit(1);
}

const admin = createClient(URL_, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: dnsFetch },
});

// --- password leggibili ---------------------------------------------
// Due parole del lessico orbitale + 2 cifre: facili da dettare al
// telefono, uniche per membro, cambiabili poi da /account.

const WORDS_A = [
  "Vega", "Luna", "Sole", "Astro", "Nova", "Orione", "Sirio", "Cosmo",
  "Aurora", "Cometa", "Stella", "Nettuno", "Marte", "Giove", "Saturno",
  "Lira", "Atlante", "Zenit", "Eclisse", "Orbita", "Polare", "Andromeda",
  "Perseo", "Fenice",
];
const WORDS_B = [
  "Vela", "Faro", "Onda", "Porto", "Corte", "Ponte", "Torre", "Bosco",
  "Fonte", "Prato", "Golfo", "Lago", "Monte", "Fiume", "Scoglio", "Molo",
  "Rocca", "Borgo", "Duomo", "Arco", "Loggia", "Terrazza", "Giardino",
  "Vetta",
];

const used = new Set(MEMBERS.map((m) => m.password).filter(Boolean));
function genPassword() {
  for (;;) {
    const pw = `${WORDS_A[randomInt(WORDS_A.length)]}-${
      WORDS_B[randomInt(WORDS_B.length)]
    }-${randomInt(10, 100)}`;
    if (!used.has(pw)) {
      used.add(pw);
      return pw;
    }
  }
}

// --- auth users ------------------------------------------------------

async function listAllUsers() {
  const byEmail = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) byEmail.set(u.email?.toLowerCase(), u.id);
    if (data.users.length < 200) return byEmail;
  }
}

async function provision() {
  const existing = await listAllUsers();
  const rows = []; // { name, email, tier, password | null }
  const idByEmail = new Map();

  for (const m of MEMBERS) {
    const key = m.email.toLowerCase();
    let id = existing.get(key);
    let password = null;

    if (!id) {
      password = m.password ?? genPassword();
      const { data, error } = await admin.auth.admin.createUser({
        email: m.email,
        password,
        email_confirm: true,
        user_metadata: { name: m.name },
      });
      if (error) throw new Error(`createUser ${m.email}: ${error.message}`);
      id = data.user.id;
      console.log(`  + creato   ${m.email}`);
    } else if (RESET) {
      password = m.password ?? genPassword();
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) throw new Error(`updateUser ${m.email}: ${error.message}`);
      console.log(`  ~ reset    ${m.email}`);
    } else {
      console.log(`  = esiste   ${m.email} (password invariata)`);
    }

    idByEmail.set(key, id);

    const { error: pErr } = await admin.from("profiles").upsert({
      id,
      name: m.name,
      // La scheda del membro mostra la mail personale; l'email di login
      // (@orbitae.club) resta solo in Supabase Auth, non nel profilo.
      email: m.personalEmail || m.email,
      role: m.role,
      tier: m.tier,
      status: m.status ?? "active",
      sector: "",
      city: "",
      company: m.company || null,
      bio: m.bio || null,
      linkedin: m.linkedin || null,
      joined_at: m.joinedAt,
    });
    if (pErr) throw new Error(`profilo ${m.email}: ${pErr.message}`);

    rows.push({ name: m.name, email: m.email, tier: m.tier, password });
  }

  return { rows, idByEmail };
}

// --- presenze agli eventi --------------------------------------------
// Sono queste a decidere chi orbita attorno a un incontro nella Home.
// L'upsert le rende ripetibili senza duplicati.

async function seedAttendance(idByEmail) {
  const links = [];
  for (const m of MEMBERS) {
    for (const slug of m.events ?? []) {
      const eventId = EVENTS[slug];
      if (!eventId) throw new Error(`evento sconosciuto "${slug}" (${m.email})`);
      links.push({
        event_id: eventId,
        profile_id: idByEmail.get(m.email.toLowerCase()),
      });
    }
  }
  if (!links.length) return;

  const { error } = await admin
    .from("event_attendees")
    .upsert(links, { onConflict: "event_id,profile_id", ignoreDuplicates: true });
  if (error) throw new Error(`presenze: ${error.message}`);

  for (const [slug, id] of Object.entries(EVENTS)) {
    const n = links.filter((l) => l.event_id === id).length;
    console.log(`  + presenze ${slug.padEnd(15)} ${n} persone`);
  }
}

// --- contenuti di partenza (solo se le tabelle sono vuote) -----------

// Nessun annuncio di partenza: il racconto delle serate vive nel campo
// `summary` degli eventi, e la Bacheca nasconde la sezione se è vuota.

async function seedContent(idByEmail) {
  const author = (email) => idByEmail.get(email);

  const { count: rCount } = await admin
    .from("resources")
    .select("*", { count: "exact", head: true });
  if (rCount === 0) {
    const { error } = await admin.from("resources").insert([
      {
        name: "Statuto del Club Orbitae",
        category: "Regolamenti",
        file_kind: "pdf",
        file_url: "#",
        uploaded_by: author("lorenzo.scisciani@orbitae.club"),
        created_at: "2025-01-15T09:00:00Z",
      },
      {
        name: "Codice di condotta dei membri",
        category: "Regolamenti",
        file_kind: "pdf",
        file_url: "#",
        uploaded_by: author("lorenzo.scisciani@orbitae.club"),
        created_at: "2025-02-01T09:00:00Z",
      },
    ]);
    if (error) throw new Error(`seed documenti: ${error.message}`);
    console.log("  + documenti: 2 segnaposto (sostituiscili dal portale)");
  }
}

// --- documento credenziali sulla Scrivania ---------------------------

// Nel documento compare l'etichetta pubblica, non chi ha l'accesso admin.
const TIER_LABEL = {
  founder: "Founder",
  ambassador: "Ambassador",
  member: "Member",
};

function writeCredentialDocs(rows) {
  const desktop = join(homedir(), "Desktop");
  const stamp = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const csv = [
    "nome;email;etichetta;password",
    ...rows.map(
      (r) =>
        `${r.name};${r.email};${TIER_LABEL[r.tier]};${r.password ?? "(invariata)"}`,
    ),
  ].join("\n");
  const csvPath = join(desktop, "credenziali-orbitae.csv");
  writeFileSync(csvPath, "﻿" + csv, "utf8");

  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const tr = (r) => `
        <tr>
          <td>${esc(r.name)}</td>
          <td class="mono">${esc(r.email)}</td>
          <td><span class="badge badge-${r.tier}">${TIER_LABEL[r.tier]}</span></td>
          <td class="mono pw">${r.password ? esc(r.password) : "<em>invariata</em>"}</td>
        </tr>`;

  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Credenziali di accesso — Orbitae</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 48px 40px; font: 15px/1.55 "Avenir Next", "Segoe UI", system-ui, sans-serif; color: #1c1917; background: #fbfaf8; }
  .sheet { max-width: 880px; margin: 0 auto; }
  header { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 2px solid #1c1917; padding-bottom: 14px; }
  h1 { margin: 0; font-size: 26px; letter-spacing: 0.14em; text-transform: uppercase; }
  .date { color: #78716c; font-size: 13px; }
  .note { margin: 18px 0 26px; padding: 12px 16px; border: 1px solid #e7e5e4; border-left: 3px solid #b4552d; background: #fff; font-size: 13.5px; color: #57534e; }
  table { width: 100%; border-collapse: collapse; background: #fff; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c; border-bottom: 1px solid #d6d3d1; padding: 10px 12px; }
  td { border-bottom: 1px solid #e7e5e4; padding: 10px 12px; vertical-align: middle; }
  .mono { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-size: 13px; }
  .pw { font-weight: 700; }
  .badge { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 600; }
  .badge-founder { background: #fbe3d6; color: #9a3d16; }
  .badge-ambassador { background: #e8e3f5; color: #4c3a8a; }
  .badge-member { background: #e5e7e3; color: #44514a; }
  footer { margin-top: 26px; font-size: 12.5px; color: #a8a29e; }
  @media print { body { padding: 24px; background: #fff; } .note { break-inside: avoid; } tr { break-inside: avoid; } }
</style>
</head>
<body>
<div class="sheet">
  <header>
    <h1>Orbitae · Credenziali</h1>
    <span class="date">${stamp}</span>
  </header>
  <p class="note"><strong>Documento riservato.</strong> Consegna a ogni membro solo la propria riga.
  Accesso dal portale con email e password; dalla pagina <strong>Account</strong> ognuno può cambiare
  la password al primo ingresso.</p>
  <table>
    <thead><tr><th>Nome</th><th>Email di accesso</th><th>Etichetta</th><th>Password</th></tr></thead>
    <tbody>${rows.map(tr).join("")}
    </tbody>
  </table>
  <footer>Generato da scripts/create-users.mjs · ${rows.length} membri · le password sono salvate solo in questo documento.</footer>
</div>
</body>
</html>`;
  const htmlPath = join(desktop, "Credenziali-Orbitae.html");
  writeFileSync(htmlPath, html, "utf8");

  return { csvPath, htmlPath };
}

// --- run -------------------------------------------------------------

console.log(`Orbitae — provisioning (${RESET ? "reset password" : "solo nuovi"})…`);
const { rows, idByEmail } = await provision();
await seedAttendance(idByEmail);
await seedContent(idByEmail);
const { csvPath, htmlPath } = writeCredentialDocs(rows);

console.log("\nCredenziali:");
for (const r of rows) {
  console.log(
    `  ${r.email.padEnd(36)} ${TIER_LABEL[r.tier].padEnd(10)} ${r.password ?? "(invariata)"}`,
  );
}
console.log(`\n✓ ${rows.length} membri provisionati.`);
console.log(`✓ Documento: ${htmlPath}`);
console.log(`✓ CSV:       ${csvPath}`);
