// pages/testimonials.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  message: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

export default function TestimonialsPage() {
  const supabase = getSupabase();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
    
    const channel = supabase
      .channel("realtime-testimonials")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "testimonials" },
        loadTestimonials
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function loadTestimonials() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Testimoni — Yayasan Amalianur</title>
        <meta 
          name="description" 
          content="Testimoni dari orang tua, siswa, dan mitra Yayasan Amalianur - Pengalaman nyata tentang pendidikan berkualitas" 
        />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 pt-28 pb-16">
          {/* Header Section */}
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-4">
              Testimoni
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pengalaman nyata dari orang tua, siswa, dan mitra Yayasan Amalianur
            </p>
          </motion.section>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Testimonials Grid */}
          {!loading && testimonials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Belum Ada Testimoni
                </h3>
                <p className="text-gray-500 text-sm">
                  Testimoni akan ditampilkan di sini. Pantau terus perkembangan kami.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group"
                >
                  {/* Photo */}
                  <div className="flex justify-center mb-4">
                    <img
                      src={testimonial.photo || "/images/dummy-avatar.png"}
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-200 group-hover:border-green-300 transition-colors duration-300"
                      alt={testimonial.name}
                    />
                  </div>

                  {/* Message */}
                  <div className="text-center mb-6">
                    <p className="italic text-gray-700 leading-relaxed text-lg">
                      “{testimonial.message}”
                    </p>
                  </div>

                  {/* Name & Role */}
                  <div className="text-center border-t border-gray-100 pt-4">
                    <h4 className="font-bold text-green-800 text-lg">
                      {testimonial.name}
                    </h4>
                    <div className="text-sm text-gray-500 mt-1">
                      {testimonial.role || "—"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State Info */}
          {!loading && testimonials.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <p className="text-gray-500 text-sm">
                Menampilkan {testimonials.length} testimoni
              </p>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}