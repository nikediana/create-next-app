export type JenisKelamin = "Laki-laki" | "Perempuan";

export type Murid = {
  nomor_registrasi: string;
  nama_lengkap: string;
  tanggal_registrasi: string;
  jenis_kelamin: JenisKelamin;
  usia: number;
  alamat_lengkap: string;
  kota: string;
  no_whatsapp: string;
  pekerjaan: string | null;
  nama_instansi: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MuridForm = {
  nomor_registrasi: string;
  nama_lengkap: string;
  tanggal_registrasi: string;
  jenis_kelamin: JenisKelamin;
  usia: string;
  alamat_lengkap: string;
  kota: string;
  no_whatsapp: string;
  pekerjaan: string;
  nama_instansi: string;
};
