// hooks/useRequireRole.tsx
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export function useRequireRole(allowedRoles: string[]) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        // 1. Cek session yang aktif
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          console.log("❌ No session found, redirecting to login");
          router.push("/admin/login");
          return;
        }

        // 2. Cek user data dari database
        const { data: user, error } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .single();

        if (!mounted) return;

        if (error || !user) {
          console.log("❌ User not found in database");
          router.push("/admin/login");
          return;
        }

        // 3. Cek role permission
        if (!allowedRoles.includes(user.role)) {
          console.log(`❌ Role ${user.role} not allowed`);
          router.push("/admin/unauthorized");
          return;
        }

        // 4. Auth berhasil
        console.log("✅ Auth successful, role:", user.role);
        setLoading(false);
        
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          router.push("/admin/login");
        }
      }
    }

    checkAuth();

    // 5. Listen untuk auth state changes (tab/window lain)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_OUT') {
          router.push("/admin/login");
        } else if (event === 'SIGNED_IN' && session) {
          // Re-validate role ketika sign in di tab lain
          await checkAuth();
        } else if (event === 'TOKEN_REFRESHED') {
          // Session diperbarui, continue loading
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, allowedRoles, supabase]);

  return { loading };
}