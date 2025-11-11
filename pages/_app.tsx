import "@/styles/globals.css";
import Head from "next/head";
import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import type { AppProps } from "next/app";

// ✅ Interface untuk type safety
interface Settings {
  id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_author?: string;
  meta_image?: string;
  favicon_url?: string;
  [key: string]: any;
}

// ✅ Context untuk share settings
export const SettingsContext = createContext<Settings | null>(null);

// ✅ Cache validation time (5 menit)
const CACHE_DURATION = 5 * 60 * 1000;

function MyApp({ Component, pageProps }: AppProps) {
  const supabase = getSupabase();
  const [settings, setSettings] = useState<Settings | null>(null);

  // ✅ Load settings dengan cache validation
  const loadSettings = useCallback(async () => {
    try {
      const cached = localStorage.getItem("settings");
      const cacheTime = localStorage.getItem("settings_cache_time");
      
      // Jika cache masih valid (< 5 menit), gunakan cache
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
        setSettings(JSON.parse(cached));
        return;
      }

      // Fetch data baru
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        localStorage.setItem("settings", JSON.stringify(data));
        localStorage.setItem("settings_cache_time", Date.now().toString());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback ke cache jika ada, meski expired
      const cached = localStorage.getItem("settings");
      if (cached) {
        setSettings(JSON.parse(cached));
      }
    }
  }, [supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ✅ Real-time updates untuk settings (opsional)
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
        },
        (payload) => {
          // Update cache dan state ketika settings berubah
          const newSettings = payload.new;
          setSettings(newSettings);
          localStorage.setItem("settings", JSON.stringify(newSettings));
          localStorage.setItem("settings_cache_time", Date.now().toString());
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  // ✅ Preload critical resources
  useEffect(() => {
    if (settings?.favicon_url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = settings.favicon_url;
      link.as = 'image';
      document.head.appendChild(link);
    }
  }, [settings?.favicon_url]);

  return (
    <SettingsContext.Provider value={settings}>
      <Head>
        {/* ✅ Character Set & Viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* ✅ SEO */}
        <title>{settings?.meta_title || "Yayasan Amalianur - Pendidikan Islami Terpadu"}</title>
        <meta
          name="description"
          content={settings?.meta_description || "Yayasan Amalianur menyediakan pendidikan Islami terpadu dari KB, TK, hingga MTs dengan kurikulum berkualitas dan pembinaan akhlak mulia."}
        />
        <meta
          name="keywords"
          content={settings?.meta_keywords || "yayasan amalianur, pendidikan islam, sekolah islam, KB, TK, MTs, pendidikan terpadu"}
        />
        <meta name="author" content={settings?.meta_author || "Yayasan Amalianur"} />
        <meta name="robots" content="index, follow" />
        
        {/* ✅ Social Media Preview */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={settings?.meta_title || "Yayasan Amalianur - Pendidikan Islami Terpadu"} />
        <meta property="og:description" content={settings?.meta_description || "Yayasan Amalianur menyediakan pendidikan Islami terpadu dari KB, TK, hingga MTs."} />
        <meta property="og:site_name" content="Yayasan Amalianur" />
        
        {settings?.meta_image ? (
          <>
            <meta property="og:image" content={settings.meta_image} />
            <meta name="twitter:image" content={settings.meta_image} />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        ) : (
          <>
            <meta property="og:image" content="/images/og-default.jpg" />
            <meta name="twitter:image" content="/images/og-default.jpg" />
          </>
        )}

        {/* ✅ Favicon dengan fallback dan preconnect */}
        <link rel="preconnect" href="https://your-supabase-domain.com" />
        
        {settings?.favicon_url ? (
          <>
            <link rel="preload" href={settings.favicon_url} as="image" />
            <link rel="icon" type="image/x-icon" href={settings.favicon_url} />
            <link rel="shortcut icon" href={settings.favicon_url} />
            <link rel="apple-touch-icon" href={settings.favicon_url} />
          </>
        ) : (
          <>
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          </>
        )}

        {/* ✅ Theme Color */}
        <meta name="theme-color" content="#16a34a" />
        
        {/* ✅ Preload critical fonts jika ada */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      {/* ✅ Component dengan error boundary (recommended tambahkan ErrorBoundary component) */}
      <Component {...pageProps} />
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default MyApp;