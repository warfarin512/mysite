import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = url.length > 0 && anonKey.length > 0;

// createClient() throws synchronously on an invalid URL, which would crash the
// static export build before secrets are configured. Fall back to a placeholder
// so the app can still render (and show the "not configured" message).
export const supabase = createClient(
  supabaseConfigured ? url : "https://placeholder.supabase.co",
  supabaseConfigured ? anonKey : "placeholder-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true } }
);
