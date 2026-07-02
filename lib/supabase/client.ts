import { createClient } from "@supabase/supabase-js";

// Browser Supabase client. Uses only the public anon key + project URL from
// NEXT_PUBLIC_* env. Row-Level Security (see supabase/policies.sql) is what
// actually protects the data — the anon key is safe to ship to the client.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
  );
}

export const supabase = createClient(url, anonKey);
