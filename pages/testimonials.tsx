// pages/testimonials.tsx
import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

type Testi = { id: string; name: string; role?: string; message: string; photo?: string };

export default function TestimonialsPage() {
  const supabase = getSupabase();
  const [items, setItems] = useState<Testi[]>([]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("realtime-testi")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "testimonials" },
        () => load()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setItems(data || []);
  }

  return (
    <>
      <Head>
        <title>Testimoni — Yayasan Amalianur</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <main className="container mx-auto px-6 pt-28 pb-16 flex-1">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-green-800 mb-8 text-center"
          >
            Testimoni
          </motion.h1>

          <div className="grid md:grid-cols-3 gap-6">
            {items.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl p-6 shadow text-center"
              >
                <img
                  src={t.photo || "/images/dummy-avatar.png"}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  alt={t.name}
                />
                <p className="italic">“{t.message}”</p>
                <h4 className="mt-3 font-semibold">{t.name}</h4>
                <div className="text-sm text-gray-500">{t.role || "—"}</div>
              </motion.div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
