// utils/upload.ts
import { getSupabase } from "../lib/supabaseClient";

/**
 * Upload file ke bucket "images" (folder opsional)
 * returns { publicUrl, path } or null
 */
export async function uploadImageFile(file: File, folder = "uploads"): Promise<{ publicUrl: string; path: string } | null> {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase client not initialized");

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const path = `${folder}/${filename}`;

    // Supabase JS expects either Blob or File; in Node env not available — this runs client-side.
    const { data, error } = await supabase.storage.from("images").upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    const { data: publicData } = await supabase.storage.from("images").getPublicUrl(data.path);
    if (!publicData) return null;
    return { publicUrl: publicData.publicUrl, path: data.path };
  } catch (err) {
    console.error("uploadImageFile error", err);
    return null;
  }
}

/**
 * Delete image given a publicUrl or path.
 * - If you pass full publicUrl -> we try to parse path after `/object/public/images/`
 * - If you pass path already (images/folder/file.jpg) we delete directly.
 */
export async function deleteImageByPath(publicOrPath: string) {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase client not initialized");

    let path = publicOrPath;

    // detect if URL (supabase public url form: https://<proj>.supabase.co/storage/v1/object/public/images/<path>)
    try {
      const u = new URL(publicOrPath);
      const parts = u.pathname.split("/object/public/images/");
      if (parts.length === 2) {
        path = parts[1];
      } else {
        // maybe using custom proxy; attempt to strip host and get last two segments
        const segs = u.pathname.split("/");
        path = segs.slice(-3).join("/"); // fallback (not perfect)
      }
    } catch {
      // not a URL, treat as path already
    }

    const { error } = await supabase.storage.from("images").remove([path]);
    if (error) {
      console.error("deleteImageByPath error", error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error("deleteImageByPath top error", err);
    throw err;
  }
}
