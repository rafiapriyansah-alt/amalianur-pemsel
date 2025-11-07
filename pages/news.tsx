// pages/news.tsx
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
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
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  const load = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (!error && data) setPosts(data);
  };

  useEffect(() => {
    load();

    // ✅ Realtime listener
    const channel = supabase
      .channel("public:posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <>
      <Head><title>Berita — Yayasan Amalianur</title></Head>
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-16">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-center text-green-800 mb-10">
          Berita Terbaru
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition">
              <img src={post.image_url} alt={post.title} className="w-full h-56 object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-green-700">{post.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{post.excerpt}</p>
                <Link href={`/news/${post.id}`}>
                  <span className="text-green-600 font-semibold text-sm hover:underline mt-3 inline-block">Lihat Selengkapnya →</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
