"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, Newspaper, List, Image, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔹 Tipe data lengkap agar tidak error di TypeScript
interface SettingsData {
  sidebar_logo?: string | null;
  logo_url?: string | null;
  site_name?: string | null;
}

/**
 * AdminSidebar props:
 * - open: boolean (mobile)
 * - onClose: () => void
 */
export default function AdminSidebar({
  open = false,
  onClose = () => {},
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const items = [
    { href: "/admin", label: "Dashboard", icon: <Home size={16} /> },
    { href: "/admin/programs", label: "Program", icon: <List size={16} /> },
    { href: "/admin/news", label: "Berita", icon: <Newspaper size={16} /> },
    { href: "/admin/galeri", label: "Galeri", icon: <Image size={16} /> },
    { href: "/admin/testimonials", label: "Testimoni", icon: <Image size={16} /> },
    { href: "/admin/users", label: "Users", icon: <Users size={16} /> },
    { href: "/admin/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const [settings, setSettings] = useState<SettingsData>({});

  useEffect(() => {
    // Ambil data settings dari Supabase
    (async () => {
      try {
        const client = require("../../lib/supabaseClient");
        const supabase =
          client.supabase ?? (client.getSupabase ? client.getSupabase() : null);
        if (!supabase) return;

        const { data, error } = await supabase
          .from("settings")
          .select("sidebar_logo, logo_url, site_name")
          .single();

        if (!error && data) setSettings(data as SettingsData);
      } catch (e) {
        console.warn("Sidebar: gagal mengambil settings", e);
      }
    })();
  }, []);

  const siteName = settings.site_name || "Yayasan Amalianur";
  const logoUrl = settings.sidebar_logo || settings.logo_url || null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm z-40">
        <div className="p-4 flex items-center gap-3 border-b">
          <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-lg">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                className="w-10 h-10 object-contain rounded"
              />
            ) : (
              <span>AN</span>
            )}
          </div>
          <div>
            <div className="font-semibold text-green-700">{siteName}</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </div>

        <nav className="p-4 overflow-auto flex-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition w-full"
            >
              <div className="opacity-90">{it.icon}</div>
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t text-sm text-gray-500">
          © {new Date().getFullYear()} {siteName}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween" }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="logo"
                      className="w-10 h-10 object-contain rounded"
                    />
                  ) : (
                    <span>AN</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-green-700">{siteName}</div>
                  <div className="text-xs text-gray-500">Admin Panel</div>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onClose}
                    className="py-3 px-2 rounded hover:bg-green-50 transition text-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="opacity-90">{it.icon}</div>
                      <span>{it.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto text-xs text-gray-400 pt-4 border-t">
                © {new Date().getFullYear()} {siteName}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
