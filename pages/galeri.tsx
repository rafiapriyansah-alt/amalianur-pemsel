// pages/galeri.tsx
import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, X, Send, ChevronUp, ChevronDown } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  description?: string;
  created_at: string;
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
  const [shares, setShares] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🟢 Load awal
  useEffect(() => {
    async function load() {
      const { data: galleryData } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: likeData } = await supabase.from("gallery_likes").select("gallery_id, user_ip");
      const { data: shareData } = await supabase.from("gallery_shares").select("gallery_id");
      
      const likeCount: Record<string, number> = {};
      const shareCount: Record<string, number> = {};
      const userLikeStatus: Record<string, boolean> = {};

      likeData?.forEach((l) => {
        likeCount[l.gallery_id] = (likeCount[l.gallery_id] || 0) + 1;
        // Simulasi user like status (dalam real app, gunakan user session/ip)
        if (l.user_ip === "dummy-ip") {
          userLikeStatus[l.gallery_id] = true;
        }
      });

      shareData?.forEach((s) => {
        shareCount[s.gallery_id] = (shareCount[s.gallery_id] || 0) + 1;
      });

      setGallery(galleryData || []);
      setLikes(likeCount);
      setShares(shareCount);
      setUserLikes(userLikeStatus);
    }
    load();
  }, []);

  // 🔴 Realtime updates
  useEffect(() => {
    const channels = [
      supabase.channel("realtime-likes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "gallery_likes" }, (payload) => {
          const galleryId = payload.new.gallery_id;
          setLikes(prev => ({ ...prev, [galleryId]: (prev[galleryId] || 0) + 1 }));
        }),
      
      supabase.channel("realtime-comments")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "gallery_comments" }, (payload) => {
          if (payload.new.gallery_id === selectedGalleryId) {
            setComments(prev => [{
              id: payload.new.id,
              name: payload.new.name,
              comment: payload.new.comment,
              created_at: payload.new.created_at,
            }, ...prev]);
          }
        }),
      
      supabase.channel("realtime-shares")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "gallery_shares" }, (payload) => {
          const galleryId = payload.new.gallery_id;
          setShares(prev => ({ ...prev, [galleryId]: (prev[galleryId] || 0) + 1 }));
        })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [selectedGalleryId]);

  // 💗 Klik Love dengan animasi
  const handleLove = useCallback(async (galleryId: string) => {
    if (isLiking) return;
    
    setIsLiking(true);
    const wasLiked = userLikes[galleryId];
    
    // Optimistic update
    setUserLikes(prev => ({ ...prev, [galleryId]: !wasLiked }));
    setLikes(prev => ({ 
      ...prev, 
      [galleryId]: Math.max(0, (prev[galleryId] || 0) + (wasLiked ? -1 : 1))
    }));

    try {
      if (wasLiked) {
        // Unlike - dalam real app, perlu hapus based on user_ip
        await supabase.from("gallery_likes").delete().eq("gallery_id", galleryId).eq("user_ip", "dummy-ip");
      } else {
        // Like
        await supabase.from("gallery_likes").insert([{ gallery_id: galleryId, user_ip: "dummy-ip" }]);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Rollback on error
      setUserLikes(prev => ({ ...prev, [galleryId]: wasLiked }));
      setLikes(prev => ({ 
        ...prev, 
        [galleryId]: Math.max(0, (prev[galleryId] || 0) + (wasLiked ? 1 : -1))
      }));
    } finally {
      setIsLiking(false);
    }
  }, [userLikes, isLiking]);

  // 🔗 Klik Share
  const handleShare = useCallback(async (galleryId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Galeri Yayasan Amalianur',
          text: gallery.find(g => g.id === galleryId)?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link berhasil disalin!');
      }
      await supabase.from("gallery_shares").insert([{ gallery_id: galleryId, user_ip: "dummy-ip" }]);
    } catch (error) {
      console.log('Sharing cancelled or failed');
    }
  }, [gallery]);

  // 💬 Buka Fullscreen
  const openFullscreen = useCallback(async (index: number) => {
    const galleryItem = gallery[index];
    setOpenIndex(index);
    setSelectedGalleryId(galleryItem.id);
    
    // Load komentar
    const { data } = await supabase
      .from("gallery_comments")
      .select("*")
      .eq("gallery_id", galleryItem.id)
      .order("created_at", { ascending: false });
    setComments(data || []);
  }, [gallery]);

  // 💬 Kirim Komentar
  const sendComment = useCallback(async () => {
    if (!name.trim() || !commentText.trim() || !selectedGalleryId) {
      alert("Isi nama dan komentar terlebih dahulu!");
      return;
    }

    try {
      await supabase.from("gallery_comments").insert([{ 
        gallery_id: selectedGalleryId, 
        name: name.trim(), 
        comment: commentText.trim() 
      }]);
      
      setCommentText("");
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error("Error sending comment:", error);
      alert("Gagal mengirim komentar");
    }
  }, [name, commentText, selectedGalleryId]);

  // 🖱️ Scroll navigation untuk mobile/tablet
  const handleWheel = useCallback((e: WheelEvent) => {
    if (openIndex === null || !containerRef.current || window.innerWidth >= 768) return;
    
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = openIndex + direction;
    
    if (newIndex >= 0 && newIndex < gallery.length) {
      openFullscreen(newIndex);
    }
  }, [openIndex, gallery.length, openFullscreen]);

  // ⌨️ Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (openIndex === null) return;
    
    if (e.key === 'ArrowDown' && openIndex < gallery.length - 1) {
      openFullscreen(openIndex + 1);
    } else if (e.key === 'ArrowUp' && openIndex > 0) {
      openFullscreen(openIndex - 1);
    } else if (e.key === 'Escape') {
      setOpenIndex(null);
    } else if (e.key === 'ArrowLeft' && openIndex > 0) {
      openFullscreen(openIndex - 1);
    } else if (e.key === 'ArrowRight' && openIndex < gallery.length - 1) {
      openFullscreen(openIndex + 1);
    }
  }, [openIndex, gallery.length, openFullscreen]);

  useEffect(() => {
    if (openIndex !== null) {
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [openIndex, handleWheel, handleKeyDown]);

  const currentImage = openIndex !== null ? gallery[openIndex] : null;

  return (
    <>
      <Head><title>Galeri — Yayasan Amalianur</title></Head>
      <div className="min-h-screen flex flex-col bg-green-50">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-28 pb-16 flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-800 text-center mb-8 sm:mb-10">Galeri Kegiatan</h1>

          {/* Grid untuk Mobile & Tablet */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {gallery.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg overflow-hidden cursor-pointer relative aspect-square"
                onClick={() => openFullscreen(i)}
              >
                <img 
                  src={g.image_url} 
                  alt={g.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <h4 className="font-semibold text-white text-sm sm:text-base line-clamp-1">{g.title}</h4>
                  <div className="text-xs text-green-200">{g.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* FULLSCREEN VIEW */}
        <AnimatePresence>
          {openIndex !== null && currentImage && (
            <motion.div
              className="fixed inset-0 bg-black z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
            >
              {/* Desktop Layout - Side by Side */}
              <div className="hidden md:flex w-full h-full">
                {/* Image Section */}
                <div className="flex-1 flex items-center justify-center bg-black relative">
                  <button 
                    className="absolute top-6 left-6 text-white z-10 bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
                    onClick={() => setOpenIndex(null)}
                  >
                    <X size={24} />
                  </button>
                  
                  {/* Navigation Arrows - Desktop */}
                  {openIndex > 0 && (
                    <button
                      onClick={() => openFullscreen(openIndex - 1)}
                      className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition"
                    >
                      <ChevronUp size={24} className="rotate-90" />
                    </button>
                  )}
                  {openIndex < gallery.length - 1 && (
                    <button
                      onClick={() => openFullscreen(openIndex + 1)}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition"
                    >
                      <ChevronDown size={24} className="rotate-90" />
                    </button>
                  )}
                  
                  <motion.img
                    src={currentImage.image_url}
                    alt={currentImage.title}
                    className="max-w-full max-h-full object-contain"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Image Counter - Desktop */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-black/50 rounded-full px-4 py-2 text-sm">
                    {openIndex + 1} / {gallery.length}
                  </div>
                </div>

                {/* Comments Section - Desktop */}
                <div className="w-96 bg-white flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="font-bold text-xl text-gray-800 flex-1">{currentImage.title}</h2>
                      <button 
                        onClick={() => setOpenIndex(null)}
                        className="md:hidden text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{likes[currentImage.id] || 0}</span>
                        <span>Likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comments.length}</span>
                        <span>Komentar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{shares[currentImage.id] || 0}</span>
                        <span>Share</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">
                      {new Date(currentImage.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    
                    {currentImage.description && (
                      <p className="text-gray-700 mt-3 text-sm">{currentImage.description}</p>
                    )}
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="p-4 border-b">
                    <div className="flex gap-6">
                      <button 
                        onClick={() => handleLove(currentImage.id)}
                        className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors disabled:opacity-50"
                        disabled={isLiking}
                      >
                        <motion.div
                          animate={{ 
                            scale: userLikes[currentImage.id] ? [1, 1.3, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart 
                            size={24} 
                            fill={userLikes[currentImage.id] ? "currentColor" : "none"}
                            color={userLikes[currentImage.id] ? "#ef4444" : "currentColor"}
                          />
                        </motion.div>
                        <span className="font-medium">{likes[currentImage.id] || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleShare(currentImage.id)}
                        className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                      >
                        <Share2 size={24} />
                        <span className="font-medium">{shares[currentImage.id] || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments List - Desktop */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800">Komentar ({comments.length})</h3>
                    </div>
                    
                    <div className="p-4">
                      {comments.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          Belum ada komentar
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-800 text-sm">{comment.name}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(comment.created_at).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{comment.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Input - Desktop */}
                  <div className="p-4 border-t">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nama kamu"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex gap-2">
                        <input
                          ref={commentInputRef}
                          type="text"
                          placeholder="Tulis komentar..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          onClick={sendComment}
                          disabled={!name.trim() || !commentText.trim()}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet Layout - Vertical Scroll */}
              <div className="md:hidden w-full h-full overflow-y-auto bg-black">
                <button 
                  className="absolute top-4 left-4 text-white z-10 bg-black/50 rounded-full p-2"
                  onClick={() => setOpenIndex(null)}
                >
                  <X size={24} />
                </button>
                
                {/* Image */}
                <div className="w-full bg-black flex items-center justify-center pt-16 pb-4">
                  <motion.img
                    src={currentImage.image_url}
                    alt={currentImage.title}
                    className="w-full max-w-lg object-contain"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  />
                </div>

                {/* Content */}
                <div className="bg-white rounded-t-3xl p-6 -mt-6 relative z-20">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="font-bold text-xl text-gray-800">{currentImage.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(currentImage.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {currentImage.description && (
                      <p className="text-sm text-gray-600 mt-2">{currentImage.description}</p>
                    )}
                    
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>{likes[currentImage.id] || 0} Likes</span>
                      <span>{comments.length} Comments</span>
                      <span>{shares[currentImage.id] || 0} Shares</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-6 mb-6 pb-4 border-b">
                    <button 
                      onClick={() => handleLove(currentImage.id)}
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors flex-1 justify-center"
                      disabled={isLiking}
                    >
                      <motion.div
                        animate={{ 
                          scale: userLikes[currentImage.id] ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart 
                          size={28} 
                          fill={userLikes[currentImage.id] ? "currentColor" : "none"}
                          color={userLikes[currentImage.id] ? "#ef4444" : "currentColor"}
                        />
                      </motion.div>
                      <span className="font-medium">{likes[currentImage.id] || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare(currentImage.id)}
                      className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors flex-1 justify-center"
                    >
                      <Share2 size={28} />
                      <span className="font-medium">{shares[currentImage.id] || 0}</span>
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Komentar ({comments.length})</h3>
                    {comments.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        Belum ada komentar
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id}>
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm">{comment.name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama kamu"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={sendComment}
                        disabled={!name.trim() || !commentText.trim()}
                        className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Navigation for Mobile */}
                  <div className="flex justify-between mt-6 pt-4 border-t">
                    {openIndex > 0 && (
                      <button
                        onClick={() => openFullscreen(openIndex - 1)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        <ChevronUp size={20} className="rotate-90" />
                        <span>Sebelumnya</span>
                      </button>
                    )}
                    <div className="text-sm text-gray-500 mx-auto">
                      {openIndex + 1} / {gallery.length}
                    </div>
                    {openIndex < gallery.length - 1 && (
                      <button
                        onClick={() => openFullscreen(openIndex + 1)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 ml-auto"
                      >
                        <span>Berikutnya</span>
                        <ChevronDown size={20} className="rotate-90" />
                      </button>
                    )}
                  </div>
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