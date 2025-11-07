// lib/auth.ts
import { getSupabase } from "./supabaseClient";

export async function signInEmail(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const res = await supabase.auth.signInWithPassword({ email, password });
  return res;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  return supabase.auth.signOut();
}

/** Fetch role from admin/users table by email */
export async function fetchRoleByEmail(email: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("users").select("role").eq("email", email).single();
  if (error) return null;
  return data?.role ?? null;
}
