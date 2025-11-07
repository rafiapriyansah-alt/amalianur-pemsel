import Head from "next/head";
import Navbar from "../components/admin/Navbar";
import Footer from "../components/admin/Footer";
import { motion } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";
import { 
  FaCheckCircle, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaVenusMars, 
  FaUserFriends, 
  FaSchool, 
  FaUpload, 
  FaArrowLeft,
  FaBook,
  FaChild,
  FaBaby,
  FaGraduationCap,
  FaMoneyBill,
  FaWhatsapp
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";

interface BiayaPendaftaran {
  id: string;
  biaya_kb: number;
  biaya_tk: number;
  biaya_mts: number;
  status_aktif: boolean;
}

interface FormulirData {
  id: string;
  header_title: string;
  header_subtitle: string;
  form_title: string;
  form_description: string;
  success_title: string;
  success_message: string;
}

export default function FormulirDaftar() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendaftaranDibuka, setPendaftaranDibuka] = useState(true);
  const [biayaPendaftaran, setBiayaPendaftaran] = useState<BiayaPendaftaran>({
    id: "",
    biaya_kb: 500000,
    biaya_tk: 750000,
    biaya_mts: 1000000,
    status_aktif: true
  });
  const [formulirData, setFormulirData] = useState<FormulirData>({
    id: "",
    header_title: "Formulir Pendaftaran",
    header_subtitle: "Isi data dengan lengkap dan benar",
    form_title: "Data Calon Siswa/Santri",
    form_description: "Lengkapi informasi berikut untuk proses pendaftaran",
    success_title: "Pendaftaran Berhasil!",
    success_message: "Terima kasih {nama} telah mendaftar di Yayasan Amalinaur. Data Anda telah kami terima dan akan segera diproses. Admin kami akan menghubungi Anda dalam 1-2 hari kerja melalui nomor telepon {telepon} atau email {email} untuk informasi lebih lanjut."
  });

  const [formData, setFormData] = useState({
    nama: "",
    jenis_kelamin: "",
    umur: "",
    telepon: "",
    email: "",
    alamat: "",
    jenjang: "",
    nama_ibu: "",
    nama_ayah: "",
    telepon_ortu: "",
    kk_url: "",
    total_biaya: 0
  });

  const router = useRouter();

  // Load semua data saat komponen mount
  useEffect(() => {
    const supabase = getSupabase();
    
    async function loadAllData() {
      try {
        // Cek status pendaftaran
        const { data: statusData } = await supabase
          .from("pengaturan_pendaftaran")
          .select("status_pendaftaran")
          .single();
        
        if (statusData) {
          setPendaftaranDibuka(statusData.status_pendaftaran);
        }

        // Load biaya pendaftaran
        const { data: biayaData } = await supabase
          .from("biaya_pendaftaran")
          .select("*")
          .single();
        
        if (biayaData) {
          setBiayaPendaftaran(biayaData);
        }

        // Load data formulir
        const { data: formulir } = await supabase
          .from("formulir_pendaftaran")
          .select("*")
          .single();
        
        if (formulir) {
          setFormulirData(formulir);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    
    loadAllData();

    // Realtime listener untuk perubahan status
    const channel = supabase
      .channel('formulir-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pengaturan_pendaftaran' },
        (payload: any) => {
          if (payload.new && payload.new.status_pendaftaran !== undefined) {
            setPendaftaranDibuka(payload.new.status_pendaftaran);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'biaya_pendaftaran' },
        (payload: any) => {
          if (payload.new) {
            setBiayaPendaftaran(payload.new);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'formulir_pendaftaran' },
        (payload: any) => {
          if (payload.new) {
            setFormulirData(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update total biaya ketika jenjang berubah
  useEffect(() => {
    let biaya = 0;
    switch (formData.jenjang) {
      case "KB": 
        biaya = biayaPendaftaran.biaya_kb; 
        break;
      case "TK": 
        biaya = biayaPendaftaran.biaya_tk; 
        break;
      case "MTS": 
        biaya = biayaPendaftaran.biaya_mts; 
        break;
      default:
        biaya = 0;
    }
    setFormData(prev => ({ ...prev, total_biaya: biaya }));
  }, [formData.jenjang, biayaPendaftaran]);

  // Jika pendaftaran ditutup, tampilkan halaman blocked
  if (!pendaftaranDibuka) {
    return (
      <>
        <Head>
          <title>Pendaftaran Ditutup — Yayasan Amalinaur</title>
          <meta name="description" content="Pendaftaran saat ini sedang ditutup" />
        </Head>

        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
          <Navbar />
          
          <section className="flex-1 flex items-center justify-center py-20">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-3xl shadow-2xl p-12"
                >
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⏸️</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Pendaftaran Sedang Ditutup
                  </h1>
                  
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    Maaf, pendaftaran siswa/santri baru saat ini sedang ditutup. 
                    Silakan hubungi admin Yayasan Amalinaur untuk informasi lebih lanjut 
                    mengenai pembukaan pendaftaran berikutnya.
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-amber-800 mb-2">Informasi Kontak</h3>
                    <p className="text-amber-700">
                      Telepon: <strong>0812-3456-7890</strong>
                    </p>
                    <p className="text-amber-700">
                      Email: <strong>info@yayasanamalinaur.sch.id</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/pendaftaran" passHref>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold"
                      >
                        Kembali ke Halaman Pendaftaran
                      </motion.button>
                    </Link>
                    
                    <Link href="/" passHref>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border-2 border-green-600 text-green-700 px-8 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 font-semibold"
                      >
                        Kembali ke Beranda
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    // Validasi file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file harus JPG, PNG, atau PDF");
      return;
    }

    setLoading(true);
    const supabase = getSupabase();

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pendaftaran")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicURL } = supabase.storage
        .from("pendaftaran")
        .getPublicUrl(uploadData.path);

      setFormData(prev => ({ ...prev, kk_url: publicURL.publicUrl }));
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Gagal mengupload file. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nama || !formData.jenis_kelamin || !formData.umur || !formData.telepon || 
        !formData.alamat || !formData.jenjang || !formData.nama_ibu || !formData.nama_ayah || 
        !formData.telepon_ortu) {
      alert("Harap lengkapi semua field yang wajib diisi!");
      return;
    }

    // Validasi umur
    const umur = parseInt(formData.umur);
    if (umur < 2 || umur > 18) {
      alert("Umur harus antara 2-18 tahun");
      return;
    }

    // Validasi file upload opsional
    if (!formData.kk_url) {
      const confirmSubmit = confirm("Anda belum mengupload Kartu Keluarga. Yakin ingin melanjutkan?");
      if (!confirmSubmit) return;
    }

    setLoading(true);
    const supabase = getSupabase();

    try {
      const { error } = await supabase.from("pendaftaran").insert([formData]);

      if (error) throw error;

      // Kirim notifikasi email
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nama: formData.nama,
            jenjang: formData.jenjang,
            telepon: formData.telepon,
            email: formData.email,
            total_biaya: formData.total_biaya,
            umur: formData.umur
          }),
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      setSuccess(true);
      
    } catch (error: any) {
      console.error("Submit error:", error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Format pesan sukses dengan variabel
  const formatSuccessMessage = () => {
    return formulirData.success_message
      .replace(/{nama}/g, formData.nama)
      .replace(/{telepon}/g, formData.telepon)
      .replace(/{email}/g, formData.email || "yang telah didaftarkan");
  };

  // Icon untuk jenjang
  const getJenjangIcon = (jenjang: string) => {
    switch (jenjang) {
      case "KB": return <FaBaby className="text-pink-500" />;
      case "TK": return <FaChild className="text-blue-500" />;
      case "MTS": return <FaGraduationCap className="text-green-500" />;
      default: return <FaSchool className="text-gray-500" />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <Head>
        <title>{formulirData.header_title} — Yayasan Amalinaur</title>
        <meta name="description" content="Formulir pendaftaran siswa/santri baru Yayasan Amalinaur" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        
        {/* Success Modal */}
        {success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                {formulirData.success_title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {formatSuccessMessage()}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">Hubungi Kami:</h4>
                <div className="space-y-2">
                  <a 
                    href={`https://wa.me/62${formData.telepon_ortu.replace(/\D/g, '').substring(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-green-700 hover:text-green-800 transition-colors bg-white px-3 py-2 rounded-lg border border-green-200"
                  >
                    <FaWhatsapp className="text-green-500" /> 
                    {formData.telepon_ortu}
                  </a>
                  {formData.email && (
                    <a 
                      href={`mailto:${formData.email}`}
                      className="flex items-center justify-center gap-2 text-green-700 hover:text-green-800 transition-colors bg-white px-3 py-2 rounded-lg border border-green-200"
                    >
                      <FaEnvelope className="text-green-500" /> 
                      {formData.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    router.push('/pendaftaran');
                  }}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold"
                >
                  Kembali ke Halaman Pendaftaran
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Header Section */}
        <section className="relative py-12 bg-gradient-to-r from-green-600 to-emerald-600 mt-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <Link href="/pendaftaran" passHref>
                  <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
                  >
                    <FaArrowLeft />
                    Kembali ke Pendaftaran
                  </motion.button>
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {formulirData.header_title}
                </h1>
                <p className="text-green-100 text-lg">
                  {formulirData.header_subtitle}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-3xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <FaBook className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-900">
                        {formulirData.form_title}
                      </h2>
                      <p className="text-green-700">
                        {formulirData.form_description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {/* Data Pribadi */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-green-800 border-l-4 border-green-600 pl-4">
                      Data Pribadi Calon Siswa
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaUser className="text-green-600" />
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          name="nama"
                          value={formData.nama}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Nama lengkap calon siswa"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaVenusMars className="text-green-600" />
                          Jenis Kelamin *
                        </label>
                        <select
                          name="jenis_kelamin"
                          value={formData.jenis_kelamin}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Umur (2-18 tahun) *
                        </label>
                        <input
                          type="number"
                          name="umur"
                          value={formData.umur}
                          onChange={handleInputChange}
                          required
                          min="2"
                          max="18"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Umur calon siswa"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaSchool className="text-green-600" />
                          Jenjang Pendidikan *
                        </label>
                        <select
                          name="jenjang"
                          value={formData.jenjang}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Pilih Jenjang</option>
                          <option value="KB">KB (Kelompok Bermain) - Usia 2-4 tahun</option>
                          <option value="TK">TK (Taman Kanak-kanak) - Usia 4-6 tahun</option>
                          <option value="MTS">MTS (Madrasah Tsanawiyah) - Usia 12-15 tahun</option>
                        </select>
                      </div>
                    </div>

                    {formData.jenjang && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                        {getJenjangIcon(formData.jenjang)}
                        <div>
                          <p className="font-semibold text-blue-800">
                            {formData.jenjang === "KB" && "KB (Kelompok Bermain)"}
                            {formData.jenjang === "TK" && "TK (Taman Kanak-kanak)"}
                            {formData.jenjang === "MTS" && "MTS (Madrasah Tsanawiyah)"}
                          </p>
                          <p className="text-blue-600 text-sm">
                            {formData.jenjang === "KB" && "Untuk usia 2-4 tahun - Program pengenalan belajar sambil bermain"}
                            {formData.jenjang === "TK" && "Untuk usia 4-6 tahun - Persiapan masuk sekolah dasar"}
                            {formData.jenjang === "MTS" && "Untuk usia 12-15 tahun - Pendidikan menengah pertama Islam"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaPhone className="text-green-600" />
                          Telepon/WhatsApp *
                        </label>
                        <input
                          type="tel"
                          name="telepon"
                          value={formData.telepon}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaEnvelope className="text-green-600" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Alamat lengkap tempat tinggal"
                      />
                    </div>
                  </div>

                  {/* Data Orang Tua */}
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-green-800 border-l-4 border-green-600 pl-4">
                      Data Orang Tua
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaUserFriends className="text-green-600" />
                          Nama Ibu *
                        </label>
                        <input
                          type="text"
                          name="nama_ibu"
                          value={formData.nama_ibu}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Nama lengkap ibu"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaUserFriends className="text-green-600" />
                          Nama Ayah *
                        </label>
                        <input
                          type="text"
                          name="nama_ayah"
                          value={formData.nama_ayah}
                          onChange={handleInputChange}
                          required
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Nama lengkap ayah"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaPhone className="text-green-600" />
                        Telepon Orang Tua *
                      </label>
                      <input
                        type="tel"
                        name="telepon_ortu"
                        value={formData.telepon_ortu}
                        onChange={handleInputChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </div>

                  {/* Dokumen dan Biaya */}
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-green-800 border-l-4 border-green-600 pl-4">
                      Dokumen & Biaya Pendaftaran
                    </h3>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUpload className="text-green-600" />
                        Upload Kartu Keluarga (KK)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors duration-300 relative">
                        <FaUpload className="text-gray-400 text-3xl mx-auto mb-3" />
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <p className="text-gray-600 font-medium">
                          {loading ? "Mengupload..." : "Klik untuk upload KK"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG, PDF (Max. 5MB)</p>
                      </div>
                      {formData.kk_url && (
                        <p className="text-green-600 text-sm flex items-center gap-2 mt-2">
                          <FaCheckCircle /> File berhasil diupload
                        </p>
                      )}
                    </div>

                    {/* Total Biaya */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <FaMoneyBill className="text-green-600" /> 
                        Biaya Pendaftaran
                      </h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-700 font-medium">Total Biaya:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(formData.total_biaya)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 space-y-1">
                        <p>• Biaya akan disesuaikan dengan jenjang pendidikan</p>
                        <p>• Pembayaran dapat dilakukan setelah konfirmasi dari admin</p>
                        <p>• Biaya sudah termasuk biaya formulir dan administrasi</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Mengirim Pendaftaran...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          Kirim Formulir Pendaftaran - {formatCurrency(formData.total_biaya)}
                        </>
                      )}
                    </motion.button>
                    
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Dengan mengirim formulir ini, saya menyetujui syarat dan ketentuan yang berlaku di Yayasan Amalinaur
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}