// ✅ lib/supabaseServerClient.ts — versi server-side, ringan & aman
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Ganti ke public URL (available di server)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Secret key dari Supabase dashboard > Settings > API

// ✅ Validasi environment variable (mirip client-mu, tapi server-side)
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "[Supabase Server] ❌ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check .env.local."
  );
}

// ✅ Singleton Supabase Server Client (hindari multiple instances per request)
let supabaseServerClient: SupabaseClient | null = null;

function createServerSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    // No realtime di server—fokus query cepat
    realtime: {
      params: {},
    },
  });
}

export function getServerSupabase(): SupabaseClient {
  if (!supabaseServerClient) {
    supabaseServerClient = createServerSupabaseClient();
  }
  return supabaseServerClient;
}

// ✅ Ekspor instance langsung untuk kemudahan (sama seperti client-mu)
export const supabaseServer = getServerSupabase();