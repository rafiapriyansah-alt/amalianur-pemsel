"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

interface Program {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

interface UploadResult {
  publicUrl: string;
  path: string;
}

export default function AdminPrograms() {
  useRequireRole(["admin", "super_admin", "editor"]);
  const supabase = getSupabase();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadPrograms() {
    if (!supabase) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPrograms(data ?? []);
    } catch (error) {
      console.error("Error loading programs:", error);
      alert("❌ Gagal memuat program");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadPrograms(); 
  }, [supabase]);

  async function saveProgram() {
    if (!supabase) return;
    
    if (!title.trim()) {
      alert("❌ Judul harus diisi");
      return;
    }

    try {
      setSaving(true);
      let imageUrl: string | undefined = undefined;

      // Upload gambar jika ada
      if (file) {
        const uploaded = await uploadImageFile(file, "programs");
        
        if (uploaded) {
          if (typeof uploaded === 'string') {
            imageUrl = uploaded;
          } else {
            imageUrl = (uploaded as UploadResult).publicUrl;
          }
        }
      }

      // Data yang sesuai dengan struktur tabel database (TANPA updated_at)
      const programData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        category,
        image_url: imageUrl,
        is_published: true // Semua program otomatis published
      };

      if (editing) {
        // Update program yang sudah ada
        const { error } = await supabase
          .from("programs")
          .update(programData)
          .eq("id", editing);
        
        if (error) throw error;
        alert("✅ Program berhasil diperbarui!");
      } else {
        // Tambah program baru
        const { error } = await supabase
          .from("programs")
          .insert([{ 
            ...programData, 
            created_at: new Date().toISOString() 
          }]);
        
        if (error) throw error;
        alert("✅ Program berhasil ditambahkan!");
      }

      resetForm();
      await loadPrograms();
    } catch (error: any) {
      console.error("Error saving program:", error);
      alert(`❌ Gagal menyimpan program: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setSubtitle("");
    setDescription("");
    setCategory("all");
    setFile(null);
    setEditing(null);
  }

  function startEdit(program: Program) {
    setEditing(program.id);
    setTitle(program.title);
    setSubtitle(program.subtitle || "");
    setDescription(program.description || "");
    setCategory(program.category || "all");
    setFile(null);
  }

  async function removeProgram(id: string) {
    if (!supabase) return;
    if (!confirm("Hapus program?")) return;
    
    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      await loadPrograms();
      alert("✅ Program berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting program:", error);
      alert("❌ Gagal menghapus program");
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {editing ? "Edit Program" : "Tambah Program Baru"}
        </h3>

        <div className="space-y-4 mb-6">
          {/* Judul Program */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Program *
            </label>
            <input 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan judul program" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan subtitle program" 
              value={subtitle} 
              onChange={(e) => setSubtitle(e.target.value)} 
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Program
            </label>
            <textarea 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical" 
              placeholder="Masukkan deskripsi program..." 
              rows={4}
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Semua</option>
              <option value="tk">TK</option>
              <option value="mts">MTS</option>
            </select>
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Program
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              {file ? `File dipilih: ${file.name}` : "Pilih gambar untuk program (opsional)"}
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={saveProgram} 
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : editing ? "Update Program" : "Simpan Program"}
            </button>
            
            {editing && (
              <button 
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        {/* Daftar Program */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Daftar Program</h4>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat program...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Belum ada program yang ditambahkan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-2">{program.title}</h5>
                      {program.subtitle && (
                        <p className="text-sm text-gray-600 mb-2">
                          {program.subtitle}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-3">
                        {program.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {program.category.toUpperCase()}
                        </span>
                        <span>
                          Dibuat: {new Date(program.created_at).toLocaleDateString('id-ID')}
                        </span>
                        {program.image_url && (
                          <span className="text-green-600">✓ Ada gambar</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => startEdit(program)} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => removeProgram(program.id)} 
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}