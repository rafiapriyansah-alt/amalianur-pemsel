"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";

interface AboutData {
  id?: string;
  title: string;
  content: string;
  vision: string;
  mission: string;
  values: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface UploadResult {
  publicUrl: string;
  path: string;
}

export default function AdminAbout() {
  const supabase = getSupabase();
  const [form, setForm] = useState<AboutData>({
    id: "",
    title: "",
    content: "",
    vision: "",
    mission: "",
    values: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil data awal
  async function loadData() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("about").select("*").limit(1).single();
      
      if (error) throw error;
      if (data) {
        setForm({
          id: data.id || "",
          title: data.title || "",
          content: data.content || "",
          vision: data.vision || "",
          mission: data.mission || "",
          values: data.values || "",
          image_url: data.image_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading about data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Listener realtime supaya halaman publik ikut update otomatis
    const channel = supabase
      .channel("about-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "about" },
        loadData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Upload gambar
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const uploaded = await uploadImageFile(file, "about");
      
      // Handle both string and object return types
      if (uploaded) {
        let imageUrl: string;
        if (typeof uploaded === 'string') {
          imageUrl = uploaded;
        } else {
          imageUrl = (uploaded as UploadResult).publicUrl;
        }
        setForm({ ...form, image_url: imageUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("❌ Gagal mengupload gambar");
    }
  }

  // Simpan perubahan
  async function handleSave() {
    if (!form.title.trim()) {
      alert("❌ Judul harus diisi");
      return;
    }

    setSaving(true);
    try {
      const aboutData = {
        ...form,
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (form.id) {
        // Update existing data
        const result = await supabase
          .from("about")
          .update(aboutData)
          .eq("id", form.id);
        error = result.error;
      } else {
        // Insert new data
        const result = await supabase
          .from("about")
          .insert([aboutData])
          .select();
        error = result.error;
        
        // Update form with new ID if inserted
        if (result.data && result.data[0]) {
          setForm(prev => ({ ...prev, id: result.data![0].id }));
        }
      }

      if (error) throw error;
      alert("✅ Data berhasil disimpan!");
    } catch (error: any) {
      console.error("Error saving about data:", error);
      alert("❌ Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
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
              <label className="font-semibold block mb-2">Judul</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan judul tentang yayasan"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Deskripsi</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border rounded-lg p-2 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                placeholder="Tulis deskripsi tentang yayasan"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Visi</label>
              <textarea
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                placeholder="Tulis visi yayasan"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Misi</label>
              <textarea
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                placeholder="Tulis misi yayasan"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Nilai-Nilai Yayasan</label>
              <textarea
                value={form.values}
                onChange={(e) => setForm({ ...form, values: e.target.value })}
                className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                placeholder="Tulis nilai-nilai yayasan"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Gambar Yayasan</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {form.image_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview Gambar:</p>
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full rounded-xl shadow-md max-h-64 object-cover border"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>

          {/* PREVIEW */}
          <div className="bg-gray-50 border rounded-xl p-5 shadow-inner">
            <h3 className="text-lg font-bold text-green-700 mb-3">
              Preview Halaman Publik
            </h3>
            
            {form.title ? (
              <h4 className="font-semibold text-xl mb-1">{form.title}</h4>
            ) : (
              <p className="text-gray-500 italic">Judul akan muncul di sini</p>
            )}
            
            {form.content ? (
              <p className="text-gray-700 mb-3">{form.content}</p>
            ) : (
              <p className="text-gray-500 italic mb-3">Deskripsi akan muncul di sini</p>
            )}

            {form.image_url && (
              <img
                src={form.image_url}
                className="rounded-xl w-full max-h-64 object-cover mb-3"
                alt="Gambar Yayasan"
              />
            )}

            <div className="space-y-2">
              {form.vision && (
                <p>
                  <b>Visi:</b> {form.vision}
                </p>
              )}
              {form.mission && (
                <p>
                  <b>Misi:</b> {form.mission}
                </p>
              )}
              {form.values && (
                <p>
                  <b>Nilai-Nilai:</b> {form.values}
                </p>
              )}
              
              {!form.vision && !form.mission && !form.values && (
                <p className="text-gray-500 italic">Visi, misi, dan nilai-nilai akan muncul di sini</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}