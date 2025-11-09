import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import CountUp from "react-countup";

interface KbData {
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

export default function KB() {
  const [data, setData] = useState<KbData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabase();

  const load = async () => {
    console.log("🔄 Loading KB data...");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("kb")
        .select("*")
        .eq("slug", "kb")
        .single();

      if (error || !data) {
        console.log("❌ No data found, using default");
        setData({
          title: "Kelompok Bermain Amalianur",
          subtitle: "Pendidikan anak usia dini yang islami dan menyenangkan",
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
          gallery: [
            "/images/kb1.jpg",
            "/images/kb2.jpg",
            "/images/kb3.jpg",
            "/images/kb4.jpg",
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
      .channel("kb-realtime-public")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "kb" 
        },
        (payload) => {
          console.log("📡 Realtime update KB:", payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log("🔌 Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Berhasil subscribe ke realtime KB");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-slide gallery untuk desktop
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Memuat data KB...</p>
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
        <title>{data.title || "KB Amalianur"} — Yayasan Amalianur</title>
        <meta name="description" content={data.subtitle || "Kelompok Bermain Amalianur - Pendidikan anak usia dini yang islami dan menyenangkan"} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <main className="w-full mx-auto px-3 sm:px-4 md:px-6 pt-24 md:pt-28 pb-12 md:pb-16 flex-1 overflow-x-hidden">
          
          {/* Judul + Logo */}
          <div className="flex flex-col items-center justify-center gap-3 mb-6 md:mb-8 text-center w-full">
            {data.logo_url && (
              <motion.img
                src={data.logo_url}
                alt="Logo KB"
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}
            <div className="w-full max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-green-800 px-2 break-words"
              >
                {data.title || "Kelompok Bermain Amalianur"}
              </motion.h1>
              {data.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mt-1 md:mt-2 px-2"
                >
                  {data.subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {/* Kepala Sekolah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-10 items-center mt-6 md:mt-8 lg:mt-12 w-full max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center w-full"
            >
              <img
                src={data.headmaster_photo}
                alt={data.headmaster}
                className="rounded-lg md:rounded-xl lg:rounded-2xl shadow-md object-cover w-full max-w-xs sm:max-w-sm md:max-w-md h-[200px] sm:h-[250px] md:h-[350px] lg:h-[400px]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left w-full px-2 sm:px-0"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-green-700 mb-2 md:mb-3">
                {data.headmaster}
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                Kepala Kelompok Bermain yang penuh semangat dalam membimbing anak-anak usia dini
                menuju karakter Islami sejak dini dengan metode pembelajaran yang kreatif dan menyenangkan.
              </p>
            </motion.div>
          </div>

          {/* Statistik */}
          <section className="mt-8 md:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 lg:gap-8 text-center w-full max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-sm md:shadow-md p-3 sm:p-4 md:p-6 rounded-lg md:rounded-xl border-l-4 border-green-500"
            >
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-800 flex items-center justify-center gap-1 md:gap-2">
                <CountUp end={data.teachers_count} duration={3} /> Guru
              </h3>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Guru berpengalaman dan penyayang anak
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow-sm md:shadow-md p-3 sm:p-4 md:p-6 rounded-lg md:rounded-xl border-l-4 border-green-500"
            >
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-800 flex items-center justify-center gap-1 md:gap-2">
                <CountUp end={data.students_count} duration={3} /> Siswa
              </h3>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Anak-anak ceria dan aktif setiap hari
              </p>
            </motion.div>
          </section>

          {/* Program Unggulan */}
          <section className="mt-8 md:mt-12 lg:mt-16 w-full max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-green-800 text-center mb-4 md:mb-6 lg:mb-8"
            >
              Program Unggulan
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6 px-2 sm:px-0">
              {data.programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-50 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl text-center shadow-sm hover:shadow-md transition-shadow border border-green-100"
                >
                  <h4 className="text-green-700 font-semibold text-xs sm:text-sm md:text-base lg:text-lg leading-tight">
                    {program}
                  </h4>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Ekstrakurikuler */}
          <section className="mt-8 md:mt-12 lg:mt-16 w-full max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-green-800 text-center mb-4 md:mb-6 lg:mb-8"
            >
              Kegiatan Ekstrakurikuler
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 px-2">
              {data.extracurricular.map((activity, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-100 text-green-700 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full shadow-xs hover:bg-green-200 transition text-xs sm:text-sm md:text-base whitespace-nowrap"
                >
                  {activity}
                </motion.span>
              ))}
            </div>
          </section>

          {/* Galeri Kegiatan */}
          <section className="mt-8 md:mt-12 lg:mt-16 w-full max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-green-800 text-center mb-4 md:mb-6 lg:mb-8"
            >
              Galeri Kegiatan
            </motion.h2>

            <div className="w-full">
              {/* MOBILE SIMPLE SLIDER */}
              <div className="block md:hidden w-full">
                <div 
                  className="relative w-full h-[250px] sm:h-[300px] rounded-xl overflow-hidden bg-gray-50 shadow-lg mx-auto"
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

                  {/* Navigation Dots */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-30">
                    {data.gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentIndex === index 
                            ? 'bg-white scale-125' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 z-20">
                    <button
                      onClick={handlePrev}
                      className="bg-white/90 hover:bg-white text-green-700 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all active:scale-95 text-sm"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-white/90 hover:bg-white text-green-700 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all active:scale-95 text-sm"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Geser untuk melihat gambar lainnya
                  </p>
                </div>
              </div>

              {/* DESKTOP 3D SLIDER */}
              <div className="hidden md:block w-full">
                <div className="relative w-full h-[350px] lg:h-[400px] flex items-center justify-center">
                  {/* Previous Image */}
                  <motion.div
                    className="absolute left-2 lg:left-4 w-1/4 lg:w-1/3 h-3/4 rounded-lg lg:rounded-xl overflow-hidden shadow-lg opacity-60 z-10"
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
                    className="absolute w-2/3 lg:w-1/2 h-full rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl z-20"
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
                    className="absolute right-2 lg:right-4 w-1/4 lg:w-1/3 h-3/4 rounded-lg lg:rounded-xl overflow-hidden shadow-lg opacity-60 z-10"
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

                  {/* Navigation Arrows */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 lg:px-4 z-30">
                    <button
                      onClick={handlePrev}
                      className="bg-white/90 hover:bg-white text-green-700 w-9 h-9 lg:w-10 lg:h-10 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 text-sm lg:text-base"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="bg-white/90 hover:bg-white text-green-700 w-9 h-9 lg:w-10 lg:h-10 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 text-sm lg:text-base"
                    >
                      →
                    </button>
                  </div>

                  {/* Navigation Dots */}
                  <div className="absolute bottom-3 lg:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 lg:gap-2 z-30">
                    {data.gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                          currentIndex === index 
                            ? 'bg-white scale-125' 
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex justify-center gap-2 lg:gap-3 mt-4 lg:mt-6 overflow-x-auto py-2 px-2">
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
                        className={`w-12 h-9 lg:w-14 lg:h-10 xl:w-16 xl:h-12 rounded-md object-cover cursor-pointer transition-all duration-300 shadow ${
                          currentIndex === index 
                            ? 'ring-2 ring-green-500 transform scale-105' 
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