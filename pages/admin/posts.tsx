"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  created_at: string;
  updated_at?: string;
}

interface UploadResult {
  publicUrl: string;
  path: string;
}

export default function AdminPosts() {
  useRequireRole(["admin", "super_admin", "editor"]);
  const supabase = getSupabase();

  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadPosts() {
    if (!supabase) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPosts(data ?? []);
    } catch (error) {
      console.error("Error loading posts:", error);
      alert("❌ Gagal memuat berita");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadPosts(); 
  }, [supabase]);

  async function savePost() {
    if (!supabase) return;
    
    if (!title.trim() || !content.trim()) {
      alert("❌ Judul dan konten harus diisi");
      return;
    }

    try {
      setSaving(true);
      let imageUrl: string | null = null;

      if (file) {
        const uploaded = await uploadImageFile(file, "posts");
        
        // Handle both string and object return types
        if (uploaded) {
          if (typeof uploaded === 'string') {
            imageUrl = uploaded;
          } else {
            imageUrl = (uploaded as UploadResult).publicUrl;
          }
        }
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        image: imageUrl,
        updated_at: new Date().toISOString()
      };

      if (editing) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editing);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("posts")
          .insert([{ 
            ...postData, 
            created_at: new Date().toISOString() 
          }]);
        
        if (error) throw error;
      }

      alert("✅ Berita disimpan!");
      resetForm();
      await loadPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("❌ Gagal menyimpan berita");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setFile(null);
    setEditing(null);
  }

  function startEdit(post: Post) {
    setEditing(post.id);
    setTitle(post.title);
    setContent(post.content);
    setFile(null);
  }

  async function removePost(id: string) {
    if (!supabase) return;
    if (!confirm("Hapus berita?")) return;
    
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      await loadPosts();
      alert("✅ Berita berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("❌ Gagal menghapus berita");
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {editing ? "Edit Berita" : "Tambah Berita Baru"}
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Berita *
            </label>
            <input 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan judul berita" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Isi Berita *
            </label>
            <textarea 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical" 
              placeholder="Tulis isi berita lengkap di sini..." 
              rows={6}
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Berita
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              {file ? `File dipilih: ${file.name}` : "Pilih gambar untuk berita (opsional)"}
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={savePost} 
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : editing ? "Update Berita" : "Simpan Berita"}
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
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Daftar Berita</h4>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat berita...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Belum ada berita yang ditambahkan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-2">{post.title}</h5>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Dibuat: {new Date(post.created_at).toLocaleDateString('id-ID')}
                        </span>
                        {post.image && (
                          <span className="text-green-600">✓ Ada gambar</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => startEdit(post)} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => removePost(post.id)} 
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