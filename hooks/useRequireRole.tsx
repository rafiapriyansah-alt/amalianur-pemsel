// ✅ hooks/useRequireRole.ts – versi cepat & stabil
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export function useRequireRole(allowedRoles: string[]) {
  const router = useRouter();
  const supabase = getSupabase();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuthOnce() {
      try {
        // ✅ Ambil session
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        // ✅ Ambil role user dari DB (satu kali saja)
        const { data: user, error } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .single();

        if (!mounted) return;

        if (error || !user) {
          router.replace("/admin/login");
          return;
        }

        // ✅ Permission check
        if (!allowedRoles.includes(user.role)) {
          router.replace("/admin/unauthorized");
          return;
        }

        // ✅ Lulus auth
        setLoading(false);
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/admin/login");
      }
    }

    // ✅ Jalankan hanya sekali saat mount
    checkAuthOnce();

    // ✅ Listener logout-saja (ringan)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        router.replace("/admin/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ kosong → tidak dipanggil ulang

  return { loading };
}
