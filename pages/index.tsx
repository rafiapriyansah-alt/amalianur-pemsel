// pages/index.tsx
import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { ChevronRight, Calendar, User, Quote } from "lucide-react";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import Hero from "../components/admin/Hero";

interface HomeData {
  id?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  welcome_message?: string;
  kepala_photo?: string;
  kepala_name?: string;
  ttd_photo?: string;
  kb_title?: string;
  kb_desc?: string;
  kb_image?: string;
  tk_title?: string;
  tk_desc?: string;
  tk_image?: string;
  mts_title?: string;
  mts_desc?: string;
  mts_image?: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  published_at?: string;
  author?: string;
  created_at?: string;
}

interface EducationItem {
  key: string;
  title: string;
  desc: string;
  img: string;
  link: string;
}

export default function Home() {
  const supabase = getSupabase();
  const [home, setHome] = useState<HomeData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentEduIndex, setCurrentEduIndex] = useState(0);
  const [newsPosition, setNewsPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const newsItemRef = useRef<HTMLDivElement>(null);
  const eduSliderRef = useRef<HTMLDivElement>(null);
  const newsSliderRef = useRef<HTMLDivElement>(null);
  
  const [dragStartX, setDragStartX] = useState(0);
  const [newsDragStartX, setNewsDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: homeData } = await supabase.from("home").select("*").single();
        setHome(homeData ?? null);

        const { data: posts } = await supabase
          .from("posts")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(8);
        setNews(posts ?? []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();

    const homeSub = supabase
      .channel("home-changes")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "home" }, 
        loadData
      )
      .subscribe();

    const postSub = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "posts" }, 
        loadData
      )
      .subscribe();

    return () => {
      homeSub.unsubscribe();
      postSub.unsubscribe();
    };
  }, [supabase]);

  // Education items data
  const educationItems: EducationItem[] = [
    {
      key: "kb",
      title: home?.kb_title || "Kelompok Bermain (KB)",
      desc: home?.kb_desc || "KB — Belajar sambil bermain dengan pembinaan karakter Islami.",
      img: home?.kb_image || "/images/kb.jpg",
      link: "/kb",
    },
    {
      key: "tk",
      title: home?.tk_title || "TK Amalianur",
      desc: home?.tk_desc || "Pendidikan anak usia dini yang interaktif dan menyenangkan.",
      img: home?.tk_image || "/images/tk.jpg",
      link: "/tk",
    },
    {
      key: "mts",
      title: home?.mts_title || "MTs Amalianur",
      desc: home?.mts_desc || "Madrasah unggulan dengan integrasi ilmu dan akhlak.",
      img: home?.mts_image || "/images/mts.jpg",
      link: "/mts",
    },
  ];

  // Auto slide pendidikan ke kanan setiap 5 detik hanya untuk mobile
  useEffect(() => {
    if (!isMobile || isDragging) return;

    const timer = setInterval(() => {
      setCurrentEduIndex((prev) => (prev + 1) % educationItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [educationItems.length, isMobile, isDragging]);

  // Auto slide berita ke kiri
  useEffect(() => {
    if (news.length === 0 || isDragging) return;

    const timer = setInterval(() => {
      setNewsPosition((prev) => {
        const containerWidth = newsContainerRef.current?.offsetWidth || 0;
        const itemWidth = 280; // Fixed width untuk konsistensi
        const gap = 16;
        const itemsPerView = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));
        const maxPosition = Math.max(0, news.length - itemsPerView);
        
        const newPosition = prev + 1;
        return newPosition > maxPosition ? 0 : newPosition;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [news.length, isDragging]);

  // Format tanggal
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  // Navigasi manual pendidikan
  const goToEduSlide = (index: number) => {
    setCurrentEduIndex(index);
  };

  // Navigasi manual berita
  const goToNewsSlide = (index: number) => {
    setNewsPosition(index);
  };

  // Handle drag untuk mobile slider pendidikan
  const handleEduTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
  };

  const handleEduTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleEduTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const dragEndX = e.changedTouches[0].clientX;
    const dragDistance = dragStartX - dragEndX;
    const threshold = 50;

    if (dragDistance > threshold) {
      // Swipe ke kiri - next
      setCurrentEduIndex((prev) => (prev + 1) % educationItems.length);
    } else if (dragDistance < -threshold) {
      // Swipe ke kanan - previous
      setCurrentEduIndex((prev) => (prev - 1 + educationItems.length) % educationItems.length);
    }
    
    setTimeout(() => setIsDragging(false), 100);
  };

  // Handle drag untuk news slider
  const handleNewsTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setNewsDragStartX(e.touches[0].clientX);
  };

  const handleNewsTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleNewsTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const dragEndX = e.changedTouches[0].clientX;
    const dragDistance = newsDragStartX - dragEndX;
    const threshold = 50;

    if (dragDistance > threshold) {
      // Swipe ke kiri - next
      const containerWidth = newsContainerRef.current?.offsetWidth || 0;
      const itemWidth = 280;
      const gap = 16;
      const itemsPerView = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));
      const maxPosition = Math.max(0, news.length - itemsPerView);
      
      setNewsPosition(prev => prev >= maxPosition ? 0 : prev + 1);
    } else if (dragDistance < -threshold) {
      // Swipe ke kanan - previous
      const containerWidth = newsContainerRef.current?.offsetWidth || 0;
      const itemWidth = 280;
      const gap = 16;
      const itemsPerView = Math.max(1, Math.floor(containerWidth / (itemWidth + gap)));
      const maxPosition = Math.max(0, news.length - itemsPerView);
      
      setNewsPosition(prev => prev <= 0 ? maxPosition : prev - 1);
    }
    
    setTimeout(() => setIsDragging(false), 100);
  };

  // Prepare hero images - convert single image to array
  const getHeroImages = (): string[] => {
    if (home?.hero_image) {
      return [home.hero_image];
    }
    return ['/images/hero-default.jpg'];
  };

  // Calculate items per view untuk news slider
  const getNewsItemsPerView = () => {
    if (!isMobile) return 3;
    const containerWidth = newsContainerRef.current?.offsetWidth || 0;
    return Math.max(1, Math.floor(containerWidth / 296)); // 280px + 16px gap
  };

  return (
    <>
      <Head>
        <title>Yayasan Amalianur — Home</title>
        <meta name="description" content="Yayasan Amalianur - Pendidikan Islami Terpadu" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
        <Navbar />
        <main className="flex-1">
          {/* Hero */}
          <Hero
            title={home?.hero_title}
            subtitle={home?.hero_subtitle}
            images={getHeroImages()}
          />

          {/* Ucapan Kepala Yayasan */}
          <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="bg-white rounded-2xl p-6 md:p-12 shadow-2xl border border-green-100 relative overflow-hidden"
            >
              {/* Background decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-green-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-50 rounded-full translate-x-1/3 translate-y-1/3 opacity-70"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  className="md:w-1/3 w-full flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur-lg opacity-20"></div>
                    <img
                      src={home?.kepala_photo || "/images/kepala-yayasan.jpg"}
                      alt="Kepala Yayasan"
                      className="rounded-2xl shadow-xl w-full max-w-xs md:max-w-sm object-cover relative z-10 border-4 border-white"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  className="md:w-2/3 text-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Quote className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-green-800">
                      Sambutan Kepala Yayasan
                    </h2>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500 mb-6">
                    <p className="text-base md:text-lg leading-relaxed text-gray-700 italic">
                      "{home?.welcome_message ||
                        "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di Yayasan Amalianur, lembaga pendidikan yang berkomitmen untuk mencetak generasi Muslim yang berakhlak mulia, berilmu, dan berkontribusi bagi umat. Kami percaya bahwa pendidikan adalah investasi terbaik untuk masa depan, dan melalui pendekatan Islami yang terpadu, kami berusaha menciptakan lingkungan belajar yang inspiratif dan menyenangkan."}"
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-green-200">
                    <div>
                      <p className="font-semibold text-green-800 text-lg">
                        {home?.kepala_name || "H. Ahmad Fauzan"}
                      </p>
                      <p className="text-sm text-gray-500">Kepala Yayasan Amalianur</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Membangun Generasi Muslim Berakhlak Mulia
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* === Pendidikan dengan Tampilan Berbeda Desktop vs Mobile === */}
          <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 bg-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-green-800 mb-4">
                Pendidikan di Yayasan Amalianur
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
                Temukan jenjang pendidikan terbaik untuk putra-putri Anda dengan kurikulum Islami yang terpadu
              </p>
            </motion.div>

            {/* Desktop View - Grid 3 Kolom */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                {educationItems.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ 
                      opacity: 0, 
                      x: i === 0 ? -50 : i === 2 ? 50 : 0,
                      y: i === 1 ? 50 : 0
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0,
                      y: 0
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: i * 0.2 
                    }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-green-100 group h-full flex flex-col"
                  >
                    <div className="relative h-56 md:h-64 overflow-hidden flex-shrink-0">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 md:p-6 flex flex-col flex-grow">
                      <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-lg flex-grow">
                        {item.desc}
                      </p>
                      <Link
                        href={item.link}
                        className="inline-flex items-center bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-green-700 font-semibold transition-all duration-300 transform hover:translate-x-2 mt-auto text-sm md:text-base"
                      >
                        Lihat Detail
                        <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile View - Slider dengan Touch Support */}
            <div className="md:hidden">
              <div className="relative max-w-4xl mx-auto px-2">
                {/* Slider Wrapper */}
                <div className="overflow-hidden rounded-2xl">
                  <motion.div
                    ref={eduSliderRef}
                    className="flex"
                    style={{ width: `${educationItems.length * 100}%` }}
                    animate={{ x: `-${(currentEduIndex * 100) / educationItems.length}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onTouchStart={handleEduTouchStart}
                    onTouchMove={handleEduTouchMove}
                    onTouchEnd={handleEduTouchEnd}
                  >
                    {educationItems.map((item, i) => (
                      <div
                        key={item.key}
                        className="w-full flex-shrink-0 px-2"
                        style={{ width: `${100 / educationItems.length}%` }}
                      >
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-green-100 h-full flex flex-col">
                          <div className="relative h-48 overflow-hidden flex-shrink-0">
                            <img
                              src={item.img}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                              <h3 className="text-xl font-bold text-white">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <p className="text-gray-600 leading-relaxed mb-4 text-sm flex-grow">
                              {item.desc}
                            </p>
                            <Link
                              href={item.link}
                              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition-all duration-300 transform hover:translate-x-2 mt-auto text-sm"
                            >
                              Lihat Detail
                              <ChevronRight className="ml-2 w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Dots Indicator untuk Mobile */}
                <div className="flex justify-center gap-2 mt-6">
                  {educationItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToEduSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentEduIndex === i 
                          ? 'bg-green-600 w-6' 
                          : 'bg-green-300 hover:bg-green-400'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* === Berita Terbaru dengan Slider === */}
          <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 bg-green-50">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-green-800 mb-4">
                Berita Terbaru
              </h2>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-4">
                Ikuti perkembangan dan kegiatan terbaru di Yayasan Amalianur
              </p>
            </motion.div>

            {news.length > 0 ? (
              <div className="max-w-7xl mx-auto">
                {/* Slider Container */}
                <div 
                  ref={newsContainerRef}
                  className="overflow-hidden px-2 md:px-4 max-w-full"
                >
                  <motion.div
                    ref={newsSliderRef}
                    className="flex gap-4 md:gap-6"
                    style={{ width: `${news.length * 280}px` }}
                    animate={{ 
                      x: `-${newsPosition * 296}px` // 280px + 16px gap
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onTouchStart={handleNewsTouchStart}
                    onTouchMove={handleNewsTouchMove}
                    onTouchEnd={handleNewsTouchEnd}
                  >
                    {news.map((item, i) => (
                      <div
                        key={item.id}
                        ref={i === 0 ? newsItemRef : null}
                        className="flex-shrink-0 w-[280px] md:w-[320px]"
                      >
                        <motion.article
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-green-100 group h-full flex flex-col"
                        >
                          <div className="relative h-40 md:h-48 overflow-hidden flex-shrink-0">
                            <img
                              src={item.image_url || "/images/news-default.jpg"}
                              alt={item.title || "Berita"}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Berita
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.published_at)}
                              </div>
                              {item.author && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.author}
                                </div>
                              )}
                            </div>

                            <h3 className="font-bold text-green-800 mb-2 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors duration-200 flex-grow text-sm md:text-base">
                              {item.title || `Berita ${i + 1}`}
                            </h3>
                            
                            <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed flex-grow">
                              {item.excerpt || "Deskripsi singkat berita."}
                            </p>
                            
                            <Link
                              href={`/news/${item.id}`}
                              className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-xs md:text-sm transition-colors duration-200 group/link mt-auto"
                            >
                              Baca Selengkapnya
                              <ChevronRight className="ml-1 w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        </motion.article>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Dots Indicator untuk Berita */}
                {news.length > getNewsItemsPerView() && (
                  <div className="flex justify-center gap-1 md:gap-2 mt-6 md:mt-8">
                    {Array.from({ length: Math.max(1, news.length - getNewsItemsPerView() + 1) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToNewsSlide(i)}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                          newsPosition === i 
                            ? 'bg-green-600 w-4 md:w-6' 
                            : 'bg-green-300 hover:bg-green-400'
                        }`}
                        aria-label={`Go to news slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* View All News Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-8 md:mt-12"
                >
                  <Link
                    href="/news"
                    className="inline-flex items-center bg-green-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Lihat Semua Berita
                    <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center py-8 md:py-12"
              >
                <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md mx-auto shadow-lg">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                    Belum Ada Berita
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm">
                    Berita terbaru akan segera hadir. Pantau terus perkembangan kami.
                  </p>
                </div>
              </motion.div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}