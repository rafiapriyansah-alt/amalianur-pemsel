// pages/admin/contact.tsx
"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle, Eye, EyeOff, Upload, X } from "lucide-react";
import Image from "next/image";

export default function AdminContact() {
  const supabase = getSupabase();
  const [data, setData] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mapImage, setMapImage] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("realtime-contact")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact" }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function load() {
    const { data } = await supabase.from("contact").select("*").limit(1).single();
    if (data) {
      setData(data);
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setMapImage(data.map_image || "");
      setMapLink(data.map_link || "");
      setOfficeHours(data.office_hours || "");
      setWhatsappMessage(data.whatsapp_message || "");
    }
  }

  async function uploadImage(file: File) {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `maps/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setMapImage(publicUrl);
      setUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
  }

  async function save() {
    setLoading(true);
    const contactData = {
      address,
      phone,
      email,
      map_image: mapImage,
      map_link: mapLink,
      office_hours: officeHours,
      whatsapp_message: whatsappMessage
    };

    if (data?.id) {
      await supabase.from("contact").update(contactData).eq("id", data.id);
    } else {
      await supabase.from("contact").insert([contactData]);
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    load();
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const removeImage = () => {
    setMapImage("");
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">Pengaturan Kontak</h2>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Kelola informasi kontak dan lokasi yayasan</p>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-sm md:text-base"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Form Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 md:space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-green-100">
              <h3 className="text-lg md:text-xl font-semibold text-green-800 mb-3 md:mb-4">Informasi Dasar</h3>
              
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap yayasan"
                    rows={3}
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all text-sm md:text-base"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon/WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all text-sm md:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@yayasan.com"
                      className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jam Operasional</label>
                  <input
                    type="text"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    placeholder="Contoh: Senin - Jumat: 08:00 - 16:00 WIB"
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pesan WhatsApp Default</label>
                  <input
                    type="text"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Contoh: Hubungi kami via WhatsApp untuk informasi cepat"
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-green-100">
              <h3 className="text-lg md:text-xl font-semibold text-green-800 mb-3 md:mb-4">Lokasi & Peta</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Google Maps</label>
                  <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Link yang akan dibuka ketika gambar QR code diklik</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Gambar QR Code Maps</label>
                  
                  {mapImage ? (
                    <div className="space-y-3">
                      <div className="relative border-2 border-green-200 rounded-xl p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-green-800">Gambar saat ini:</span>
                          <button
                            onClick={removeImage}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="relative w-full max-w-xs mx-auto">
                          <Image
                            src={mapImage}
                            alt="Preview QR code maps"
                            width={300}
                            height={300}
                            className="w-full h-auto rounded-lg border border-gray-300"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Ukuran disarankan: 400x400px (akan disesuaikan otomatis)
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload QR code Google Maps</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Format: JPG, PNG, WebP. Ukuran disarankan: 400x400px
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="map-upload"
                      />
                      <label
                        htmlFor="map-upload"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block text-sm"
                      >
                        {uploading ? "Mengupload..." : "Pilih File"}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={save}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 text-green-700 p-3 md:p-4 rounded-xl text-center text-sm md:text-base"
              >
                ✅ Perubahan berhasil disimpan!
              </motion.div>
            )}
          </motion.div>

          {/* Preview Section */}
          {showPreview && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 md:space-y-6">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-green-100">
                <h3 className="text-lg md:text-xl font-semibold text-green-800 mb-3 md:mb-4">Preview Halaman Publik</h3>
                
                <div className="space-y-3 md:space-y-4">
                  {/* Info Cards Preview */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                      <div className="bg-green-600 p-2 rounded-full flex-shrink-0">
                        <MapPin className="text-white w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-green-800 text-xs md:text-sm">Alamat</h4>
                        <p className="text-gray-700 text-xs md:text-sm mt-1">{address || "Alamat belum diatur"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                      <div className="bg-green-600 p-2 rounded-full flex-shrink-0">
                        <Phone className="text-white w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-green-800 text-xs md:text-sm">Telepon/WhatsApp</h4>
                        <p className="text-gray-700 text-xs md:text-sm mt-1">{phone || "Nomor belum diatur"}</p>
                        {whatsappMessage && (
                          <p className="text-xs text-gray-600 mt-1">{whatsappMessage}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                      <div className="bg-green-600 p-2 rounded-full flex-shrink-0">
                        <Mail className="text-white w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-green-800 text-xs md:text-sm">Email</h4>
                        <p className="text-gray-700 text-xs md:text-sm mt-1">{email || "Email belum diatur"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                      <div className="bg-green-600 p-2 rounded-full flex-shrink-0">
                        <Clock className="text-white w-3 h-3 md:w-4 md:h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-green-800 text-xs md:text-sm">Jam Operasional</h4>
                        <p className="text-gray-700 text-xs md:text-sm mt-1">
                          {officeHours || "Jam operasional belum diatur"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Preview */}
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-3 md:p-4 text-white">
                    <h4 className="font-semibold text-xs md:text-sm mb-2">Butuh Bantuan Cepat?</h4>
                    <p className="text-xs opacity-90 mb-3">Hubungi kami melalui WhatsApp untuk respon yang lebih cepat</p>
                    <div className="bg-white text-green-600 text-xs font-semibold py-2 px-3 md:px-4 rounded-lg text-center">
                      Chat WhatsApp
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-200">
                      <h4 className="font-semibold text-green-800 text-xs md:text-sm flex items-center gap-2">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                        Lokasi Kami
                      </h4>
                    </div>
                    <div className="p-4">
                      {mapImage ? (
                        <div className="text-center">
                          <div className="relative mx-auto max-w-xs border-2 border-green-200 rounded-lg overflow-hidden bg-gray-100">
                            <div className="aspect-square flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-green-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                  <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-xs text-gray-600">QR Code Maps</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Klik untuk membuka peta</p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">QR code belum diatur</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}