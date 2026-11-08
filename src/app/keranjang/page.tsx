import Link from "next/link";

export default function KeranjangPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="max-w-xl text-center">
        <h1 className="text-4xl font-black uppercase">Keranjang B2B</h1>
        <p className="mt-4 text-lg">
          Keranjang retail tidak digunakan dalam alur platform ini. Pilih
          inventaris dan ajukan RFQ berdasarkan tonase yang dibutuhkan.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-[#1EEB1E] px-6 py-3 font-black uppercase text-black"
        >
          Buka katalog inventaris
        </Link>
      </section>
    </main>
  );
}