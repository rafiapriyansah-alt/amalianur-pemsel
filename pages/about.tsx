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
  const supabase = getSupabase();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // Template default (dummy)
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
    };

    load();

    // ✅ Realtime listener (auto sync dari dashboard admin)
    const channel = supabase
      .channel("about-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "about" },
        (payload) => {
          console.log("📡 Perubahan data About:", payload);
          if (payload.new) setData(payload.new as AboutData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!data)
    return (
      <div className="text-center p-10 text-gray-600 animate-pulse">
        Memuat data yayasan...
      </div>
    );

  return (
    <>
      <Head>
        <title>{data.title} — Yayasan Amalianur</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        {/* Tambah padding-top agar tidak tertutup navbar */}
        <main className="container mx-auto px-6 pt-32 pb-16 flex-1">
          {/* Judul Section */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-green-800 mb-12"
          >
            {data.title}
          </motion.h1>

          {/* Section 1 - Tentang */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.img
              src={data.image_url || "/images/about-default.jpg"}
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
            >
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {data.content}
              </p>
            </motion.div>
          </div>

          {/* Section 2 - Visi & Misi */}
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
                <p className="text-gray-700">{data.vision}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white shadow-md rounded-xl p-6 border-l-4 border-green-500"
              >
                <h3 className="text-xl font-bold text-green-700 mb-2">Misi</h3>
                <p className="text-gray-700 whitespace-pre-line">{data.mission}</p>
              </motion.div>
            </div>
          </section>

          {/* Section 3 - Nilai-nilai */}
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
