"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { useRequireRole } from "../../hooks/useRequireRole";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  useRequireRole(["super_admin"]);
  const supabase = getSupabase();

  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();

    // Realtime listener untuk sinkronisasi langsung
    const settingsSub = supabase
      .channel("settings-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(settingsSub);
    };
  }, []);

  async function load() {
    const { data } = await supabase.from("settings").select("*").single();
    if (data) setSettings(data);

    const { data: logData } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setLogs(logData ?? []);
  }

  // 🧩 Upload handler (logo, footer, favicon, meta image)
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`settings/${fileName}`, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;

      // Simpan ke database
      await supabase
        .from("settings")
        .update({ [field]: url, updated_at: new Date() })
        .eq("id", settings.id);

      await supabase.from("activity_logs").insert({
        actor: "Super Admin",
        action: "Upload",
        details: `Mengubah ${field} di Settings`,
      });

      load();
    } catch (err: any) {
      alert(err.message || "Gagal mengupload file.");
    } finally {
      setLoading(false);
    }
  }

  // 🧹 Hapus gambar tertentu
  async function handleDeleteImage(field: string) {
    if (!confirm("Hapus gambar ini?")) return;
    await supabase.from("settings").update({ [field]: null }).eq("id", settings.id);
    await supabase.from("activity_logs").insert({
      actor: "Super Admin",
      action: "Delete",
      details: `Menghapus ${field} di Settings`,
    });
    load();
  }

  // ✏️ Update teks langsung (inline)
  async function saveText(field: string, value: string) {
    await supabase
      .from("settings")
      .update({ [field]: value, updated_at: new Date() })
      .eq("id", settings.id);

    await supabase.from("activity_logs").insert({
      actor: "Super Admin",
      action: "Update",
      details: `Mengubah ${field} menjadi "${value}"`,
    });

    load();
  }

  // 🗑️ Hapus semua log aktivitas
  async function clearLogs() {
    if (!confirm("Hapus semua log aktivitas?")) return;
    await supabase.from("activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    load();
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-green-800">⚙️ Pengaturan Website</h2>

        {/* =============================== */}
        {/* A. Identitas Website */}
        {/* =============================== */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            A. Identitas Website
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Nama Situs</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={settings.site_name || ""}
                onChange={(e) => saveText("site_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Tagline</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={settings.site_tagline || ""}
                onChange={(e) => saveText("site_tagline", e.target.value)}
              />
            </div>
          </div>

          {/* 🔹 Upload Logo/Favicon */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* Logo Navbar */}
            <div>
              <label className="block mb-1 font-medium">Logo Navbar</label>
              <div className="relative inline-block">
                <input
                  type="file"
                  onChange={(e) => handleUpload(e, "logo_url")}
                  disabled={loading}
                />
                {settings.logo_url && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={settings.logo_url}
                      className="w-24 rounded border"
                      alt="Logo Navbar"
                    />
                    <button
                      onClick={() => handleDeleteImage("logo_url")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Sidebar (untuk Sidebar Admin) */}
<div>
  <label className="block mb-1 font-medium">Logo Sidebar Admin</label>
  <div className="relative inline-block">
    <input
      type="file"
      onChange={(e) => handleUpload(e, "sidebar_logo")}
      disabled={loading}
    />
    {settings.sidebar_logo && (
      <div className="mt-2 relative inline-block">
        <img
          src={settings.sidebar_logo}
          className="w-24 rounded border"
          alt="Logo Sidebar Admin"
        />
        <button
          onClick={() => handleDeleteImage("sidebar_logo")}
          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )}
  </div>
</div>


            {/* Logo Footer */}
            <div>
              <label className="block mb-1 font-medium">Logo Footer</label>
              <div className="relative inline-block">
                <input
                  type="file"
                  onChange={(e) => handleUpload(e, "footer_logo")}
                  disabled={loading}
                />
                {settings.footer_logo && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={settings.footer_logo}
                      className="w-24 rounded border"
                      alt="Logo Footer"
                    />
                    <button
                      onClick={() => handleDeleteImage("footer_logo")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block mb-1 font-medium">Favicon</label>
              <div className="relative inline-block">
                <input
                  type="file"
                  onChange={(e) => handleUpload(e, "favicon_url")}
                  disabled={loading}
                />
                {settings.favicon_url && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={settings.favicon_url}
                      className="w-10 rounded border"
                      alt="Favicon"
                    />
                    <button
                      onClick={() => handleDeleteImage("favicon_url")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =============================== */}
        {/* D. Meta SEO & Branding */}
        {/* =============================== */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            D. Meta SEO & Branding
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Meta Title</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={settings.meta_title || ""}
                onChange={(e) => saveText("meta_title", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Meta Author</label>
              <input
                type="text"
                className="border p-2 rounded w-full"
                value={settings.meta_author || ""}
                onChange={(e) => saveText("meta_author", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-1 font-medium">Meta Description</label>
            <textarea
              className="border p-2 rounded w-full"
              value={settings.meta_description || ""}
              onChange={(e) => saveText("meta_description", e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block mb-1 font-medium">Meta Keywords</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={settings.meta_keywords || ""}
              onChange={(e) => saveText("meta_keywords", e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block mb-1 font-medium">Gambar Meta (SEO Preview)</label>
            <div className="relative inline-block">
              <input
                type="file"
                onChange={(e) => handleUpload(e, "meta_image")}
                disabled={loading}
              />
              {settings.meta_image && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={settings.meta_image}
                    className="w-48 rounded border"
                    alt="Meta SEO Preview"
                  />
                  <button
                    onClick={() => handleDeleteImage("meta_image")}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =============================== */}
        {/* E. Log Aktivitas */}
        {/* =============================== */}
        <section>
          <h3 className="text-lg font-semibold text-green-700 mb-4">
            E. Riwayat Aktivitas
          </h3>
          <button
            onClick={clearLogs}
            className="bg-red-600 text-white px-4 py-2 rounded mb-4 hover:bg-red-700"
          >
            🗑️ Hapus Semua Log
          </button>

          <div className="border rounded overflow-auto max-h-64">
            <table className="min-w-full text-sm">
              <thead className="bg-green-100 text-green-800">
                <tr>
                  <th className="p-2 text-left">Tanggal</th>
                  <th className="p-2 text-left">Aktor</th>
                  <th className="p-2 text-left">Aksi</th>
                  <th className="p-2 text-left">Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.length ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-green-50">
                      <td className="p-2">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2">{log.actor}</td>
                      <td className="p-2">{log.action}</td>
                      <td className="p-2">{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Belum ada aktivitas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
