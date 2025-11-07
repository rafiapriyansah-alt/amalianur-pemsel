"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function LoginSettings() {
  const supabase = getSupabase();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  // 🔹 Load settings dari Supabase
  async function loadSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("login_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    if (error || !data) {
      // kalau belum ada row, buat default
      await supabase.from("login_settings").insert({
        id: "00000000-0000-0000-0000-000000000001",
        background_image: "",
        logo_image: "",
        title: "Login Dashboard Amalianur",
        subtitle: "Yayasan Pendidikan Islam Terpadu",
      });
      const { data: newData } = await supabase
        .from("login_settings")
        .select("*")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();
      setSettings(newData);
    } else {
      setSettings(data);
    }
    setLoading(false);
  }

  // 🔹 Upload image (logo atau background)
  async function handleUpload(e: any, key: string) {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `login/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });
    if (error) {
      toast.error("Upload gagal: " + error.message);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    const url = urlData.publicUrl;
    const updated = { ...settings, [key]: url };
    setSettings(updated);

    await saveSettings(updated);
  }

  // 🔹 Simpan perubahan text atau image
  async function saveSettings(payload = settings) {
    const { error } = await supabase.from("login_settings").upsert({
      id: "00000000-0000-0000-0000-000000000001", // pastikan ID tetap
      ...payload,
      updated_at: new Date(),
    });

    if (error) toast.error("Gagal menyimpan: " + error.message);
    else toast.success("✅ Berhasil disimpan!");
    await loadSettings();
  }

  if (loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-green-700 border-b pb-2">
           Pengaturan Halaman Login
        </h2>

        {/* Upload Gambar Background */}
        <section>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Gambar Latar Belakang
          </h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e, "background_image")}
            className="border p-2 rounded w-full"
          />
          {settings?.background_image && (
            <Image
              src={`${settings.background_image}?v=${Date.now()}`}
              alt="Background Preview"
              width={500}
              height={280}
              className="mt-3 rounded shadow-md object-cover"
            />
          )}
        </section>

        {/* Upload Logo */}
        <section>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Logo</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e, "logo_image")}
            className="border p-2 rounded w-full"
          />
          {settings?.logo_image && (
            <Image
              src={`${settings.logo_image}?v=${Date.now()}`}
              alt="Logo Preview"
              width={200}
              height={200}
              className="mt-3 rounded shadow-md object-contain bg-gray-50 p-3"
            />
          )}
        </section>

        {/* Text Title dan Subtitle */}
        <section className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Judul Halaman
            </label>
            <input
              type="text"
              value={settings?.title || ""}
              onChange={(e) =>
                setSettings({ ...settings, title: e.target.value })
              }
              onBlur={() => saveSettings()}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Sub Judul
            </label>
            <input
              type="text"
              value={settings?.subtitle || ""}
              onChange={(e) =>
                setSettings({ ...settings, subtitle: e.target.value })
              }
              onBlur={() => saveSettings()}
              className="border p-2 rounded w-full"
            />
          </div>
        </section>

        {/* Tombol Simpan */}
        <div className="text-right pt-4 border-t mt-4">
          <button
            onClick={() => saveSettings()}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition"
          >
             Simpan Perubahan
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
