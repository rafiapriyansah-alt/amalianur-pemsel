"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const preloaded = useRef<Record<number, boolean>>({});
  const timerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Parallax + zoom efek saat scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const brightness = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const brightnessFilter = useTransform(brightness, (b) => `brightness(${b})`);

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

  // Preload image
  function preload(idx: number) {
    const url = imagesToShow[idx];
    if (!url || preloaded.current[idx]) {
      preloaded.current[idx] = true;
      setReady(true);
      return;
    }
    const img = new Image();
    img.src = url;
    img.onload = () => {
      preloaded.current[idx] = true;
      setReady(true);
    };
    img.onerror = () => {
      preloaded.current[idx] = true;
      setReady(true);
    };
  }

  // Auto ganti gambar tiap beberapa detik
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
      } else preload(next);
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
    >
      {/* Background dengan efek parallax */}
      <div className="absolute inset-0">
        {currentImage ? (
          <motion.div
            key={currentImage}
            style={{ scale, y, filter: brightnessFilter }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: ready ? 1 : 0, scale: 1.15 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-center bg-cover will-change-transform"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white" />
        )}
      </div>

      {/* Overlay shadow */}
      <div
        className={`absolute inset-0 ${
          shadow ? "bg-black/35 backdrop-blur-[1px]" : "bg-transparent"
        }`}
      />

      {/* Konten Hero */}
      <div className="relative z-10 text-center px-6 sm:px-12 max-w-3xl">
        {/* Judul tetap warna aslinya (hijau) */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-green-700 leading-tight drop-shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
        >
          {title ?? "Selamat Datang di Yayasan Amalianur"}
        </motion.h1>

        {/* Subjudul warna putih */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-2xl font-semibold text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)] max-w-2xl mx-auto"
        >
          {subtitle ?? "Membangun Generasi Islami dan Berakhlak Mulia"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <a
            href="/about"
            className="bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-green-800 transition"
          >
            Tentang Kami
          </a>
          <a
            href="/news"
            className="bg-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-green-800 transition"
          >
            Berita
          </a>
        </motion.div>
      </div>

      {/* Wave bawah */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-20 sm:h-28 text-white/60"
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
      </div>
    </section>
  );
}
