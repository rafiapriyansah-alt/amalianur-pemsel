// pages/admin/programs.tsx
"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

interface Program {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  category: string;
  is_published?: boolean;
}

export default function AdminPrograms() {
  useRequireRole(["super_admin", "admin"]);
  const supabase = getSupabase();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [form, setForm] = useState<Program>({
    title: "",
    subtitle: "",
    description: "",
    category: "MTS",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 🔹 Ambil data awal
  async function loadPrograms() {
    const { data } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: true });
    setPrograms(data || []);
  }

  useEffect(() => {
    loadPrograms();

    // 🔹 Supabase Realtime Sync
    const channel = supabase
      .channel("programs_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "programs" },
        () => loadPrograms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔹 Tambah / Update data
  async function handleSave() {
    let imageUrl = form.image_url;

    if (imageFile) {
      const uploadedUrl = await uploadImageFile(imageFile, "programs");
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const payload = { ...form, image_url: imageUrl };

    if (editingId) {
      await supabase.from("programs").update(payload).eq("id", editingId);
      alert("✅ Program berhasil diperbarui!");
    } else {
      await supabase.from("programs").insert([payload]);
      alert("✅ Program baru berhasil ditambahkan!");
    }

    setForm({ title: "", subtitle: "", description: "", category: "MTS", image_url: "" });
    setImageFile(null);
    setEditingId(null);
    loadPrograms();
  }

  // 🔹 Hapus
  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus program ini?")) return;
    await supabase.from("programs").delete().eq("id", id);
    loadPrograms();
  }

  // 🔹 Edit (isi form dengan data lama)
  function handleEdit(p: Program) {
    setForm({
      title: p.title,
      subtitle: p.subtitle || "",
      description: p.description,
      category: p.category,
      image_url: p.image_url || "",
    });
    setEditingId(p.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Kelola Program</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <input
            placeholder="Judul Program"
            className="border p-2 rounded"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Sub Judul (opsional)"
            className="border p-2 rounded"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <textarea
            placeholder="Deskripsi Program"
            className="border p-2 rounded md:col-span-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="MTS">MTS</option>
            <option value="TK">TK</option>
          </select>

          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              className="h-24 object-cover rounded"
            />
          )}
        </div>

        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {editingId ? "💾 Simpan Perubahan" : "➕ Tambah Program"}
        </button>

        <div className="mt-10">
          <h3 className="font-semibold text-lg mb-3">Daftar Program</h3>
          {programs.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between border-b py-3"
            >
              <div>
                <b>{p.title}</b>
                <div className="text-sm text-gray-500">{p.subtitle}</div>
                <div className="text-sm">{p.category}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id!)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
