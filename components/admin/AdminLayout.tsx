// ✅ components/admin/AdminLayout.tsx - FULL VERSION
import { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Image,
  Newspaper,
  BookOpen,
  Info,
  Heart,
  Mail,
  Home,
  Users,
  LogOut,
  Settings,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Lock,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "../../lib/supabaseClient";

interface AdminLayoutProps {
  children: ReactNode;
  user?: { name: string; role: string };
  onLogout?: () => void;
  title?: string;
}

export default function AdminLayout({
  children,
  user: propUser,
  onLogout,
  title,
}: AdminLayoutProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string }>({
    name: propUser?.name || "Admin Panel",
    role: propUser?.role || "super_admin",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("Yayasan Amalianur");

  const supabase = getSupabase();

  // 🧠 Ambil data user dari Supabase
  useEffect(() => {
    async function fetchUser() {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (!authUser?.email) return;

      const { data: dbUser } = await supabase
        .from("users")
        .select("name, role")
        .eq("email", authUser.email)
        .single();

      if (dbUser) {
        setUser({ name: dbUser.name, role: dbUser.role });
      } else {
        setUser({
          name: authUser.user_metadata?.name || "Admin",
          role: authUser.user_metadata?.role || "admin",
        });
      }
    }
    fetchUser();
  }, [supabase]);

  // 🧩 Ambil logo & nama situs dari tabel settings
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("sidebar_logo, logo_url, site_name")
          .single();

        if (!error && data) {
          setLogoUrl(data.sidebar_logo || data.logo_url || null);
          if (data.site_name) setSiteName(data.site_name);
        }
      } catch (err) {
        console.warn("Gagal memuat logo dari settings:", err);
      }
    })();
  }, [supabase]);

  // 🧩 Listener realtime (jika settings berubah)
  useEffect(() => {
    const channel = supabase
      .channel("settings-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        (payload) => {
          const newData = payload.new as any;
          if (newData) {
            setLogoUrl(newData.sidebar_logo || newData.logo_url || null);
            if (newData.site_name) setSiteName(newData.site_name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 🚪 Logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      supabase.auth.signOut().then(() => {
        window.location.href = "/admin/login";
      });
    }
  };

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Program", icon: BookOpen, path: "/admin/programs" },
    { name: "Home", icon: Home, path: "/admin/home" },
    { name: "Berita", icon: Newspaper, path: "/admin/news" },
    { name: "Galeri", icon: Image, path: "/admin/galeri" },
    { name: "Testimoni", icon: Users, path: "/admin/testimonials" },
  ];

  const secondaryMenu = [
    { name: "Tentang Kami", icon: Info, path: "/admin/about" },
    { name: "Pendaftaran", icon: Heart, path: "/admin/pendaftaran" },
    { name: "Kontak", icon: Mail, path: "/admin/contact" },
    { name: "User", icon: Users, path: "/admin/users" },
  ];

  // Fungsi untuk mendapatkan title halaman
  const getPageTitle = () => {
    if (title) return title;
    
    const path = router.pathname;
    if (path === "/admin") return "Dashboard";
    if (path === "/admin/home") return "Home Settings";
    if (path === "/admin/programs") return "Program";
    if (path === "/admin/news") return "Berita";
    if (path === "/admin/galeri") return "Galeri";
    if (path === "/admin/testimonials") return "Testimoni";
    if (path === "/admin/about") return "Tentang Kami";
    if (path === "/admin/pendaftaran") return "Pendaftaran";
    if (path === "/admin/contact") return "Kontak";
    if (path === "/admin/users") return "Manajemen User";
    if (path === "/admin/settings") return "Settings";
    if (path === "/admin/login-settings") return "Login Settings";
    if (path.includes("/admin/kb")) return "KB Amalianur";
    if (path.includes("/admin/tk")) return "TK Amalianur";
    if (path.includes("/admin/mts")) return "MTS Amalianur";
    
    return "Dashboard";
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <div
        className={`bg-white shadow-md w-64 p-4 flex flex-col fixed inset-y-0 left-0 transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-30`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
                  A
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg text-green-700">{siteName}</h2>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden p-2 hover:bg-green-100 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {/* Main Menu Items */}
          {menu.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setMenuOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  router.pathname === item.path
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-green-50 text-gray-700"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </div>
            </Link>
          ))}

          {/* Dropdown Pendidikan */}
          <div>
            <button
              onClick={() => setEduOpen(!eduOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-green-50 text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-3">
                <GraduationCap size={18} />
                Pendidikan
              </span>
              {eduOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {eduOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-8 mt-1 space-y-1 overflow-hidden"
                >
                  {["kb", "tk", "mts"].map((level) => (
                    <Link key={level} href={`/admin/${level}`} onClick={() => setMenuOpen(false)}>
                      <div
                        className={`block px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                          router.pathname === `/admin/${level}`
                            ? "bg-green-100 text-green-700 font-semibold"
                            : "hover:bg-green-50 text-gray-600"
                        }`}
                      >
                        {level.toUpperCase()}
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown Lainnya */}
          <div>
            <button
              onClick={() => setOtherOpen(!otherOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-green-50 text-gray-700 transition-colors"
            >
              <span className="flex items-center gap-3">
                <MoreHorizontal size={18} />
                Lainnya
              </span>
              {otherOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {otherOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-8 mt-1 space-y-1 overflow-hidden"
                >
                  <Link href="/admin/login-settings" onClick={() => setMenuOpen(false)}>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                        router.pathname === "/admin/login-settings"
                          ? "bg-green-100 text-green-700 font-semibold"
                          : "hover:bg-green-50 text-gray-600"
                      }`}
                    >
                      <Lock size={14} />
                      Login Settings
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secondary Menu Items */}
          {secondaryMenu.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setMenuOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  router.pathname === item.path
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "hover:bg-green-50 text-gray-700"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="border-t border-gray-200 pt-3 space-y-1">
          {/* User Info & Copyright */}
          <div className="px-3 py-2 text-xs text-gray-500">
            <div className="font-medium text-gray-700 truncate">{user.name}</div>
            <div className="capitalize text-gray-500">{user.role.replace("_", " ")}</div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-gray-400">
              © {new Date().getFullYear()} {siteName}
            </div>
          </div>

          {/* Settings & Logout */}
          <Link href="/admin/settings" onClick={() => setMenuOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                router.pathname === "/admin/settings"
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "hover:bg-green-50 text-gray-700"
              }`}
            >
              <Settings size={18} />
              Settings
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md w-full text-left hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm py-3 px-5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-green-700">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
            <div className="bg-green-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50">
          {children}
        </main>

        {/* Main Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-2 md:mb-0">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Admin Panel v1.0</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Powered by Amalianur</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}