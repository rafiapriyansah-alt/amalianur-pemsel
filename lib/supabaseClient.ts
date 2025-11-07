// lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Ambil environment variable dari .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Validasi agar tidak error saat build
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (typeof window !== "undefined") {
    console.warn(
      "[Supabase] ⚠️ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
}

// Supabase client tunggal (singleton pattern)
let client: SupabaseClient | null = null;

/**
 * Pastikan hanya ada satu instance Supabase di seluruh aplikasi.
 * Ini mencegah multiple connections saat Fast Refresh di dev mode.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true, // biar user login nggak ke-reset saat refresh
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 10 }, // supaya realtime stabil
      },
    });
  }
  return client;
}

// export default (opsional)
export const supabase = getSupabase();
