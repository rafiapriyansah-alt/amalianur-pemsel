"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

interface Program {
  id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  created_at: string;
  updated_at?: string;
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
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
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
    
    if (!title.trim() || !content.trim()) {
      alert("❌ Judul dan konten harus diisi");
      return;
    }

    try {
      setSaving(true);
      let imageUrl: string | undefined = undefined;

      if (file) {
        const uploaded = await uploadImageFile(file, "programs");
        
        // Handle both string and object return types
        if (uploaded) {
          if (typeof uploaded === 'string') {
            imageUrl = uploaded;
          } else {
            imageUrl = (uploaded as UploadResult).publicUrl;
          }
        }
      }

      const programData = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        image: imageUrl,
        updated_at: new Date().toISOString()
      };

      if (editing) {
        const { error } = await supabase
          .from("programs")
          .update(programData)
          .eq("id", editing);
        
        if (error) throw error;
        alert("✅ Program berhasil diperbarui!");
      } else {
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
    } catch (error) {
      console.error("Error saving program:", error);
      alert("❌ Gagal menyimpan program");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setContent("");
    setFile(null);
    setEditing(null);
  }

  function startEdit(program: Program) {
    setEditing(program.id);
    setTitle(program.title);
    setDescription(program.description || "");
    setContent(program.content);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Program *
            </label>
            <input 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan judul program" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Singkat
            </label>
            <input 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan deskripsi singkat program" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten Program *
            </label>
            <textarea 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical" 
              placeholder="Tulis detail lengkap program di sini..." 
              rows={6}
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
            />
          </div>

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

          <div className="flex gap-3">
            <button 
              onClick={saveProgram} 
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : editing ? "Update Program" : "Simpan Program"}
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
                      {program.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {program.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Dibuat: {new Date(program.created_at).toLocaleDateString('id-ID')}
                        </span>
                        {program.image && (
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