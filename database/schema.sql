-- =========================================================
-- Schema Database Supabase: CRUD Data Murid
-- Untuk app master presensi sederhana.
-- Jalankan file ini di Supabase SQL Editor.
-- =========================================================

create table if not exists public.murid (
  nomor_registrasi text primary key,
  nama_lengkap text not null,
  tanggal_registrasi date not null default current_date,
  jenis_kelamin text not null check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  usia integer not null check (usia >= 0 and usia <= 150),
  alamat_lengkap text not null,
  kota text not null,
  no_whatsapp text not null,
  pekerjaan text,
  nama_instansi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index tambahan agar pencarian nama/kota lebih ringan ketika data mulai banyak.
create index if not exists idx_murid_nama_lengkap on public.murid (nama_lengkap);
create index if not exists idx_murid_kota on public.murid (kota);

-- Otomatis update kolom updated_at saat data diubah.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_murid_updated_at on public.murid;
create trigger set_murid_updated_at
before update on public.murid
for each row
execute function public.set_updated_at();

-- =========================================================
-- RLS Policy untuk DEMO CRUD publik tanpa login.
-- Catatan penting:
-- Policy ini cocok untuk belajar/demo.
-- Untuk produksi, sebaiknya pakai login dan role management.
-- =========================================================

alter table public.murid enable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on table public.murid to anon;

drop policy if exists "Murid dapat dibaca publik" on public.murid;
create policy "Murid dapat dibaca publik"
on public.murid
for select
to anon
using (true);

drop policy if exists "Murid dapat ditambah publik" on public.murid;
create policy "Murid dapat ditambah publik"
on public.murid
for insert
to anon
with check (true);

drop policy if exists "Murid dapat diubah publik" on public.murid;
create policy "Murid dapat diubah publik"
on public.murid
for update
to anon
using (true)
with check (true);

drop policy if exists "Murid dapat dihapus publik" on public.murid;
create policy "Murid dapat dihapus publik"
on public.murid
for delete
to anon
using (true);

-- Data contoh, boleh dihapus jika tidak diperlukan.
insert into public.murid (
  nomor_registrasi,
  nama_lengkap,
  tanggal_registrasi,
  jenis_kelamin,
  usia,
  alamat_lengkap,
  kota,
  no_whatsapp,
  pekerjaan,
  nama_instansi
) values
  ('REG-001', 'Ahmad Fauzan', current_date, 'Laki-laki', 20, 'Jl. Mawar No. 10', 'Yogyakarta', '6281234567890', 'Mahasiswa', 'Universitas Contoh'),
  ('REG-002', 'Siti Aminah', current_date, 'Perempuan', 22, 'Jl. Melati No. 5', 'Sleman', '6289876543210', 'Karyawan', 'PT Contoh Jaya')
on conflict (nomor_registrasi) do nothing;
