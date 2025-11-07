"use client";
import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { uploadImageFile } from "../../utils/upload";
import { useRequireRole } from "../../hooks/useRequireRole";

interface School {
  id: string;
  nama: string;
  deskripsi: string;
  jumlah_siswa: string;
  jumlah_guru: string;
  photo?: string;
  created_at: string;
  updated_at?: string;
}

interface UploadResult {
  publicUrl: string;
  path: string;
}

export default function AdminSchools() {
  useRequireRole(["admin", "super_admin"]);
  const supabase = getSupabase();

  const [schools, setSchools] = useState<School[]>([]);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlahSiswa, setJumlahSiswa] = useState("");
  const [jumlahGuru, setJumlahGuru] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadSchools() {
    if (!supabase) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setSchools(data ?? []);
    } catch (error) {
      console.error("Error loading schools:", error);
      alert("❌ Gagal memuat data sekolah");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadSchools(); 
  }, [supabase]);

  async function saveSchool() {
    if (!supabase) return;
    
    if (!nama.trim()) {
      alert("❌ Nama sekolah harus diisi");
      return;
    }

    try {
      setSaving(true);
      let photoUrl: string | null = null;

      if (file) {
        const uploaded = await uploadImageFile(file, "schools");
        
        // Handle both string and object return types
        if (uploaded) {
          if (typeof uploaded === 'string') {
            photoUrl = uploaded;
          } else {
            photoUrl = (uploaded as UploadResult).publicUrl;
          }
        }
      }

      const schoolData = {
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        jumlah_siswa: jumlahSiswa.trim(),
        jumlah_guru: jumlahGuru.trim(),
        photo: photoUrl,
        updated_at: new Date().toISOString()
      };

      if (editing) {
        const { error } = await supabase
          .from("schools")
          .update(schoolData)
          .eq("id", editing);
        
        if (error) throw error;
        alert("✅ Data sekolah berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from("schools")
          .insert([{ 
            ...schoolData, 
            created_at: new Date().toISOString() 
          }]);
        
        if (error) throw error;
        alert("✅ Data sekolah berhasil ditambahkan!");
      }

      resetForm();
      await loadSchools();
    } catch (error) {
      console.error("Error saving school:", error);
      alert("❌ Gagal menyimpan data sekolah");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setNama("");
    setDeskripsi("");
    setJumlahSiswa("");
    setJumlahGuru("");
    setFile(null);
    setEditing(null);
  }

  function startEdit(school: School) {
    setEditing(school.id);
    setNama(school.nama);
    setDeskripsi(school.deskripsi);
    setJumlahSiswa(school.jumlah_siswa);
    setJumlahGuru(school.jumlah_guru);
    setFile(null);
  }

  async function removeSchool(id: string) {
    if (!supabase) return;
    if (!confirm("Hapus sekolah ini?")) return;
    
    try {
      const { error } = await supabase
        .from("schools")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      await loadSchools();
      alert("✅ Data sekolah berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting school:", error);
      alert("❌ Gagal menghapus data sekolah");
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          {editing ? "Edit Data Sekolah" : "Tambah Data Sekolah Baru"}
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Sekolah *
            </label>
            <input 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              placeholder="Masukkan nama sekolah" 
              value={nama} 
              onChange={(e) => setNama(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Sekolah
            </label>
            <textarea 
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical" 
              placeholder="Masukkan deskripsi sekolah" 
              rows={3}
              value={deskripsi} 
              onChange={(e) => setDeskripsi(e.target.value)} 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Siswa
              </label>
              <input 
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="Contoh: 150 siswa" 
                value={jumlahSiswa} 
                onChange={(e) => setJumlahSiswa(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Guru
              </label>
              <input 
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="Contoh: 20 guru" 
                value={jumlahGuru} 
                onChange={(e) => setJumlahGuru(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Sekolah
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} 
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              {file ? `File dipilih: ${file.name}` : "Pilih foto sekolah (opsional)"}
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={saveSchool} 
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : editing ? "Update Sekolah" : "Simpan Sekolah"}
            </button>
            
            {editing && (
              <button 
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal Edit
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Daftar Sekolah</h4>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Memuat data sekolah...</p>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Belum ada data sekolah yang ditambahkan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-2">{school.nama}</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        {school.deskripsi}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Siswa: {school.jumlah_siswa || '-'}</span>
                        <span>Guru: {school.jumlah_guru || '-'}</span>
                        {school.photo && (
                          <span className="text-green-600">✓ Ada foto</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => startEdit(school)} 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => removeSchool(school.id)} 
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}