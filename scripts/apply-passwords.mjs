// ===================================================================
// ORBITAE — allinea le password di Supabase Auth alle credenziali
// fisse annotate in scripts/members.mjs (campo `password`, dal file
// "Credenziali Orbitae.xlsx").
//
//   node scripts/apply-passwords.mjs
//
// Tocca SOLO i membri che hanno una password fissa: gli altri account
// (e chi ha già cambiato password da /account ma non è nel file)
// restano invariati. Ripetibile senza effetti collaterali.
//
// Richiede in .env.local: NEXT_PUBLIC_SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY (come create-users.mjs).
// ===================================================================

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dns from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";
import { createClient } from "@supabase/supabase-js";
import { MEMBERS } from "./members.mjs";

// Stessa rete di sicurezza DNS di create-users.mjs.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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
  console.error("✗ Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const admin = createClient(URL_, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: dnsFetch },
});

async function listAllUsers() {
  const byEmail = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) byEmail.set(u.email?.toLowerCase(), u.id);
    if (data.users.length < 200) return byEmail;
  }
}

const fixed = MEMBERS.filter((m) => m.password);
console.log(`Orbitae — applico ${fixed.length} password fisse…`);

const existing = await listAllUsers();
let updated = 0;
const missing = [];

for (const m of fixed) {
  const id = existing.get(m.email.toLowerCase());
  if (!id) {
    missing.push(m.email);
    console.log(`  ? assente  ${m.email} (esegui prima create-users.mjs)`);
    continue;
  }
  const { error } = await admin.auth.admin.updateUserById(id, { password: m.password });
  if (error) throw new Error(`updateUser ${m.email}: ${error.message}`);
  updated++;
  console.log(`  ~ allineata ${m.email}`);
}

console.log(`\n✓ ${updated} password allineate alle credenziali del file.`);
if (missing.length) {
  console.log(`! ${missing.length} account mancanti: ${missing.join(", ")}`);
}
