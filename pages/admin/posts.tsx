"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

export default function AdminPosts() {
  useRequireRole(["admin", "super_admin", "editor"]);
  const supabase = getSupabase();

  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    try {
      let imageUrl: string | null = null;

      if (file) {
        const uploaded = await uploadImageFile(file, "posts");
        if (uploaded) imageUrl = uploaded;
      }

      if (editing) {
        await supabase.from("posts").update({ title, content, image: imageUrl ?? "" }).eq("id", editing);
      } else {
        await supabase.from("posts").insert([{ title, content, image: imageUrl ?? "", created_at: new Date().toISOString() }]);
      }

      alert("✅ Berita disimpan!");
      setTitle("");
      setContent("");
      setFile(null);
      setEditing(null);
      load();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan berita");
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus berita?")) return;
    if (!supabase) return;
    await supabase.from("posts").delete().eq("id", id);
    load();
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Kelola Berita</h3>

        <input className="border p-2 rounded w-full mb-2" placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="border p-2 rounded w-full mb-2" placeholder="Isi Berita" value={content} onChange={(e) => setContent(e.target.value)} />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Simpan</button>

        <div className="mt-6">
          {posts.map((p) => (
            <div key={p.id} className="border-b py-3 flex justify-between">
              <div>
                <b>{p.title}</b>
                <div className="text-sm text-gray-500">{p.content.slice(0, 60)}...</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(p.id); setTitle(p.title); setContent(p.content); }} className="text-blue-600">Edit</button>
                <button onClick={() => remove(p.id)} className="text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
