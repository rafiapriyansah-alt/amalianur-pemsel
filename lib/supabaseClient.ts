// ✅ lib/supabaseClient.ts — versi paling ringan & cepat
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Validasi environment variable saat development
if (typeof window !== "undefined") {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "[Supabase] ⚠️ Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
}

// ✅ Singleton Supabase Client (hindari multiple instances)
let supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      
      // ✅ Tidak perlu detectSessionInUrl karena kamu tidak pakai OAuth
      detectSessionInUrl: false,
    },

    // ✅ Tidak perlu menaikkan frekuensi update realtime
    // Default lebih ringan & cepat
    realtime: {
      params: {},
    },
  });
}

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// ✅ Ekspor instance langsung untuk backward compatibility
// TIDAK membuat instance baru, hanya menggunakan singleton yang sama
export const supabase = getSupabase();