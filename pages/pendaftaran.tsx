import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { 
  FaUser, 
  FaArrowRight, 
  FaGraduationCap,
  FaHeart,
  FaBookOpen,
  FaUsers,
  FaShieldAlt,
  FaAward,
  FaStar
} from "react-icons/fa";
import Link from "next/link";

interface DaftarData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  contact_person: string;
  email: string;
  location: string;
  image_url: string;
}

export default function Daftar() {
  const [data, setData] = useState<DaftarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    async function load() {
  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("daftar")
      .select("*")
      .single();

    if (error) {
      console.error("❌ Gagal memuat data publik dari tabel 'daftar':", error);
      // Fallback data agar halaman tetap tampil walau gagal memuat
      setData({
        id: "",
        title: "Daftar Sekarang di Yayasan Amalianur",
        subtitle: "Bergabung bersama kami untuk mencetak generasi Islami dan berakhlak mulia.",
        description:
          "Yayasan Amalianur membuka kesempatan bagi calon siswa/santri yang ingin mendapatkan pendidikan Islami, lingkungan positif, dan pembinaan karakter. Mari bersama menjadi bagian dari keluarga besar Yayasan Amalinaur.",
        contact_person: "081234567890",
        email: "info@yayasanamalianur.sch.id",
        location: "Jl. Pendidikan No. 123, Medan, Sumatera Utara",
        image_url:
          "https://images.unsplash.com/photo-1562813733-b31f71025d54?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
      });
    } else {
      console.log("✅ Data publik berhasil dimuat:", data);
      setData(data);
    }

  } catch (error) {
    console.error("🚨 Unexpected error saat load() data publik:", error);
  } finally {
    setLoading(false);
  }
}


    load();

    // Realtime listener yang lebih robust
    const channel = supabase
      .channel("daftar-realtime-public")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "daftar" 
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          if (payload.new) {
            setData(payload.new as DaftarData);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Gagal memuat data pendaftaran</p>
          <button 
            onClick={() => window.location.reload()}
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
        <title>Pendaftaran — Yayasan Amalianur</title>
        <meta name="description" content="Bergabung bersama Yayasan Amalinaur untuk pendidikan Islami dan pembinaan karakter" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
          <div className="container mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <FaStar className="text-yellow-500" />
                    Pendidikan Islami Berkualitas
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 leading-tight">
                    {data.title}
                  </h1>
                  
                  <p className="text-xl text-green-700 font-medium leading-relaxed">
                    {data.subtitle}
                  </p>
                  
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {data.description}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/formulir-daftar" passHref>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3 text-lg font-semibold group w-full sm:w-auto"
                    >
                      <FaUser className="text-xl group-hover:scale-110 transition-transform" />
                      Daftar Sekarang
                      <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  
                  <motion.button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-green-600 text-green-700 px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center gap-3 text-lg font-semibold w-full sm:w-auto"
                  >
                    <FaBookOpen />
                    Pelajari Lebih Lanjut
                  </motion.button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">500+</div>
                    <div className="text-sm text-gray-600">Siswa Aktif</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">50+</div>
                    <div className="text-sm text-gray-600">Pengajar Berpengalaman</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">10+</div>
                    <div className="text-sm text-gray-600">Tahun Pengalaman</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Content - Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={data.image_url}
                      alt="Yayasan Amalianur"
                      className="w-full h-[500px] object-cover"
                      onError={(e) => {
                        // Fallback image jika gagal load
                        e.currentTarget.src = "https://images.unsplash.com/photo-1562813733-b31f71025d54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Mari Bergabung</h3>
                      <p className="text-lg opacity-90">Bersama kita wujudkan generasi Qur'ani yang berakhlak mulia</p>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-lg">
                    <FaGraduationCap className="text-green-600 text-2xl" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg">
                    <FaHeart className="text-green-600 text-2xl" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
                Keunggulan Yayasan Amalianur
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Memberikan pendidikan terbaik dengan pendekatan Islami untuk membentuk karakter generasi penerus
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: FaBookOpen,
                  title: "Kurikulum Islami",
                  description: "Integrasi ilmu dunia dan akhirat dengan pendekatan Al-Qur'an dan Sunnah"
                },
                {
                  icon: FaUsers,
                  title: "Guru Berpengalaman",
                  description: "Diajar oleh pengajar profesional yang kompeten di bidangnya"
                },
                {
                  icon: FaShieldAlt,
                  title: "Lingkungan Aman",
                  description: "Lingkungan belajar yang nyaman dan mendukung perkembangan anak"
                },
                {
                  icon: FaAward,
                  title: "Akreditasi A",
                  description: "Terakreditasi dengan predikat terbaik dari lembaga terkait"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 group hover:transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors duration-300">
                    <feature.icon className="text-2xl text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}