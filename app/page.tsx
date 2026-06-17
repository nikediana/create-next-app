import Link from "next/link";
import MuridCrud from "@/components/MuridCrud";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="badge">Master App Presensi</p>

        <h1>CRUD Data Murid</h1>

        <p className="description">
          Halaman ini digunakan untuk mengelola data murid sebagai master data
          untuk aplikasi presensi.
        </p>

        <Link href="/page2" className="button secondary">
          Buka Page 2
        </Link>
      </section>

      <MuridCrud />
    </main>
  );
}