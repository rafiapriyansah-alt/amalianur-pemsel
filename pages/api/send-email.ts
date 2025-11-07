import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nama, jenjang, telepon, email, total_biaya, umur } = req.body;

    // === 1️⃣ Ambil email admin dari tabel pengaturan_pendaftaran ===
    const { data: pengaturan, error: pengaturanError } = await supabase
      .from("pengaturan_pendaftaran")
      .select("email_notifikasi")
      .limit(1)
      .single();

    if (pengaturanError || !pengaturan?.email_notifikasi) {
      console.error("Gagal ambil email admin:", pengaturanError);
      return res.status(500).json({ error: "Email admin tidak ditemukan di database." });
    }

    const adminEmail = pengaturan.email_notifikasi;

    // === 2️⃣ Buat isi email otomatis ===
    const subject = `Pendaftar Baru: ${nama} (${jenjang || "-"})`;
    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>📋 Data Pendaftar Baru</h2>
        <p>Halo Admin Yayasan Amalinaur,</p>
        <p>Ada pendaftar baru yang mengisi formulir:</p>

        <ul>
          <li><strong>Nama:</strong> ${nama}</li>
          <li><strong>Umur:</strong> ${umur || "-"}</li>
          <li><strong>Jenjang:</strong> ${jenjang || "-"}</li>
          <li><strong>Telepon:</strong> ${telepon || "-"}</li>
          <li><strong>Email:</strong> ${email || "-"}</li>
          <li><strong>Total Biaya:</strong> Rp${Number(total_biaya).toLocaleString("id-ID")}</li>
        </ul>

        <p>Silakan login ke dashboard admin untuk melihat detail lengkap.</p>

        <hr />
        <p style="font-size: 13px; color: #777;">Email ini dikirim otomatis oleh sistem Yayasan Amalinaur.</p>
      </div>
    `;

    // === 3️⃣ Kirim email pakai Resend ===
    const { data, error } = await resend.emails.send({
      from: "Yayasan Amalinaur <onboarding@resend.dev>",
      to: adminEmail,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Gagal mengirim email notifikasi." });
    }

    console.log(`✅ Email notifikasi berhasil dikirim ke ${adminEmail}`);
    return res.status(200).json({ success: true, data });

  } catch (error: any) {
    console.error("Send notification error:", error);
    return res.status(500).json({ error: error.message });
  }
}
