// pages/mts.tsx
import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabase();

  const load = async () => {
    console.log("🔄 Loading MTS data...");
    setIsLoading(true);
    
    try {
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
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Touch handlers untuk mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleNext = useCallback(() => {
    if (!data?.gallery?.length) return;
    setCurrentIndex((prev) => (prev + 1) % data.gallery.length);
  }, [data?.gallery]);

  const handlePrev = useCallback(() => {
    if (!data?.gallery?.length) return;
    setCurrentIndex((prev) => (prev - 1 + data.gallery.length) % data.gallery.length);
  }, [data?.gallery]);

  useEffect(() => {
    load();

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
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-slide gallery
  useEffect(() => {
    if (!data?.gallery?.length) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [data, handleNext]);

  // Fungsi untuk mendapatkan gambar sebelumnya dan sesudahnya
  const getPrevIndex = (current: number) => 
    data?.gallery?.length ? (current - 1 + data.gallery.length) % data.gallery.length : 0;
  
  const getNextIndex = (current: number) => 
    data?.gallery?.length ? (current + 1) % data.gallery.length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Memuat data MTS...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <p className="text-red-600">Gagal memuat data. Silakan refresh halaman.</p>
          <button 
            onClick={load}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{data.title || "MTs Amalianur"} — Yayasan Amalianur</title>
        <meta name="description" content={data.subtitle || "Madrasah Tsanawiyah Amalianur - Membangun generasi Islami dan berprestasi"} />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-28 pb-16 flex-1">
          
          {/* Judul + Logo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-center sm:text-left">
            {data.logo_url && (
              <motion.img
                src={data.logo_url}
                alt="Logo MTs"
                className="w-16 h-16 object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl md:text-5xl font-bold text-green-800"
              >
                {data.title || "Madrasah Tsanawiyah Amalianur"}
              </motion.h1>
              {data.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm sm:text-base md:text-lg text-gray-600 mt-2"
                >
                  {data.subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {/* Kepala Sekolah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center mt-8 md:mt-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <img
                src={data.headmaster_photo}
                alt={data.headmaster}
                className="rounded-xl md:rounded-2xl shadow-lg object-cover w-full max-w-md h-[250px] md:h-[400px]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-green-700 mb-3">
                {data.headmaster}
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Kepala Madrasah yang berkomitmen mencetak generasi Islami berprestasi tinggi di
                Yayasan Amalianur dengan pendekatan pendidikan yang holistik dan islami.
              </p>
            </motion.div>
          </div>

          {/* Statistik */}
          <section className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-md p-4 md:p-6 rounded-xl border-l-4 border-green-500"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <CountUp end={data.teachers_count} duration={3} /> Guru
              </h3>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Guru profesional dan inspiratif
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow-md p-4 md:p-6 rounded-xl border-l-4 border-green-500"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
                <CountUp end={data.students_count} duration={3} /> Siswa
              </h3>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Siswa aktif berprestasi akademik dan spiritual
              </p>
            </motion.div>
          </section>

          {/* Program Unggulan */}
          <section className="mt-12 md:mt-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-800 text-center mb-6 md:mb-10"
            >
              Program Unggulan
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {data.programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-50 p-4 md:p-6 rounded-xl text-center shadow hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-green-700 font-semibold text-sm md:text-base">
                    {program}
                  </h4>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Ekstrakurikuler */}
          <section className="mt-12 md:mt-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-800 text-center mb-6 md:mb-10"
            >
              Kegiatan Ekstrakurikuler
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {data.extracurricular.map((activity, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-100 text-green-700 px-3 md:px-4 py-2 rounded-full shadow-sm hover:bg-green-200 transition text-xs sm:text-sm md:text-base"
                >
                  {activity}
                </motion.span>
              ))}
            </div>
          </section>

          {/* Galeri Kegiatan - VERSI RESPONSIF */}
          <section className="mt-12 md:mt-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-800 text-center mb-6 md:mb-10"
            >
              Galeri Kegiatan
            </motion.h2>

            <div className="max-w-4xl mx-auto">
              {/* Container untuk 3D effect */}
              <div 
                className="relative h-[200px] sm:h-[300px] md:h-[400px] flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Gambar sebelumnya (kiri) */}
                <motion.div
                  className="absolute left-0 sm:left-2 md:left-4 w-1/4 sm:w-1/4 md:w-1/3 h-1/2 sm:h-3/4 rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg opacity-30 sm:opacity-60 z-10"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 0.3, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={data.gallery[getPrevIndex(currentIndex)]}
                    alt="Previous"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 sm:bg-black/30"></div>
                </motion.div>

                {/* Gambar utama (tengah) */}
                <motion.div
                  className="absolute w-3/4 sm:w-3/4 md:w-2/3 h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl z-20 mx-auto"
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={data.gallery[currentIndex]}
                    alt={`Galeri ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Gambar berikutnya (kanan) */}
                <motion.div
                  className="absolute right-0 sm:right-2 md:right-4 w-1/4 sm:w-1/4 md:w-1/3 h-1/2 sm:h-3/4 rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg opacity-30 sm:opacity-60 z-10"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 0.3, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={data.gallery[getNextIndex(currentIndex)]}
                    alt="Next"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 sm:bg-black/30"></div>
                </motion.div>

                {/* Navigation Arrows - Desktop & Tablet */}
                <div className="hidden sm:flex absolute inset-y-0 left-0 right-0 items-center justify-between z-30 px-2 md:px-4">
                  <button
                    onClick={handlePrev}
                    className="bg-white/80 hover:bg-white text-green-700 w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 text-sm md:text-base"
                    aria-label="Gambar sebelumnya"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-white/80 hover:bg-white text-green-700 w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 text-sm md:text-base"
                    aria-label="Gambar berikutnya"
                  >
                    →
                  </button>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 z-30">
                  {data.gallery.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        currentIndex === index 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Pergi ke gambar ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Navigation & Instructions */}
              <div className="sm:hidden text-center mt-4">
                <div className="flex justify-center gap-4 mb-2">
                  <button
                    onClick={handlePrev}
                    className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all"
                    aria-label="Gambar sebelumnya"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all"
                    aria-label="Gambar berikutnya"
                  >
                    →
                  </button>
                </div>
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Geser atau tekan tombol untuk melihat gambar lainnya
                </p>
              </div>

              {/* Thumbnail Preview untuk Tablet & Desktop */}
              <div className="hidden sm:flex justify-center gap-2 md:gap-3 mt-4 md:mt-6 overflow-x-auto py-2">
                {data.gallery.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex-shrink-0"
                  >
                    <img
                      src={image}
                      alt={`Preview ${index}`}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-12 h-9 md:w-16 md:h-12 rounded-md md:rounded-lg object-cover cursor-pointer transition-all duration-300 shadow ${
                        currentIndex === index 
                          ? 'ring-2 ring-green-500 transform scale-105' 
                          : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-green-300'
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