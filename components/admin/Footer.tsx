"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Youtube,
  ChevronDown,
  School,
  Users,
  Building
} from "lucide-react";

interface SettingsData {
  site_name: string;
  tagline: string;
  logo_url?: string;
  footer_logo?: string;
  footer_text?: string;

  facebook_yayasan?: string;
  facebook_tk?: string;
  facebook_kb?: string;
  facebook_mts?: string;

  instagram_yayasan?: string;
  instagram_tk?: string;
  instagram_kb?: string;
  instagram_mts?: string;

  youtube_yayasan?: string;
  youtube_tk?: string;
  youtube_kb?: string;
  youtube_mts?: string;
}

interface ContactData {
  address?: string;
  phone?: string;
  email?: string;
  office_hours?: string;
}

export default function Footer() {
  const supabase = getSupabase();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: settingsData } = await supabase.from("settings").select("*").single();
      setSettings(settingsData);

      const { data: contactData } = await supabase.from("contact").select("*").single();
      setContact(contactData);
    };

    loadData();

    const settingsSub = supabase
      .channel("settings-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, 
        () => supabase.from("settings").select("*").single().then(({ data }) => setSettings(data))
      )
      .subscribe();

    const contactSub = supabase
      .channel("contact-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact" }, 
        () => supabase.from("contact").select("*").single().then(({ data }) => setContact(data))
      )
      .subscribe();

    return () => {
      settingsSub.unsubscribe();
      contactSub.unsubscribe();
    };
  }, []);

  // ✅ FIX: perbaikan framer-motion variants (ease harus array, bukan string)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      }
    }
  };

  const socialLinks = [
    { 
      icon: Facebook, 
      label: "Facebook",
      options: [
        { name: "Yayasan Amalianur", href: settings?.facebook_yayasan || "#", icon: Building, hasLink: !!settings?.facebook_yayasan?.trim() },
        { name: "TK Amalianur", href: settings?.facebook_tk || "#", icon: School, hasLink: !!settings?.facebook_tk?.trim() },
        { name: "KB Amalianur", href: settings?.facebook_kb || "#", icon: Users, hasLink: !!settings?.facebook_kb?.trim() },
        { name: "MTs Amalianur", href: settings?.facebook_mts || "#", icon: School, hasLink: !!settings?.facebook_mts?.trim() }
      ].filter(v => v.hasLink)
    },
    { 
      icon: Instagram, 
      label: "Instagram",
      options: [
        { name: "Yayasan Amalianur", href: settings?.instagram_yayasan || "#", icon: Building, hasLink: !!settings?.instagram_yayasan?.trim() },
        { name: "TK Amalianur", href: settings?.instagram_tk || "#", icon: School, hasLink: !!settings?.instagram_tk?.trim() },
        { name: "KB Amalianur", href: settings?.instagram_kb || "#", icon: Users, hasLink: !!settings?.instagram_kb?.trim() },
        { name: "MTs Amalianur", href: settings?.instagram_mts || "#", icon: School, hasLink: !!settings?.instagram_mts?.trim() }
      ].filter(v => v.hasLink)
    },
    { 
      icon: Youtube, 
      label: "YouTube",
      options: [
        { name: "Yayasan Amalianur", href: settings?.youtube_yayasan || "#", icon: Building, hasLink: !!settings?.youtube_yayasan?.trim() },
        { name: "TK Amalianur", href: settings?.youtube_tk || "#", icon: School, hasLink: !!settings?.youtube_tk?.trim() },
        { name: "KB Amalianur", href: settings?.youtube_kb || "#", icon: Users, hasLink: !!settings?.youtube_kb?.trim() },
        { name: "MTs Amalianur", href: settings?.youtube_mts || "#", icon: School, hasLink: !!settings?.youtube_mts?.trim() }
      ].filter(v => v.hasLink)
    }
  ];

  const quickLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/about" },
    { name: "TK Amalianur", href: "/tk" },
    { name: "MTs Amalianur", href: "/mts" },
    { name: "Kontak", href: "/contact" }
  ];

  const programLinks = [
    { name: "Program Pendidikan", href: "/programs" },
    { name: "Ekstrakurikuler", href: "/extracurricular" },
    { name: "Pendaftaran", href: "/admission" },
    { name: "Berita & Artikel", href: "/news" }
  ];

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <footer className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      <div className="container mx-auto px-6 pt-16 pb-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid lg:grid-cols-4 md:grid-cols-2 gap-10 items-start"
        >
          {/* ------------------------------------------------------------------------------------------------------ */}
          {/* ✅ Kolom 1 */}
          {/* ------------------------------------------------------------------------------------------------------ */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              {settings?.footer_logo && (
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div 
                    className="absolute inset-0"
                    style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.8)) drop-shadow(0 0 2px rgba(255,255,255,0.6))' }}
                  >
                    <img
                      src={settings.footer_logo}
                      alt="Logo Footer"
                      className="w-16 h-16 object-contain opacity-20"
                    />
                  </div>
                  <img
                    src={settings.footer_logo}
                    alt="Logo Footer"
                    className="w-16 h-16 object-contain rounded-xl bg-white bg-opacity-10 p-2 shadow-lg relative z-10 backdrop-blur-sm"
                  />
                </motion.div>
              )}
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {settings?.site_name || "Yayasan Amalianur"}
                </h3>
                <div className="w-12 h-1 bg-emerald-300 rounded-full"></div>
              </div>
            </div>

            <p className="text-green-100 leading-relaxed mb-6 text-sm">
              {settings?.tagline || 
              "Membangun Generasi Islami dan Berakhlak Mulia melalui pendidikan berkualitas."}
            </p>

            <div className="flex gap-2 relative">
              {socialLinks.map((social) => (
                <div key={social.label} className="relative">
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.1, 
                      y: -2,
                      backgroundColor: "rgba(255,255,255,0.15)"
                    }}
                    onClick={() => toggleDropdown(social.label)}
                    className="w-10 h-10 rounded-xl bg-white bg-opacity-10 flex items-center justify-center transition-all duration-300 hover:bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20"
                  >
                    <social.icon className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
                  </motion.button>

                  <AnimatePresence>
                    {activeDropdown === social.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 mb-2 w-48 bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-xl border border-white border-opacity-20 z-50 overflow-hidden"
                      >
                        <div className="p-2">
                          {social.options.length > 0 ? (
                            social.options.map((option) => (
                              <motion.a
                                key={option.name}
                                href={option.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ 
                                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                                  x: 5 
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-emerald-700 transition-all duration-200 group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                  <option.icon className="w-3 h-3 text-emerald-600" />
                                </div>
                                <span className="font-medium">{option.name}</span>
                              </motion.a>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                              Belum ada link yang diisi
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ------------------------------------------------------------------------------------------------------ */}
          {/* ✅ Kolom 2 */}
          {/* ------------------------------------------------------------------------------------------------------ */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
              Navigasi Cepat
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 5 }}>
                  <Link 
                    href={link.href}
                    className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group text-sm"
                  >
                    <div className="w-1 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ------------------------------------------------------------------------------------------------------ */}
          {/* ✅ Kolom 3 */}
          {/* ------------------------------------------------------------------------------------------------------ */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
              Program Kami
            </h4>
            <ul className="space-y-3">
              {programLinks.map((link) => (
                <motion.li key={link.name} whileHover={{ x: 5 }}>
                  <Link 
                    href={link.href}
                    className="text-green-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group text-sm"
                  >
                    <div className="w-1 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ------------------------------------------------------------------------------------------------------ */}
          {/* ✅ Kolom 4 */}
          {/* ------------------------------------------------------------------------------------------------------ */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
              Hubungi Kami
            </h4>
            
            <div className="space-y-4">

              <motion.div className="flex items-start gap-3 group" whileHover={{ x: 3 }}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors border border-emerald-400">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <p className="text-green-100 text-sm leading-relaxed">
                  {contact?.address || "Jl. Pendidikan No. 45, Cibinong, Bogor"}
                </p>
              </motion.div>

              <motion.div className="flex items-center gap-3 group" whileHover={{ x: 3 }}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors border border-emerald-400">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <a 
                  href={`tel:${contact?.phone || "+6281234567890"}`}
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  {contact?.phone || "+62 812 3456 7890"}
                </a>
              </motion.div>

              <motion.div className="flex items-center gap-3 group" whileHover={{ x: 3 }}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors border border-emerald-400">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <a 
                  href={`mailto:${contact?.email || "info@amalianur.or.id"}`}
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  {contact?.email || "info@amalianur.or.id"}
                </a>
              </motion.div>

              <motion.div className="flex items-start gap-3 group" whileHover={{ x: 3 }}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors border border-emerald-400">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <p className="text-green-100 text-sm">
                  {contact?.office_hours || "Senin - Jumat: 07:00 - 16:00 WIB"}
                </p>
              </motion.div>

            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* ------------------------------------------------------------------------------------------------------ */}
      {/* Bottom Footer */}
      {/* ------------------------------------------------------------------------------------------------------ */}

      <div className="border-t border-green-500 border-opacity-30 bg-white">
        <div className="container mx-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-center gap-3 text-center"
          >
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <span>© 2025</span>
              <span className="font-semibold text-green-700">
                {settings?.site_name || "Yayasan Amalianur"}
              </span>
              <span>All rights reserved</span>
            </div>
            
            <div className="text-gray-600 text-sm">
              {settings?.footer_text || "Mendidik Generasi, Membangun Peradaban"}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ------------------------------------------------------------------------------------------------------ */}
      {/* Floating Decorations */}
      {/* ------------------------------------------------------------------------------------------------------ */}

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        className="absolute bottom-10 left-10 w-4 h-4 bg-emerald-300 rounded-full opacity-20"
      />

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: [0.42, 0, 0.58, 1], delay: 1 }}
        className="absolute top-20 right-20 w-3 h-3 bg-white rounded-full opacity-20"
      />
    </footer>
  );
}
