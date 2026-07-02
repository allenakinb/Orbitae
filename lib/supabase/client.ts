import { createClient } from "@supabase/supabase-js";

// Browser Supabase client. Uses only the public anon key + project URL from
// NEXT_PUBLIC_* env. Row-Level Security (see supabase/policies.sql) is what
// actually protects the data — the anon key is safe to ship to the client.
// Strip whitespace and accidental wrapping quotes — the usual paste errors
// when setting env vars in the Vercel dashboard.
const clean = (v?: string) => v?.trim().replace(/^["']|["']$/g, "");

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (set them in .env.local locally, or in Project Settings → Environment Variables on Vercel)",
  );
}
if (!/^https?:\/\//.test(url)) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL must start with https:// — got "${url}"`,
  );
}

export const supabase = createClient(url, anonKey);
