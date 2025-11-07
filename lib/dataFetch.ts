// lib/dataFetch.ts
import { supabase } from "./supabaseClient";

export async function getNews() {
  const { data } = await supabase.from("news").select("*").order("date", { ascending: false });
  return data || [];
}

export async function getTestimonials() {
  const { data } = await supabase.from("testimonials").select("*");
  return data || [];
}

export async function getMts() {
  const { data } = await supabase.from("mts").select("*").limit(1).single();
  return data;
}

export async function getTk() {
  const { data } = await supabase.from("tk").select("*").limit(1).single();
  return data;
}

export async function getHomeContent() {
  const { data } = await supabase.from("home_content").select("*").limit(1).single();
  return data;
}
