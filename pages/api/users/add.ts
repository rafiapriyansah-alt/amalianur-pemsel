// ✅ pages/api/users/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, password, name, role, actor } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ success: false, message: "⚠️ Semua field wajib diisi." });
    }

    // 🔹 1. Buat user di sistem Auth Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) {
      console.error("❌ Auth Error:", authError);
      throw new Error(authError.message || "Gagal membuat user di Supabase Auth");
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error("Gagal mendapatkan ID user dari Supabase Auth");

    // 🔹 2. Simpan juga ke tabel public.users untuk dashboard
    const { error: dbError } = await supabaseAdmin.from("users").upsert([
      {
        id: userId,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      console.error("❌ DB Error:", dbError);
      throw new Error(dbError.message || "Gagal menambahkan user ke tabel users");
    }

    // 🔹 3. Catat log aktivitas (opsional)
    await supabaseAdmin.from("activity_logs").insert([
      {
        actor: actor || "Super Admin",
        action: "Create User",
        details: `Menambahkan user ${name} (${email}) sebagai ${role}`,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "✅ User berhasil dibuat dan bisa login ke sistem.",
    });
  } catch (err: any) {
    console.error("🔥 Error adding user:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat menambahkan user.",
    });
  }
}
