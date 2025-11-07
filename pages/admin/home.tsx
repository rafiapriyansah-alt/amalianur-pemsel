"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSupabase } from "../../lib/supabaseClient";
import { useRequireRole } from "../../hooks/useRequireRole";
import Image from "next/image";
import { FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function AdminHome() {
  useRequireRole(["super_admin", "admin", "editor"]);
  const supabase = getSupabase();

  const [form, setForm] = useState<any>({
    hero_title: "",
    hero_subtitle: "",
    hero_images: [] as string[],
    hero_shadow: true,
    kepala_name: "",
    kepala_photo: "",
    ttd_photo: "",
    welcome_message: "",
    kb_title: "",
    kb_desc: "",
    kb_image: "",
    tk_title: "",
    tk_desc: "",
    tk_image: "",
    mts_title: "",
    mts_desc: "",
    mts_image: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase.from("home").select("*").single();
    if (error) {
      console.warn("Load home:", error.message);
      return;
    }
    if (data) {
      data.hero_images = data.hero_images ?? [];
      setForm(data);
    }
  }

  async function uploadToBucket(file: File) {
    const filePath = `home/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data: pub } = supabase.storage.from("images").getPublicUrl(filePath);
    return pub.publicUrl;
  }

  // ✅ Upload image hero (maks 3)
  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if ((form.hero_images?.length || 0) >= 3) {
      alert("Maksimal hanya 3 gambar hero.");
      return;
    }
    try {
      setLoading(true);
      const url = await uploadToBucket(file);
      setForm((f: any) => ({
        ...f,
        hero_images: [...(f.hero_images || []), url],
      }));
    } catch (err: any) {
      alert("Upload gagal: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSingleUpload(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadToBucket(file);
      setForm((f: any) => ({ ...f, [key]: url }));
    } catch (err: any) {
      alert("Upload gagal: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  function removeHeroImage(i: number) {
    setForm((f: any) => ({
      ...f,
      hero_images: (f.hero_images || []).filter((_: any, idx: number) => idx !== i),
    }));
  }

  function moveHero(i: number, dir: "left" | "right") {
    setForm((f: any) => {
      const arr = [...(f.hero_images || [])];
      const j = dir === "left" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, hero_images: arr };
    });
  }

  async function save() {
    try {
      setLoading(true);
      const payload = { ...form };
      const { error } = await supabase
        .from("home")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
      alert("✅ Berhasil disimpan!");
    } catch (err: any) {
      alert("❌ Gagal menyimpan: " + (err.message ?? err));
    } finally {
      setLoading(false);
      load();
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-8">
        <h2 className="text-3xl font-semibold text-green-700 border-b pb-2">
          Kelola Halaman Home
        </h2>

        {/* 🖼️ HERO */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">Bagian Hero</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Judul Hero"
              value={form.hero_title || ""}
              onChange={(e) =>
                setForm({ ...form, hero_title: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Sub Judul Hero"
              value={form.hero_subtitle || ""}
              onChange={(e) =>
                setForm({ ...form, hero_subtitle: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-sm text-gray-600">
              Upload Gambar Hero (maksimal 3)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroUpload}
              disabled={(form.hero_images?.length || 0) >= 3}
              className="mb-3"
            />

            {/* Preview Hero Images */}
            <div className="flex flex-wrap gap-3">
              {(form.hero_images || []).map((u: string, i: number) => (
                <div
                  key={i}
                  className="relative w-36 h-24 border rounded overflow-hidden group"
                >
                  <Image
                    src={u}
                    alt={`hero-${i}`}
                    width={144}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-2 transition">
                    <button
                      title="Geser Kiri"
                      onClick={() => moveHero(i, "left")}
                      className="bg-white/90 p-1 rounded-full"
                    >
                      <FaArrowLeft className="text-green-600" />
                    </button>
                    <button
                      title="Hapus"
                      onClick={() => removeHeroImage(i)}
                      className="bg-red-600 p-1 rounded-full text-white"
                    >
                      <FaTrash />
                    </button>
                    <button
                      title="Geser Kanan"
                      onClick={() => moveHero(i, "right")}
                      className="bg-white/90 p-1 rounded-full"
                    >
                      <FaArrowRight className="text-green-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <input
              id="hero_shadow"
              type="checkbox"
              checked={!!form.hero_shadow}
              onChange={(e) =>
                setForm({ ...form, hero_shadow: e.target.checked })
              }
            />
            <label htmlFor="hero_shadow">
              Gunakan overlay gelap pada Hero (shadow)
            </label>
          </div>
        </section>

        {/* 👨‍🏫 Kepala Yayasan */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-green-800">
            Kepala Yayasan
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Kepala Yayasan"
              value={form.kepala_name || ""}
              onChange={(e) =>
                setForm({ ...form, kepala_name: e.target.value })
              }
              className="border p-2 rounded"
            />
            <textarea
              placeholder="Ucapan Kepala Yayasan"
              value={form.welcome_message || ""}
              onChange={(e) =>
                setForm({ ...form, welcome_message: e.target.value })
              }
              className="border p-2 rounded"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm text-gray-600">
                Foto Kepala Yayasan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleUpload(e, "kepala_photo")}
              />
              {form.kepala_photo && (
                <Image
                  src={form.kepala_photo}
                  alt="kepala"
                  width={200}
                  height={200}
                  className="mt-2 rounded shadow"
                />
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600">
                Tanda Tangan (image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleUpload(e, "ttd_photo")}
              />
              {form.ttd_photo && (
                <Image
                  src={form.ttd_photo}
                  alt="ttd"
                  width={200}
                  height={100}
                  className="mt-2 rounded shadow"
                />
              )}
            </div>
          </div>
        </section>

        {/* 🎓 Pendidikan */}
        <section>
          <h3 className="text-xl font-semibold mb-3 text-green-800">
            Pendidikan di Yayasan Amalianur
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "KB Amalianur", key: "kb" },
              { label: "TK Amalianur", key: "tk" },
              { label: "MTS Amalianur", key: "mts" },
            ].map((edu) => (
              <div
                key={edu.key}
                className="p-4 border rounded-xl shadow-sm space-y-2"
              >
                <h4 className="font-semibold text-green-700">{edu.label}</h4>
                <input
                  type="text"
                  placeholder={`Judul ${edu.label}`}
                  value={form[`${edu.key}_title`] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [`${edu.key}_title`]: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                <textarea
                  placeholder={`Deskripsi ${edu.label}`}
                  value={form[`${edu.key}_desc`] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [`${edu.key}_desc`]: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                  rows={2}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleSingleUpload(e, `${edu.key}_image`)
                  }
                />
                {form[`${edu.key}_image`] && (
                  <Image
                    src={form[`${edu.key}_image`]}
                    alt={edu.key}
                    width={300}
                    height={200}
                    className="mt-2 rounded shadow"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="text-right">
          <button
            onClick={save}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}