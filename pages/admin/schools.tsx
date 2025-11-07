"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

export default function AdminSchools() {
  useRequireRole(["admin", "super_admin"]);
  const supabase = getSupabase();

  const [schools, setSchools] = useState<any[]>([]);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlahSiswa, setJumlahSiswa] = useState("");
  const [jumlahGuru, setJumlahGuru] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
    setSchools(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    let photoUrl: string | null = null;
    if (file) {
      const uploaded = await uploadImageFile(file, "schools");
      if (uploaded) photoUrl = uploaded;
    }

    if (editing) {
      await supabase.from("schools").update({
        nama, deskripsi, jumlah_siswa: jumlahSiswa, jumlah_guru: jumlahGuru, photo: photoUrl ?? ""
      }).eq("id", editing);
    } else {
      await supabase.from("schools").insert([{
        nama, deskripsi, jumlah_siswa: jumlahSiswa, jumlah_guru: jumlahGuru, photo: photoUrl ?? "",
        created_at: new Date().toISOString()
      }]);
    }

    alert("✅ Data sekolah disimpan!");
    setNama(""); setDeskripsi(""); setJumlahSiswa(""); setJumlahGuru(""); setFile(null); setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus sekolah ini?")) return;
    await supabase.from("schools").delete().eq("id", id);
    load();
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Kelola Data TK & MTS</h3>

        <input className="border p-2 rounded w-full mb-2" placeholder="Nama Sekolah" value={nama} onChange={(e) => setNama(e.target.value)} />
        <textarea className="border p-2 rounded w-full mb-2" placeholder="Deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
        <div className="flex gap-2 mb-2">
          <input className="border p-2 rounded flex-1" placeholder="Jumlah Siswa" value={jumlahSiswa} onChange={(e) => setJumlahSiswa(e.target.value)} />
          <input className="border p-2 rounded flex-1" placeholder="Jumlah Guru" value={jumlahGuru} onChange={(e) => setJumlahGuru(e.target.value)} />
        </div>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Simpan</button>

        <div className="mt-6">
          {schools.map((s) => (
            <div key={s.id} className="border-b py-3 flex justify-between">
              <div>
                <b>{s.nama}</b>
                <div className="text-sm text-gray-500">{s.deskripsi}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(s.id); setNama(s.nama); setDeskripsi(s.deskripsi); }} className="text-blue-600">Edit</button>
                <button onClick={() => remove(s.id)} className="text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
