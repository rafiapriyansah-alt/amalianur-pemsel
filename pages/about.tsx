import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

interface AboutData {
  id: number;
  title: string;
  content: string;
  image_url: string;
  vision: string;
  mission: string;
}

export default function About() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true); // ✅ loading state baru
  const supabase = getSupabase();

  useEffect(() => {
    const load = async () => {
      setLoading(true); // ✅ mulai loading

      const { data, error } = await supabase
        .from("about")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        setData({
          id: 0,
          title: "Tentang Yayasan Amalianur",
          content: `Yayasan Amalianur adalah lembaga pendidikan Islam yang berdedikasi dalam membentuk generasi berilmu, berakhlak, dan mandiri.
Kami menaungi dua lembaga pendidikan: Taman Kanak-kanak (TK) dan Madrasah Tsanawiyah (MTs) Amalianur.

Didirikan atas dasar semangat kebersamaan dan keikhlasan untuk mencerdaskan kehidupan bangsa dengan nilai-nilai Islam yang rahmatan lil 'alamin.`,
          image_url: "/images/about-default.jpg",
          vision:
            "Menjadi lembaga pendidikan Islam unggulan yang melahirkan generasi cerdas, beriman, dan berakhlakul karimah.",
          mission: `1. Menanamkan nilai-nilai keislaman dan moral sejak usia dini.  
2. Menyediakan pendidikan yang berkualitas, berlandaskan teknologi dan nilai spiritual.  
3. Membangun lingkungan belajar yang menyenangkan dan inspiratif.`,
        });
      } else {
        setData(data);
      }

      setLoading(false); // ✅ selesai loading
    };

    load();

    const channel = supabase
      .channel("about-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "about" },
        (payload) => {
          if (payload.new) setData(payload.new as AboutData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Loading Skeleton (tidak mengubah UI Anda)
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{data?.title} — Yayasan Amalianur</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />

        <main className="container mx-auto px-6 pt-32 pb-16 flex-1">

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-green-800 mb-12"
          >
            {data?.title}
          </motion.h1>

          {/* ✅ Section Tentang */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.img
              src={data?.image_url || "/images/about-default.jpg"}
              loading="lazy"                  // ✅ Lazy loading gambar
              alt="Yayasan Amalianur"
              className="rounded-2xl shadow-xl object-cover w-full h-[400px]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            />

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100"
            >
              <div className="relative">

                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-green-500 rounded-tl-lg"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-green-500 rounded-br-lg"></div>

                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line font-sans tracking-normal">
                  {data?.content}
                </p>
              </div>
            </motion.div>
          </div>

          {/* ✅ Section Visi & Misi */}
          <section className="mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-semibold text-green-800 text-center mb-10"
            >
              Visi & Misi
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white shadow-md rounded-xl p-6 border-l-4 border-green-500"
              >
                <h3 className="text-xl font-bold text-green-700 mb-2">Visi</h3>
                <p className="text-gray-700">{data?.vision}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white shadow-md rounded-xl p-6 border-l-4 border-green-500"
              >
                <h3 className="text-xl font-bold text-green-700 mb-2">Misi</h3>
                <p className="text-gray-700 whitespace-pre-line">{data?.mission}</p>
              </motion.div>
            </div>
          </section>

          {/* ✅ Section Nilai-nilai */}
          <section className="mt-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-semibold text-green-800 text-center mb-10"
            >
              Nilai-Nilai Yayasan
            </motion.h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { title: "Keikhlasan", desc: "Melakukan setiap kegiatan dengan niat tulus karena Allah SWT." },
                { title: "Kedisiplinan", desc: "Membentuk karakter yang tangguh dan berkomitmen tinggi." },
                { title: "Kebersamaan", desc: "Menumbuhkan rasa saling menghargai antar sesama." },
                { title: "Integritas", desc: "Menjaga kejujuran dan tanggung jawab dalam setiap tindakan." },
                { title: "Inovasi", desc: "Selalu berusaha berkreasi untuk kemajuan pendidikan." },
                { title: "Empati", desc: "Menumbuhkan rasa kepedulian sosial dan semangat membantu sesama." },
              ].map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-green-50 p-6 rounded-xl shadow-sm hover:shadow-lg transition"
                >
                  <h4 className="font-semibold text-green-700 mb-2">{val.title}</h4>
                  <p className="text-gray-600 text-sm">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
