# Yayasan Amalianur - Complete Starter (Next.js + Supabase + Tailwind)

Ini merupakan starter project lengkap untuk **Yayasan Amalianur**.
Termasuk: frontend multi-page, admin panel (login email/password via Supabase), API skeleton, dan SQL schema untuk Supabase.

## Persiapan (Supabase)
1. Buat project di https://app.supabase.com
2. Di Project → Settings → API, catat:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY) — **jaga kerahasiaannya**

3. Di SQL Editor, jalankan file `supabase_schema.sql` untuk membuat tabel dasar.
4. Di Authentication → Users, buat user admin (email/password) — catat UID.
5. Insert metadata ke `users_meta` (gunakan SQL editor):
   ```sql
   insert into users_meta (id, email, full_name, role) values (
     'PASTE_UID_FROM_AUTH', 'owner@yayasan.id', 'Pemilik Yayasan', 'superadmin'
   );
   ```

## Setup Lokal
1. Clone / extract project
2. Buat file `.env.local` di root project dengan konten:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan dev server:
   ```bash
   npm run dev
   ```
5. Buka http://localhost:3000

## Notes
- API routes di folder `pages/api/admin` menggunakan `supabaseServer` yang memerlukan `SUPABASE_SERVICE_ROLE_KEY` — **letakkan hanya di server** (Vercel environment variables), jangan commit.
- Ini starter; fitur seperti image upload UI, file storage permissions, webhook payment, dan i18n perlu diimplementasikan selanjutnya.

## Deployment
- Deploy ke Vercel atau hosting Next.js. Tambahkan environment variables di dashboard hosting (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
- Untuk custom domain `.sch.id`, ikuti panduan registrar & Vercel.
