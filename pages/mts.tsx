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
          subtitle: "Membangun generasi Islami dan berprestasi",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 text-lg font-medium">Memuat data MTS...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center px-6">
          <p className="text-red-600 text-lg font-medium mb-4">Gagal memuat data. Silakan refresh halaman.</p>
          <button 
            onClick={load}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-medium"
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        
        {/* MAIN CONTENT - MOBILE TETAP BESAR, DESKTOP & IPAD DIPERBAIKI */}
        <main className="w-full mx-auto px-4 sm:px-5 pt-24 pb-12 flex-1 overflow-x-hidden">
          
          {/* JUDUL - MOBILE TETAP BESAR, DESKTOP & IPAD DIKECILKAN */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8 lg:mb-10 text-center w-full">
            {data.logo_url && (
              <motion.img
                src={data.logo_url}
                alt="Logo MTs"
                className="w-20 h-20 lg:w-16 lg:h-16 object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}
            <div className="w-full">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold text-green-800 leading-tight"
              >
                {data.title || "Madrasah Tsanawiyah Amalianur"}
              </motion.h1>
              {data.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg sm:text-xl lg:text-lg xl:text-xl text-gray-600 mt-3 lg:mt-2 font-medium"
                >
                  {data.subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {/* KEPALA SEKOLAH - MOBILE TETAP, DESKTOP & IPAD DIKECILKAN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-center mt-8 lg:mt-10 xl:mt-12 w-full max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center w-full"
            >
              <img
                src={data.headmaster_photo}
                alt={data.headmaster}
                className="rounded-2xl lg:rounded-xl xl:rounded-2xl shadow-xl lg:shadow-lg object-cover w-full max-w-md h-80 sm:h-96 lg:h-80 xl:h-96"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left w-full space-y-3 lg:space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold text-green-700">
                {data.headmaster}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg sm:text-xl lg:text-base xl:text-lg">
                Kepala Madrasah yang berkomitmen mencetak generasi Islami berprestasi tinggi di
                Yayasan Amalianur dengan pendekatan pendidikan yang holistik dan islami.
              </p>
            </motion.div>
          </div>

          {/* STATISTIK - MOBILE TETAP, DESKTOP & IPAD DIKECILKAN */}
          <section className="mt-12 lg:mt-14 xl:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 text-center w-full max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-lg lg:shadow-md rounded-2xl lg:rounded-xl p-6 lg:p-6 xl:p-8 border-l-4 border-green-500"
            >
              <h3 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-bold text-green-800 flex items-center justify-center gap-3 mb-3">
                <CountUp end={data.teachers_count} duration={3} /> 
                <span className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl">Guru</span>
              </h3>
              <p className="text-gray-600 text-lg sm:text-xl lg:text-base xl:text-lg">
                Guru profesional dan inspiratif
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow-lg lg:shadow-md rounded-2xl lg:rounded-xl p-6 lg:p-6 xl:p-8 border-l-4 border-green-500"
            >
              <h3 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-bold text-green-800 flex items-center justify-center gap-3 mb-3">
                <CountUp end={data.students_count} duration={3} /> 
                <span className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl">Siswa</span>
              </h3>
              <p className="text-gray-600 text-lg sm:text-xl lg:text-base xl:text-lg">
                Siswa aktif berprestasi akademik dan spiritual
              </p>
            </motion.div>
          </section>

          {/* PROGRAM UNGGULAN - MOBILE TETAP, DESKTOP & IPAD DIKECILKAN */}
          <section className="mt-12 lg:mt-14 xl:mt-16 w-full max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-bold text-green-800 text-center mb-8 lg:mb-10"
            >
              Program Unggulan
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-4 xl:gap-6">
              {data.programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-50 rounded-2xl lg:rounded-xl p-6 lg:p-5 xl:p-6 text-center shadow-lg lg:shadow-md hover:shadow-xl transition-all duration-300 border border-green-200"
                >
                  <h4 className="text-xl sm:text-2xl lg:text-lg xl:text-xl font-semibold text-green-700 leading-tight">
                    {program}
                  </h4>
                </motion.div>
              ))}
            </div>
          </section>

          {/* EKSTRAKURIKULER - MOBILE TETAP, DESKTOP & IPAD DIKECILKAN */}
          <section className="mt-12 lg:mt-14 xl:mt-16 w-full max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-bold text-green-800 text-center mb-6 lg:mb-8"
            >
              Kegiatan Ekstrakurikuler
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-3 lg:gap-2 xl:gap-3">
              {data.extracurricular.map((activity, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-100 text-green-700 px-5 lg:px-4 xl:px-5 py-3 lg:py-2 xl:py-3 rounded-2xl lg:rounded-xl shadow-md hover:bg-green-200 transition-all text-lg sm:text-xl lg:text-base xl:text-lg font-medium whitespace-nowrap"
                >
                  {activity}
                </motion.span>
              ))}
            </div>
          </section>

          {/* GALERI KEGIATAN - MOBILE TETAP BESAR, DESKTOP & IPAD DIKECILKAN */}
          <section className="mt-12 lg:mt-14 xl:mt-16 w-full max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-bold text-green-800 text-center mb-6 lg:mb-8"
            >
              Galeri Kegiatan
            </motion.h2>

            <div className="w-full">
              {/* MOBILE SIMPLE SLIDER - TETAP BESAR */}
              <div className="block lg:hidden w-full">
                <div 
                  className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-gray-50 shadow-2xl mx-auto"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img
                        src={data.gallery[currentIndex]}
                        alt={`Galeri ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Dots - BESAR untuk mobile */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
                    {data.gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          currentIndex === index 
                            ? 'bg-white scale-125' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows - BESAR untuk mobile */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20">
                    <button
                      onClick={handlePrev}
                      className="bg-white/90 hover:bg-white text-green-700 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 text-xl"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-white/90 hover:bg-white text-green-700 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 text-xl"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    Geser untuk melihat gambar lainnya
                  </p>
                </div>
              </div>

              {/* DESKTOP & IPAD 3D SLIDER - DIKECILKAN */}
              <div className="hidden lg:block w-full">
                <div className="relative w-full h-[350px] xl:h-[400px] flex items-center justify-center">
                  {/* Previous Image */}
                  <motion.div
                    className="absolute left-4 xl:left-6 w-1/4 xl:w-1/3 h-3/4 rounded-xl xl:rounded-2xl overflow-hidden shadow-lg opacity-60 z-10"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={data.gallery[(currentIndex - 1 + data.gallery.length) % data.gallery.length]}
                      alt="Previous"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                  </motion.div>

                  {/* Current Image */}
                  <motion.div
                    className="absolute w-2/3 xl:w-1/2 h-full rounded-2xl xl:rounded-3xl overflow-hidden shadow-xl xl:shadow-2xl z-20"
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={data.gallery[currentIndex]}
                      alt={`Galeri ${currentIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Next Image */}
                  <motion.div
                    className="absolute right-4 xl:right-6 w-1/4 xl:w-1/3 h-3/4 rounded-xl xl:rounded-2xl overflow-hidden shadow-lg opacity-60 z-10"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={data.gallery[(currentIndex + 1) % data.gallery.length]}
                      alt="Next"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                  </motion.div>

                  {/* Navigation Arrows - DIKECILKAN untuk desktop & iPad */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 xl:px-6 z-30">
                    <button
                      onClick={handlePrev}
                      className="bg-white/90 hover:bg-white text-green-700 w-10 h-10 xl:w-12 xl:h-12 rounded-full shadow-lg xl:shadow-xl flex items-center justify-center transition-all hover:scale-110 text-lg xl:text-xl"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-white/90 hover:bg-white text-green-700 w-10 h-10 xl:w-12 xl:h-12 rounded-full shadow-lg xl:shadow-xl flex items-center justify-center transition-all hover:scale-110 text-lg xl:text-xl"
                    >
                      →
                    </button>
                  </div>

                  {/* Navigation Dots - DIKECILKAN untuk desktop & iPad */}
                  <div className="absolute bottom-4 xl:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 xl:gap-3 z-30">
                    {data.gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 xl:w-4 xl:h-4 rounded-full transition-all duration-300 ${
                          currentIndex === index 
                            ? 'bg-white scale-125' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnails - DIKECILKAN untuk desktop & iPad */}
                <div className="flex justify-center gap-3 xl:gap-4 mt-6 xl:mt-8 overflow-x-auto py-2">
                  {data.gallery.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex-shrink-0"
                    >
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-14 h-10 xl:w-16 xl:h-12 rounded-lg xl:rounded-xl object-cover cursor-pointer transition-all duration-300 shadow-md ${
                          currentIndex === index 
                            ? 'ring-2 xl:ring-3 ring-green-500 transform scale-105' 
                            : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-green-300'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}