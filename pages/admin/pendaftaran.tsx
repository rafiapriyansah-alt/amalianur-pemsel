"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaTrash,
  FaFileExcel,
  FaEye,
  FaPrint,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle,
  FaToggleOn,
  FaToggleOff,
  FaEnvelope,
  FaSave,
  FaEdit,
  FaImage,
  FaHeading,
  FaParagraph,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaVenusMars,
  FaSchool,
  FaUserFriends,
  FaUpload,
  FaBook,
  FaMoneyBill,
  FaDollarSign
} from "react-icons/fa";
import * as XLSX from "xlsx";

interface HalamanPendaftaran {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  contact_person: string;
  email: string;
  location: string;
  image_url: string;
}

interface FormulirPendaftaran {
  id: string;
  header_title: string;
  header_subtitle: string;
  form_title: string;
  form_description: string;
  success_title: string;
  success_message: string;
  telepon_admin?: string;
  email_admin?: string;
}

interface PengaturanPendaftaran {
  id: string;
  status_pendaftaran: boolean;
  email_notifikasi: string;
}

interface BiayaPendaftaran {
  id: string;
  status_aktif: boolean;
  biaya_kb: number;
  biaya_tk: number;
  biaya_mts: number;
}

interface Pendaftar {
  id: string;
  nama: string;
  jenis_kelamin: string;
  umur: number;
  telepon: string;
  email: string;
  alamat: string;
  jenjang: string;
  nama_ibu: string;
  nama_ayah: string;
  telepon_ortu: string;
  kk_url: string;
  total_biaya: number;
  created_at: string;
}

export default function AdminDaftar() {
  const supabase = getSupabase();
  
  // State untuk halaman pendaftaran
  const [halamanPendaftaran, setHalamanPendaftaran] = useState<HalamanPendaftaran>({
    id: "",
    title: "Daftar Sekarang di Yayasan Amalianur",
    subtitle: "Bergabung bersama kami untuk mencetak generasi Islami dan berakhlak mulia.",
    description: "Yayasan Amalianur membuka kesempatan bagi calon siswa/santri yang ingin mendapatkan pendidikan Islami, lingkungan positif, dan pembinaan karakter. Mari bersama menjadi bagian dari keluarga besar Yayasan Amalinaur.",
    contact_person: "081234567890",
    email: "info@yayasanamalianur.sch.id",
    location: "Jl. Pendidikan No. 123, Medan, Sumatera Utara",
    image_url: "https://images.unsplash.com/photo-1562813733-b31f71025d54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
  });

  // State untuk pengaturan formulir pendaftaran
  const [formulirPendaftaran, setFormulirPendaftaran] = useState<FormulirPendaftaran>({
    id: "",
    header_title: "Formulir Pendaftaran",
    header_subtitle: "Isi data dengan lengkap dan benar",
    form_title: "Data Calon Siswa/Santri",
    form_description: "Lengkapi informasi berikut untuk proses pendaftaran",
    success_title: "Pendaftaran Berhasil!",
    success_message: "Terima kasih {nama} telah mendaftar di Yayasan Amalinaur. Data Anda telah kami terima dan akan segera diproses. Admin kami akan menghubungi Anda dalam 1-2 hari kerja melalui nomor telepon {telepon} atau email {email} untuk informasi lebih lanjut.",
    telepon_admin: "081234567890",
    email_admin: "info@yayasanamalinaur.sch.id"
  });

  const [pengaturan, setPengaturan] = useState<PengaturanPendaftaran>({
    id: "",
    status_pendaftaran: true,
    email_notifikasi: "teske3nya@gmail.com",
  });

  const [biayaPendaftaran, setBiayaPendaftaran] = useState<BiayaPendaftaran>({
    id: "",
    status_aktif: true,
    biaya_kb: 500000,
    biaya_tk: 750000,
    biaya_mts: 1000000
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pendaftarList, setPendaftarList] = useState<Pendaftar[]>([]);
  const [notif, setNotif] = useState<string | null>(null);

  // Modal states
  const [selectedPendaftar, setSelectedPendaftar] = useState<Pendaftar | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pendaftaran" | "formulir" | "pengaturan" | "data" | "biaya">("pendaftaran");

  // Load all data
  async function loadAll() {
    try {
      setLoading(true);
      
      // Load halaman pendaftaran
      const { data: daftarData, error: daftarError } = await supabase
        .from("daftar")
        .select("*")
        .single();

      if (!daftarError && daftarData) {
        setHalamanPendaftaran(daftarData);
      } else {
        console.error("Error loading daftar:", daftarError);
        // Insert default data jika tidak ada
        const { data: newDaftar, error: insertError } = await supabase
          .from("daftar")
          .insert([{
            title: halamanPendaftaran.title,
            subtitle: halamanPendaftaran.subtitle,
            description: halamanPendaftaran.description,
            contact_person: halamanPendaftaran.contact_person,
            email: halamanPendaftaran.email,
            location: halamanPendaftaran.location,
            image_url: halamanPendaftaran.image_url
          }])
          .select()
          .single();
        
        if (!insertError && newDaftar) {
          setHalamanPendaftaran(newDaftar);
        }
      }

      // Load formulir pendaftaran
      const { data: formulirData, error: formulirError } = await supabase
        .from("formulir_pendaftaran")
        .select("*")
        .single();

      if (!formulirError && formulirData) {
        setFormulirPendaftaran(formulirData);
      } else {
        console.error("Error loading formulir:", formulirError);
        // Insert default data jika tidak ada
        const { data: newFormulir, error: insertError } = await supabase
          .from("formulir_pendaftaran")
          .insert([{
            header_title: formulirPendaftaran.header_title,
            header_subtitle: formulirPendaftaran.header_subtitle,
            form_title: formulirPendaftaran.form_title,
            form_description: formulirPendaftaran.form_description,
            success_title: formulirPendaftaran.success_title,
            success_message: formulirPendaftaran.success_message,
            telepon_admin: formulirPendaftaran.telepon_admin,
            email_admin: formulirPendaftaran.email_admin
          }])
          .select()
          .single();
        
        if (!insertError && newFormulir) {
          setFormulirPendaftaran(newFormulir);
        }
      }

      // Load pengaturan
      const { data: pengaturanData, error: pengaturanError } = await supabase
        .from("pengaturan_pendaftaran")
        .select("*")
        .single();

      if (!pengaturanError && pengaturanData) {
        setPengaturan(pengaturanData);
      } else {
        console.error("Error loading pengaturan:", pengaturanError);
      }

      // Load biaya pendaftaran
      const { data: biayaData, error: biayaError } = await supabase
        .from("biaya_pendaftaran")
        .select("*")
        .single();

      if (!biayaError && biayaData) {
        setBiayaPendaftaran(biayaData);
      } else {
        console.error("Error loading biaya:", biayaError);
      }

      // Load pendaftar
      await loadPendaftar();

    } catch (error) {
      console.error("Error loading data:", error);
      setStatus("❌ Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function loadPendaftar() {
    const { data, error } = await supabase
      .from("pendaftaran")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setPendaftarList(data);
    } else {
      console.error("Error loading pendaftar:", error);
    }
  }

  // Realtime listener
  useEffect(() => {
    loadAll();

    const ch1 = supabase
      .channel("daftar-realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "daftar" }, (payload) => {
        if (payload.new) setHalamanPendaftaran(payload.new as HalamanPendaftaran);
      })
      .subscribe();

    const ch2 = supabase
      .channel("formulir-realtime-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "formulir_pendaftaran" }, (payload) => {
        if (payload.new) setFormulirPendaftaran(payload.new as FormulirPendaftaran);
      })
      .subscribe();

    const ch3 = supabase
  .channel("pendaftaran-realtime")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "pendaftaran" },
    async (payload) => {
      console.log("Realtime update (pendaftaran):", payload);

      // === INSERT: Ada pendaftar baru ===
      if (payload.eventType === "INSERT") {
        const newData = payload.new as Pendaftar;
        setNotif(`Pendaftar baru: ${newData.nama}`);
        setPendaftarList((prev) => [newData, ...prev]);

        // 🔔 Kirim email notifikasi ke admin
        try {
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama: newData.nama,
              jenjang: newData.jenjang,
              telepon: newData.telepon,
              email: newData.email,
              total_biaya: newData.total_biaya,
              umur: newData.umur,
            }),
          });
          console.log("✅ Notifikasi email terkirim ke admin");
        } catch (error) {
          console.error("❌ Gagal mengirim notifikasi email:", error);
        }
      }

      // === UPDATE: data pendaftar diubah (misalnya ubah jenjang / biaya)
      else if (payload.eventType === "UPDATE") {
        const updated = payload.new as Pendaftar;
        setPendaftarList((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      }

      // === DELETE: pendaftar dihapus
      else if (payload.eventType === "DELETE") {
        setPendaftarList((prev) =>
          prev.filter((p) => p.id !== payload.old.id)
        );
      }

      // 🔄 Reset notif setelah 4 detik
      setTimeout(() => setNotif(null), 4000);
    }
  )
  .subscribe((status) => {
    console.log("🔌 Realtime channel status:", status);
  });


    const ch4 = supabase
      .channel("pengaturan-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pengaturan_pendaftaran" }, (payload) => {
        if (payload.new) setPengaturan(payload.new as PengaturanPendaftaran);
      })
      .subscribe();

    const ch5 = supabase
      .channel("biaya-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "biaya_pendaftaran" }, (payload) => {
        if (payload.new) setBiayaPendaftaran(payload.new as BiayaPendaftaran);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
      supabase.removeChannel(ch4);
      supabase.removeChannel(ch5);
    };
  }, []);

  // Save halaman pendaftaran
  async function saveHalamanPendaftaran() {
    setLoading(true);
    setStatus(null);
    
    try {
      let error;
      
      if (halamanPendaftaran.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from("daftar")
          .update({
            title: halamanPendaftaran.title,
            subtitle: halamanPendaftaran.subtitle,
            description: halamanPendaftaran.description,
            contact_person: halamanPendaftaran.contact_person,
            email: halamanPendaftaran.email,
            location: halamanPendaftaran.location,
            image_url: halamanPendaftaran.image_url
          })
          .eq("id", halamanPendaftaran.id);
        
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("daftar")
          .insert([{
            title: halamanPendaftaran.title,
            subtitle: halamanPendaftaran.subtitle,
            description: halamanPendaftaran.description,
            contact_person: halamanPendaftaran.contact_person,
            email: halamanPendaftaran.email,
            location: halamanPendaftaran.location,
            image_url: halamanPendaftaran.image_url
          }]);
        
        error = insertError;
      }

      if (error) throw error;
      
      setStatus("✅ Halaman pendaftaran berhasil disimpan");
      await loadAll(); // Reload data untuk mendapatkan ID yang benar
      
    } catch (error: any) {
      console.error("Save error:", error);
      setStatus("❌ Gagal menyimpan halaman pendaftaran: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Save formulir pendaftaran
  async function saveFormulirPendaftaran() {
    setLoading(true);
    setStatus(null);
    
    try {
      let error;
      
      if (formulirPendaftaran.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from("formulir_pendaftaran")
          .update({
            header_title: formulirPendaftaran.header_title,
            header_subtitle: formulirPendaftaran.header_subtitle,
            form_title: formulirPendaftaran.form_title,
            form_description: formulirPendaftaran.form_description,
            success_title: formulirPendaftaran.success_title,
            success_message: formulirPendaftaran.success_message,
            telepon_admin: formulirPendaftaran.telepon_admin,
            email_admin: formulirPendaftaran.email_admin
          })
          .eq("id", formulirPendaftaran.id);
        
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("formulir_pendaftaran")
          .insert([{
            header_title: formulirPendaftaran.header_title,
            header_subtitle: formulirPendaftaran.header_subtitle,
            form_title: formulirPendaftaran.form_title,
            form_description: formulirPendaftaran.form_description,
            success_title: formulirPendaftaran.success_title,
            success_message: formulirPendaftaran.success_message,
            telepon_admin: formulirPendaftaran.telepon_admin,
            email_admin: formulirPendaftaran.email_admin
          }]);
        
        error = insertError;
      }

      if (error) throw error;
      
      setStatus("✅ Formulir pendaftaran berhasil disimpan");
      await loadAll(); // Reload data untuk mendapatkan ID yang benar
      
    } catch (error: any) {
      console.error("Save error:", error);
      setStatus("❌ Gagal menyimpan formulir pendaftaran: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Save pengaturan
  async function savePengaturan() {
    setLoading(true);
    setStatus(null);
    
    try {
      let error;
      
      if (pengaturan.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from("pengaturan_pendaftaran")
          .update({
            status_pendaftaran: pengaturan.status_pendaftaran,
            email_notifikasi: pengaturan.email_notifikasi
          })
          .eq("id", pengaturan.id);
        
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("pengaturan_pendaftaran")
          .insert([{
            status_pendaftaran: pengaturan.status_pendaftaran,
            email_notifikasi: pengaturan.email_notifikasi
          }]);
        
        error = insertError;
      }

      if (error) throw error;
      
      setStatus("✅ Pengaturan berhasil disimpan");
      await loadAll(); // Reload data untuk mendapatkan ID yang benar
      
    } catch (error: any) {
      console.error("Save error:", error);
      setStatus("❌ Gagal menyimpan pengaturan: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Save biaya pendaftaran
async function saveBiayaPendaftaran() {
  setLoading(true);
  setStatus(null);

  try {
    const supabase = getSupabase();
    let error = null;

    let biayaId = biayaPendaftaran.id;

    if (!biayaId) {
      const { data: existing, error: fetchError } = await supabase
        .from("biaya_pendaftaran")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) console.error("Gagal memeriksa data existing:", fetchError);
      if (existing?.id) {
        biayaId = existing.id;
      }
    }

    if (biayaId) {
      const { error: updateError } = await supabase
        .from("biaya_pendaftaran")
        .update({
          status_aktif: biayaPendaftaran.status_aktif,
          biaya_kb: biayaPendaftaran.biaya_kb,
          biaya_tk: biayaPendaftaran.biaya_tk,
          biaya_mts: biayaPendaftaran.biaya_mts,
          updated_at: new Date(),
        })
        .eq("id", biayaId);

      error = updateError;
    } 
    else {
      const { error: insertError } = await supabase
        .from("biaya_pendaftaran")
        .insert([
          {
            status_aktif: biayaPendaftaran.status_aktif ?? true,
            biaya_kb: biayaPendaftaran.biaya_kb ?? 500000,
            biaya_tk: biayaPendaftaran.biaya_tk ?? 750000,
            biaya_mts: biayaPendaftaran.biaya_mts ?? 1000000,
            updated_at: new Date(),
          },
        ]);

      error = insertError;
    }

    if (error) throw error;

    setStatus("✅ Biaya pendaftaran berhasil disimpan");
    await loadAll();

  } catch (error: any) {
    console.error("Save error:", error);
    setStatus("❌ Gagal menyimpan biaya pendaftaran: " + error.message);
  } finally {
    setLoading(false);
  }
}

  // Toggle status pendaftaran
  async function togglePendaftaran() {
    const newStatus = !pengaturan.status_pendaftaran;
    setPengaturan({ ...pengaturan, status_pendaftaran: newStatus });
    
    const { error } = await supabase
      .from("pengaturan_pendaftaran")
      .update({ status_pendaftaran: newStatus })
      .eq("id", pengaturan.id);
    
    if (error) {
      setStatus("❌ Gagal mengubah status pendaftaran");
      setPengaturan({ ...pengaturan, status_pendaftaran: !newStatus });
    } else {
      setStatus(`✅ Pendaftaran ${newStatus ? 'dibuka' : 'ditutup'}`);
    }
  }

  // Fungsi upload gambar
  async function handleUploadHalaman(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus(null);

    try {
      // Validasi file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran file maksimal 5MB");
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Format file harus JPG, PNG");
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("daftar")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from("daftar")
        .getPublicUrl(uploadData.path);

      const imageUrl = publicURL.publicUrl;

      // Update database
      let updateError;
      if (halamanPendaftaran.id) {
        const { error } = await supabase
          .from("daftar")
          .update({ image_url: imageUrl })
          .eq("id", halamanPendaftaran.id);
        updateError = error;
      } else {
        // Jika tidak ada ID, buat record baru
        const { error } = await supabase
          .from("daftar")
          .insert([{ image_url: imageUrl }]);
        updateError = error;
      }

      if (updateError) throw updateError;
      
      // Update local state
      setHalamanPendaftaran({ 
        ...halamanPendaftaran, 
        image_url: imageUrl 
      });
      
      setStatus("✅ Foto halaman pendaftaran berhasil diunggah!");
      await loadAll(); // Reload untuk mendapatkan ID yang benar
      
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus("❌ Upload gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Hapus pendaftar
  async function deletePendaftar(id: string, nama: string) {
    if (!confirm(`Yakin ingin menghapus data "${nama}"? Tindakan ini tidak dapat dibatalkan!`)) return;
    
    setLoading(true);
    try {
      // Coba hapus data pendaftaran
      const { error } = await supabase.from("pendaftaran").delete().eq("id", id);
      
      if (error) {
        // Jika ada foreign key constraint, coba hapus data terkait terlebih dahulu
        if (error.message.includes('foreign key constraint')) {
          console.log('Foreign key constraint detected, trying alternative approach...');
          
          // Coba hapus dari tabel email_notifications jika ada
          const { error: emailError } = await supabase
            .from("email_notifications")
            .delete()
            .eq("pendaftaran_id", id);
            
          if (emailError) {
            console.log('No email notifications to delete or error:', emailError);
          }
          
          // Coba hapus lagi data pendaftaran
          const { error: retryError } = await supabase.from("pendaftaran").delete().eq("id", id);
          
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      
      setStatus(`✅ Data "${nama}" berhasil dihapus`);
      // Data akan diupdate otomatis melalui realtime listener
      
    } catch (err: any) {
      console.error("Delete error:", err);
      setStatus("❌ Gagal menghapus: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Hapus semua pendaftar
  async function deleteSemua() {
    if (pendaftarList.length === 0) {
      alert("Tidak ada data untuk dihapus");
      return;
    }

    const confirm1 = confirm(`Yakin ingin menghapus SEMUA data pendaftar (${pendaftarList.length} data)?`);
    if (!confirm1) return;

    const confirm2 = prompt("Tindakan ini PERMANEN dan tidak dapat dikembalikan! Ketik 'HAPUS SEMUA' untuk konfirmasi:");
    if (confirm2 !== "HAPUS SEMUA") return;

    setLoading(true);
    try {
      // Hapus satu per satu untuk handle constraints
      for (const pendaftar of pendaftarList) {
        await deletePendaftar(pendaftar.id, pendaftar.nama);
      }
      
      setStatus(`✅ Semua data (${pendaftarList.length}) berhasil dihapus`);
      
    } catch (err: any) {
      console.error("Delete all error:", err);
      setStatus("❌ Terjadi kesalahan saat menghapus semua data");
    } finally {
      setLoading(false);
    }
  }

  // Export ke Excel
  function exportExcel() {
    if (pendaftarList.length === 0) {
      alert("Belum ada data untuk diekspor.");
      return;
    }
    const data = pendaftarList.map((p, i) => ({
      No: i + 1,
      Nama: p.nama,
      Jenis_Kelamin: p.jenis_kelamin,
      Jenjang: p.jenjang || "-",
      Umur: p.umur,
      Telepon: p.telepon,
      Email: p.email,
      Alamat: p.alamat,
      "Nama Ibu": p.nama_ibu,
      "Nama Ayah": p.nama_ayah,
      "Telepon Ortu": p.telepon_ortu,
      "Total Biaya": p.total_biaya,
      "Tanggal Daftar": new Date(p.created_at).toLocaleDateString("id-ID"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftar");
    XLSX.writeFile(workbook, "Daftar_Pendaftar.xlsx");
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <AdminLayout>
      {/* Notifikasi */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-5 right-5 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
          >
            <FaInfoCircle /> {notif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Message */}
      {status && (
        <div className={`mx-auto mt-4 max-w-5xl p-3 rounded-lg text-center ${
          status.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto mt-6">
        <div className="bg-white rounded-2xl shadow-md p-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("pendaftaran")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === "pendaftaran" 
                  ? "bg-green-600 text-white" 
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <FaHeading /> Halaman Pendaftaran
            </button>
            <button
              onClick={() => setActiveTab("formulir")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === "formulir" 
                  ? "bg-green-600 text-white" 
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <FaEdit /> Formulir Pendaftaran
            </button>
            <button
              onClick={() => setActiveTab("biaya")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === "biaya" 
                  ? "bg-green-600 text-white" 
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <FaDollarSign /> Biaya Pendaftaran
            </button>
            <button
              onClick={() => setActiveTab("pengaturan")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === "pengaturan" 
                  ? "bg-green-600 text-white" 
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <FaToggleOn /> Pengaturan
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                activeTab === "data" 
                  ? "bg-green-600 text-white" 
                  : "text-gray-600 hover:bg-green-50"
              }`}
            >
              <FaUsers /> Data Pendaftar ({pendaftarList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto mt-6">
        {/* TAB: HALAMAN PENDAFTARAN */}
        {activeTab === "pendaftaran" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
              <FaHeading /> Kelola Halaman Pendaftaran
            </h2>

            <div className="space-y-6">
              {/* Hero Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaHeading /> Hero Section
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Utama</label>
                    <input 
                      type="text" 
                      value={halamanPendaftaran.title} 
                      onChange={(e) => setHalamanPendaftaran({...halamanPendaftaran, title: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Judul halaman pendaftaran"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subjudul</label>
                    <input 
                      type="text" 
                      value={halamanPendaftaran.subtitle} 
                      onChange={(e) => setHalamanPendaftaran({...halamanPendaftaran, subtitle: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Subjudul halaman pendaftaran"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                    <textarea 
                      rows={4}
                      value={halamanPendaftaran.description} 
                      onChange={(e) => setHalamanPendaftaran({...halamanPendaftaran, description: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Deskripsi halaman pendaftaran"
                    />
                  </div>
                </div>
              </div>

              {/* Informasi Kontak */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaPhone /> Informasi Kontak
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                    <input 
                      type="text" 
                      value={halamanPendaftaran.contact_person} 
                      onChange={(e) => setHalamanPendaftaran({...halamanPendaftaran, contact_person: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Nomor telepon contact person"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={halamanPendaftaran.email} 
                      onChange={(e) => setHalamanPendaftaran({...halamanPendaftaran, email: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Email contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                  <input 
                    type="text" 
                    value={halamanPendaftaran.location} 
                    onChange={(e) => setHalamanPendaftaran({...halamanPendaftaran, location: e.target.value})} 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Alamat lengkap"
                  />
                </div>
              </div>

              {/* Gambar Hero */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaImage /> Gambar Hero
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Gambar Hero</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUploadHalaman} 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    disabled={loading}
                  />
                  {halamanPendaftaran.image_url && (
                    <div className="mt-3">
                      <img 
                        src={halamanPendaftaran.image_url} 
                        alt="Preview" 
                        className="rounded-lg w-full h-48 object-cover border"
                      />
                      <p className="text-sm text-gray-500 mt-1">Preview gambar hero</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={saveHalamanPendaftaran} 
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loading ? "Menyimpan..." : "Simpan Perubahan Halaman Pendaftaran"}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB: FORMULIR PENDAFTARAN */}
        {activeTab === "formulir" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
              <FaEdit /> Kelola Formulir Pendaftaran
            </h2>

            <div className="space-y-6">
              {/* Header Formulir */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaHeading /> Header Formulir
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Header</label>
                    <input 
                      type="text" 
                      value={formulirPendaftaran.header_title} 
                      onChange={(e) => setFormulirPendaftaran({...formulirPendaftaran, header_title: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Judul header formulir"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subjudul Header</label>
                    <input 
                      type="text" 
                      value={formulirPendaftaran.header_subtitle} 
                      onChange={(e) => setFormulirPendaftaran({...formulirPendaftaran, header_subtitle: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Subjudul header formulir"
                    />
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaBook /> Konten Formulir
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Formulir</label>
                    <input 
                      type="text" 
                      value={formulirPendaftaran.form_title} 
                      onChange={(e) => setFormulirPendaftaran({...formulirPendaftaran, form_title: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Judul formulir"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Formulir</label>
                    <input 
                      type="text" 
                      value={formulirPendaftaran.form_description} 
                      onChange={(e) => setFormulirPendaftaran({...formulirPendaftaran, form_description: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Deskripsi formulir"
                    />
                  </div>
                </div>
              </div>

              {/* Success Message & Kontak Admin */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaCheckCircle /> Pesan Sukses & Kontak Admin
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Sukses</label>
                    <input 
                      type="text" 
                      value={formulirPendaftaran.success_title} 
                      onChange={(e) => setFormulirPendaftaran({...formulirPendaftaran, success_title: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Judul pesan sukses"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pesan Sukses</label>
                    <textarea 
                      rows={4}
                      value={formulirPendaftaran.success_message} 
                      onChange={(e) => setFormulirPendaftaran({...formulirPendaftaran, success_message: e.target.value})} 
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Pesan sukses setelah pendaftaran"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Gunakan {"{nama}"}, {"{telepon}"}, {"{email}"} untuk variabel dinamis
                    </p>
                  </div>

                  {/* Field Kontak Admin */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telepon Admin (WhatsApp)
                      </label>
                      <input 
                        type="text" 
                        value={formulirPendaftaran.telepon_admin || ""} 
                        onChange={(e) => setFormulirPendaftaran({
                          ...formulirPendaftaran, 
                          telepon_admin: e.target.value
                        })} 
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="081234567890"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Nomor yang akan ditampilkan di pesan sukses
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Admin
                      </label>
                      <input 
                        type="email" 
                        value={formulirPendaftaran.email_admin || ""} 
                        onChange={(e) => setFormulirPendaftaran({
                          ...formulirPendaftaran, 
                          email_admin: e.target.value
                        })} 
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="admin@yayasanamalinaur.sch.id"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email yang akan ditampilkan di pesan sukses
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={saveFormulirPendaftaran} 
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loading ? "Menyimpan..." : "Simpan Perubahan Formulir"}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB: BIAYA PENDAFTARAN */}
        {activeTab === "biaya" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
              <FaDollarSign /> Kelola Biaya Pendaftaran
            </h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <FaMoneyBill /> KB (Kelompok Bermain)
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Biaya KB</label>
                      <input
                        type="number"
                        value={biayaPendaftaran.biaya_kb}
                        onChange={(e) => setBiayaPendaftaran({...biayaPendaftaran, biaya_kb: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="500000"
                      />
                      <p className="text-sm text-gray-500">Untuk usia 2-4 tahun</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <FaMoneyBill /> TK (Taman Kanak-kanak)
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Biaya TK</label>
                      <input
                        type="number"
                        value={biayaPendaftaran.biaya_tk}
                        onChange={(e) => setBiayaPendaftaran({...biayaPendaftaran, biaya_tk: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="750000"
                      />
                      <p className="text-sm text-gray-500">Untuk usia 4-6 tahun</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <FaMoneyBill /> MTS (Madrasah Tsanawiyah)
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Biaya MTS</label>
                      <input
                        type="number"
                        value={biayaPendaftaran.biaya_mts}
                        onChange={(e) => setBiayaPendaftaran({...biayaPendaftaran, biaya_mts: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="1000000"
                      />
                      <p className="text-sm text-gray-500">Untuk usia 12-15 tahun</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  Status Biaya Pendaftaran
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-yellow-700">
                    {biayaPendaftaran.status_aktif ? 
                      "Biaya pendaftaran sedang aktif" : 
                      "Biaya pendaftaran sedang non-aktif"
                    }
                  </p>
                  <button
                    onClick={() => setBiayaPendaftaran({...biayaPendaftaran, status_aktif: !biayaPendaftaran.status_aktif})}
                    className={`p-2 rounded-full transition-colors ${
                      biayaPendaftaran.status_aktif ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {biayaPendaftaran.status_aktif ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={saveBiayaPendaftaran} 
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loading ? "Menyimpan..." : "Simpan Perubahan Biaya"}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB: PENGGATURAN */}
        {activeTab === "pengaturan" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-2">
              <FaToggleOn /> Pengaturan Pendaftaran
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Status Pendaftaran */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">Status Pendaftaran</h3>
                    <p className="text-sm text-gray-600">
                      {pengaturan.status_pendaftaran ? 
                        "Pendaftaran sedang dibuka" : 
                        "Pendaftaran sedang ditutup"
                      }
                    </p>
                  </div>
                  <button
                    onClick={togglePendaftaran}
                    className={`p-2 rounded-full transition-colors ${
                      pengaturan.status_pendaftaran ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {pengaturan.status_pendaftaran ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                  </button>
                </div>

                {/* Email Notifikasi */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="text-green-600" />
                    Email Notifikasi
                  </label>
                  <input
                    type="email"
                    value={pengaturan.email_notifikasi}
                    onChange={(e) => setPengaturan({...pengaturan, email_notifikasi: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                  <p className="text-sm text-gray-500">
                    Notifikasi akan dikirim ke email ini ketika ada pendaftar baru
                  </p>
                </div>

                <button
                  onClick={savePengaturan}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaSave /> Simpan Pengaturan
                </button>
              </div>

              {/* Info Status */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Informasi Status</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• <strong>Pendaftaran Dibuka:</strong> Formulir dapat diakses publik</li>
                  <li>• <strong>Pendaftaran Ditutup:</strong> Formulir tidak dapat diakses</li>
                  <li>• <strong>Notifikasi Email:</strong> Akan dikirim ke email yang ditentukan</li>
                  <li>• <strong>Realtime Sync:</strong> Perubahan langsung terlihat di halaman publik</li>
                  <li>• <strong>Biaya Aktif:</strong> Biaya akan ditampilkan di formulir</li>
                  <li>• <strong>Biaya Non-Aktif:</strong> Biaya tidak akan ditampilkan</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: DATA PENDAFTAR */}
        {activeTab === "data" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }} 
            className="bg-white p-6 rounded-2xl shadow-md"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
                <FaUsers /> Data Pendaftar ({pendaftarList.length})
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                  <FaFileExcel /> Export Excel
                </button>
                <button onClick={deleteSemua} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                  <FaTrash /> Hapus Semua
                </button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse border text-sm">
                <thead className="bg-green-50">
                  <tr>
                    <th className="border p-2">No</th>
                    <th className="border p-2">Nama</th>
                    <th className="border p-2">Jenjang</th>
                    <th className="border p-2">Umur</th>
                    <th className="border p-2">Telepon</th>
                    <th className="border p-2">Total Biaya</th>
                    <th className="border p-2">Tanggal</th>
                    <th className="border p-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendaftarList.map((p, i) => (
                    <tr key={p.id} className="hover:bg-green-50">
                      <td className="border p-2 text-center">{i + 1}</td>
                      <td className="border p-2">{p.nama}</td>
                      <td className="border p-2 text-center">{p.jenjang || "-"}</td>
                      <td className="border p-2 text-center">{p.umur}</td>
                      <td className="border p-2 text-center">{p.telepon}</td>
                      <td className="border p-2 text-center">{formatCurrency(p.total_biaya)}</td>
                      <td className="border p-2 text-center">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="border p-2 text-center flex justify-center gap-3">
                        <button onClick={() => { setSelectedPendaftar(p); setShowModal(true); }} className="text-blue-600 hover:text-blue-800"><FaEye /></button>
                        <button onClick={() => deletePendaftar(p.id, p.nama)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {pendaftarList.map((p, i) => (
                <div key={p.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{p.nama}</h3>
                      <p className="text-sm text-gray-600">{p.jenjang} • {p.umur} tahun</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      #{i + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telepon:</span>
                      <span className="font-medium">{p.telepon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biaya:</span>
                      <span className="font-medium text-green-600">{formatCurrency(p.total_biaya)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium">{new Date(p.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
                    <button 
                      onClick={() => { setSelectedPendaftar(p); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <FaEye /> Detail
                    </button>
                    <button 
                      onClick={() => deletePendaftar(p.id, p.nama)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <FaTrash /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pendaftarList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaUsers className="text-4xl text-gray-300 mx-auto mb-3" />
                <p>Belum ada data pendaftar</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {showModal && selectedPendaftar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-y-auto max-h-[90vh]" id="print-area">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-2xl"><FaTimes /></button>

              <div className="text-center border-b pb-3 mb-3">
                <h3 className="text-lg font-semibold text-green-700">YAYASAN AMALINAUR</h3>
                <p className="text-sm text-gray-600">Jl. Kebaikan No. 7, Medan | Telp. 0812-3456-7890</p>
              </div>

              <h2 className="text-xl font-semibold text-green-700 mb-4 text-center">Formulir Pendaftaran</h2>

              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Nama:</strong> {selectedPendaftar.nama}</p>
                <p><strong>Jenis Kelamin:</strong> {selectedPendaftar.jenis_kelamin}</p>
                <p><strong>Jenjang:</strong> {selectedPendaftar.jenjang}</p>
                <p><strong>Umur:</strong> {selectedPendaftar.umur}</p>
                <p><strong>Telepon:</strong> {selectedPendaftar.telepon}</p>
                <p><strong>Email:</strong> {selectedPendaftar.email}</p>
                <p><strong>Alamat:</strong> {selectedPendaftar.alamat}</p>
                <p><strong>Nama Ibu:</strong> {selectedPendaftar.nama_ibu}</p>
                <p><strong>Nama Ayah:</strong> {selectedPendaftar.nama_ayah}</p>
                <p><strong>Telepon Ortu:</strong> {selectedPendaftar.telepon_ortu}</p>
                <p><strong>Total Biaya:</strong> {formatCurrency(selectedPendaftar.total_biaya)}</p>
                <p><strong>Tanggal Daftar:</strong> {new Date(selectedPendaftar.created_at).toLocaleDateString("id-ID")}</p>

                {selectedPendaftar.kk_url ? (
                  <div className="mt-3">
                    <p className="font-semibold text-green-700 mb-2">Foto Kartu Keluarga:</p>
                    <img src={selectedPendaftar.kk_url} alt="Foto KK" onClick={() => setFullscreenImg(selectedPendaftar.kk_url)} className="w-full h-56 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition" />
                    <p className="text-xs text-gray-500 mt-1 text-center">(Klik gambar untuk perbesar)</p>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-3 italic">Belum ada foto KK</p>
                )}
              </div>

              <button onClick={() => window.print()} className="mt-5 bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg w-full flex justify-center items-center gap-2">
                <FaPrint /> Cetak Formulir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Foto KK */}
      <AnimatePresence>
        {fullscreenImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setFullscreenImg(null)}>
            <motion.img src={fullscreenImg} alt="KK Fullscreen" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} transition={{ duration: 0.3 }} className="max-w-[95%] max-h-[90%] rounded-xl shadow-2xl cursor-zoom-out" />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}