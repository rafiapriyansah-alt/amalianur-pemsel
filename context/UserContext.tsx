// context/UserContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabaseClient";

type Ctx = {
  user: User | null;
  role: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const UserContext = createContext<Ctx>({ user: null, role: null, loading: true, refresh: async () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  async function load() {
    setLoading(true);
    try {
      if (!supabase) {
        setUser(null); setRole(null); setLoading(false); return;
      }
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser?.email) {
        const { data: r } = await supabase.from("users").select("role").eq("email", currentUser.email).single();
        setRole(r?.role ?? null);
      } else {
        setRole(null);
      }
    } catch (e) {
      console.error(e);
      setUser(null); setRole(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const sub = supabase.auth.onAuthStateChange((_event, _session) => {
      load();
    });
    return () => sub.data?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <UserContext.Provider value={{ user, role, loading, refresh: load }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
