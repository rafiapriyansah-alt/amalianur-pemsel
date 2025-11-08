"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiX, HiChevronDown, HiChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "../../lib/supabaseClient";

// Custom Hamburger Icon yang lebih keren
const CustomMenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.div
    className="relative w-6 h-6 flex flex-col justify-between cursor-pointer"
    animate={isOpen ? "open" : "closed"}
    initial={false}
  >
    <motion.span
      className="w-full h-0.5 bg-green-700 rounded-full block origin-center"
      variants={{
        closed: { rotate: 0, y: 0 },
        open: { rotate: 45, y: 8 }
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
    <motion.span
      className="w-full h-0.5 bg-green-700 rounded-full block"
      variants={{
        closed: { opacity: 1 },
        open: { opacity: 0 }
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    />
    <motion.span
      className="w-full h-0.5 bg-green-700 rounded-full block origin-center"
      variants={{
        closed: { rotate: 0, y: 0 },
        open: { rotate: -45, y: -8 }
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </motion.div>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("Yayasan Amalianur");
  const [educationOpen, setEducationOpen] = useState(false);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    // Set initial state
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Ambil data logo dari tabel settings Supabase
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100" 
          : "bg-white/95 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {logo ? (
            <motion.img
              src={logo}
              alt="Logo Yayasan"
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">YA</span>
            </div>
          )}
          <div>
            <div className="font-bold text-green-800 text-sm md:text-base leading-tight">
              {siteName}
            </div>
            <div className="text-xs text-gray-500 leading-tight">Pematang Seleng</div>
          </div>
        </motion.div>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-gray-700">
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {item.dropdown ? (
                // Dropdown untuk Pendidikan
                <div 
                  className="relative"
                  onMouseEnter={() => setEducationOpen(true)}
                  onMouseLeave={() => setEducationOpen(false)}
                >
                  <button className="flex items-center gap-1 px-2 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50">
                    {item.name}
                    <HiChevronDown className={`transition-transform duration-300 ${educationOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <span className="absolute left-2 bottom-1 w-[calc(100%-1rem)] h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {educationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-green-100 overflow-hidden z-50"
                      >
                        {item.dropdown.map((dropdownItem, index) => (
                          <Link
                            key={index}
                            href={dropdownItem.href}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 border-b border-green-50 last:border-b-0 hover:pl-6"
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
                  className="px-2 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50 relative block"
                >
                  {item.name}
                  <span className="absolute left-2 bottom-1 w-[calc(100%-1rem)] h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                </Link>
              )}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Link
              href="/pendaftaran"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Daftar
            </Link>
          </motion.div>
        </nav>

        {/* TOGGLE MOBILE dengan Custom Icon */}
        <motion.button 
          className="md:hidden p-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CustomMenuIcon isOpen={open} />
        </motion.button>
      </div>

      {/* SIDEBAR MOBILE dengan Enhanced Animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            {/* Backdrop dengan blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="absolute right-0 top-0 w-80 h-full bg-gradient-to-b from-white to-green-50/95 backdrop-blur-md shadow-2xl p-6 flex flex-col border-l border-green-200/50"
            >
              {/* Header Sidebar */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-green-200/50">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo Yayasan"
                      className="w-10 h-10 rounded-lg object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm flex items-center justify-center">
                      <span className="text-white font-bold text-xs">YA</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">{siteName}</h2>
                    <p className="text-xs text-gray-500">Menu Navigasi</p>
                  </div>
                </div>
                <motion.button 
                  onClick={() => setOpen(false)} 
                  className="text-green-700 hover:text-green-800 transition-colors p-2 hover:bg-green-100 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <HiX size={24} />
                </motion.button>
              </div>

              {/* Navigation Items */}
              <motion.nav
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
                }}
                className="flex flex-col flex-1 overflow-y-auto"
              >
                {menuItems.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: 40 },
                      show: { opacity: 1, x: 0 },
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="border-b border-green-100/50 last:border-b-0"
                  >
                    {item.dropdown ? (
                      // Dropdown untuk Pendidikan di mobile
                      <div className="py-3">
                        <motion.button
                          onClick={() => setMobileEducationOpen(!mobileEducationOpen)}
                          className="flex items-center justify-between w-full text-gray-800 text-base font-medium hover:text-green-600 transition-colors duration-200 py-2"
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{item.name}</span>
                          <motion.div
                            animate={{ rotate: mobileEducationOpen ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <HiChevronRight className="text-green-600" />
                          </motion.div>
                        </motion.button>
                        
                        {/* Submenu Pendidikan */}
                        <AnimatePresence>
                          {mobileEducationOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pt-1 space-y-1">
                                {item.dropdown.map((dropdownItem, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Link
                                      href={dropdownItem.href}
                                      onClick={() => setOpen(false)}
                                      className="block py-2.5 text-gray-600 text-sm hover:text-green-600 transition-colors duration-200 border-l-2 border-green-200 pl-3 hover:border-green-400 hover:bg-green-50/50 rounded-r-lg"
                                    >
                                      {dropdownItem.name}
                                    </Link>
                                  </motion.div>
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
                        className="block py-3.5 text-gray-800 text-base font-medium hover:text-green-600 transition-colors duration-200 hover:bg-green-50/50 rounded-lg px-2"
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="pt-6 mt-auto"
                >
                  <Link
                    href="/pendaftaran"
                    onClick={() => setOpen(false)}
                    className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
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