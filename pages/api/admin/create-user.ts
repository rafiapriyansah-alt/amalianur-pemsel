// pages/api/admin/create-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password = null, full_name, role = "admin" } = req.body;

  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    // create user in Supabase Auth
    const { data: user, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password, // optional; if null, you may generate random and email it
      email_confirm: true,
    });

    if (authErr) throw authErr;

    // insert profile into public.users table (or profiles) with same id
    const userId = user.user?.id;
    const { error: dbErr } = await supabaseAdmin.from("users").upsert({
      id: userId,
      email,
      name: full_name,
      role,
      created_at: new Date().toISOString(),
    });

    if (dbErr) throw dbErr;

    // insert audit log using helper
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userId,
      user_email: email,
      action: "create_user",
      target_table: "users",
      details: { created_by: "super_admin_api" },
    });

    return res.status(200).json({ ok: true, userId });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
