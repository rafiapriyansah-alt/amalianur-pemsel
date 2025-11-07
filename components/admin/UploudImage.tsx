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
    const result = await uploadImageFile(file, "gallery");
    
    // Handle both string and object return types
    if (result) {
      if (typeof result === 'string') {
        onUploaded(result);
      } else {
        // Jika return berupa object, ambil publicUrl-nya
        onUploaded(result.publicUrl);
      }
    }
    
    setUploading(false);
  }

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