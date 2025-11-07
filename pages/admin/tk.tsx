"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { useRequireRole } from "../../hooks/useRequireRole";
import { X } from "lucide-react";

export default function AdminTK() {
  useRequireRole(["super_admin", "admin", "editor"]);
  const supabase = getSupabase();

  const [form, setForm] = useState({
    title: "Taman Kanak-Kanak Amalianur",
    logo_url: "",
    headmaster: "",
    headmaster_photo: "",
    teachers_count: 0,
    students_count: 0,
    programs: "",
    extracurricular: "",
    gallery: [] as string[],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingHead, setUploadingHead] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    console.log("🔄 Loading TK data...");
    const { data, error } = await supabase
      .from("tk")
      .select("*")
      .eq("slug", "tk")
      .single();

    console.log("📥 Data response:", { data, error });
    
    if (data) {
      setForm({
        title: data.title || "Taman Kanak-Kanak Amalianur",
        logo_url: data.logo_url || "",
        headmaster: data.headmaster || "",
        headmaster_photo: data.headmaster_photo || "",
        teachers_count: data.teachers_count || 0,
        students_count: data.students_count || 0,
        programs: data.programs?.join(", ") || "",
        extracurricular: data.extracurricular?.join(", ") || "",
        gallery: data.gallery || [],
      });
      console.log("✅ Form updated with:", data);
    } else {
      console.error("❌ Error loading data:", error);
    }
  }

  // Fungsi upload image yang konsisten
  async function uploadImage(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}-${Date.now()}.${fileExt}`;
    const filePath = `tk/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  // Update database dengan slug
  async function updateField(field: string, value: any) {
    console.log(`🔄 Updating ${field}:`, value);
    
    const { error } = await supabase
      .from("tk")
      .update({ 
        [field]: value,
        updated_at: new Date().toISOString()
      })
      .eq("slug", "tk");

    if (error) {
      console.error(`❌ Failed to update ${field}:`, error);
      throw error;
    }
    
    console.log(`✅ Successfully updated ${field}`);
  }

  // 🖼 Upload logo TK
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);

    try {
      const publicUrl = await uploadImage(file, "logo");
      
      // Update form state
      setForm(prev => ({ ...prev, logo_url: publicUrl }));
      
      // Update database
      await updateField("logo_url", publicUrl);

      console.log("✅ Logo uploaded:", publicUrl);
      
    } catch (error: any) {
      console.error("❌ Error upload logo:", error);
      alert("Gagal upload logo: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  // 🖼 Upload foto kepala sekolah
  async function handleHeadmasterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingHead(true);

    try {
      const publicUrl = await uploadImage(file, "headmaster");
      
      setForm(prev => ({ ...prev, headmaster_photo: publicUrl }));
      await updateField("headmaster_photo", publicUrl);

      console.log("✅ Headmaster photo uploaded:", publicUrl);
      
    } catch (error: any) {
      console.error("❌ Error upload headmaster photo:", error);
      alert("Gagal upload foto kepala sekolah: " + error.message);
    } finally {
      setUploadingHead(false);
    }
  }

  // 🖼 Upload galeri
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const newGalleryUrls: string[] = [];

      for (const file of Array.from(files)) {
        const publicUrl = await uploadImage(file, "gallery");
        newGalleryUrls.push(publicUrl);
      }

      const updatedGallery = [...form.gallery, ...newGalleryUrls];
      setForm({ ...form, gallery: updatedGallery });
      await updateField("gallery", updatedGallery);

      console.log("✅ Gallery uploaded:", newGalleryUrls);
      
    } catch (error: any) {
      console.error("❌ Error upload gallery:", error);
      alert("Gagal upload gambar galeri: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  // 🗑 Hapus gambar galeri
  async function handleDeleteGallery(index: number) {
    const updated = form.gallery.filter((_, i) => i !== index);
    setForm({ ...form, gallery: updated });
    
    try {
      await updateField("gallery", updated);
    } catch (error: any) {
      console.error("❌ Failed to delete image:", error.message);
      alert("Gagal menghapus gambar: " + error.message);
    }
  }

  async function save() {
    try {
      const payload = {
        title: form.title,
        headmaster: form.headmaster,
        headmaster_photo: form.headmaster_photo,
        teachers_count: Number(form.teachers_count),
        students_count: Number(form.students_count),
        programs: form.programs.split(",").map((p) => p.trim()).filter(p => p !== ""),
        extracurricular: form.extracurricular.split(",").map((e) => e.trim()).filter(e => e !== ""),
        gallery: form.gallery,
        logo_url: form.logo_url,
        updated_at: new Date().toISOString(),
      };

      console.log("💾 Saving payload:", payload);

      const { error } = await supabase
        .from("tk")
        .update(payload)
        .eq("slug", "tk");
      
      if (error) {
        console.error("❌ Save error:", error);
        alert("❌ Gagal menyimpan: " + error.message);
      } else {
        alert("✅ Data TK berhasil disimpan!");
        loadData();
      }
    } catch (error: any) {
      console.error("❌ Save exception:", error);
      alert("❌ Terjadi error saat menyimpan: " + error.message);
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Kelola Halaman TK</h2>

        {/* Upload Logo */}
        <div className="border-b pb-4">
          <label className="block text-sm font-medium mb-2 text-green-800">
            Logo TK
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleLogoUpload}
            className="border p-2 rounded w-full"
          />
          {uploadingLogo && (
            <p className="text-green-600 mt-2 animate-pulse">Mengupload logo...</p>
          )}
          {form.logo_url && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-1">Preview Logo:</p>
              <img
                src={form.logo_url}
                alt="Logo TK"
                className="w-24 h-24 object-contain rounded-lg border shadow"
              />
            </div>
          )}
        </div>

        {/* Form Utama */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Judul TK"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Nama Kepala Sekolah"
            value={form.headmaster}
            onChange={(e) => setForm({ ...form, headmaster: e.target.value })}
            className="border p-2 rounded"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Foto Kepala Sekolah</label>
            <input type="file" accept="image/*" onChange={handleHeadmasterUpload} />
            {uploadingHead && (
              <p className="text-green-600 mt-1 animate-pulse">Mengupload foto...</p>
            )}
            {form.headmaster_photo && (
              <div className="mt-2">
                <img
                  src={form.headmaster_photo}
                  alt="Kepala Sekolah"
                  className="w-32 h-32 object-cover rounded-lg shadow"
                />
              </div>
            )}
          </div>

          <input
            type="number"
            placeholder="Jumlah Guru"
            value={form.teachers_count}
            onChange={(e) => setForm({ ...form, teachers_count: e.target.valueAsNumber })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Jumlah Siswa"
            value={form.students_count}
            onChange={(e) => setForm({ ...form, students_count: e.target.valueAsNumber })}
            className="border p-2 rounded"
          />
        </div>

        <textarea
          placeholder="Program (pisahkan dengan koma)"
          value={form.programs}
          onChange={(e) => setForm({ ...form, programs: e.target.value })}
          className="border p-2 rounded w-full"
          rows={2}
        />
        <textarea
          placeholder="Ekstrakurikuler (pisahkan dengan koma)"
          value={form.extracurricular}
          onChange={(e) => setForm({ ...form, extracurricular: e.target.value })}
          className="border p-2 rounded w-full"
          rows={2}
        />

        {/* Upload Galeri */}
        <div>
          <label className="block text-sm font-medium mb-2">Upload Galeri TK</label>
          <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
          {uploading && <p className="text-green-600 mt-2 animate-pulse">Sedang mengupload...</p>}

          <div className="flex flex-wrap gap-3 mt-4">
            {form.gallery.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Gallery ${i}`}
                  className="w-28 h-20 object-cover rounded shadow"
                />
                <button
                  onClick={() => handleDeleteGallery(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Simpan Perubahan
        </button>
      </div>
    </AdminLayout>
  );
}