// ✅ pages/api/users/add.ts — versi cepat & aman
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase Admin Client dibuat sekali (di luar handler)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, password, name, role, actor } = req.body;

    // ✅ Validasi cepat
    if (!email?.trim() || !password?.trim() || !name?.trim() || !role?.trim()) {
      return res.status(400).json({ success: false, message: "⚠️ Semua field wajib diisi." });
    }

    // ✅ 1. Buat user di Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });

    if (authError) {
      console.error("❌ Auth Error:", authError);
      return res.status(400).json({
        success: false,
        message: authError.message || "Gagal membuat user di Supabase Auth",
      });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengambil ID user" });
    }

    // ✅ 2. Upsert ke tabel users (CEPAT)
    const dbPromise = supabaseAdmin.from("users").upsert({
      id: userId,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
    });

    // ✅ 3. Log aktivitas (jalan paralel)
    const logPromise = supabaseAdmin.from("activity_logs").insert({
      actor: actor || "Super Admin",
      action: "Create User",
      details: `Menambahkan user ${name} (${email}) sebagai ${role}`,
      created_at: new Date().toISOString(),
    });

    // ✅ MENUNGGU KEDUA PROSES SECARA PARALEL (lebih cepat)
    const [dbResult, logResult] = await Promise.all([dbPromise, logPromise]);

    if (dbResult.error) {
      console.error("❌ DB Error:", dbResult.error);
      return res.status(500).json({
        success: false,
        message: dbResult.error.message || "Gagal menambahkan user ke database.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ User berhasil dibuat dan tercatat.",
    });
  } catch (err: any) {
    console.error("🔥 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan server.",
    });
  }
}
