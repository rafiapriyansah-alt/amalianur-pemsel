"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/admin/AdminLayout";
import { uploadImageFile } from "../../utils/upload";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageCircle, Heart, Share2, X } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
  description?: string;
}

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
  gallery_id: string;
}

interface Like {
  id: string;
  gallery_id: string;
  user_ip: string;
  created_at: string;
}

interface Share {
  id: string;
  gallery_id: string;
  user_ip: string;
  created_at: string;
}

export default function AdminGallery() {
  const supabase = getSupabase();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("umum");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedImageComments, setSelectedImageComments] = useState<Comment[]>([]);

  // modal edit
  const [isEditModal, setIsEditModal] = useState(false);
  const [editData, setEditData] = useState<GalleryItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("umum");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  async function loadGallery() {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setGallery(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
      alert("❌ Gagal memuat galeri");
    }
  }

  async function loadInteractions() {
    try {
      const [commentsRes, likesRes, sharesRes] = await Promise.all([
        supabase.from("gallery_comments").select("*").order("created_at", { ascending: false }),
        supabase.from("gallery_likes").select("*"),
        supabase.from("gallery_shares").select("*")
      ]);

      if (commentsRes.data) setComments(commentsRes.data);
      if (likesRes.data) setLikes(likesRes.data);
      if (sharesRes.data) setShares(sharesRes.data);
    } catch (error) {
      console.error("Error loading interactions:", error);
    }
  }

  useEffect(() => {
    loadGallery();
    loadInteractions();
  }, []);

  // Realtime agar langsung sinkron dengan halaman publik
  useEffect(() => {
    const channel = supabase
      .channel("realtime-gallery")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery" },
        (payload) => {
          loadGallery();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("realtime-comments-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_comments" },
        (payload) => {
          loadInteractions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(commentsChannel);
    };
  }, [supabase]);

  async function handleUpload() {
    if (!title.trim() || !imageFile) {
      alert("❌ Isi judul & pilih gambar terlebih dahulu!");
      return;
    }

    try {
      setIsLoading(true);
      const uploaded = await uploadImageFile(imageFile, "gallery");
      
      if (!uploaded) {
        throw new Error("Upload failed - returned null");
      }

      let imageUrl: string;
      if (typeof uploaded === 'string') {
        imageUrl = uploaded;
      } else {
        imageUrl = uploaded.publicUrl;
      }

      console.log("Upload successful, image URL:", imageUrl);

      const { data, error } = await supabase.from("gallery").insert([
        { 
          title: title.trim(), 
          image_url: imageUrl, 
          category,
          created_at: new Date().toISOString()
        },
      ]).select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Insert successful, data:", data);
      
      alert("✅ Foto berhasil ditambahkan!");
      setTitle("");
      setCategory("umum");
      setImageFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await loadGallery();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(`❌ Gagal menambahkan foto: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeImage(id: string) {
    if (!confirm("Yakin hapus foto ini?")) return;
    
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      alert("✅ Foto berhasil dihapus!");
      await loadGallery();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("❌ Gagal menghapus foto");
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm("Yakin hapus komentar ini?")) return;
    
    try {
      const { error } = await supabase.from("gallery_comments").delete().eq("id", commentId);
      if (error) throw error;
      alert("✅ Komentar berhasil dihapus!");
      await loadInteractions();
      if (showCommentsModal) {
        setSelectedImageComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("❌ Gagal menghapus komentar");
    }
  }

  function openEdit(item: GalleryItem) {
    setEditData(item);
    setNewTitle(item.title);
    setNewCategory(item.category);
    setNewImage(null);
    setIsEditModal(true);
  }

  async function saveEdit() {
    if (!editData) return;

    if (!newTitle.trim()) {
      alert("❌ Judul tidak boleh kosong");
      return;
    }

    try {
      setEditLoading(true);

      let imageUrl = editData.image_url;
      
      // Jika ada gambar baru, upload dulu
      if (newImage) {
        console.log("Uploading new image...");
        const uploaded = await uploadImageFile(newImage, "gallery");
        
        if (!uploaded) {
          throw new Error("Upload gambar baru gagal");
        }

        if (typeof uploaded === 'string') {
          imageUrl = uploaded;
        } else {
          imageUrl = uploaded.publicUrl;
        }
        console.log("New image URL:", imageUrl);
      }

      // Siapkan data update
      const updateData: any = {
        title: newTitle.trim(),
        category: newCategory,
        updated_at: new Date().toISOString()
      };

      // Hanya update image_url jika ada gambar baru
      if (newImage) {
        updateData.image_url = imageUrl;
      }

      console.log("Updating with data:", updateData);

      // Lakukan update
      const { data, error } = await supabase
        .from("gallery")
        .update(updateData)
        .eq("id", editData.id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Update successful, data:", data);
      
      alert("✅ Foto berhasil diperbarui!");
      setIsEditModal(false);
      await loadGallery();
    } catch (error: any) {
      console.error("Error updating image:", error);
      alert(`❌ Gagal memperbarui foto: ${error.message || 'Unknown error'}`);
    } finally {
      setEditLoading(false);
    }
  }

  function closeEditModal() {
    setIsEditModal(false);
    setEditData(null);
    setNewTitle("");
    setNewCategory("umum");
    setNewImage(null);
    setEditLoading(false);
  }

  function getImageStats(galleryId: string) {
    const imageComments = comments.filter(c => c.gallery_id === galleryId);
    const imageLikes = likes.filter(l => l.gallery_id === galleryId);
    const imageShares = shares.filter(s => s.gallery_id === galleryId);
    
    return {
      comments: imageComments,
      likes: imageLikes.length,
      shares: imageShares.length
    };
  }

  function openCommentsModal(galleryId: string) {
    const imageComments = comments.filter(c => c.gallery_id === galleryId);
    setSelectedImageComments(imageComments);
    setShowCommentsModal(true);
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-green-700">
          Kelola Galeri Kegiatan
        </h2>

        {/* Statistik total */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 px-4 py-3 rounded-lg border-l-4 border-green-600 text-green-700 font-medium shadow-sm">
            Total Foto: {gallery.length}
          </div>
          <div className="bg-blue-50 px-4 py-3 rounded-lg border-l-4 border-blue-600 text-blue-700 font-medium shadow-sm">
            Total Komentar: {comments.length}
          </div>
          <div className="bg-red-50 px-4 py-3 rounded-lg border-l-4 border-red-600 text-red-700 font-medium shadow-sm">
            Total Like: {likes.length}
          </div>
          <div className="bg-purple-50 px-4 py-3 rounded-lg border-l-4 border-purple-600 text-purple-700 font-medium shadow-sm">
            Total Share: {shares.length}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-green-800 mb-3">
            Tambah Foto Baru
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Judul foto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="umum">Umum</option>
                <option value="tk">TK</option>
                <option value="mts">MTS</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {imageFile && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                File dipilih: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isLoading || !title.trim() || !imageFile}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Mengunggah..." : "Tambah Gambar"}
            </button>
          </div>
        </div>

        {/* Grid Galeri */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-green-800 mb-3">
            Daftar Foto ({gallery.length})
          </h3>
          {gallery.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              Belum ada foto di galeri
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g, i) => {
                const stats = getImageStats(g.id);
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={g.image_url}
                        alt={g.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          g.category === "umum" ? "bg-blue-100 text-blue-800" :
                          g.category === "tk" ? "bg-purple-100 text-purple-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {g.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                        {g.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(g.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Heart size={14} className="text-red-500" />
                          <span>{stats.likes}</span>
                        </div>
                        <div 
                          className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                          onClick={() => openCommentsModal(g.id)}
                        >
                          <MessageCircle size={14} />
                          <span>{stats.comments.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 size={14} className="text-green-500" />
                          <span>{stats.shares}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEdit(g)}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeImage(g.id)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit */}
      <AnimatePresence>
        {isEditModal && editData && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                Edit Foto
              </h3>
              
              {/* Preview Gambar Saat Ini */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Gambar saat ini:</p>
                <img 
                  src={editData.image_url} 
                  alt={editData.title}
                  className="w-full h-32 object-cover rounded border"
                />
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Judul baru"
                />

                <select
                  className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="umum">Umum</option>
                  <option value="tk">TK</option>
                  <option value="mts">MTS</option>
                </select>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Ganti gambar (opsional):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                {newImage && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    File baru: {newImage.name} ({(newImage.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition flex-1 sm:flex-none"
                  disabled={editLoading}
                >
                  Batal
                </button>
                <button
                  onClick={saveEdit}
                  disabled={editLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Komentar */}
      <AnimatePresence>
        {showCommentsModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-green-700">
                  Komentar ({selectedImageComments.length})
                </h3>
                <button
                  onClick={() => setShowCommentsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedImageComments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Belum ada komentar untuk foto ini
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedImageComments.map((comment) => (
                      <div key={comment.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{comment.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.comment}</p>
                        </div>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Hapus komentar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}