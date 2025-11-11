"use client";
import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { useRequireRole } from "../../hooks/useRequireRole";
import { toast } from "react-hot-toast";

export default function UsersPage() {
  const { loading: authLoading } = useRequireRole(["super_admin"]);
  const supabase = getSupabase();

  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ Optimisasi penting: cegah spam loadUsers
  const loadLock = useRef(false);

  // ✅ Ambil current user sekali saja (tidak double request)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  // ✅ Load daftar user (optimisasi)
  async function loadUsers() {
    if (loadLock.current) return; // ⛔ Cegah multi-request
    loadLock.current = true;

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, name, role, created_at")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data ?? []);

    // ✅ buka kunci setelah 300ms biar tidak spam
    setTimeout(() => {
      loadLock.current = false;
    }, 300);
  }

  // ✅ Real-time + load awal
  useEffect(() => {
    if (authLoading) return;

    loadUsers();

    // ✅ Real-time dengan debounce
    const channel = supabase
      .channel("public:users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading]);

  // ✅ Tambah user baru
  async function handleAddUser() {
    if (!form.email || !form.full_name || !form.password) {
      setStatus({ type: "error", message: "Semua field wajib diisi!" });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.full_name,
          role: form.role,
          actor: currentUser?.email || "Super Admin",
        }),
      });

      const result = await res.json();

      if (result.success) {
        setStatus({ type: "success", message: "✅ User berhasil ditambahkan!" });
        setForm({ email: "", full_name: "", password: "", role: "admin" });
        loadUsers();
      } else {
        setStatus({
          type: "error",
          message: result.message || "❌ Gagal menambahkan user.",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "❌ Tidak dapat menghubungi server.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ✅ Hapus user (cepat & realtime aman)
  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, actor: currentUser?.email }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        loadUsers();
      } else {
        toast.error(result.message || "Gagal menghapus user.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server.");
    }
  }

  if (authLoading) {
    return (
      <AdminLayout title="Manajemen Pengguna">
        <div className="p-6 bg-white rounded-xl shadow">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Memeriksa otentikasi...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Pengguna">
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          👥 Kelola Pengguna
        </h2>

        {/* FORM TAMBAH USER */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <button
          onClick={handleAddUser}
          disabled={loading}
          className={`px-6 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Menambahkan..." : "Tambah Pengguna"}
        </button>

        {/* STATUS NOTIF */}
        {status.type && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              status.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* TABEL USERS */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border rounded-xl text-sm">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-green-50">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.name || u.full_name}</td>
                    <td className="p-2 capitalize">{u.role}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Belum ada pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
