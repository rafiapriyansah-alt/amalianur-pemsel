"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image"; // Tambahan: Import Next.js Image
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronRight } from "lucide-react"; // Asumsi impor jika butuh
import Link from "next/link"; // Untuk a href

type HomeTable = {
  hero_images?: string[];
  hero_title?: string;
  hero_subtitle?: string;
};

interface HeroProps {
  title?: string;
  subtitle?: string;
  images?: string[]; // Dari props index
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
  const [dbImages, setDbImages] = useState<string[]>(images); // Init dari props, hapus fetch
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(true); // Hapus preload manual, langsung ready
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Deteksi device type (sama)
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax + zoom efek (sama)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scale = useTransform(smoothScroll, [0, 1], [1, isMobile ? 1.1 : 1.25]);
  const y = useTransform(smoothScroll, [0, 1], [0, isMobile ? -50 : -120]);
  const brightness = useTransform(smoothScroll, [0, 1], [1, isMobile ? 0.9 : 0.85]);
  const brightnessFilter = useTransform(brightness, (b) => `brightness(${b})`);

  const waveY = useTransform(smoothScroll, [0, 1], [0, isMobile ? 8 : 20]);

  // Hapus fetch Supabase - pakai props dari index

  const imagesToShow = dbImages.length ? dbImages : ['/images/hero-default.jpg']; // Fallback sama

  // Auto ganti gambar (sederhana, tanpa preload manual - Next Image handle sendiri)
  useEffect(() => {
    if (!imagesToShow.length) return;

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % imagesToShow.length);
    }, intervalMs) as any;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [imagesToShow.length, intervalMs]);

  const currentImage = imagesToShow[index];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background dengan Next Image + efek parallax */}
      <div className="absolute inset-0">
        {currentImage ? (
          <motion.div
            key={currentImage}
            style={{ 
              scale, 
              y, 
              filter: brightnessFilter 
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: isMobile ? 1 : 1.15 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={currentImage}
              alt="Hero Background"
              fill
              className="object-cover object-center"
              priority={true} // Priority untuk LCP cepat
              quality={85} // Optimasi kualitas
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white" />
        )}
      </div>

      {/* Overlay shadow (sama) */}
      <div
        className={`absolute inset-0 ${
          shadow ? "bg-black/35 backdrop-blur-[1px]" : "bg-transparent"
        }`}
      />

      {/* Konten Hero (sama) */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-12 max-w-3xl mx-auto w-full">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-700 leading-tight drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)] px-2"
        >
          {title ?? "Selamat Datang di Yayasan Amalianur"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)] max-w-2xl mx-auto px-2"
        >
          {subtitle ?? "Membangun Generasi Islami dan Berakhlak Mulia"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 sm:mt-8 flex flex-row gap-3 sm:gap-4 justify-center items-center px-2"
        >
          <Link
            href="/about"
            className="bg-green-700 text-white font-semibold px-5 sm:px-6 py-2 sm:py-3 rounded-xl shadow hover:bg-green-800 transition text-sm sm:text-base w-auto text-center"
          >
            Tentang Kami
          </Link>
          <Link
            href="/news"
            className="bg-green-700 text-white font-semibold px-5 sm:px-6 py-2 sm:py-3 rounded-xl shadow hover:bg-green-800 transition text-sm sm:text-base w-auto text-center"
          >
            Berita
          </Link>
        </motion.div>
      </div>

      {/* Wave bawah (sama) */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]"
        style={{
          y: waveY
        }}
      >
        <svg
          className="relative block w-full h-16 sm:h-20 md:h-28 text-white/60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path
            fillOpacity="1"
            d="M0,160L48,186.7C96,213,192,267,288,277.3C384,288,480,256,576,213.3C672,171,768,117,864,117.3C960,117,1056,171,1152,192C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </motion.div>
    </section>
  );
}