import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import AdminLayout from "../../components/admin/AdminLayout";
import { toast } from "react-hot-toast";

interface Post {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image_url?: string;
  published_at?: string;
}

export default function AdminNews() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState<Post>({ title: "", excerpt: "", content: "", image_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("published_at", { ascending: false });
    if (!error && data) setPosts(data);
  };

  useEffect(() => {
    load();
    const channel = supabase.channel("public:posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const url = await uploadImageFile(e.target.files[0], "news");
    if (url) setForm((f) => ({ ...f, image_url: url }));
  };

  const handleSubmit = async () => {
    if (editingId) {
      const { error } = await supabase.from("posts").update(form).eq("id", editingId);
      if (!error) toast.success("Berita berhasil diperbarui!");
    } else {
      const { error } = await supabase.from("posts").insert([form]);
      if (!error) toast.success("Berita berhasil ditambahkan!");
    }
    setForm({ title: "", excerpt: "", content: "", image_url: "" });
    setEditingId(null);
    load();
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id!);
    setForm(post);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus berita ini?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (!error) toast.success("Berita dihapus!");
      load();
    }
  };

  return (
    <AdminLayout title="Kelola Berita">
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Berita" : "Tambah Berita Baru"}</h2>

        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul" className="border p-2 w-full rounded" />
        <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Deskripsi singkat" className="border p-2 w-full rounded" />
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Isi berita lengkap (boleh HTML)" className="border p-2 w-full rounded h-32" />

        <input type="file" onChange={handleUpload} className="border p-2 w-full rounded" />
        {form.image_url && <img src={form.image_url} alt="Preview" className="w-48 mt-2 rounded shadow" />}

        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {editingId ? "Simpan Perubahan" : "Tambah Berita"}
        </button>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {posts.map((p) => (
            <div key={p.id} className="border p-3 rounded shadow">
              <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover rounded" />
              <h3 className="font-semibold mt-2">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.excerpt}</p>
              <div className="flex justify-between mt-2">
                <button onClick={() => handleEdit(p)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(p.id!)} className="text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
