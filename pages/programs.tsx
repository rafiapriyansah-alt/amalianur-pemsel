// pages/programs.tsx 
"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion } from "framer-motion";

interface Program {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  category: string;
}

export default function Programs() {
  const supabase = getSupabase();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Tambah loading

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // ✅ Set loading mulai
      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      setPrograms(data || []);
      setLoading(false); // ✅ Stop loading
    };

    fetchData();

    
    const channel = supabase
      .channel("programs_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "programs" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Loading UI (tidak mengubah layout utama)
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </>
    );
  }

  // ✅ Tidak ada data setelah fetch
  if (!loading && programs.length === 0)
    return (
      <>
        <Navbar />
        <div className="text-center mt-32 text-gray-500">
          Belum ada program ditambahkan.
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-16">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-green-800 text-center mb-10"
        >
          Program Unggulan Yayasan Amalianur
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <img
                src={p.image_url || "https://placehold.co/600x400?text=No+Image"}
                alt={p.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-5">
                <h3 className="text-lg font-semibold text-green-800">{p.title}</h3>

                {p.subtitle && (
                  <p className="text-sm text-gray-600">{p.subtitle}</p>
                )}

                <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                  {p.description}
                </p>

                <div className="mt-2 text-xs text-green-600 font-medium">
                  {p.category}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
