import "@/styles/globals.css";
import Head from "next/head";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const supabase = getSupabase();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("settings").select("*").single();
      setSettings(data ?? null);
    };
    load();

    // Realtime listener
    const settingsSub = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "settings" }, 
        async () => {
          const { data } = await supabase.from("settings").select("*").single();
          setSettings(data ?? null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsSub);
    };
  }, [supabase]);

  return (
    <>
      <Head>
        <title>{settings?.meta_title || "Yayasan Amalianur"}</title>
        <meta
          name="description"
          content={settings?.meta_description || "Yayasan Amalianur – Lembaga pendidikan Islam modern dan berakhlak mulia."}
        />
        <meta name="keywords" content={settings?.meta_keywords || "Yayasan Amalianur, Pendidikan, Islam"} />
        <meta name="author" content={settings?.meta_author || "Yayasan Amalianur"} />
        {settings?.meta_image && <meta property="og:image" content={settings.meta_image} />}
        <link rel="icon" href={settings?.favicon_url || "/favicon.ico"} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;