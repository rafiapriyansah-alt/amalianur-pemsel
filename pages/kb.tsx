"use client";
import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

interface KbData {
  title: string;
  logo_url: string;
  headmaster: string;
  headmaster_photo: string;
  teachers_count: number;
  students_count: number;
  programs: string[];
  extracurricular: string[];
  gallery: string[];
}

export default function KB() {
  const [data, setData] = useState<KbData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const supabase = getSupabase();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("kb").select("*").eq("slug", "kb").single();
      if (error || !data) {
        console.warn("Load KB:", error?.message);
        setData({
          title: "Kelompok Bermain Amalianur",
          logo_url: "/images/logo_kb.png",
          headmaster: "Ustadzah Aisyah, S.Pd.I",
          headmaster_photo: "/images/headmaster_kb.jpg",
          teachers_count: 10,
          students_count: 70,
          programs: [
            "Pembelajaran Kreatif Anak Usia Dini",
            "Penguatan Karakter Islami",
            "Pengenalan Huruf & Angka",
            "Seni dan Keterampilan Anak",
          ],
          extracurricular: ["Mewarnai", "Senam Ceria", "Marawis Mini", "Ceramah Anak"],
          gallery: ["/images/kb1.jpg", "/images/kb2.jpg", "/images/kb3.jpg", "/images/kb4.jpg"],
        });
      } else {
        setData(data);
      }
    }

    load();

    // 🔄 Realtime listener
    const channel = supabase
      .channel("kb-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "kb" }, async (payload) => {
        console.log("Realtime KB update:", payload);
        const { data } = await supabase.from("kb").select("*").eq("slug", "kb").single();
        if (data) setData(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!data?.gallery?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.gallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) return <div className="text-center p-10">Memuat data...</div>;

  return (
    <>
      <Head>
        <title>{data.title || "KB Amalianur"} — Yayasan Amalianur</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-28 pb-16 flex-1">
          
          {/* Judul + Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {data.logo_url && (
              <motion.img
                src={data.logo_url}
                alt="Logo KB"
                className="w-16 h-16 object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold text-center text-green-800"
            >
              {data.title || "Kelompok Bermain Amalianur"}
            </motion.h1>
          </div>

          {/* Kepala Sekolah */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <motion.img
              src={data.headmaster_photo}
              alt={data.headmaster}
              className="rounded-2xl shadow-lg object-cover w-full h-[300px] md:h-[400px]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl md:text-2xl font-semibold text-green-700 mb-2">{data.headmaster}</h2>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Kepala Kelompok Bermain yang penuh semangat dalam membimbing anak-anak usia dini
                menuju karakter Islami sejak dini.
              </p>
            </motion.div>
          </div>

          {/* Statistik */}
          <section className="mt-16 grid md:grid-cols-2 gap-6 md:gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md p-6 rounded-xl border-l-4 border-green-500"
            >
              <h3 className="text-xl md:text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <CountUp end={data.teachers_count} duration={3} /> Guru
              </h3>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Guru berpengalaman dan penyayang anak.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md p-6 rounded-xl border-l-4 border-green-500"
            >
              <h3 className="text-xl md:text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <CountUp end={data.students_count} duration={3} /> Siswa
              </h3>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Anak-anak ceria dan aktif setiap hari.</p>
            </motion.div>
          </section>

          {/* Program Unggulan */}
          <section className="mt-16 md:mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-semibold text-green-800 text-center mb-8 md:mb-10"
            >
              Program Unggulan
            </motion.h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {data.programs.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-50 p-4 md:p-6 rounded-xl text-center shadow hover:shadow-lg"
                >
                  <h4 className="text-green-700 font-semibold text-sm md:text-base">{p}</h4>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Ekstrakurikuler */}
          <section className="mt-16 md:mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-semibold text-green-800 text-center mb-8 md:mb-10"
            >
              Kegiatan Ekstrakurikuler
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {data.extracurricular.map((e, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-green-100 text-green-700 px-3 md:px-4 py-2 rounded-full shadow-sm hover:bg-green-200 transition text-sm md:text-base"
                >
                  {e}
                </motion.span>
              ))}
            </div>
          </section>

          {/* Galeri - VERSI BARU dengan efek smooth untuk mobile */}
          <section className="mt-16 md:mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-semibold text-green-800 text-center mb-8 md:mb-10"
            >
              Galeri Kegiatan
            </motion.h2>

            {/* Modal untuk mobile */}
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:hidden"
                onClick={() => setSelectedImage(null)}
              >
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  src={selectedImage}
                  alt="Galeri"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => setSelectedImage(null)}
                >
                  ✕
                </button>
              </motion.div>
            )}

            {/* Mobile: Grid dengan efek paralax */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {data.gallery.map((g, i) => (
                  <motion.div
                    key={`${g}-${i}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className="relative group"
                  >
                    {/* Gambar utama */}
                    <div className="aspect-square rounded-xl overflow-hidden shadow-lg transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                      <img
                        src={g}
                        alt={`Galeri ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay effect */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl" />
                    
                    {/* Preview effect - gambar berikutnya terlihat sedikit */}
                    {i < data.gallery.length - 1 && (
                      <motion.div 
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg overflow-hidden shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500"
                        whileHover={{ scale: 1.2 }}
                      >
                        <img
                          src={data.gallery[i + 1]}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                    
                    {/* Click area */}
                    <div 
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => setSelectedImage(g)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Preview indicator untuk mobile */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6"
              >
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Tap gambar untuk melihat lebih detail
                </p>
              </motion.div>
            </div>

            {/* Desktop: Slider dengan auto-play */}
            <div className="hidden md:block max-w-5xl mx-auto">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg group">
                <motion.img
                  key={data.gallery[currentIndex]}
                  src={data.gallery[currentIndex]}
                  alt={`Galeri ${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Navigation dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {data.gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentIndex === i 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnail preview */}
              <div className="flex justify-center gap-3 mt-6">
                {data.gallery.map((g, i) => (
                  <motion.div
                    key={`${g}-${i}`}
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img
                      src={g}
                      alt={`Preview ${i}`}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-16 h-12 rounded-lg object-cover cursor-pointer transition-all duration-300 shadow-md ${
                        currentIndex === i 
                          ? 'ring-3 ring-green-500 transform scale-110' 
                          : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-green-300'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}