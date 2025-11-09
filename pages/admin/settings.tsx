"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { useRequireRole } from "../../hooks/useRequireRole";
import { Trash2, Upload, Settings, Activity, Image, Globe, ChevronDown, ChevronUp } from "lucide-react";

export default function SettingsPage() {
  useRequireRole(["super_admin"]);
  const supabase = getSupabase();

  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("identity");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    load();

    // Realtime listener untuk semua tabel yang relevan
    const settingsSub = supabase
      .channel("settings-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, load)
      .subscribe();

    const logsSub = supabase
      .channel("logs-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(settingsSub);
      supabase.removeChannel(logsSub);
    };
  }, []);

  async function load() {
    const { data } = await supabase.from("settings").select("*").single();
    if (data) setSettings(data);

    const { data: logData } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setLogs(logData ?? []);
  }

  // 🧩 Upload handler dengan multiple sizes untuk favicon
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validasi file type
    if (field.includes("favicon") && !file.type.includes("image")) {
      alert("Favicon harus berupa file gambar");
      return;
    }

    setLoading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`settings/${fileName}`, file, {
          cacheControl: "86400", // 24 jam cache
          upsert: true,
        });

      if (error) throw error;

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;

      // Simpan ke database
      await supabase
        .from("settings")
        .update({ [field]: url, updated_at: new Date() })
        .eq("id", settings.id);

      // Log aktivitas yang lebih deskriptif
      const fieldNames: { [key: string]: string } = {
        logo_url: "Logo Navbar",
        sidebar_logo: "Logo Sidebar Admin", 
        footer_logo: "Logo Footer",
        favicon_url: "Favicon",
        meta_image: "Gambar Meta SEO"
      };

      await supabase.from("activity_logs").insert({
        actor: "Super Admin",
        action: "upload_image",
        details: `Mengupload ${fieldNames[field] || field}`,
        target_table: "settings",
        target_id: settings.id
      });

      load();
    } catch (err: any) {
      alert(err.message || "Gagal mengupload file.");
    } finally {
      setLoading(false);
      // Reset input file
      e.target.value = "";
    }
  }

  // 🧹 Hapus gambar tertentu
  async function handleDeleteImage(field: string) {
    if (!confirm("Hapus gambar ini?")) return;
    
    const fieldNames: { [key: string]: string } = {
      logo_url: "Logo Navbar",
      sidebar_logo: "Logo Sidebar Admin",
      footer_logo: "Logo Footer", 
      favicon_url: "Favicon",
      meta_image: "Gambar Meta SEO"
    };

    await supabase.from("settings").update({ [field]: null }).eq("id", settings.id);
    
    await supabase.from("activity_logs").insert({
      actor: "Super Admin",
      action: "delete_image",
      details: `Menghapus ${fieldNames[field] || field}`,
      target_table: "settings",
      target_id: settings.id
    });
    
    load();
  }

  // ✏️ Update teks langsung (inline) dengan debounce
  async function saveText(field: string, value: string) {
    const fieldNames: { [key: string]: string } = {
      site_name: "Nama Situs",
      site_tagline: "Tagline Situs",
      meta_title: "Meta Title",
      meta_author: "Meta Author",
      meta_description: "Meta Description",
      meta_keywords: "Meta Keywords"
    };

    await supabase
      .from("settings")
      .update({ [field]: value, updated_at: new Date() })
      .eq("id", settings.id);

    await supabase.from("activity_logs").insert({
      actor: "Super Admin",
      action: "update_setting",
      details: `Mengubah ${fieldNames[field] || field} menjadi "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`,
      target_table: "settings",
      target_id: settings.id
    });

    load();
  }

  // 🗑️ Hapus semua log aktivitas
  async function clearLogs() {
    if (!confirm("Hapus semua log aktivitas? Tindakan ini tidak dapat dibatalkan.")) return;
    
    const { error } = await supabase.from("activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) {
      alert("Gagal menghapus log: " + error.message);
      return;
    }

    await supabase.from("activity_logs").insert({
      actor: "Super Admin",
      action: "clear_logs",
      details: "Menghapus semua log aktivitas",
      target_table: "activity_logs"
    });

    load();
  }

  // Navigation sections
  const sections = [
    { id: "identity", name: "Identitas Website", icon: Globe },
    { id: "seo", name: "SEO & Branding", icon: Settings },
    { id: "activity", name: "Log Aktivitas", icon: Activity }
  ];

  // Komponen untuk menampilkan log aktivitas di mobile
  const MobileLogItem = ({ log }: { log: any }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          log.action.includes('delete') ? 'bg-red-100 text-red-800' :
          log.action.includes('upload') ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {log.action}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(log.created_at).toLocaleDateString("id-ID")}
        </span>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {log.actor}
          </span>
          {log.target_table && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {log.target_table}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700">{log.details}</p>
      </div>
      <div className="text-xs text-gray-400">
        {new Date(log.created_at).toLocaleTimeString("id-ID")}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Settings className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                  Pengaturan Website
                </h1>
                <p className="text-gray-600 mt-2 text-sm md:text-base">
                  Kelola identitas, SEO, dan pantau aktivitas website
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs md:text-sm text-green-800">
                    <strong>Terakhir diperbarui:</strong>{" "}
                    {settings.updated_at ? new Date(settings.updated_at).toLocaleString("id-ID") : "Belum ada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Container dengan Border */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <div className={`${isMobile ? 'flex flex-col' : 'flex flex-row'} bg-gray-50/50`}>
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center justify-between gap-3 px-4 md:px-6 py-4 text-left transition-all duration-200 border-b md:border-b-0 md:border-r border-gray-200 last:border-b-0 md:last:border-r-0 flex-1 ${
                        isActive
                          ? "bg-white text-green-700 border-green-200 shadow-sm"
                          : "text-gray-700 hover:bg-white/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm md:text-base">{section.name}</span>
                      </div>
                      {isMobile && (
                        <div>
                          {isActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 md:p-6">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              )}

              {/* A. Identitas Website */}
              {activeSection === "identity" && (
                <section className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Identitas Website</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Nama Situs</label>
                        <input
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base"
                          value={settings.site_name || ""}
                          onChange={(e) => saveText("site_name", e.target.value)}
                          placeholder="Masukkan nama website"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Tagline</label>
                        <input
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base"
                          value={settings.site_tagline || ""}
                          onChange={(e) => saveText("site_tagline", e.target.value)}
                          placeholder="Masukkan tagline website"
                        />
                      </div>
                    </div>

                    {/* Logo Upload Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo & Branding</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Logo Navbar */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-green-400 transition-colors">
                          <label className="cursor-pointer block">
                            <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2 md:mb-3" />
                            <div className="font-medium text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Logo Navbar</div>
                            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">200x50px</p>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, "logo_url")}
                              disabled={loading}
                            />
                            <div className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-2 rounded-lg inline-block">
                              Pilih File
                            </div>
                          </label>
                          {settings.logo_url && (
                            <div className="mt-3 md:mt-4 relative inline-block">
                              <img
                                src={settings.logo_url}
                                className="h-8 md:h-12 rounded-lg border shadow-sm"
                                alt="Logo Navbar"
                              />
                              <button
                                onClick={() => handleDeleteImage("logo_url")}
                                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <Trash2 size={12} className="md:w-3 md:h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Logo Sidebar Admin */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-green-400 transition-colors">
                          <label className="cursor-pointer block">
                            <Image className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2 md:mb-3" />
                            <div className="font-medium text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Logo Sidebar Admin</div>
                            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">150x40px</p>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, "sidebar_logo")}
                              disabled={loading}
                            />
                            <div className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-2 rounded-lg inline-block">
                              Pilih File
                            </div>
                          </label>
                          {settings.sidebar_logo && (
                            <div className="mt-3 md:mt-4 relative inline-block">
                              <img
                                src={settings.sidebar_logo}
                                className="h-6 md:h-10 rounded-lg border shadow-sm"
                                alt="Logo Sidebar Admin"
                              />
                              <button
                                onClick={() => handleDeleteImage("sidebar_logo")}
                                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <Trash2 size={12} className="md:w-3 md:h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Logo Footer */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-green-400 transition-colors">
                          <label className="cursor-pointer block">
                            <Image className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2 md:mb-3" />
                            <div className="font-medium text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Logo Footer</div>
                            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">180x45px</p>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, "footer_logo")}
                              disabled={loading}
                            />
                            <div className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-2 rounded-lg inline-block">
                              Pilih File
                            </div>
                          </label>
                          {settings.footer_logo && (
                            <div className="mt-3 md:mt-4 relative inline-block">
                              <img
                                src={settings.footer_logo}
                                className="h-8 md:h-12 rounded-lg border shadow-sm"
                                alt="Logo Footer"
                              />
                              <button
                                onClick={() => handleDeleteImage("footer_logo")}
                                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <Trash2 size={12} className="md:w-3 md:h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Favicon */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-green-400 transition-colors md:col-span-2 lg:col-span-1">
                          <label className="cursor-pointer block">
                            <Image className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2 md:mb-3" />
                            <div className="font-medium text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Favicon</div>
                            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">ICO/PNG, Multiple sizes</p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".ico,image/x-icon,image/png,image/jpeg"
                              onChange={(e) => handleUpload(e, "favicon_url")}
                              disabled={loading}
                            />
                            <div className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-2 rounded-lg inline-block">
                              Pilih File
                            </div>
                          </label>
                          {settings.favicon_url && (
                            <div className="mt-3 md:mt-4">
                              <div className="flex items-center justify-center gap-3 md:gap-4">
                                <div className="relative">
                                  <img
                                    src={settings.favicon_url}
                                    className="w-6 h-6 md:w-8 md:h-8 rounded border shadow-sm"
                                    alt="Favicon 32x32"
                                  />
                                  <span className="text-xs text-gray-500 block text-center mt-1">32px</span>
                                </div>
                                <div className="relative">
                                  <img
                                    src={settings.favicon_url}
                                    className="w-4 h-4 md:w-6 md:h-6 rounded border shadow-sm"
                                    alt="Favicon 16x16"
                                  />
                                  <span className="text-xs text-gray-500 block text-center mt-1">16px</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteImage("favicon_url")}
                                className="mt-2 md:mt-3 bg-red-500 text-white px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm hover:bg-red-600 transition-colors flex items-center gap-1 mx-auto"
                              >
                                <Trash2 size={12} className="md:w-3 md:h-3" />
                                Hapus Favicon
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* D. Meta SEO & Branding */}
              {activeSection === "seo" && (
                <section className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">SEO & Branding</h2>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Meta Title</label>
                        <input
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base"
                          value={settings.meta_title || ""}
                          onChange={(e) => saveText("meta_title", e.target.value)}
                          placeholder="Judul untuk SEO"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optimal: 50-60 karakter</p>
                      </div>
                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Meta Author</label>
                        <input
                          type="text"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base"
                          value={settings.meta_author || ""}
                          onChange={(e) => saveText("meta_author", e.target.value)}
                          placeholder="Nama author website"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Meta Description</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base"
                        value={settings.meta_description || ""}
                        onChange={(e) => saveText("meta_description", e.target.value)}
                        placeholder="Deskripsi untuk hasil pencarian"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optimal: 150-160 karakter</p>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Meta Keywords</label>
                      <input
                        type="text"
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm md:text-base"
                        value={settings.meta_keywords || ""}
                        onChange={(e) => saveText("meta_keywords", e.target.value)}
                        placeholder="Keyword dipisahkan koma"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contoh: website, company, services</p>
                    </div>

                    {/* Meta Image Upload */}
                    <div>
                      <label className="block mb-2 font-medium text-gray-700 text-sm md:text-base">Gambar Meta (SEO Preview)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-green-400 transition-colors">
                        <label className="cursor-pointer block">
                          <Image className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2 md:mb-3" />
                          <div className="font-medium text-gray-700 mb-1 md:mb-2 text-sm md:text-base">Upload Gambar Meta</div>
                          <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">1200x630px (rasio 1.91:1)</p>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, "meta_image")}
                            disabled={loading}
                          />
                          <div className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg inline-block">
                            Pilih File Gambar
                          </div>
                        </label>
                        {settings.meta_image && (
                          <div className="mt-3 md:mt-4">
                            <div className="relative inline-block">
                              <img
                                src={settings.meta_image}
                                className="w-32 h-16 md:w-48 md:h-24 object-cover rounded-lg border shadow-sm"
                                alt="Meta SEO Preview"
                              />
                              <button
                                onClick={() => handleDeleteImage("meta_image")}
                                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <Trash2 size={12} className="md:w-3 md:h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Gambar ini akan muncul saat website dibagikan di media sosial
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* E. Log Aktivitas */}
              {activeSection === "activity" && (
                <section className="animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Log Aktivitas</h2>
                  </div>

                  <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <div>
                      <p className="text-gray-600 text-sm md:text-base">
                        Total: <strong>{logs.length}</strong> aktivitas tercatat
                      </p>
                    </div>
                    <button
                      onClick={clearLogs}
                      className="bg-red-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                      Hapus Semua Log
                    </button>
                  </div>

                  {/* Mobile View */}
                  {isMobile ? (
                    <div className="space-y-3">
                      {logs.length ? (
                        logs.map((log) => (
                          <MobileLogItem key={log.id} log={log} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>Belum ada aktivitas yang tercatat</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Desktop/Tablet View */
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Tanggal</th>
                              <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Aktor</th>
                              <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Aksi</th>
                              <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Detail</th>
                              <th className="text-left p-3 md:p-4 font-semibold text-gray-700">Tabel</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {logs.length ? (
                              logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-3 md:p-4 text-gray-600 text-xs md:text-sm">
                                    {new Date(log.created_at).toLocaleString("id-ID")}
                                  </td>
                                  <td className="p-3 md:p-4">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                      {log.actor}
                                    </span>
                                  </td>
                                  <td className="p-3 md:p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                                      log.action.includes('upload') ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="p-3 md:p-4 text-gray-700 text-sm">{log.details}</td>
                                  <td className="p-3 md:p-4 text-gray-500 text-xs md:text-sm">{log.target_table}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-6 md:p-8 text-center text-gray-500">
                                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                  <p>Belum ada aktivitas yang tercatat</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </AdminLayout>
  );
}