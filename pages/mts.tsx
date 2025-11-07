// pages/mts.tsx
import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

interface MtsData {
  title: string;
  subtitle: string;
  logo_url: string;
  headmaster: string;
  headmaster_photo: string;
  teachers_count: number;
  students_count: number;
  programs: string[];
  extracurricular: string[];
  gallery: string[];
}

export default function MTS() {
  const [data, setData] = useState<MtsData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = getSupabase();

  const load = async () => {
    console.log("🔄 Loading MTS data...");
    const { data, error } = await supabase
      .from("mts")
      .select("*")
      .eq("slug", "mts")
      .single();

    if (error || !data) {
      console.log("❌ No data found, using default");
      setData({
        title: "Madrasah Tsanawiyah Amalianur",
        subtitle: "Membangun generasi Islami dan berprestasi.",
        logo_url: "/images/logo_mts.png",
        headmaster: "Ustadz Ahmad, S.Pd.I",
        headmaster_photo: "/images/headmaster_mts.jpg",
        teachers_count: 22,
        students_count: 250,
        programs: [
          "Tahfidz Qur'an",
          "Pembinaan Akhlak Islami",
          "Pengembangan Teknologi",
          "Bahasa Arab & Inggris Lanjutan",
        ],
        extracurricular: ["Marawis", "Paskibra", "Pramuka", "Futsal", "Kaligrafi"],
        gallery: [
          "/images/mts1.jpg",
          "/images/mts2.jpg",
          "/images/mts3.jpg",
          "/images/mts4.jpg",
        ],
      });
    } else {
      console.log("✅ Data loaded:", data);
      setData(data);
    }
  };

  useEffect(() => {
    load();

    // ✅ Realtime listener yang lebih robust
    const channel = supabase
      .channel("mts-realtime-public")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "mts" 
        },
        (payload) => {
          console.log("📡 Realtime update MTS:", payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log("🔌 Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Berhasil subscribe ke realtime MTS");
        } else if (status === "CHANNEL_ERROR") {
          console.log("❌ Error subscribe realtime MTS");
        } else if (status === "TIMED_OUT") {
          console.log("⏰ Timeout subscribe realtime MTS");
        }
      });

    return () => {
      console.log("🧹 Cleaning up realtime channel");
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-slide gallery
  useEffect(() => {
    if (!data?.gallery?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.gallery.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  // Debug effect untuk melihat perubahan data
  useEffect(() => {
    console.log("📊 Current MTS data:", data);
  }, [data]);

  if (!data) return <div className="text-center p-10">Memuat data...</div>;

  return (
    <>
      <Head>
        <title>{data.title || "MTs Amalianur"} — Yayasan Amalianur</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <main className="container mx-auto px-6 pt-32 pb-16 flex-1">
          
          {/* Judul + Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {data.logo_url && (
              <motion.img
                src={data.logo_url}
                alt="Logo MTs"
                className="w-16 h-16 object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                key={data.logo_url}
              />
            )}
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-green-800"
                key={data.title}
              >
                {data.title || "Madrasah Tsanawiyah Amalianur"}
              </motion.h1>
              {data.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-gray-600 mt-2"
                >
                  {data.subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {/* Kepala Sekolah */}
          <div className="grid md:grid-cols-2 gap-10 items-center mt-12">
            <motion.img
              src={data.headmaster_photo}
              alt={data.headmaster}
              className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              key={data.headmaster_photo}
            />
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-2">
                {data.headmaster}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Kepala Madrasah yang berkomitmen mencetak generasi Islami berprestasi tinggi di
                Yayasan Amalianur.
              </p>
            </motion.div>
          </div>

          {/* Statistik */}
          <section className="mt-16 grid md:grid-cols-2 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-md p-6 rounded-xl border-l-4 border-green-500"
              key={`teachers-${data.teachers_count}`}
            >
              <h3 className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <CountUp end={data.teachers_count} duration={3} /> Guru
              </h3>
              <p className="text-gray-600 mt-1">
                Guru profesional dan inspiratif.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow-md p-6 rounded-xl border-l-4 border-green-500"
              key={`students-${data.students_count}`}
            >
              <h3 className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <CountUp end={data.students_count} duration={3} /> Siswa
              </h3>
              <p className="text-gray-600 mt-1">
                Siswa aktif berprestasi akademik dan spiritual.
              </p>
            </motion.div>
          </section>

          {/* Program */}
          <section className="mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold text-green-800 text-center mb-10"
            >
              Program Unggulan
            </motion.h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.programs.map((p, i) => (
                <motion.div
                  key={`${p}-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-50 p-6 rounded-xl text-center shadow hover:shadow-lg"
                >
                  <h4 className="text-green-700 font-semibold">{p}</h4>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Ekstrakurikuler */}
          <section className="mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold text-green-800 text-center mb-10"
            >
              Kegiatan Ekstrakurikuler
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-4">
              {data.extracurricular.map((e, i) => (
                <motion.span
                  key={`${e}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-full shadow-sm hover:bg-green-200 transition"
                >
                  {e}
                </motion.span>
              ))}
            </div>
          </section>

          {/* Galeri */}
          <section className="mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold text-green-800 text-center mb-10"
            >
              Galeri Kegiatan
            </motion.h2>

            <div className="max-w-5xl mx-auto">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
                <motion.img
                  key={data.gallery[currentIndex]}
                  src={data.gallery[currentIndex]}
                  alt={`Galeri ${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex justify-center gap-3 mt-4">
                {data.gallery.map((g, i) => (
                  <motion.img
                    key={`${g}-${i}`}
                    src={g}
                    alt={`Preview ${i}`}
                    onClick={() => setCurrentIndex(i)}
                    whileHover={{ scale: 1.1 }}
                    className={`w-20 h-16 rounded-md object-cover cursor-pointer transition-all ${
                      currentIndex === i ? "ring-4 ring-green-500" : "opacity-70"
                    }`}
                  />
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