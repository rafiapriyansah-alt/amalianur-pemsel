// types.ts
export interface GalleryItem {
  id?: string;
  title: string;
  image_url: string;
  category?: string;
  created_at?: string;
}


// types.ts (opsional)
export type SettingsForm = {
  site_name: string;
  description: string;
  logo_url?: string;
  head_name?: string;
  head_message?: string;
  head_photo?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  maps_iframe?: string;
};
