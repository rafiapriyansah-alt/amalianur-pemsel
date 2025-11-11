"use client";
import { useState, useCallback } from "react";
import { uploadImageFile } from "../../utils/upload";

interface UploadImageProps {
  onUploaded: (url: string) => void;
}

export default function UploadImage({ onUploaded }: UploadImageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /** ✅ Optimal: gunakan useCallback agar tidak recreate function setiap render */
  const handleUpload = useCallback(async () => {
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadImageFile(file, "gallery");

      if (result) {
        const url = typeof result === "string" ? result : result.publicUrl;
        onUploaded(url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Gagal upload gambar. Coba lagi.");
    } finally {
      setUploading(false);
    }
  }, [file, onUploaded]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border rounded p-2"
      />

      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
      >
        {uploading ? "Mengunggah..." : "Upload"}
      </button>
    </div>
  );
}
