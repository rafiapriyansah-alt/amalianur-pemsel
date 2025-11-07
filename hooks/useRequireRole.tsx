// hooks/useRequireRole.tsx
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export function useRequireRole(allowedRoles: string[]) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function check() {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/admin/login"); return; }
      const email = data.user.email;
      if (!email) { router.push("/admin/login"); return; }
      const { data: user } = await supabase.from("users").select("role").eq("email", email).single();
      const role = user?.role ?? "editor";
      if (!allowedRoles.includes(role)) {
        router.push("/admin/unauthorized");
        return;
      }
      setLoading(false);
    }
    check();
  }, []);
  return { loading };
}
