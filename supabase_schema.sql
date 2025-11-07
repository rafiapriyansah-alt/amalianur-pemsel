create extension if not exists "pgcrypto";

-- users (role management separate from Auth)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  role text check (role in ('super_admin','admin','editor')) default 'editor',
  created_at timestamptz default now()
);

-- posts / berita
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique,
  content text,
  image text,
  published boolean default false,
  author text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- programs
create table if not exists programs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique,
  description text,
  image text,
  category text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- testimonials
create table if not exists testimonials (
  id uuid default gen_random_uuid() primary key,
  name text,
  message text,
  photo text,
  created_at timestamptz default now()
);

-- gallery
create table if not exists gallery (
  id uuid default gen_random_uuid() primary key,
  image text,
  caption text,
  created_at timestamptz default now()
);

-- combined schools for TK & MTS
create table if not exists schools (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('tk','mts')),
  title text,
  description text,
  image text,
  jumlah_siswa integer default 0,
  jumlah_guru integer default 0,
  kegiatan jsonb default '[]'::jsonb, -- array of activities {title,desc,image}
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- settings
create table if not exists settings (
  id int primary key default 1,
  site_name text,
  description text,
  logo_url text,
  head_name text,
  head_message text,
  head_photo text,
  contact_phone text,
  contact_email text,
  contact_address text,
  maps_iframe text,
  theme_color text,
  updated_at timestamptz default now()
);

-- donation methods / accounts
create table if not exists donation_methods (
  id uuid default gen_random_uuid() primary key,
  name text,
  type text, -- e.g. bank / ewallet
  account_number text,
  holder_name text,
  logo_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- contacts (messages)
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  message text,
  created_at timestamptz default now()
);
