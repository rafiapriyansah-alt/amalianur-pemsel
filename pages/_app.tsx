import "@/styles/globals.css";
import Head from "next/head";
import { useEffect, useState, createContext, useContext } from "react";
import { getSupabase } from "../lib/supabaseClient";
import type { AppProps } from "next/app";

// ✅ Context untuk share settings ke semua halaman tanpa fetch ulang
export const SettingsContext = createContext<any>(null);

function MyApp({ Component, pageProps }: AppProps) {
  const supabase = getSupabase();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const cachedSettings = localStorage.getItem("settings");
    if (cachedSettings) {
      setSettings(JSON.parse(cachedSettings));
    }

    const load = async () => {
      const { data } = await supabase.from("settings").select("*").single();
      if (data) {
        setSettings(data);
        localStorage.setItem("settings", JSON.stringify(data));
      }
    };

    if (!cachedSettings) load();
  }, [supabase]);

  return (
    <SettingsContext.Provider value={settings}>
      <Head>
        {/* ✅ SEO */}
        <title>{settings?.meta_title || "Yayasan Amalianur"}</title>
        <meta
          name="description"
          content={settings?.meta_description || "Yayasan Amalianur"}
        />
        <meta
          name="keywords"
          content={settings?.meta_keywords || "Yayasan Amalianur"}
        />
        <meta name="author" content={settings?.meta_author || "Admin"} />

        {/* ✅ Social Media Preview */}
        {settings?.meta_image && (
          <>
            <meta property="og:image" content={settings.meta_image} />
            <meta name="twitter:image" content={settings.meta_image} />
            <meta name="twitter:card" content="summary_large_image" />
          </>
        )}

        {/* ✅ Universal Favicon Support */}
        {settings?.favicon_url ? (
          <>
            <link rel="icon" type="image/png" sizes="32x32" href={settings.favicon_url} />
            <link rel="icon" type="image/png" sizes="16x16" href={settings.favicon_url} />
            <link rel="apple-touch-icon" sizes="180x180" href={settings.favicon_url} />
            <link rel="shortcut icon" href={settings.favicon_url} />
          </>
        ) : (
          <link rel="icon" href="/favicon.ico" />
        )}
      </Head>

      <Component {...pageProps} />
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export default MyApp;
