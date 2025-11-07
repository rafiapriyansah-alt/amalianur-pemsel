"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/admin/AdminLayout";
import { uploadImageFile } from "../../utils/upload";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

export default function AdminGallery() {
  const supabase = getSupabase();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("umum");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // modal edit
  const [isEditModal, setIsEditModal] = useState(false);
  const [editData, setEditData] = useState<GalleryItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("umum");
  const [newImage, setNewImage] = useState<File | null>(null);

  async function load() {
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    setGallery(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  // Realtime agar langsung sinkron dengan halaman publik
  useEffect(() => {
    const channel = supabase
      .channel("realtime-gallery")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery" },
        (payload) => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleUpload() {
    if (!title || !imageFile) return alert("Isi judul & pilih gambar terlebih dahulu!");
    setIsLoading(true);
    const imageUrl = await uploadImageFile(imageFile, "gallery");

    const { error } = await supabase.from("gallery").insert([
      { title, image_url: imageUrl, category },
    ]);

    setIsLoading(false);
    if (error) return alert(error.message);
    setTitle("");
    setImageFile(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Yakin hapus foto ini?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) alert(error.message);
  }

  async function openEdit(item: GalleryItem) {
    setEditData(item);
    setNewTitle(item.title);
    setNewCategory(item.category);
    setNewImage(null);
    setIsEditModal(true);
  }

  async function saveEdit() {
    if (!editData) return;
    setIsLoading(true);

    let imageUrl = editData.image_url;
    if (newImage) {
      const uploaded = await uploadImageFile(newImage, "gallery");
      if (uploaded) imageUrl = uploaded;
    }

    const { error } = await supabase
      .from("gallery")
      .update({
        title: newTitle,
        category: newCategory,
        image_url: imageUrl,
      })
      .eq("id", editData.id);

    setIsLoading(false);
    if (error) return alert(error.message);
    setIsEditModal(false);
    load();
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-green-700">Kelola Galeri Kegiatan</h2>

        {/* Statistik total */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-green-50 px-4 py-3 rounded-lg border-l-4 border-green-600 text-green-700 font-medium shadow-sm">
            Total Foto: {gallery.length}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-green-800 mb-3">Tambah Foto Baru</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Judul foto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-3 rounded w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="border border-gray-300 p-3 rounded w-full"
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
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
            >
              {isLoading ? "Mengunggah..." : "Tambah Gambar"}
            </button>
          </div>
        </div>

        {/* Grid Galeri */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-green-800 mb-3">Daftar Foto</h3>
          {gallery.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada foto di galeri
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g, i) => (
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
                    <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">{g.title}</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(g.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEdit(g)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(g.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit */}
      <AnimatePresence>
        {isEditModal && (
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
              <h3 className="text-lg font-semibold text-green-700 mb-4">Edit Foto</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border border-gray-300 p-3 rounded w-full"
                  placeholder="Judul baru"
                />

                <select
                  className="border border-gray-300 p-3 rounded w-full"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="umum">Umum</option>
                  <option value="tk">TK</option>
                  <option value="mts">MTS</option>
                </select>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                <button
                  onClick={() => setIsEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition flex-1 sm:flex-none"
                >
                  Batal
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex-1 sm:flex-none"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}