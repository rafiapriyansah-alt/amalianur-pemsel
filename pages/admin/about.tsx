"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";

export default function AdminAbout() {
  const supabase = getSupabase();
  const [form, setForm] = useState({
    id: "",
    title: "",
    content: "",
    vision: "",
    mission: "",
    values: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);

  // Ambil data awal
  async function loadData() {
    const { data } = await supabase.from("about").select("*").limit(1).single();
    if (data) setForm(data);
  }

  useEffect(() => {
    loadData();

    // Listener realtime supaya halaman publik ikut update otomatis
    const channel = supabase
      .channel("about-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "about" },
        () => loadData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Upload gambar
  async function handleUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImageFile(file, "about");
    if (url) setForm({ ...form, image_url: url });
  }

  // Simpan perubahan
  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("about")
      .upsert({ ...form, updated_at: new Date() }, { onConflict: "id" });

    setSaving(false);
    if (error) alert("❌ Gagal menyimpan: " + error.message);
    else alert("✅ Data berhasil disimpan!");
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Tentang Yayasan Amalianur
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Judul</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="font-semibold">Deskripsi</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border rounded-lg p-2 h-24 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="font-semibold">Visi</label>
              <textarea
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="font-semibold">Misi</label>
              <textarea
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="font-semibold">Nilai-Nilai Yayasan</label>
              <textarea
                value={form.values}
                onChange={(e) => setForm({ ...form, values: e.target.value })}
                className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="font-semibold">Gambar Yayasan</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="mt-1"
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="mt-3 w-full rounded-xl shadow-md max-h-64 object-cover border"
                />
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow mt-4 transition-all"
            >
              {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>

          {/* PREVIEW */}
          <div className="bg-gray-50 border rounded-xl p-5 shadow-inner">
            <h3 className="text-lg font-bold text-green-700 mb-3">
              Preview Halaman Publik
            </h3>
            <h4 className="font-semibold text-xl mb-1">{form.title}</h4>
            <p className="text-gray-700 mb-3">{form.content}</p>

            {form.image_url && (
              <img
                src={form.image_url}
                className="rounded-xl w-full max-h-64 object-cover mb-3"
              />
            )}

            <p>
              <b>Visi:</b> {form.vision}
            </p>
            <p>
              <b>Misi:</b> {form.mission}
            </p>
            <p>
              <b>Nilai-Nilai:</b> {form.values}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
