"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { getSupabase } from "../../lib/supabaseClient";

type HomeTable = {
  hero_images?: string[];
  hero_title?: string;
  hero_subtitle?: string;
};

interface HeroProps {
  title?: string;
  subtitle?: string;
  images?: string[];
  shadow?: boolean;
  intervalMs?: number;
}

export default function Hero({
  title,
  subtitle,
  images = [],
  shadow = true,
  intervalMs = 6000,
}: HeroProps) {
  const supabase = getSupabase();
  const [dbImages, setDbImages] = useState<string[]>(images);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const preloaded = useRef<Record<number, boolean>>({});
  const timerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<SVGSVGElement | null>(null);

  // Deteksi device type
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced parallax + 3D effect dengan spring physics
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring animation untuk efek yang lebih natural
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Enhanced transform effects dengan range yang disesuaikan untuk mobile
  const scale = useTransform(smoothScroll, [0, 1], [1, isMobile ? 1.15 : 1.4]);
  const y = useTransform(smoothScroll, [0, 1], [0, isMobile ? -80 : -180]);
  const rotateX = useTransform(smoothScroll, [0, 1], [0, isMobile ? 2 : 5]);
  const brightness = useTransform(smoothScroll, [0, 1], [1, isMobile ? 0.8 : 0.7]);
  
  const brightnessFilter = useTransform(brightness, (b) => `brightness(${b})`);
  const transform3d = useTransform(
    [scale, y, rotateX],
    ([s, yVal, rX]) => `scale(${s}) translateY(${yVal}px) rotateX(${rX}deg)`
  );

  // Wave animation dengan nilai yang lebih kecil untuk mobile
  const waveY = useTransform(smoothScroll, [0, 1], [0, isMobile ? 20 : 40]);
  const waveOpacity = useTransform(smoothScroll, [0, 0.5, 1], [0.6, 0.8, 0.4]);

  // Content animation dengan nilai yang lebih kecil untuk mobile
  const contentY = useTransform(smoothScroll, [0, 1], [0, isMobile ? 25 : 50]);
  const contentScale = useTransform(smoothScroll, [0, 1], [1, isMobile ? 0.98 : 0.95]);

  // Debug scroll progress untuk mobile
  useMotionValueEvent(smoothScroll, "change", (latest) => {
    if (isMobile && latest > 0.8) {
      // Limit efek parallax di mobile saat mendekati akhir scroll
      console.log("Mobile scroll progress:", latest);
    }
  });

  // Ambil data dari Supabase (sinkron otomatis)
  useEffect(() => {
    let mounted = true;
    async function loadImages() {
      const { data, error }: { data: HomeTable | null; error: any } = await supabase
        .from("home")
        .select("hero_images, hero_title, hero_subtitle")
        .single();
      if (!error && data && mounted) {
        setDbImages(data.hero_images || []);
      }
    }
    loadImages();

    const channel = supabase
      .channel("home-hero-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "home" },
        (payload) => {
          const updated = (payload.new as HomeTable)?.hero_images;
          if (updated && Array.isArray(updated)) setDbImages(updated);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const imagesToShow = dbImages.length ? dbImages : images;

  // Preload image dengan optimisasi mobile
  function preload(idx: number) {
    const url = imagesToShow[idx];
    if (!url || preloaded.current[idx]) {
      preloaded.current[idx] = true;
      setReady(true);
      return;
    }
    
    const img = new Image();
    img.src = url;
    img.loading = "eager";
    
    img.onload = () => {
      preloaded.current[idx] = true;
      setReady(true);
    };
    img.onerror = () => {
      preloaded.current[idx] = true;
      setReady(true);
    };
  }

  // Auto ganti gambar dengan optimisasi performa
  useEffect(() => {
    if (!imagesToShow.length) return;
    
    setReady(false);
    preload(index);
    preload((index + 1) % imagesToShow.length);

    if (timerRef.current) window.clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      const next = (index + 1) % imagesToShow.length;
      if (preloaded.current[next]) {
        setIndex(next);
        setReady(false);
      } else {
        preload(next);
      }
    }, intervalMs) as any;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, imagesToShow, intervalMs]);

  useEffect(() => {
    if (imagesToShow.length) {
      preload(0);
      preload(1 % imagesToShow.length);
    } else setReady(true);
  }, [imagesToShow]);

  const currentImage = imagesToShow[index];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{ 
        perspective: isMobile ? "500px" : "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      {/* Enhanced Background dengan efek parallax 3D yang mobile-friendly */}
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {currentImage ? (
          <motion.div
            key={currentImage}
            style={{ 
              transform: transform3d,
              filter: brightnessFilter,
              transformStyle: "preserve-3d"
            }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: ready ? 1 : 0, scale: 1 }}
            transition={{ 
              duration: isMobile ? 1.2 : 1.5, 
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: isMobile ? 1 : 1.2 }
            }}
            className="absolute inset-0 bg-center bg-cover will-change-transform"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                // Hapus backgroundAttachment fixed untuk mobile compatibility
              }}
            />
            {/* Safety overlay untuk mencegah gambar keluar container di mobile */}
            <div className="absolute inset-0 bg-black/5" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white" />
        )}
      </div>

      {/* Enhanced Overlay dengan gradient dinamis */}
      <motion.div
        className={`absolute inset-0 ${
          shadow 
            ? "bg-gradient-to-b from-black/40 via-black/25 to-black/40 backdrop-blur-[0.5px]" 
            : "bg-transparent"
        }`}
        style={{ opacity: brightness }}
      />

      {/* Konten Hero dengan efek parallax terbalik yang disesuaikan untuk mobile */}
      <motion.div 
        className="relative z-10 text-center px-4 sm:px-6 md:px-12 max-w-3xl mx-auto w-full"
        style={{
          y: contentY,
          scale: contentScale,
        }}
      >
        {/* Judul tetap warna aslinya (hijau) */}
        <motion.h1
          initial={{ opacity: 0, y: isMobile ? 40 : 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: isMobile ? 1 : 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2
          }}
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-700 leading-tight drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] px-2"
        >
          {title ?? "Selamat Datang di Yayasan Amalianur"}
        </motion.h1>

        {/* Subjudul warna putih */}
        <motion.p
          initial={{ opacity: 0, y: isMobile ? 30 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: isMobile ? 0.8 : 1,
            delay: isMobile ? 0.4 : 0.6,
            ease: "easeOut"
          }}
          className="mt-3 xs:mt-4 sm:mt-6 text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] max-w-2xl mx-auto px-3"
        >
          {subtitle ?? "Membangun Generasi Islami dan Berakhlak Mulia"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: isMobile ? 20 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: isMobile ? 0.7 : 0.9
          }}
          className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 justify-center items-center px-3"
        >
          <a
            href="/about"
            className="bg-green-700 text-white font-semibold px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl shadow-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm xs:text-base w-full xs:w-auto text-center min-w-[140px]"
          >
            Tentang Kami
          </a>
          <a
            href="/news"
            className="bg-green-700 text-white font-semibold px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl shadow-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm xs:text-base w-full xs:w-auto text-center min-w-[140px]"
          >
            Berita
          </a>
        </motion.div>
      </motion.div>

      {/* Enhanced Wave bawah dengan animasi smooth yang mobile-friendly */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20"
        style={{
          y: waveY,
          opacity: waveOpacity
        }}
      >
        <motion.svg
          ref={waveRef}
          className="relative block w-full h-12 xs:h-14 sm:h-16 md:h-20 lg:h-24 text-white/70"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="currentColor"
          initial={{ scaleY: 0.8 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <motion.path
            fillOpacity="1"
            d="M0,160L48,186.7C96,213,192,267,288,277.3C384,288,480,256,576,213.3C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            initial={{ d: "M0,160L48,186.7C96,213,192,267,288,277.3C384,288,480,256,576,213.3C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
            animate={{
              d: [
                "M0,160L48,186.7C96,213,192,267,288,277.3C384,288,480,256,576,213.3C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,208C672,192,768,160,864,154.7C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,160L48,186.7C96,213,192,267,288,277.3C384,288,480,256,576,213.3C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            }}
            transition={{
              duration: isMobile ? 6 : 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Loading indicator untuk mobile */}
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg"
          >
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </div>
      )}
    </section>
  );
}