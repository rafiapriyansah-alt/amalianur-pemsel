"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { useRequireRole } from "../../hooks/useRequireRole";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function AdminKB() {
  useRequireRole(["super_admin", "admin", "editor"]);
  const supabase = getSupabase();

  const [form, setForm] = useState<any>({
    slug: "kb",
    title: "Kelompok Bermain Amalianur",
    logo_url: "",
    headmaster: "",
    headmaster_photo: "",
    teachers_count: 0,
    students_count: 0,
    programs: [] as string[],
    extracurricular: [] as string[],
    gallery: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  // =====================================================
  // 🔹 Ambil Data Awal
  // =====================================================
  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("kb")
      .select("*")
      .eq("slug", "kb")
      .single();

    if (error) {
      console.warn("Load KB error:", error.message);
      return;
    }
    if (data) {
      data.programs = data.programs ?? [];
      data.extracurricular = data.extracurricular ?? [];
      data.gallery = data.gallery ?? [];
      setForm(data);
    }
  }

  // =====================================================
  // 🔹 Upload ke Storage Supabase
  // =====================================================
  async function uploadToBucket(file: File) {
    const filePath = `kb/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: pub } = supabase.storage.from("images").getPublicUrl(filePath);
    return pub.publicUrl;
  }

  // =====================================================
  // 🔹 Upload tunggal (logo, foto kepala, dll)
  // =====================================================
  async function handleSingleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadToBucket(file);
      setForm((f: any) => ({ ...f, [key]: url }));
    } catch (err: any) {
      alert("Upload gagal: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // 🔹 Upload galeri (multi)
  // =====================================================
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadToBucket(file);
      setForm((f: any) => ({
        ...f,
        gallery: [...(f.gallery || []), url],
      }));
    } catch (err: any) {
      alert("Upload gagal: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  function removeGallery(i: number) {
    setForm((f: any) => ({
      ...f,
      gallery: f.gallery.filter((_: string, idx: number) => idx !== i),
    }));
  }

  // =====================================================
  // 🔹 Simpan ke Database
  // =====================================================
  async function save() {
    try {
      setLoading(true);
      const payload = { ...form, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from("kb")
        .upsert(payload, { onConflict: "slug" });
      if (error) throw error;
      alert("✅ Berhasil disimpan!");
    } catch (err: any) {
      alert("❌ Gagal menyimpan: " + (err.message ?? err));
    } finally {
      setLoading(false);
      load();
    }
  }

  // =====================================================
  // 🔹 UI Halaman Admin
  // =====================================================
  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-8">
        <h2 className="text-3xl font-semibold text-green-700 border-b pb-2">
          Kelola Halaman KB (Kelompok Bermain)
        </h2>

        {/* Logo KB */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Logo KB Amalianur
          </h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleSingleUpload(e, "logo_url")}
          />
          {form.logo_url && (
            <img
              src={form.logo_url}
              alt="Logo KB"
              className="mt-3 w-24 h-24 object-contain rounded shadow"
            />
          )}
        </section>

        {/* Kepala Sekolah */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Kepala Kelompok Bermain
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Kepala KB"
              value={form.headmaster || ""}
              onChange={(e) =>
                setForm({ ...form, headmaster: e.target.value })
              }
              className="border p-2 rounded"
            />
            <div>
              <label className="block text-sm text-gray-600">
                Foto Kepala KB
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleUpload(e, "headmaster_photo")}
              />
              {form.headmaster_photo && (
                <img
                  src={form.headmaster_photo}
                  alt="Kepala KB"
                  className="mt-2 w-40 h-40 object-cover rounded shadow"
                />
              )}
            </div>
          </div>
        </section>

        {/* Statistik */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Statistik KB
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Jumlah Guru"
              value={form.teachers_count || 0}
              onChange={(e) =>
                setForm({ ...form, teachers_count: parseInt(e.target.value) })
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Jumlah Siswa"
              value={form.students_count || 0}
              onChange={(e) =>
                setForm({ ...form, students_count: parseInt(e.target.value) })
              }
              className="border p-2 rounded"
            />
          </div>
        </section>

        {/* Program Unggulan */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Program Unggulan
          </h3>
          {form.programs.map((p: string, i: number) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={p}
                onChange={(e) => {
                  const newPrograms = [...form.programs];
                  newPrograms[i] = e.target.value;
                  setForm({ ...form, programs: newPrograms });
                }}
                className="border p-2 rounded flex-1"
              />
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    programs: form.programs.filter((_: any, idx: number) => idx !== i),
                  })
                }
                className="bg-red-500 text-white px-3 rounded"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setForm({ ...form, programs: [...form.programs, ""] })
            }
            className="bg-green-600 text-white px-4 py-1 rounded mt-2 flex items-center gap-2"
          >
            <FaPlus /> Tambah Program
          </button>
        </section>

        {/* Ekstrakurikuler */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Ekstrakurikuler
          </h3>
          {form.extracurricular.map((p: string, i: number) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={p}
                onChange={(e) => {
                  const newList = [...form.extracurricular];
                  newList[i] = e.target.value;
                  setForm({ ...form, extracurricular: newList });
                }}
                className="border p-2 rounded flex-1"
              />
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    extracurricular: form.extracurricular.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  })
                }
                className="bg-red-500 text-white px-3 rounded"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setForm({ ...form, extracurricular: [...form.extracurricular, ""] })
            }
            className="bg-green-600 text-white px-4 py-1 rounded mt-2 flex items-center gap-2"
          >
            <FaPlus /> Tambah Ekstrakurikuler
          </button>
        </section>

        {/* Galeri */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">Galeri</h3>
          <input type="file" accept="image/*" onChange={handleGalleryUpload} />
          <div className="flex flex-wrap gap-3 mt-3">
            {(form.gallery || []).map((u: string, i: number) => (
              <div key={i} className="relative">
                <img
                  src={u}
                  alt={`Galeri-${i}`}
                  className="w-32 h-24 object-cover rounded shadow"
                />
                <button
                  onClick={() => removeGallery(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tombol Simpan */}
        <div className="text-right pt-4 border-t">
          <button
            onClick={save}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
