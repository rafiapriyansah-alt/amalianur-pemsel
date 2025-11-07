// pages/admin/footer.tsx
"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Link, MessageCircle, Users } from "lucide-react";

interface FooterSettings {
  site_name: string;
  tagline: string;
  footer_text: string;
  facebook_yayasan: string;
  facebook_tk: string;
  facebook_kb: string;
  facebook_mts: string;
  instagram_yayasan: string;
  instagram_tk: string;
  instagram_kb: string;
  instagram_mts: string;
  youtube_yayasan: string;
  youtube_tk: string;
  youtube_kb: string;
  youtube_mts: string;
}

export default function AdminFooter() {
  const supabase = getSupabase();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase.from("settings").select("*").single();
    if (data) {
      setSettings(data);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    
    setLoading(true);
    try {
      await supabase.from("settings").upsert({
        ...settings,
        updated_at: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: keyof FooterSettings, value: string) => {
    if (settings) {
      setSettings(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  if (!settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">Pengaturan Footer</h2>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
              Kelola konten dan link social media untuk footer website
            </p>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-sm md:text-base"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Informasi Dasar */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Informasi Dasar
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Situs</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => handleChange('site_name', e.target.value)}
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all"
                    placeholder="Nama yayasan atau sekolah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <textarea
                    value={settings.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all"
                    placeholder="Tagline atau motto yayasan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teks Footer</label>
                  <input
                    type="text"
                    value={settings.footer_text}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-xl outline-none transition-all"
                    placeholder="Teks yang ditampilkan di bagian bawah footer"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Link Social Media
              </h3>
              
              <div className="space-y-6">
                {/* Facebook */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Facebook</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Yayasan</label>
                      <input
                        type="url"
                        value={settings.facebook_yayasan || ''}
                        onChange={(e) => handleChange('facebook_yayasan', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://facebook.com/yayasan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">TK</label>
                      <input
                        type="url"
                        value={settings.facebook_tk || ''}
                        onChange={(e) => handleChange('facebook_tk', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://facebook.com/tk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">KB</label>
                      <input
                        type="url"
                        value={settings.facebook_kb || ''}
                        onChange={(e) => handleChange('facebook_kb', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://facebook.com/kb"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">MTs</label>
                      <input
                        type="url"
                        value={settings.facebook_mts || ''}
                        onChange={(e) => handleChange('facebook_mts', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://facebook.com/mts"
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Instagram</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Yayasan</label>
                      <input
                        type="url"
                        value={settings.instagram_yayasan || ''}
                        onChange={(e) => handleChange('instagram_yayasan', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://instagram.com/yayasan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">TK</label>
                      <input
                        type="url"
                        value={settings.instagram_tk || ''}
                        onChange={(e) => handleChange('instagram_tk', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://instagram.com/tk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">KB</label>
                      <input
                        type="url"
                        value={settings.instagram_kb || ''}
                        onChange={(e) => handleChange('instagram_kb', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://instagram.com/kb"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">MTs</label>
                      <input
                        type="url"
                        value={settings.instagram_mts || ''}
                        onChange={(e) => handleChange('instagram_mts', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://instagram.com/mts"
                      />
                    </div>
                  </div>
                </div>

                {/* YouTube */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">YouTube</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Yayasan</label>
                      <input
                        type="url"
                        value={settings.youtube_yayasan || ''}
                        onChange={(e) => handleChange('youtube_yayasan', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://youtube.com/yayasan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">TK</label>
                      <input
                        type="url"
                        value={settings.youtube_tk || ''}
                        onChange={(e) => handleChange('youtube_tk', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://youtube.com/tk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">KB</label>
                      <input
                        type="url"
                        value={settings.youtube_kb || ''}
                        onChange={(e) => handleChange('youtube_kb', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://youtube.com/kb"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">MTs</label>
                      <input
                        type="url"
                        value={settings.youtube_mts || ''}
                        onChange={(e) => handleChange('youtube_mts', e.target.value)}
                        className="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-2 rounded-lg outline-none transition-all text-sm"
                        placeholder="https://youtube.com/mts"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center"
              >
                ✅ Perubahan berhasil disimpan!
              </motion.div>
            )}
          </motion.div>

        

{/* Preview Section */}
{showPreview && (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
      <h3 className="text-xl font-semibold text-green-800 mb-4">Preview Footer</h3>
      
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
        {/* Brand Preview */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <div>
            <h4 className="font-bold text-lg">{settings.site_name || "Yayasan Amalianur"}</h4>
            <p className="text-green-100 text-xs opacity-80">
              {settings.tagline || "Membangun Generasi Islami dan Berakhlak Mulia"}
            </p>
          </div>
        </div>

        {/* Social Media Preview */}
        <div className="flex gap-2 mb-4">
          {/* Facebook */}
          {(settings.facebook_yayasan || settings.facebook_tk || settings.facebook_kb || settings.facebook_mts) && (
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          )}
          {/* Instagram */}
          {(settings.instagram_yayasan || settings.instagram_tk || settings.instagram_kb || settings.instagram_mts) && (
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          )}
          {/* YouTube */}
          {(settings.youtube_yayasan || settings.youtube_tk || settings.youtube_kb || settings.youtube_mts) && (
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
          )}
        </div>

        {/* Footer Text Preview */}
        <div className="border-t border-green-500 border-opacity-30 pt-4">
          <p className="text-green-100 text-sm text-center opacity-80">
            {settings.footer_text || "© 2025 Yayasan Amalianur. All rights reserved."}
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p><strong>Facebook Links:</strong> {
          [settings.facebook_yayasan, settings.facebook_tk, settings.facebook_kb, settings.facebook_mts]
            .filter(val => val && val.trim() !== '').length
        } link tersedia</p>
        <p><strong>Instagram Links:</strong> {
          [settings.instagram_yayasan, settings.instagram_tk, settings.instagram_kb, settings.instagram_mts]
            .filter(val => val && val.trim() !== '').length
        } link tersedia</p>
        <p><strong>YouTube Links:</strong> {
          [settings.youtube_yayasan, settings.youtube_tk, settings.youtube_kb, settings.youtube_mts]
            .filter(val => val && val.trim() !== '').length
        } link tersedia</p>
      </div>
    </div>
  </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}