// pages/galeri.tsx
import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, X } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
}

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
}

export default function Galeri() {
  const supabase = getSupabase();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);

  // 🟢 Load awal (galeri + like)
  useEffect(() => {
    async function load() {
      const { data: galleryData } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: likeData } = await supabase.from("gallery_likes").select("gallery_id");
      const likeCount: Record<string, number> = {};
      likeData?.forEach((l) => {
        likeCount[l.gallery_id] = (likeCount[l.gallery_id] || 0) + 1;
      });

      setGallery(galleryData || []);
      setLikes(likeCount);
    }
    load();
  }, []);

  // 🔴 Realtime Love
  useEffect(() => {
    const channel = supabase
      .channel("realtime-likes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gallery_likes" },
        (payload) => {
          const galleryId = payload.new.gallery_id;
          setLikes((prev) => ({
            ...prev,
            [galleryId]: (prev[galleryId] || 0) + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔴 Realtime Komentar
  useEffect(() => {
    const channel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gallery_comments" },
        (payload) => {
          if (payload.new.gallery_id === selectedGalleryId) {
            setComments((prev) => [
              {
                id: payload.new.id,
                name: payload.new.name,
                comment: payload.new.comment,
                created_at: payload.new.created_at,
              },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGalleryId]);

  // 💗 Klik Love
  async function handleLove(galleryId: string) {
    await supabase.from("gallery_likes").insert([{ gallery_id: galleryId, user_ip: "dummy-ip" }]);
  }

  // 💬 Buka Komentar
  async function openComments(galleryId: string) {
    setSelectedGalleryId(galleryId);
    const { data } = await supabase
      .from("gallery_comments")
      .select("*")
      .eq("gallery_id", galleryId)
      .order("created_at", { ascending: false });
    setComments(data || []);
    setShowCommentBox(true);
  }

  // 💬 Kirim Komentar
  async function sendComment() {
    if (!name || !commentText || !selectedGalleryId) return alert("Isi semua kolom!");
    await supabase.from("gallery_comments").insert([{ gallery_id: selectedGalleryId, name, comment: commentText }]);
    setName("");
    setCommentText("");
  }

  const dummyGallery: GalleryItem[] = [
    { id: "1", title: "Kegiatan Gotong Royong", image_url: "https://placehold.co/600x400?text=Gotong+Royong", category: "umum" },
    { id: "2", title: "Lomba 17 Agustus", image_url: "https://placehold.co/600x400?text=Lomba+17+Agustus", category: "tk" },
    { id: "3", title: "Pramuka MTS", image_url: "https://placehold.co/600x400?text=Pramuka+MTS", category: "mts" },
  ];

  const images = gallery.length > 0 ? gallery : dummyGallery;

  return (
    <>
      <Head><title>Galeri — Yayasan Amalianur</title></Head>
      <div className="min-h-screen flex flex-col bg-green-50">
        <Navbar />
        <main className="container mx-auto px-6 pt-32 pb-16 flex-1">
          <h1 className="text-4xl font-bold text-green-800 text-center mb-10">Galeri Kegiatan</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {images.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden cursor-pointer relative"
                onClick={() => setOpenIndex(i)}
              >
                <img src={g.image_url} alt={g.title} className="w-full h-64 object-cover" />
                <div className="p-3">
                  <h4 className="font-semibold text-green-800">{g.title}</h4>
                  <div className="text-sm text-gray-500">{g.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* FULLSCREEN VIEW */}
        <AnimatePresence>
          {openIndex !== null && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button className="absolute top-6 right-6 text-white" onClick={() => setOpenIndex(null)}>
                <X size={30} />
              </button>

              <motion.img
                src={images[openIndex].image_url}
                alt={images[openIndex].title}
                className="w-[90%] md:w-[60%] max-h-[70vh] object-cover rounded-xl"
              />

              <div className="flex gap-6 mt-6 text-white items-center">
                <div className="flex flex-col items-center cursor-pointer" onClick={() => handleLove(images[openIndex].id)}>
                  <Heart size={28} color={likes[images[openIndex].id] ? "red" : "white"} fill={likes[images[openIndex].id] ? "red" : "none"} />
                  <span className="text-sm">{likes[images[openIndex].id] || 0}</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => openComments(images[openIndex].id)}>
                  <MessageCircle size={28} />
                </div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => navigator.share({ url: window.location.href })}>
                  <Share2 size={28} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POPUP KOMENTAR */}
        <AnimatePresence>
          {showCommentBox && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-xl p-6 w-[90%] md:w-[400px] relative">
                <button className="absolute top-3 right-3" onClick={() => setShowCommentBox(false)}>
                  <X size={22} />
                </button>
                <h3 className="text-xl font-semibold mb-4 text-green-700">Tulis Komentar</h3>
                <input
                  type="text"
                  placeholder="Nama kamu"
                  className="border p-2 w-full mb-3 rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <textarea
                  placeholder="Tulis komentar..."
                  className="border p-2 w-full mb-3 rounded"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={sendComment}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                  Kirim
                </button>

                <div className="mt-4 max-h-[200px] overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="border-b py-2">
                      <b>{c.name}</b>
                      <p className="text-sm text-gray-600">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
}
