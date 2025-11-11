import { useState, ReactNode, useEffect, useMemo } from "react";
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
  MoreHorizontal,
  FileText,
  Lock
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
}: AdminLayoutProps) {
  const router = useRouter();
  const currentPath = router.pathname; // ✅ caching agar tidak panggil ulang
  const supabase = getSupabase();

  const [menuOpen, setMenuOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string }>({
    name: propUser?.name || "Admin Panel",
    role: propUser?.role || "super_admin",
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>("Yayasan Amalianur");

  // ✅ OPTIMISASI: 1x fetch user + settings bersamaan
  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const [authRes, settingsRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("settings").select("sidebar_logo, logo_url, site_name").single(),
      ]);

      if (!active) return;

      // ✅ USER
      const authUser = authRes?.data?.user;
      if (authUser?.email) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("name, role")
          .eq("email", authUser.email)
          .single();

        if (dbUser) setUser({ name: dbUser.name, role: dbUser.role });
      }

      // ✅ SETTINGS
      const data = settingsRes.data;
      if (data) {
        setLogoUrl(data.sidebar_logo || data.logo_url || null);
        if (data.site_name) setSiteName(data.site_name);
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  // ✅ OPTIMISASI: realtime dengan kontrol re-render (debounce)
  useEffect(() => {
  const channel = supabase
    .channel("settings-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "settings" },
      (payload) => {
        const s = payload.new as any;
        setLogoUrl(s.sidebar_logo || s.logo_url || null);
        if (s.site_name) setSiteName(s.site_name);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel); // ✅ FIX
  };
}, []);


  const menu = useMemo(
    () => [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { name: "Program", icon: BookOpen, path: "/admin/programs" },
      { name: "Home", icon: Home, path: "/admin/home" },
      { name: "Berita", icon: Newspaper, path: "/admin/news" },
      { name: "Galeri", icon: Image, path: "/admin/galeri" },
      { name: "Testimoni", icon: Users, path: "/admin/testimonials" },
    ],
    []
  );

  const secondaryMenu = useMemo(
    () => [
      { name: "Tentang Kami", icon: Info, path: "/admin/about" },
      { name: "Pendaftaran", icon: Heart, path: "/admin/pendaftaran" },
      { name: "Kontak", icon: Mail, path: "/admin/contact" },
      { name: "User", icon: Users, path: "/admin/users" },
    ],
    []
  );

  const handleLogout = () => {
    if (onLogout) onLogout();
    else supabase.auth.signOut().then(() => (window.location.href = "/admin/login"));
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* SIDEBAR */}
      <div
        className={`bg-white shadow-md w-64 p-4 flex flex-col fixed inset-y-0 left-0 transition-transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-30`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold" />
              )}
            </div>

            <div>
              <h2 className="font-bold text-lg text-green-700">{siteName}</h2>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>

          <button onClick={() => setMenuOpen(false)} className="md:hidden p-2 hover:bg-green-100 rounded">
            ✕
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
                  currentPath === item.path ? "bg-green-100 text-green-700 font-semibold" : "hover:bg-green-50 text-gray-700"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </div>
            </Link>
          ))}

          {/* DROPDOWN PENDIDIKAN */}
          <div>
            <button
              onClick={() => setEduOpen(!eduOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-green-50 text-gray-700"
            >
              <span className="flex items-center gap-3">
                <GraduationCap size={18} />
                Pendidikan
              </span>
              {eduOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {eduOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="ml-8 mt-1 space-y-1">
                  {["kb", "tk", "mts"].map((level) => (
                    <Link key={level} href={`/admin/${level}`}>
                      <div
                        className={`block px-3 py-1.5 rounded-md text-sm cursor-pointer ${
                          currentPath === `/admin/${level}` ? "bg-green-100 text-green-700 font-semibold" : "hover:bg-green-50 text-gray-600"
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

          

          {/* SECONDARY MENU */}
          {secondaryMenu.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
                  currentPath === item.path ? "bg-green-100 text-green-700 font-semibold" : "hover:bg-green-50 text-gray-700"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        {/* MENU LAINNYA */}
          <div>
            <button
              onClick={() => setOtherOpen(!otherOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-green-50 text-gray-700"
            >
              <span className="flex items-center gap-3">
                <MoreHorizontal size={18} />
                Lainnya
              </span>
              {otherOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {otherOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="ml-8 mt-1 space-y-1">
                  <Link href="/admin/login-settings">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer ${
                        currentPath === "/admin/login-settings"
                          ? "bg-green-100 text-green-700 font-semibold"
                          : "hover:bg-green-50 text-gray-600"
                      }`}
                    >
                      <Lock size={14} />
                      Login Settings
                    </div>
                  </Link>

                  <Link href="/admin/footer">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer ${
                        currentPath === "/admin/footer"
                          ? "bg-green-100 text-green-700 font-semibold"
                          : "hover:bg-green-50 text-gray-600"
                      }`}
                    >
                      <FileText size={14} />
                      Footer
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* FOOTER SIDEBAR */}
        <div className="border-t pt-3 space-y-1">
          <Link href="/admin/settings">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
                currentPath === "/admin/settings" ? "bg-green-100 text-green-700 font-semibold" : "hover:bg-green-50 text-gray-700"
              }`}
            >
              <Settings size={18} />
              Settings
            </div>
          </Link>

          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-md w-full text-left hover:bg-red-50 text-red-600">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 md:ml-64">
        <header className="bg-white shadow-sm py-3 px-5 flex items-center justify-between sticky top-0 z-20">
          <button className="md:hidden p-2 bg-green-100 rounded-md" onClick={() => setMenuOpen(true)}>
            ☰
          </button>

          <h1 className="text-lg font-semibold text-green-700">
            {currentPath.replace("/admin/", "").toUpperCase() || "DASHBOARD"}
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
            </div>

            <div className="bg-green-600 text-white w-9 h-9 flex items-center justify-center rounded-full font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
