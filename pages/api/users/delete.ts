// ✅ pages/api/users/delete.ts — versi cepat, aman, tanpa ubah sistem
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// ✅ Buat Supabase Admin Client (hanya 1x, super cepat)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { id, actor } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "ID user wajib dikirim.",
      });
    }

    // ✅ Jalankan semua operasi secara paralel (lebih cepat)
    const deleteAuth = supabaseAdmin.auth.admin.deleteUser(id);
    const deleteDB = supabaseAdmin.from("users").delete().eq("id", id);

    const logInsert = supabaseAdmin.from("activity_logs").insert({
      actor: actor || "Super Admin",
      action: "Delete User",
      details: `Menghapus user ${id}`,
      created_at: new Date().toISOString(),
    });

    // ✅ Tunggu semuanya selesai (paralel, bukan berurutan)
    const [authResult, dbResult] = await Promise.all([deleteAuth, deleteDB, logInsert]);

    if (dbResult.error) {
      console.error("❌ DB Error:", dbResult.error);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus user dari database.",
      });
    }

    // Auth error tidak menghalangi, hanya dicatat
    if (authResult.error) {
      console.warn("⚠️ Auth deletion error:", authResult.error.message);
    }

    return res.status(200).json({
      success: true,
      message: "✅ User berhasil dihapus dari sistem.",
    });
  } catch (err: any) {
    console.error("🔥 Delete error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat menghapus user.",
    });
  }
}
