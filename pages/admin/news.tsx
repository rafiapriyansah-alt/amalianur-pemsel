"use client";
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
  is_published?: boolean;
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
    image_url: "",
    is_published: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Custom toast functions
  const showToast = {
    success: (message: string) => {
      toast.success(message, {
        duration: 3000,
        position: "top-center",
        style: {
          background: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        icon: (
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      });
    },
    error: (message: string) => {
      toast.error(message, {
        duration: 4000,
        position: "top-center",
        style: {
          background: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        icon: (
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )
      });
    },
    warning: (message: string) => {
      toast(message, {
        duration: 3000,
        position: "top-center",
        style: {
          background: '#f59e0b',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        icon: (
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )
      });
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      if (data) setPosts(data);
    } catch (error: any) {
      console.error("Error loading posts:", error);
      showToast.error("Gagal memuat berita");
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

    if (!file.type.startsWith('image/')) {
      showToast.warning("Harap pilih file gambar yang valid");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.warning("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }
    
    try {
      setUploading(true);
      const result = await uploadImageFile(file, "news");
      
      if (result) {
        let imageUrl: string;
        
        if (typeof result === 'string') {
          imageUrl = result;
        } else {
          imageUrl = (result as UploadResult).publicUrl;
        }
        
        setForm((f) => ({ ...f, image_url: imageUrl }));
        showToast.success("Gambar berhasil diupload");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      showToast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast.warning("Judul berita harus diisi");
      return;
    }

    if (!form.content.trim()) {
      showToast.warning("Konten berita harus diisi");
      return;
    }

    try {
      setSaving(true);
      
      const postData = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        image_url: form.image_url,
        is_published: true,
        ...(editingId ? {} : { published_at: new Date().toISOString() })
      };

      let error;
      
      if (editingId) {
        const result = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingId);
        error = result.error;
      } else {
        const result = await supabase
          .from("posts")
          .insert([postData]);
        error = result.error;
      }
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }
      
      showToast.success(`Berita berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`);
      
      setForm({ 
        title: "", 
        excerpt: "", 
        content: "", 
        image_url: "",
        is_published: true 
      });
      setEditingId(null);
      await loadPosts();
    } catch (error: any) {
      console.error("Error saving post:", error);
      showToast.error("Gagal menyimpan berita");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id!);
    setForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      image_url: post.image_url || "",
      is_published: post.is_published !== undefined ? post.is_published : true
    });
    
    document.getElementById('news-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
    
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      showToast.success("Berita berhasil dihapus");
      await loadPosts();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      showToast.error("Gagal menghapus berita");
    }
  };

  const resetForm = () => {
    setForm({ 
      title: "", 
      excerpt: "", 
      content: "", 
      image_url: "",
      is_published: true 
    });
    setEditingId(null);
    showToast.success("Form berhasil direset");
  };

  const removeImage = () => {
    setForm({ ...form, image_url: "" });
    showToast.success("Gambar berhasil dihapus");
  };

  return (
    <AdminLayout title="Kelola Berita">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Form Section - Compact for Mobile */}
        <div id="news-form" className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {editingId ? "Edit Berita" : "Tambah Berita"}
            </h2>
            {editingId && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Mode Edit</span>
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Single Column Layout for Mobile */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul Berita <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masukkan judul berita"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Deskripsi singkat berita"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gambar Berita
                  {uploading && (
                    <span className="text-orange-600 ml-2 text-xs font-normal">
                      Mengupload...
                    </span>
                  )}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-all hover:border-green-400">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading || saving}
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF • Maks 5MB
                  </p>
                </div>
              </div>

              {form.image_url && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Preview:</span>
                    <button
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700 text-sm"
                      disabled={saving}
                    >
                      Hapus
                    </button>
                  </div>
                  <img 
                    src={form.image_url} 
                    alt="Preview" 
                    className="w-full h-24 sm:h-32 object-cover rounded-lg" 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konten Berita <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tulis isi berita lengkap..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Action Buttons - Stack on Mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium order-1"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : editingId ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simpan Perubahan</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Tambah Berita</span>
                  </>
                )}
              </button>
              
              {editingId && (
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium order-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Posts List - Compact for Mobile */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Daftar Berita</h2>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{posts.length} berita</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Memuat berita...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Belum Ada Berita</h3>
              <p className="text-gray-500 text-sm">
                Tambahkan berita pertama Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="relative h-32 sm:h-40 overflow-hidden">
                    <img 
                      src={post.image_url || "/images/news-default.jpg"} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                      {post.excerpt || "Tidak ada deskripsi"}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID') : 'Draft'}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                          disabled={saving}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id!)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                          disabled={saving}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline">Hapus</span>
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