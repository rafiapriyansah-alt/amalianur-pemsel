"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiOutlineMenu, HiX, HiChevronDown, HiChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "../../lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("Yayasan Amalianur");
  const [educationOpen, setEducationOpen] = useState(false);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Ambil data logo dari tabel settings Supabase
  useEffect(() => {
    const supabase = getSupabase();

    const load = async () => {
      const { data } = await supabase.from("settings").select("*").single();
      if (data) {
        setLogo(data.logo_url || null);
        setSiteName(data.site_name || "Yayasan Amalianur");
      }
    };
    load();

    // 🔹 Realtime update
    const sub = supabase
      .channel("settings-navbar")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, async () => {
        const { data } = await supabase.from("settings").select("*").single();
        if (data) {
          setLogo(data.logo_url || null);
          setSiteName(data.site_name || "Yayasan Amalianur");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Tentang", href: "/about" },
    { 
      name: "Pendidikan", 
      href: "#",
      dropdown: [
        { name: "KB", href: "/kb" },
        { name: "TK", href: "/tk" },
        { name: "MTS", href: "/mts" }
      ]
    },
    { name: "Program", href: "/programs" },
    { name: "Galeri", href: "/galeri" },
    { name: "Berita", href: "/news" },
    { name: "Testimoni", href: "/testimonials" },
    { name: "Kontak", href: "/contact" },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt="Logo Yayasan"
              className="w-12 h-12 rounded-lg object-cover shadow-sm"
            />
          ) : (
            <div className="">
              
            </div>
          )}
          <div>
            <div className="font-bold text-green-800">{siteName}</div>
            <div className="text-xs text-gray-500">Pematang Seleng</div>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              {item.dropdown ? (
                // Dropdown untuk Pendidikan
                <div 
                  className="relative"
                  onMouseEnter={() => setEducationOpen(true)}
                  onMouseLeave={() => setEducationOpen(false)}
                >
                  <button className="flex items-center gap-1 px-2 py-1 transition-all duration-300 group-hover:text-green-600">
                    {item.name}
                    <HiChevronDown className={`transition-transform duration-300 ${educationOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-green-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {educationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden"
                      >
                        {item.dropdown.map((dropdownItem, index) => (
                          <Link
                            key={index}
                            href={dropdownItem.href}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 border-b border-green-50 last:border-b-0"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Menu biasa
                <Link
                  href={item.href}
                  className="px-2 py-1 transition-all duration-300 group-hover:text-green-600"
                >
                  {item.name}
                </Link>
              )}
            </motion.div>
          ))}
          <Link
            href="/pendaftaran"
            className="bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 transition-colors duration-300"
          >
            Daftar
          </Link>
        </nav>

        {/* TOGGLE MOBILE */}
        <button className="md:hidden p-2 text-green-700" onClick={() => setOpen(true)}>
          <HiOutlineMenu size={24} />
        </button>
      </div>

      {/* SIDEBAR MOBILE */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="absolute right-0 top-0 w-72 h-full bg-gradient-to-b from-white to-green-50 shadow-2xl p-6 flex flex-col border-l border-green-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-green-700">Menu</h2>
                <button onClick={() => setOpen(false)} className="text-green-700 hover:text-green-800 transition-colors">
                  <HiX size={26} />
                </button>
              </div>

              <motion.nav
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                className="flex flex-col"
              >
                {menuItems.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: 40 },
                      show: { opacity: 1, x: 0 },
                    }}
                    className="border-b border-green-100"
                  >
                    {item.dropdown ? (
                      // Dropdown untuk Pendidikan di mobile
                      <div className="py-3">
                        <button
                          onClick={() => setMobileEducationOpen(!mobileEducationOpen)}
                          className="flex items-center justify-between w-full text-gray-800 text-lg font-medium hover:text-green-600 transition-colors"
                        >
                          <span>{item.name}</span>
                          <HiChevronRight 
                            className={`transition-transform duration-300 ${mobileEducationOpen ? 'rotate-90' : ''}`} 
                          />
                        </button>
                        
                        {/* Submenu Pendidikan */}
                        <AnimatePresence>
                          {mobileEducationOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pt-2 space-y-2">
                                {item.dropdown.map((dropdownItem, index) => (
                                  <Link
                                    key={index}
                                    href={dropdownItem.href}
                                    onClick={() => setOpen(false)}
                                    className="block py-2 text-gray-600 text-base hover:text-green-600 transition-colors border-l-2 border-green-200 pl-3 hover:border-green-400"
                                  >
                                    {dropdownItem.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      // Menu biasa di mobile
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block py-3 text-gray-800 text-lg font-medium hover:text-green-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4"
                >
                  <Link
                    href="/pendaftaran"
                    onClick={() => setOpen(false)}
                    className="block text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-300"
                  >
                    Daftar Sekarang
                  </Link>
                </motion.div>
              </motion.nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}