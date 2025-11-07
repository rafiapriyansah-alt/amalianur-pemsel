// components/UploadImage.tsx
"use client";
import { useState } from "react";
import { uploadImageFile } from "../../utils/upload";

export default function UploadImage({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const url = await uploadImageFile(file, "gallery");
    if (url) onUploaded(url);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Mengunggah..." : "Upload"}
      </button>
    </div>
  );
}
