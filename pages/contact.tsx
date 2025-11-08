// pages/contact.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import Image from "next/image";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";

interface ContactData {
  id?: string;
  address?: string;
  phone?: string;
  email?: string;
  map_image?: string;
  map_link?: string;
  office_hours?: string;
  whatsapp_message?: string;
  map_embed?: string;
  created_at?: string;
}

interface FormData {
  name: string;
  contact: string;
  message: string;
}

export default function ContactPage() {
  const supabase = getSupabase();
  const [contact, setContact] = useState<ContactData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    loadContact();
    
    const channel = supabase
      .channel("realtime-contact")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "contact" }, 
        loadContact
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function loadContact() {
    try {
      const { data, error } = await supabase
        .from("contact")
        .select("*")
        .limit(1)
        .single();
      
      if (error) throw error;
      setContact(data ?? null);
    } catch (error) {
      console.error("Error loading contact data:", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", contact: "", message: "" });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMapClick = () => {
    if (contact?.map_link) {
      window.open(contact.map_link, '_blank', 'noopener,noreferrer');
    } else if (contact?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getWhatsAppUrl = () => {
    if (!contact?.phone) return "#";
    const phoneNumber = contact.phone.replace(/\D/g, "");
    const message = contact?.whatsapp_message || "Halo Yayasan Amalianur, saya ingin bertanya tentang:";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <Head>
        <title>Kontak — Yayasan Amalianur</title>
        <meta 
          name="description" 
          content="Hubungi Yayasan Amalianur untuk informasi lebih lanjut tentang program pendidikan dan kegiatan sosial kami." 
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6"
            >
              Hubungi Kami
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto px-4"
            >
              Mari berkolaborasi untuk menciptakan pendidikan yang lebih baik
            </motion.p>
          </div>
        </section>

        <main className="flex-1 container mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 pb-16">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-4 md:space-y-6"
            >
              {/* Info Cards */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-green-100">
                <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-4 md:mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                  Informasi Kontak
                </h2>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="bg-green-600 p-2 md:p-3 rounded-full flex-shrink-0">
                      <MapPin className="text-white w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-800 text-sm md:text-base">Alamat</h3>
                      <p className="text-gray-700 mt-1 text-sm md:text-base">
                        {contact?.address || "Alamat belum diatur."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="bg-green-600 p-2 md:p-3 rounded-full flex-shrink-0">
                      <Phone className="text-white w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-800 text-sm md:text-base">
                        Telepon/WhatsApp
                      </h3>
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 mt-1 hover:text-green-600 transition-colors block text-sm md:text-base break-all"
                      >
                        {contact?.phone || "Nomor belum diatur"}
                      </a>
                      {contact?.whatsapp_message && (
                        <p className="text-xs md:text-sm text-gray-600 mt-2">
                          {contact.whatsapp_message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="bg-green-600 p-2 md:p-3 rounded-full flex-shrink-0">
                      <Mail className="text-white w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-800 text-sm md:text-base">Email</h3>
                      <a 
                        href={`mailto:${contact?.email || ""}`} 
                        className="text-gray-700 mt-1 hover:text-green-600 transition-colors block text-sm md:text-base break-all"
                      >
                        {contact?.email || "Email belum diatur"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="bg-green-600 p-2 md:p-3 rounded-full flex-shrink-0">
                      <Clock className="text-white w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-green-800 text-sm md:text-base">
                        Jam Operasional
                      </h3>
                      <p className="text-gray-700 mt-1 text-sm md:text-base">
                        {contact?.office_hours || "Senin - Jumat: 08:00 - 16:00 WIB"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 md:p-8 text-white">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
                  Butuh Bantuan Cepat?
                </h3>
                <p className="opacity-90 mb-4 md:mb-6 text-sm md:text-base">
                  Hubungi kami melalui WhatsApp untuk respon yang lebih cepat
                </p>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold py-3 px-4 md:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm md:text-base w-full"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  Chat WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Contact Form & Map */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-green-100"
              >
                <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-2">
                  Kirim Pesan
                </h2>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                  Isi form berikut dan kami akan menghubungi Anda secepatnya
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 md:p-4 rounded-xl outline-none transition-all text-sm md:text-base"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email / No. HP *
                      </label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 md:p-4 rounded-xl outline-none transition-all text-sm md:text-base"
                        placeholder="Email atau nomor WhatsApp"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesan *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 md:p-4 rounded-xl outline-none transition-all resize-none text-sm md:text-base"
                      placeholder="Tulis pesan Anda di sini..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                        Kirim Pesan
                      </>
                    )}
                  </button>

                  {submitStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 text-green-700 p-3 md:p-4 rounded-xl text-center text-sm md:text-base"
                    >
                      ✅ Pesan berhasil dikirim! Kami akan menghubungi Anda segera.
                    </motion.div>
                  )}
                </form>
              </motion.div>

              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100"
              >
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-green-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    Lokasi Kami
                  </h3>
                </div>
                
                <div className="p-4 md:p-6">
                  {contact?.map_image ? (
                    <div className="text-center">
                      <div 
                        className="cursor-pointer mx-auto max-w-md transition-transform duration-300 hover:scale-105"
                        onClick={handleMapClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleMapClick();
                          }
                        }}
                      >
                        <div className="relative overflow-hidden rounded-xl shadow-lg border-2 border-green-200">
                          <Image
                            src={contact.map_image}
                            alt="Lokasi Yayasan Amalianur"
                            width={400}
                            height={300}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Klik gambar untuk membuka peta lokasi
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="text-center py-8 md:py-12 cursor-pointer"
                      onClick={handleMapClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleMapClick();
                        }
                      }}
                    >
                      <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto border-2 border-dashed border-gray-300 hover:border-green-400 transition-all duration-300">
                        <MapPin className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">Gambar lokasi belum tersedia</p>
                        <p className="text-sm text-gray-400">Klik untuk membuka peta lokasi</p>
                      </div>
                    </div>
                  )}
                  
                  {contact?.address && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">{contact.address}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}