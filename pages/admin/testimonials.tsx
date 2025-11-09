"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { motion } from "framer-motion";
import { useRequireRole } from "../../hooks/useRequireRole";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  photo_url?: string; // ✅ UBAH: photo -> photo_url
  created_at: string;
  updated_at?: string;
}

interface UploadResult {
  publicUrl: string;
  path: string;
}

export default function AdminTestimonials() {
  useRequireRole(["admin", "super_admin", "editor"]);
  const supabase = getSupabase();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTestimonials();
  }, [supabase]);

  async function loadTestimonials() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setTestimonials(data ?? []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
      setError("❌ Gagal memuat testimoni");
    } finally {
      setLoading(false);
    }
  }

  async function saveTestimonial() {
    if (!name.trim() || !message.trim()) {
      setError("❌ Nama dan pesan harus diisi");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      let photoUrl: string | null = null;

      // Upload gambar jika ada file baru
      if (file) {
        try {
          const uploaded = await uploadImageFile(file, "testimonials");
          
          if (uploaded) {
            if (typeof uploaded === 'string') {
              photoUrl = uploaded;
            } else {
              photoUrl = (uploaded as UploadResult).publicUrl;
            }
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          setError("❌ Gagal mengupload gambar");
          return;
        }
      }

      // ✅ SESUAIKAN DENGAN DATABASE: photo_url
      const testimonialData = {
        name: name.trim(),
        role: role.trim(),
        message: message.trim(),
        photo_url: photoUrl || (editing?.photo_url ?? null), // ✅ UBAH: photo -> photo_url
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (editing) {
        // Update testimonial yang sudah ada
        const result = await supabase
          .from("testimonials")
          .update(testimonialData)
          .eq("id", editing.id);
        error = result.error;
      } else {
        // Tambah testimonial baru
        const result = await supabase
          .from("testimonials")
          .insert([{ 
            ...testimonialData,
            created_at: new Date().toISOString()
          }]);
        error = result.error;
      }
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }

      alert(editing ? "✅ Testimoni berhasil diperbarui!" : "✅ Testimoni berhasil ditambahkan!");
      resetForm();
      await loadTestimonials();
      
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      setError(`❌ Gagal menyimpan testimoni: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setName("");
    setRole("");
    setMessage("");
    setFile(null);
    setEditing(null);
    setError("");
  }

  function startEdit(testimonial: Testimonial) {
    setEditing(testimonial);
    setName(testimonial.name);
    setRole(testimonial.role);
    setMessage(testimonial.message);
    setFile(null);
    setError("");
  }

  async function removeTestimonial(id: string) {
    if (!confirm("Yakin hapus testimoni ini?")) return;
    
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      await loadTestimonials();
      alert("✅ Testimoni berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      setError("❌ Gagal menghapus testimoni");
    }
  }

  return (
    <AdminLayout>
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {editing ? "Edit Testimoni" : "Tambah Testimoni Baru"}
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama *
            </label>
            <input
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peran / Posisi
            </label>
            <input
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Contoh: Orang Tua Siswa, Siswa, Guru, dll"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Testimoni *
            </label>
            <textarea
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
              placeholder="Tulis pesan testimoni di sini..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Profil
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              {file ? `File dipilih: ${file.name}` : "Pilih foto profil (opsional)"}
            </p>
            {editing?.photo_url && !file && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Foto saat ini:</p>
                <img 
                  src={editing.photo_url} 
                  alt="Current" 
                  className="w-16 h-16 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveTestimonial}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Testimoni"}
            </button>
            
            {editing && (
              <button
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Daftar Testimoni</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Memuat testimoni...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Belum ada testimoni yang ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {testimonial.photo_url && (
                      <img
                        src={testimonial.photo_url} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-800 text-lg">{testimonial.name}</p>
                        {testimonial.role && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {testimonial.role}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 italic leading-relaxed">
                        "{testimonial.message}"
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Ditambahkan: {new Date(testimonial.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(testimonial)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeTestimonial(testimonial.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}