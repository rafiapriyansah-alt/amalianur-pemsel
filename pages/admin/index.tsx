"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { useRequireRole } from "../../hooks/useRequireRole";

export default function AdminDashboard() {
  useRequireRole(["admin", "super_admin"]);
  const supabase = getSupabase();

  const [stats, setStats] = useState({
    posts: 0,
    programs: 0,
    testimonials: 0,
    gallery: 0,
    schools: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!supabase) return;

      const queries = {
        posts: supabase.from("posts").select("*", { count: "exact", head: true }),
        programs: supabase.from("programs").select("*", { count: "exact", head: true }),
        testimonials: supabase.from("testimonials").select("*", { count: "exact", head: true }),
        gallery: supabase.from("gallery").select("*", { count: "exact", head: true }),
        schools: supabase.from("schools").select("*", { count: "exact", head: true }),
      };

      // ✅ Jalankan semua query paralel → super cepat
      const [
        postsRes, 
        programsRes, 
        testimonialsRes, 
        galleryRes, 
        schoolsRes
      ] = await Promise.all([
        queries.posts,
        queries.programs,
        queries.testimonials,
        queries.gallery,
        queries.schools
      ]);

      setStats({
        posts: postsRes.count ?? 0,
        programs: programsRes.count ?? 0,
        testimonials: testimonialsRes.count ?? 0,
        gallery: galleryRes.count ?? 0,
        schools: schoolsRes.count ?? 0,
      });

      setLoading(false);
    }

    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Dashboard Utama</h2>

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div whileHover={{ scale: 1.05 }} className="p-4 bg-green-50 rounded-xl shadow text-center">
                <p className="text-gray-500 text-sm">Berita</p>
                <h2 className="text-2xl font-bold text-green-700">{stats.posts}</h2>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-4 bg-green-50 rounded-xl shadow text-center">
                <p className="text-gray-500 text-sm">Program</p>
                <h2 className="text-2xl font-bold text-green-700">{stats.programs}</h2>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-4 bg-green-50 rounded-xl shadow text-center">
                <p className="text-gray-500 text-sm">Testimoni</p>
                <h2 className="text-2xl font-bold text-green-700">{stats.testimonials}</h2>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="p-4 bg-green-50 rounded-xl shadow text-center">
                <p className="text-gray-500 text-sm">Galeri</p>
                <h2 className="text-2xl font-bold text-green-700">{stats.gallery}</h2>
              </motion.div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Preview Sekolah</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div whileHover={{ scale: 1.03 }} className="bg-white border rounded-xl p-4 shadow-sm">
                  <h4 className="font-semibold">TK Amalianur</h4>
                  <p className="text-gray-500 text-sm">Jumlah siswa, guru, kegiatan, dsb.</p>
                  <a href="/tk" className="text-green-700 text-sm hover:underline mt-2 inline-block">Lihat di website</a>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="bg-white border rounded-xl p-4 shadow-sm">
                  <h4 className="font-semibold">MTS Amalianur</h4>
                  <p className="text-gray-500 text-sm">Jumlah siswa, guru, kegiatan, dsb.</p>
                  <a href="/mts" className="text-green-700 text-sm hover:underline mt-2 inline-block">Lihat di website</a>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
