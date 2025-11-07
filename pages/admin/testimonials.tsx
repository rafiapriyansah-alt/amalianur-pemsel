"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { motion } from "framer-motion";
import { useRequireRole } from "../../hooks/useRequireRole";

export default function AdminTestimonials() {
  useRequireRole(["admin", "super_admin", "editor"]);
  const supabase = getSupabase();

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    setLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setTestimonials(data ?? []);
    setLoading(false);
  }

  async function save() {
    setLoading(true);
    try {
      let photoUrl: string | null = null;
      if (file) photoUrl = await uploadImageFile(file, "testimonials");

      if (editing) {
        await supabase
          .from("testimonials")
          .update({
            name,
            role,
            message,
            photo: photoUrl ?? editing.photo,
          })
          .eq("id", editing.id);
      } else {
        await supabase.from("testimonials").insert([
          {
            name,
            role,
            message,
            photo: photoUrl,
          },
        ]);
      }

      setName("");
      setRole("");
      setMessage("");
      setFile(null);
      setEditing(null);
      loadTestimonials();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Yakin hapus testimoni ini?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    loadTestimonials();
  }

  return (
    <AdminLayout>
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">
          {editing ? "Edit Testimoni" : "Tambah Testimoni"}
        </h2>

        <div className="space-y-3 mb-6">
          <input
            className="border p-2 w-full rounded"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Peran (Orang tua / Siswa / Guru)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <textarea
            className="border p-2 w-full rounded"
            placeholder="Pesan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button
            onClick={save}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {editing ? "Simpan Perubahan" : "Tambah Testimoni"}
          </button>
        </div>

        <hr className="my-6" />

        <h3 className="text-lg font-semibold mb-3">Daftar Testimoni</h3>
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="border p-3 rounded flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {t.photo && (
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.role}</p>
                  <p className="text-gray-800 text-sm italic">“{t.message}”</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(t)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
