import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import AdminLayout from "../../components/admin/AdminLayout";
import { toast } from "react-hot-toast";

interface Post {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image_url?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface UploadResult {
  publicUrl: string;
  path: string;
}

export default function AdminNews() {
  const supabase = getSupabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<Post>({ 
    title: "", 
    excerpt: "", 
    content: "", 
    image_url: "" 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Gagal memuat berita");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "posts" }, 
        loadPosts
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const result = await uploadImageFile(file, "news");
      
      // Handle both string and object return types
      if (result) {
        let imageUrl: string;
        
        if (typeof result === 'string') {
          imageUrl = result;
        } else {
          // Jika return berupa object, ambil publicUrl-nya
          imageUrl = (result as UploadResult).publicUrl;
        }
        
        setForm((f) => ({ ...f, image_url: imageUrl }));
        toast.success("Gambar berhasil diupload");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten harus diisi");
      return;
    }

    try {
      setLoading(true);
      const postData = {
        ...form,
        updated_at: new Date().toISOString(),
        ...(editingId ? {} : { published_at: new Date().toISOString() })
      };

      if (editingId) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingId);
        
        if (error) throw error;
        toast.success("Berita berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from("posts")
          .insert([postData]);
        
        if (error) throw error;
        toast.success("Berita berhasil ditambahkan!");
      }
      
      // Reset form
      setForm({ title: "", excerpt: "", content: "", image_url: "" });
      setEditingId(null);
      await loadPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Gagal menyimpan berita");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id!);
    setForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      image_url: post.image_url || ""
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;
    
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Berita berhasil dihapus!");
      await loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Gagal menghapus berita");
    }
  };

  const resetForm = () => {
    setForm({ title: "", excerpt: "", content: "", image_url: "" });
    setEditingId(null);
  };

  return (
    <AdminLayout title="Kelola Berita">
      <div className="p-6 space-y-6">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? "Edit Berita" : "Tambah Berita Baru"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Berita *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Masukkan judul berita"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Singkat
              </label>
              <input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Masukkan deskripsi singkat berita"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Berita *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tulis isi berita lengkap di sini..."
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Berita
                {uploading && <span className="text-orange-600 ml-2">(Mengupload...)</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              />
              {form.image_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview Gambar:</p>
                  <img 
                    src={form.image_url} 
                    alt="Preview" 
                    className="w-48 h-32 object-cover rounded-lg shadow-md border" 
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Berita"}
              </button>
              
              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Berita</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat berita...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada berita yang ditambahkan.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-48 object-cover" 
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID') : 'Draft'}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id!)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
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