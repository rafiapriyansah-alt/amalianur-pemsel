// pages/admin/about.tsx
import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill dengan proper typing
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});
import "react-quill/dist/quill.snow.css";

interface AboutData {
  id?: string;
  title?: string;
  content?: string;
  vision?: string;
  mission?: string;
  history?: string;
  updated_at?: string;
}

export default function AboutAdmin() {
  const supabase = getSupabase();
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load data function
  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .single();
      
      if (error) throw error;
      
      if (data) {
        setAbout(data);
      } else {
        // Initialize empty about data if doesn't exist
        setAbout({
          title: "",
          content: "",
          vision: "",
          mission: "",
          history: ""
        });
      }
    } catch (error) {
      console.error("Error loading about data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listener realtime supaya halaman publik ikut update otomatis
    const aboutSub = supabase
      .channel("about-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "about" },
        loadData
      )
      .subscribe();

    // Cleanup function
    return () => {
      aboutSub.unsubscribe();
    };
  }, [supabase]);

  const handleSave = async () => {
    if (!about) return;
    
    setSaving(true);
    try {
      // Cek apakah data sudah ada
      const { data: existingData } = await supabase
        .from("about")
        .select("id")
        .single();

      if (existingData) {
        // Update existing data
        const { error } = await supabase
          .from("about")
          .update({
            title: about.title,
            content: about.content,
            vision: about.vision,
            mission: about.mission,
            history: about.history,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingData.id);

        if (error) throw error;
      } else {
        // Insert new data
        const { error } = await supabase
          .from("about")
          .insert([
            {
              title: about.title,
              content: about.content,
              vision: about.vision,
              mission: about.mission,
              history: about.history
            }
          ]);

        if (error) throw error;
      }

      alert("Data berhasil disimpan!");
    } catch (error) {
      console.error("Error saving about data:", error);
      alert("Gagal menyimpan data!");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof AboutData, value: string) => {
    setAbout((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"]
    ]
  };

  const simpleQuillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Kelola Halaman Tentang Kami
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Judul Halaman</h2>
          <input
            type="text"
            value={about?.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Masukkan judul halaman tentang kami"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Konten Utama</h2>
          {typeof window !== 'undefined' && (
            <ReactQuill
              value={about?.content || ""}
              onChange={(value) => handleChange("content", value)}
              theme="snow"
              modules={quillModules}
              className="h-64 mb-12"
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Visi</h2>
          {typeof window !== 'undefined' && (
            <ReactQuill
              value={about?.vision || ""}
              onChange={(value) => handleChange("vision", value)}
              theme="snow"
              modules={simpleQuillModules}
              className="h-48 mb-12"
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Misi</h2>
          {typeof window !== 'undefined' && (
            <ReactQuill
              value={about?.mission || ""}
              onChange={(value) => handleChange("mission", value)}
              theme="snow"
              modules={simpleQuillModules}
              className="h-48 mb-12"
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sejarah</h2>
          {typeof window !== 'undefined' && (
            <ReactQuill
              value={about?.history || ""}
              onChange={(value) => handleChange("history", value)}
              theme="snow"
              modules={quillModules}
              className="h-64 mb-12"
            />
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

        </div>
      </div>
    </div>
  );
}