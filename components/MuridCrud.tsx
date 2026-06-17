"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Murid, MuridForm } from "@/types/murid";

const today = new Date().toISOString().slice(0, 10);

const emptyForm: MuridForm = {
  nomor_registrasi: "",
  nama_lengkap: "",
  tanggal_registrasi: today,
  jenis_kelamin: "Laki-laki",
  usia: "",
  alamat_lengkap: "",
  kota: "",
  no_whatsapp: "",
  pekerjaan: "",
  nama_instansi: "",
};

export default function MuridCrud() {
  const [muridList, setMuridList] = useState<Murid[]>([]);
  const [form, setForm] = useState<MuridForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [keyword, setKeyword] = useState("");

  async function loadMurid() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("murid")
      .select("*")
      .order("tanggal_registrasi", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage({ type: "error", text: `Gagal load data: ${error.message}` });
    } else {
      setMuridList((data ?? []) as Murid[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMurid();
  }, []);

  const filteredMurid = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return muridList;

    return muridList.filter((murid) => {
      return [
        murid.nomor_registrasi,
        murid.nama_lengkap,
        murid.kota,
        murid.no_whatsapp,
        murid.pekerjaan ?? "",
        murid.nama_instansi ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [keyword, muridList]);

  function updateForm(name: keyof MuridForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm, tanggal_registrasi: today });
    setEditingId(null);
  }

  function validateForm() {
    if (!form.nomor_registrasi.trim()) return "Nomor Registrasi wajib diisi.";
    if (!form.nama_lengkap.trim()) return "Nama Lengkap wajib diisi.";
    if (!form.tanggal_registrasi) return "Tanggal Registrasi wajib diisi.";
    if (!form.usia || Number(form.usia) < 0) return "Usia wajib diisi dengan angka valid.";
    if (!form.alamat_lengkap.trim()) return "Alamat Lengkap wajib diisi.";
    if (!form.kota.trim()) return "Kota wajib diisi.";
    if (!form.no_whatsapp.trim()) return "No Whatsapp wajib diisi.";
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);

    const payload = {
      nomor_registrasi: form.nomor_registrasi.trim(),
      nama_lengkap: form.nama_lengkap.trim(),
      tanggal_registrasi: form.tanggal_registrasi,
      jenis_kelamin: form.jenis_kelamin,
      usia: Number(form.usia),
      alamat_lengkap: form.alamat_lengkap.trim(),
      kota: form.kota.trim(),
      no_whatsapp: form.no_whatsapp.trim(),
      pekerjaan: form.pekerjaan.trim() || null,
      nama_instansi: form.nama_instansi.trim() || null,
    };

    const query = editingId
      ? supabase.from("murid").update(payload).eq("nomor_registrasi", editingId)
      : supabase.from("murid").insert(payload);

    const { error } = await query;

    if (error) {
      setMessage({ type: "error", text: `Gagal menyimpan data: ${error.message}` });
    } else {
      setMessage({
        type: "success",
        text: editingId ? "Data murid berhasil diperbarui." : "Data murid berhasil ditambahkan.",
      });
      resetForm();
      await loadMurid();
    }

    setSaving(false);
  }

  function handleEdit(murid: Murid) {
    setEditingId(murid.nomor_registrasi);
    setForm({
      nomor_registrasi: murid.nomor_registrasi,
      nama_lengkap: murid.nama_lengkap,
      tanggal_registrasi: murid.tanggal_registrasi,
      jenis_kelamin: murid.jenis_kelamin,
      usia: String(murid.usia),
      alamat_lengkap: murid.alamat_lengkap,
      kota: murid.kota,
      no_whatsapp: murid.no_whatsapp,
      pekerjaan: murid.pekerjaan ?? "",
      nama_instansi: murid.nama_instansi ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(nomorRegistrasi: string) {
    const confirmed = window.confirm(`Hapus murid dengan Nomor Registrasi ${nomorRegistrasi}?`);
    if (!confirmed) return;

    setMessage(null);
    const { error } = await supabase.from("murid").delete().eq("nomor_registrasi", nomorRegistrasi);

    if (error) {
      setMessage({ type: "error", text: `Gagal menghapus data: ${error.message}` });
    } else {
      setMessage({ type: "success", text: "Data murid berhasil dihapus." });
      await loadMurid();
      if (editingId === nomorRegistrasi) resetForm();
    }
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="badge">Master Presensi</p>
          <h1>CRUD Data Murid</h1>
          <p className="muted">Kelola data murid sebagai dasar app presensi.</p>
        </div>
        <div className="header-actions">
          <Link href="/page2" className="button secondary">
            Buka Halaman 2
          </Link>
          <button className="button ghost" onClick={loadMurid} disabled={loading}>
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </header>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="grid">
        <section className="card">
          <div className="section-title">
            <h2>{editingId ? "Edit Murid" : "Tambah Murid"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="form-grid two">
            <div className="field">
              <label htmlFor="nomor_registrasi">Nomor Registrasi</label>
              <input
                id="nomor_registrasi"
                value={form.nomor_registrasi}
                onChange={(event) => updateForm("nomor_registrasi", event.target.value)}
                placeholder="Contoh: REG-001"
                disabled={Boolean(editingId)}
              />
            </div>

            <div className="field">
              <label htmlFor="tanggal_registrasi">Tanggal Registrasi</label>
              <input
                id="tanggal_registrasi"
                type="date"
                value={form.tanggal_registrasi}
                onChange={(event) => updateForm("tanggal_registrasi", event.target.value)}
              />
            </div>

            <div className="field full">
              <label htmlFor="nama_lengkap">Nama Lengkap</label>
              <input
                id="nama_lengkap"
                value={form.nama_lengkap}
                onChange={(event) => updateForm("nama_lengkap", event.target.value)}
                placeholder="Nama lengkap murid"
              />
            </div>

            <div className="field">
              <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
              <select
                id="jenis_kelamin"
                value={form.jenis_kelamin}
                onChange={(event) => updateForm("jenis_kelamin", event.target.value)}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="usia">Usia</label>
              <input
                id="usia"
                type="number"
                min="0"
                value={form.usia}
                onChange={(event) => updateForm("usia", event.target.value)}
                placeholder="Contoh: 20"
              />
            </div>

            <div className="field full">
              <label htmlFor="alamat_lengkap">Alamat Lengkap</label>
              <textarea
                id="alamat_lengkap"
                value={form.alamat_lengkap}
                onChange={(event) => updateForm("alamat_lengkap", event.target.value)}
                placeholder="Alamat lengkap"
              />
            </div>

            <div className="field">
              <label htmlFor="kota">Kota</label>
              <input
                id="kota"
                value={form.kota}
                onChange={(event) => updateForm("kota", event.target.value)}
                placeholder="Contoh: Yogyakarta"
              />
            </div>

            <div className="field">
              <label htmlFor="no_whatsapp">No Whatsapp</label>
              <input
                id="no_whatsapp"
                value={form.no_whatsapp}
                onChange={(event) => updateForm("no_whatsapp", event.target.value)}
                placeholder="Contoh: 6281234567890"
              />
            </div>

            <div className="field">
              <label htmlFor="pekerjaan">Pekerjaan</label>
              <input
                id="pekerjaan"
                value={form.pekerjaan}
                onChange={(event) => updateForm("pekerjaan", event.target.value)}
                placeholder="Opsional"
              />
            </div>

            <div className="field">
              <label htmlFor="nama_instansi">Nama Instansi</label>
              <input
                id="nama_instansi"
                value={form.nama_instansi}
                onChange={(event) => updateForm("nama_instansi", event.target.value)}
                placeholder="Opsional"
              />
            </div>

            <div className="form-actions full">
              <button className="button full-width" type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editingId ? "Update Data" : "Tambah Data"}
              </button>
              <button className="button ghost full-width" type="button" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="section-title">
            <h2>Daftar Murid</h2>
            <span className="badge">{filteredMurid.length} data</span>
          </div>

          <div className="field search-box">
            <label htmlFor="keyword">Cari Murid</label>
            <input
              id="keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Cari nama, kota, whatsapp, instansi..."
            />
          </div>

          {loading ? (
            <div className="empty">Memuat data...</div>
          ) : filteredMurid.length === 0 ? (
            <div className="empty">Belum ada data murid.</div>
          ) : (
            <div className="murid-list">
              {filteredMurid.map((murid) => (
                <article className="murid-item" key={murid.nomor_registrasi}>
                  <div className="murid-top">
                    <div>
                      <h3>{murid.nama_lengkap}</h3>
                      <span className="badge">{murid.nomor_registrasi}</span>
                    </div>
                    <span className="muted">Daftar: {murid.tanggal_registrasi}</span>
                  </div>

                  <div className="murid-meta">
                    <span>
                      {murid.jenis_kelamin}, {murid.usia} tahun
                    </span>
                    <span>{murid.alamat_lengkap}</span>
                    <span>
                      {murid.kota} · WA: {murid.no_whatsapp}
                    </span>
                    <span>
                      {murid.pekerjaan || "Pekerjaan belum diisi"}
                      {murid.nama_instansi ? ` · ${murid.nama_instansi}` : ""}
                    </span>
                  </div>

                  <div className="murid-actions">
                    <button className="button secondary" onClick={() => handleEdit(murid)}>
                      Edit
                    </button>
                    <button className="button danger" onClick={() => handleDelete(murid.nomor_registrasi)}>
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
