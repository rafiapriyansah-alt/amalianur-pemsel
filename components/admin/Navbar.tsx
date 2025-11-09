"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
  
  const educationTimeoutRef = useRef<NodeJS.Timeout>();
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  const handleEducationMouseEnter = () => {
    if (educationTimeoutRef.current) {
      clearTimeout(educationTimeoutRef.current);
    }
    setEducationOpen(true);
  };

  const handleEducationMouseLeave = () => {
    educationTimeoutRef.current = setTimeout(() => {
      setEducationOpen(false);
    }, 200);
  };

  // Menu items yang lebih ringkas untuk tablet
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
    { name: "Kontak", href: "/contact" },
  ];

  const menuIconVariants = {
    open: { rotate: 90, scale: 1.1 },
    closed: { rotate: 0, scale: 1 }
  };

  const menuBarVariants = {
    open: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: { 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <header
      ref={navbarRef}
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* LOGO - Diperkecil untuk tablet */}
        
<div className="flex items-center gap-3 flex-shrink-0">
  {logo ? (
    <motion.img
      src={logo}
      alt="Logo Yayasan"
      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-sm"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    />
  ) : (
    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-sm flex items-center justify-center">
      <span className="text-white font-bold text-xs">YA</span>
    </div>
  )}
  <div>
    <div className="font-bold text-green-800 text-sm md:text-lg leading-tight">{siteName}</div>
    <div className="text-xs text-gray-500 leading-tight">Pematang Seleng</div>
  </div>
</div>

        {/* DESKTOP & TABLET MENU - Dioptimalkan untuk iPad */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-gray-700">
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
                  onMouseEnter={handleEducationMouseEnter}
                  onMouseLeave={handleEducationMouseLeave}
                >
                  <button className="flex items-center gap-1 px-2 xl:px-3 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50 whitespace-nowrap">
                    {item.name}
                    <motion.div
                      animate={{ rotate: educationOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <HiChevronDown className="text-sm" />
                    </motion.div>
                  </button>
                  <span className="absolute left-2 xl:left-3 bottom-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-[calc(100%-16px)] xl:group-hover:w-[calc(100%-24px)] rounded-full"></span>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {educationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden z-50"
                        onMouseEnter={handleEducationMouseEnter}
                        onMouseLeave={handleEducationMouseLeave}
                      >
                        {item.dropdown.map((dropdownItem, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Link
                              href={dropdownItem.href}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 border-b border-green-50 last:border-b-0"
                            >
                              {dropdownItem.name}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Menu biasa
                <Link
                  href={item.href}
                  className="px-2 xl:px-3 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50 block relative whitespace-nowrap"
                >
                  {item.name}
                  <span className="absolute left-2 xl:left-3 bottom-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-[calc(100%-16px)] xl:group-hover:w-[calc(100%-24px)] rounded-full"></span>
                </Link>
              )}
            </motion.div>
          ))}
          
          {/* CTA Button - Hanya Daftar saja */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/pendaftaran"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 xl:px-4 py-2.5 rounded-lg shadow hover:shadow-lg transition-all duration-300 font-medium text-sm whitespace-nowrap"
            >
              Daftar
            </Link>
          </motion.div>
        </nav>

        {/* TABLET MENU (768px - 1024px) - Menu yang lebih ringkas */}
        <nav className="hidden md:flex lg:hidden items-center gap-3 text-sm font-medium text-gray-700">
          {/* Menu penting saja untuk tablet */}
          {menuItems.slice(0, 4).map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              {item.dropdown ? (
                // Dropdown untuk Pendidikan di tablet
                <div 
                  className="relative"
                  onMouseEnter={handleEducationMouseEnter}
                  onMouseLeave={handleEducationMouseLeave}
                >
                  <button className="flex items-center gap-1 px-2 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50 whitespace-nowrap text-xs">
                    {item.name}
                    <HiChevronDown className="text-xs" />
                  </button>
                  
                  <AnimatePresence>
                    {educationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden z-50"
                        onMouseEnter={handleEducationMouseEnter}
                        onMouseLeave={handleEducationMouseLeave}
                      >
                        {item.dropdown.map((dropdownItem, index) => (
                          <Link
                            key={index}
                            href={dropdownItem.href}
                            className="block px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors border-b border-green-50 last:border-b-0"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="px-2 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50 block relative whitespace-nowrap text-xs"
                >
                  {item.name}
                </Link>
              )}
            </motion.div>
          ))}
          
          {/* More dropdown untuk menu lainnya */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-2 transition-all duration-300 group-hover:text-green-600 rounded-lg group-hover:bg-green-50 whitespace-nowrap text-xs">
              Lainnya
              <HiChevronDown className="text-xs" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-green-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {menuItems.slice(4).map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="block px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors border-b border-green-50 last:border-b-0"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button untuk tablet - Hanya Daftar saja */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/pendaftaran"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300 font-medium text-xs whitespace-nowrap"
            >
              Daftar
            </Link>
          </motion.div>
        </nav>

        {/* MOBILE MENU TOGGLE - Tampil di tablet kecil dan mobile */}
        <motion.button 
          className="md:hidden p-2 text-green-700 relative z-60"
          onClick={() => setOpen(!open)}
          variants={menuIconVariants}
          animate={open ? "open" : "closed"}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-6 h-6 relative">
            <motion.div
              className="absolute top-1 left-0 w-6 h-0.5 bg-green-700 rounded-full"
              variants={menuBarVariants}
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute top-3 left-0 w-6 h-0.5 bg-green-700 rounded-full"
              variants={menuBarVariants}
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="absolute top-5 left-0 w-6 h-0.5 bg-green-700 rounded-full"
              variants={menuBarVariants}
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.button>
      </div>

      {/* SIDEBAR MOBILE - Dioptimalkan untuk tablet */}
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
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                mass: 0.8
              }}
              className="absolute right-0 top-0 w-80 md:w-96 h-full bg-gradient-to-b from-white to-green-50 shadow-2xl p-6 flex flex-col border-l border-green-100"
            >
              {/* Header Sidebar */}
              <motion.div 
                className="flex justify-between items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
  {logo ? (
    <img
      src={logo}
      alt="Logo Yayasan"
      className="w-10 h-10 rounded-lg object-cover shadow-sm"
    />
  ) : (
    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-sm flex items-center justify-center">
      <span className="text-white font-bold text-xs">YA</span>
    </div>
  )}
  <div>
    <div className="font-bold text-green-800 text-lg">{siteName}</div>
    <div className="text-xs text-gray-500">Pematang Seleng</div>
  </div>
</div>
                <motion.button 
                  onClick={() => setOpen(false)} 
                  className="text-green-700 hover:text-green-800 transition-colors p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <HiX size={24} />
                </motion.button>
              </motion.div>

              {/* Navigation Items */}
              <motion.nav
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: { 
                    opacity: 1, 
                    transition: { 
                      staggerChildren: 0.07,
                      delayChildren: 0.1
                    } 
                  },
                }}
                className="flex-1 overflow-y-auto"
              >
                {menuItems.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      show: { 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 24
                        }
                      },
                    }}
                    className="border-b border-green-100/50"
                  >
                    {item.dropdown ? (
                      <div className="py-3">
                        <motion.button
                          onClick={() => setMobileEducationOpen(!mobileEducationOpen)}
                          className="flex items-center justify-between w-full text-gray-800 text-base font-medium hover:text-green-600 transition-colors py-2"
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{item.name}</span>
                          <motion.div
                            animate={{ rotate: mobileEducationOpen ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <HiChevronRight />
                          </motion.div>
                        </motion.button>
                        
                        <AnimatePresence>
                          {mobileEducationOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ 
                                duration: 0.4,
                                ease: "easeInOut"
                              }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pt-1 space-y-1">
                                {item.dropdown.map((dropdownItem, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                  >
                                    <Link
                                      href={dropdownItem.href}
                                      onClick={() => setOpen(false)}
                                      className="block py-2.5 text-gray-600 text-sm hover:text-green-600 transition-colors border-l-2 border-green-200 pl-3 hover:border-green-400 hover:bg-green-50/50 rounded-r-lg"
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
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block py-3.5 text-gray-800 text-base font-medium hover:text-green-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.nav>

              {/* CTA Button di sidebar - Hanya Daftar saja */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-6 border-t border-green-100/50"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/pendaftaran"
                    onClick={() => setOpen(false)}
                    className="block text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3.5 rounded-lg shadow-lg transition-all duration-300 font-medium"
                  >
                    Daftar Sekarang
                  </Link>
                </motion.div>
              </motion.div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}