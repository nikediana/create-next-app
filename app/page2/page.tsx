import Link from "next/link";

export default function Page2() {
  return (
    <main className="page">
      <section className="hero">
        <p className="badge">Page 2</p>

        <h1>Sekarang mulai dengan Vibe Coding!</h1>

        <p className="description">
          Ini adalah halaman kedua sederhana untuk latihan App Router di
          Next.js.
        </p>

        <Link href="/" className="button secondary">
          Kembali ke Page 1
        </Link>
      </section>
    </main>
  );
}