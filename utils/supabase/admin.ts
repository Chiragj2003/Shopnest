import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client with the secret key. Bypasses RLS — every caller MUST
// verify Clerk auth() and scope queries to that seller id before writing.
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret || secret.includes("REPLACE_ME")) {
    throw new Error("SUPABASE_SECRET_KEY is not configured in .env.local");
  }
  return createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
