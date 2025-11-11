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
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const commentInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🟢 PERBAIKAN: Load data dengan optimisasi
  useEffect(() => {
    async function load() {
      try {
        console.time('LoadGalleryData');
        
        // Load data secara paralel
        const [galleryResponse, likeResponse, shareResponse] = await Promise.all([
          supabase.from("gallery").select("*").order("created_at", { ascending: false }),
          supabase.from("gallery_likes").select("gallery_id, user_ip"),
          supabase.from("gallery_shares").select("gallery_id")
        ]);

        const galleryData = galleryResponse.data || [];
        const likeData = likeResponse.data || [];
        const shareData = shareResponse.data || [];

        // Set gallery data FIRST untuk memulai loading gambar
        setGallery(galleryData);

        // Preload images
        galleryData.forEach((item) => {
          const img = new Image();
          img.src = item.image_url;
          img.onload = () => {
            setImageLoaded(prev => ({ ...prev, [item.id]: true }));
          };
        });

        // Process likes and shares
        const likeCount: Record<string, number> = {};
        const shareCount: Record<string, number> = {};
        const userLikeStatus: Record<string, boolean> = {};

        likeData.forEach((l) => {
          likeCount[l.gallery_id] = (likeCount[l.gallery_id] || 0) + 1;
          if (l.user_ip === "dummy-ip") {
            userLikeStatus[l.gallery_id] = true;
          }
        });

        shareData.forEach((s) => {
          shareCount[s.gallery_id] = (shareCount[s.gallery_id] || 0) + 1;
        });

        setLikes(likeCount);
        setShares(shareCount);
        setUserLikes(userLikeStatus);
        
        console.timeEnd('LoadGalleryData');
      } catch (error) {
        console.error('Error loading gallery:', error);
      }
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
        await supabase.from("gallery_likes").delete().eq("gallery_id", galleryId).eq("user_ip", "dummy-ip");
      } else {
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
    setShowComments(false);
    
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

  // 🖱️ Scroll navigation untuk mobile
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

  // Handle image load
  const handleImageLoad = useCallback((galleryId: string) => {
    setImageLoaded(prev => ({ ...prev, [galleryId]: true }));
  }, []);

  const currentImage = openIndex !== null ? gallery[openIndex] : null;

  // Animasi untuk container judul
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  // Variants untuk grid galeri
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <>
      <Head>
        <title>Galeri — Yayasan Amalianur</title>
        {/* Preconnect untuk optimasi loading */}
        <link rel="preconnect" href="https://your-image-domain.com" />
      </Head>
      <div className="min-h-screen flex flex-col bg-green-50">
        <Navbar />
        <main className="container mx-auto px-6 pt-32 pb-16 flex-1">
          {/* JUDUL GALERI DENGAN ANIMASI */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-10"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-bold text-green-800 mb-4"
            >
              Galeri Kegiatan
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-green-600 max-w-2xl mx-auto"
            >
              Dokumentasi berbagai kegiatan dan program Yayasan Amalianur
            </motion.p>
          </motion.div>

          {/* GRID GALERI DENGAN OPTIMISASI LOADING */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {gallery.map((g, i) => (
              <motion.div
                key={g.id}
                variants={cardVariants}
                className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden cursor-pointer relative"
                onClick={() => openFullscreen(i)}
              >
                {/* PERBAIKAN: Image dengan loading state */}
                <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                  {!imageLoaded[g.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src={g.image_url} 
                    alt={g.title} 
                    className={`w-full h-64 object-cover transition-opacity duration-300 ${
                      imageLoaded[g.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(g.id)}
                    loading="lazy" // Lazy loading untuk performa
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-green-800">{g.title}</h4>
                  <div className="text-sm text-gray-500">{g.category}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Loading State saat data belum ada */}
          {gallery.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat galeri...</p>
            </div>
          )}
        </main>

        {/* FULLSCREEN VIEW - Desktop & Mobile */}
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
              <div className="hidden md:flex w-full h-full bg-white">
                {/* Close Button */}
                <button 
                  className="absolute top-6 right-6 text-gray-600 z-10 bg-white/80 rounded-full p-2 hover:bg-white transition"
                  onClick={() => setOpenIndex(null)}
                >
                  <X size={24} />
                </button>

                {/* Image Section dengan Loading */}
                <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
                  <div className="relative">
                    {!imageLoaded[currentImage.id] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <motion.img
                      src={currentImage.image_url}
                      alt={currentImage.title}
                      className={`max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
                        imageLoaded[currentImage.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: imageLoaded[currentImage.id] ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      onLoad={() => handleImageLoad(currentImage.id)}
                    />
                  </div>

                  {/* Navigation Arrows untuk Desktop */}
                  {openIndex > 0 && (
                    <button
                      onClick={() => openFullscreen(openIndex - 1)}
                      className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-600 bg-white/80 rounded-full p-3 hover:bg-white transition shadow-lg"
                    >
                      <ChevronUp size={28} className="rotate-90" />
                    </button>
                  )}
                  {openIndex < gallery.length - 1 && (
                    <button
                      onClick={() => openFullscreen(openIndex + 1)}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-600 bg-white/80 rounded-full p-3 hover:bg-white transition shadow-lg"
                    >
                      <ChevronDown size={28} className="rotate-90" />
                    </button>
                  )}
                </div>

                {/* Sidebar Section - Komentar & Info */}
                <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
                  {/* Header Info */}
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentImage.title}</h2>
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(currentImage.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {currentImage.description && (
                      <p className="text-sm text-gray-700 mt-3">{currentImage.description}</p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleLove(currentImage.id)}
                          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                          disabled={isLiking}
                        >
                          <motion.div
                            animate={{ 
                              scale: userLikes[currentImage.id] ? [1, 1.2, 1] : 1
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart 
                              size={20} 
                              fill={userLikes[currentImage.id] ? "currentColor" : "none"}
                              color={userLikes[currentImage.id] ? "#ef4444" : "currentColor"}
                            />
                          </motion.div>
                          <span className="font-medium">{likes[currentImage.id] || 0}</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageCircle size={20} />
                        <span className="font-medium">{comments.length}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleShare(currentImage.id)}
                          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <Share2 size={20} />
                          <span className="font-medium">{shares[currentImage.id] || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Komentar ({comments.length})</h3>
                      
                      {comments.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                          <p>Belum ada komentar</p>
                          <p className="text-sm mt-1">Jadilah yang pertama berkomentar!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-gray-800 text-sm">{comment.name}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(comment.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nama kamu"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <input
                          ref={commentInputRef}
                          type="text"
                          placeholder="Tulis komentar..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={sendComment}
                          disabled={!name.trim() || !commentText.trim()}
                          className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                          <Send size={16} />
                          <span className="hidden sm:inline">Kirim</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet Layout */}
              <div className="md:hidden w-full h-full bg-white flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center text-gray-800">
                  <button 
                    onClick={() => setOpenIndex(null)}
                    className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="text-sm opacity-80 bg-gray-200 px-3 py-1 rounded-full">
                    {openIndex + 1} / {gallery.length}
                  </div>
                </div>

                {/* Image Container - Full Screen dengan Loading */}
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {!imageLoaded[currentImage.id] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <motion.img
                      key={currentImage.id}
                      src={currentImage.image_url}
                      alt={currentImage.title}
                      className={`w-full h-full object-contain transition-opacity duration-300 ${
                        imageLoaded[currentImage.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: imageLoaded[currentImage.id] ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      onLoad={() => handleImageLoad(currentImage.id)}
                    />
                  </div>

                  {/* Navigation Arrows untuk Mobile */}
                  {openIndex > 0 && (
                    <button
                      onClick={() => openFullscreen(openIndex - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition"
                    >
                      <ChevronUp size={28} className="rotate-90" />
                    </button>
                  )}
                  {openIndex < gallery.length - 1 && (
                    <button
                      onClick={() => openFullscreen(openIndex + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition"
                    >
                      <ChevronDown size={28} className="rotate-90" />
                    </button>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="bg-gradient-to-t from-black/90 to-transparent pt-8 pb-6 px-6 text-white">
                  {/* Image Info */}
                  <div className="mb-4">
                    <h2 className="text-lg font-bold mb-1">{currentImage.title}</h2>
                    <p className="text-xs opacity-80">
                      {new Date(currentImage.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Like Button */}
                      <button 
                        onClick={() => handleLove(currentImage.id)}
                        className="flex flex-col items-center gap-1 transition-all"
                        disabled={isLiking}
                      >
                        <motion.div
                          animate={{ 
                            scale: userLikes[currentImage.id] ? [1, 1.3, 1] : 1
                          }}
                          transition={{ duration: 0.4 }}
                        >
                          <Heart 
                            size={28} 
                            fill={userLikes[currentImage.id] ? "#ef4444" : "none"}
                            color={userLikes[currentImage.id] ? "#ef4444" : "white"}
                          />
                        </motion.div>
                        <span className="text-xs font-medium">{likes[currentImage.id] || 0}</span>
                      </button>

                      {/* Comment Button */}
                      <button 
                        onClick={() => setShowComments(true)}
                        className="flex flex-col items-center gap-1 transition-all"
                      >
                        <MessageCircle size={28} color="white" />
                        <span className="text-xs font-medium">{comments.length}</span>
                      </button>

                      {/* Share Button */}
                      <button 
                        onClick={() => handleShare(currentImage.id)}
                        className="flex flex-col items-center gap-1 transition-all"
                      >
                        <Share2 size={28} color="white" />
                        <span className="text-xs font-medium">{shares[currentImage.id] || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments Panel untuk Mobile & Tablet */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowComments(false)}
              />
              
              {/* Comments Panel */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ 
                  type: "spring", 
                  damping: 25,
                  stiffness: 300
                }}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      Komentar
                    </h3>
                    <p className="text-sm text-gray-500">{comments.length} komentar</p>
                  </div>
                  <button
                    onClick={() => setShowComments(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">Belum ada komentar</p>
                      <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama berkomentar!</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800 text-sm">{comment.name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(comment.created_at).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{comment.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama kamu"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <input
                        ref={commentInputRef}
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendComment}
                        disabled={!name.trim() || !commentText.trim()}
                        className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[60px]"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
}