import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cookie-less anonymous client for public reads / RLS-allowed public inserts
// (storefront fetches, click logging). Safe on server and during build.
export const createPublicClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
