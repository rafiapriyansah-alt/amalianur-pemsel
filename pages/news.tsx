// pages/news.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getSupabase } from "../lib/supabaseClient";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  content: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

export default function NewsPage() {
  const supabase = getSupabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      setPosts(data ?? []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    // ✅ Realtime listener
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Tanggal tidak tersedia';
    }
  };

  return (
    <>
      <Head>
        <title>Berita — Yayasan Amalianur</title>
        <meta 
          name="description" 
          content="Berita terbaru dari Yayasan Amalianur - Informasi kegiatan, perkembangan, dan acara terkini" 
        />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-28 pb-16">
          {/* Header Section */}
          <motion.section 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-4">
              Berita Terbaru
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ikuti perkembangan dan kegiatan terbaru di Yayasan Amalianur
            </p>
          </motion.section>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Posts Grid */}
          {!loading && posts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v12m0 0h6m-6 0v-6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Belum Ada Berita
                </h3>
                <p className="text-gray-500 text-sm">
                  Berita terbaru akan segera hadir. Pantau terus perkembangan kami.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-green-100 group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image_url || "/images/news-default.jpg"} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Berita
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <p className="text-sm text-gray-500 mb-3">
                      {formatDate(post.published_at)}
                    </p>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-green-800 mb-3 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors duration-200">
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt || "Baca berita selengkapnya untuk informasi lebih detail."}
                    </p>
                    
                    {/* Read More Link */}
                    <Link 
                      href={`/news/${post.id}`}
                      className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-sm transition-colors duration-200 group/link"
                    >
                      Baca Selengkapnya
                      <svg 
                        className="ml-1 w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          {/* Empty State for No Posts */}
          {!loading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <p className="text-gray-500 text-sm">
                Menampilkan {posts.length} berita
              </p>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}