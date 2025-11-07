import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// ✅ Gunakan koneksi admin (dengan Service Role Key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { id, actor } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID user wajib dikirim." });
    }

    // 🔹 1️⃣ Hapus dari auth.users (Supabase Authentication)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error("⚠️ Auth deletion error:", authError);
      // Tidak langsung throw agar tetap lanjut hapus dari tabel users
    }

    // 🔹 2️⃣ Hapus dari tabel public.users
    const { error: dbError } = await supabaseAdmin.from("users").delete().eq("id", id);
    if (dbError) {
      console.error("⚠️ DB deletion error:", dbError);
      throw new Error("Gagal menghapus user dari tabel users.");
    }

    // 🔹 3️⃣ Catat log aktivitas (opsional)
    await supabaseAdmin.from("activity_logs").insert([
      {
        actor: actor || "Super Admin",
        action: "Delete User",
        details: `Menghapus user dengan ID ${id}`,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "✅ User berhasil dihapus dari sistem dan authentication.",
    });
  } catch (err: any) {
    console.error("🔥 Error deleting user:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Terjadi kesalahan saat menghapus user.",
    });
  }
}
