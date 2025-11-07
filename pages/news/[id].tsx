// pages/news/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "../../components/admin/Navbar";
import Footer from "../../components/admin/Footer";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
}

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
      if (!error && data) setPost(data);
    };
    load();
  }, [id]);

  if (!post) return <div className="text-center p-10">Memuat berita...</div>;

  return (
    <>
      <Head><title>{post.title} — Yayasan Amalianur</title></Head>
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <img src={post.image_url} alt={post.title} className="w-full h-[400px] object-cover rounded-xl shadow mb-8" />
          <h1 className="text-4xl font-bold text-green-800 mb-4">{post.title}</h1>
          <p className="text-gray-600 italic mb-6">Diterbitkan pada {new Date(post.published_at).toLocaleDateString()}</p>
          <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
