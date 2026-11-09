import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProducts, formatRupiah } from "../products";
import ProductActions from "./ProductActions";
// 1. TAMBAHKAN IMPORT INI
import { headers } from "next/headers"; 

type Params = Promise<{ slug: string }>;

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  // 2. TAMBAHKAN BARIS INI
  // Memaksa halaman menjadi dinamis (SSR) agar tidak error saat Vercel build
  await headers(); 

  const { slug } = await params;
  
  // Menarik data dari API Backend
  const products = await fetchProducts();
  const product = products.find((item) => item.slug === slug);
  
  // Jika URL tidak cocok dengan slug mana pun di database, arahkan ke halaman 404 (not-found.tsx)
  if (!product) notFound();

  // Logika Rekomendasi Produk Lainnya (Maksimal 4 produk)
  const others = products.filter((p) => p.slug !== product.slug);
  const sameType = others.filter((p) => p.name === product.name);
  const related = [...sameType, ...others.filter((p) => p.name !== product.name)].slice(0, 4);

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        
        {/* ===== Header ===== */}
        <header className="relative flex min-h-48 items-center gap-4 pt-10 sm:gap-8 sm:pt-14 lg:pr-64">
          <Link href="/shop" aria-label="Kembali ke Shop" className="w-fit shrink-0">
            <p className="font-serif text-2xl uppercase tracking-wider text-black sm:text-4xl lg:text-5xl transition hover:opacity-70">
              Juragan Mangga
            </p>
            <p className="mt-1 flex justify-between text-4xl font-black leading-none text-[#FFA800] sm:text-6xl lg:text-7xl transition hover:opacity-70">
              {"REANG".split("").map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </p>
            <div className="mt-3 h-1.5 w-full bg-[#FFA800]" />
          </Link>

          <div className="h-20 w-0.5 shrink-0 bg-black sm:h-28" />

          <div>
            <h1 className="text-5xl font-black uppercase leading-none text-black drop-shadow-[0_12px_14px_rgba(0,0,0,0.25)] sm:text-7xl lg:text-8xl">
              Shop
            </h1>
            <p className="mt-1 flex justify-between font-serif text-lg uppercase text-black sm:text-3xl">
              {"PRODUCT".split("").map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </p>
          </div>

          <Image
            src="/images/manggaLandingP.png"
            alt=""
            width={320}
            height={260}
            priority
            className="pointer-events-none absolute right-0 top-0 z-0 hidden w-60 drop-shadow-2xl lg:block"
          />
        </header>

        {/* ===== Search bar ===== */}
        <form action="/shop" method="GET">
          <div className="relative z-10 mt-6 flex max-w-4xl items-center rounded-full border-[3px] border-black bg-white px-6 py-2 shadow-md">
            <input
              type="search"
              name="q"
              placeholder="CARI STOK MANGGA B2B TERBAIK"
              aria-label="Cari mangga"
              className="min-w-0 flex-1 bg-transparent text-sm uppercase tracking-wide text-stone-700 outline-none placeholder:text-stone-400"
            />
            <button type="submit" aria-label="Cari" className="text-2xl">
              🔍
            </button>
          </div>
        </form>

        {/* ===== Panel oranye ===== */}
        <div className="-mt-7 rounded-t-[3rem] bg-[#FFA800] px-4 pb-10 pt-12 shadow-[0_0_60px_rgba(255,168,0,0.6)] sm:px-7">
          <div className="flex gap-3">
            <div className="min-w-0 flex-1 lg:pr-6">
              
              {/* ----- Kartu detail utama ----- */}
              <article className="flex flex-col items-center gap-5 rounded-[2.5rem] border-[3px] border-[#D48A00] bg-[#FFA800] p-4 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.15)] sm:flex-row sm:gap-10 sm:p-8">
                <div className="relative aspect-square w-full max-w-56 shrink-0 overflow-hidden rounded-4xl bg-white shadow-inner">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority
                    sizes="224px"
                    className="object-contain p-3"
                  />
                  {/* Badge Label Stok yang tersisa di Gudang */}
                  <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
                    Sisa Stok: {product.stockTons} Ton
                  </div>
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
                    {product.name}
                  </h2>
                  <p className="mt-2 font-mono text-4xl font-black text-black sm:text-6xl">
                    {formatRupiah(product.price)}
                  </p>
                  <p className="mt-3 text-lg font-medium uppercase leading-tight tracking-wider text-white sm:text-3xl">
                    Grade: {product.grade.replace("GRADE_", "")}
                  </p>
                  <p className="mt-1 text-base font-bold uppercase leading-tight tracking-wider text-black/70 sm:text-xl">
                    {product.supplier} | {product.address}
                  </p>
                </div>
              </article>

              {/* ----- Varian, custom, checkout (Memanggil ProductActions.tsx B2B) ----- */}
              <div className="mt-6 px-2 sm:px-6">
                <ProductActions product={product} />
              </div>

              {/* ----- Info supplier ----- */}
              <div className="mt-6 flex w-fit max-w-full items-stretch overflow-hidden rounded-full bg-[#D48A00] sm:ml-6">
                <div className="flex min-w-0 items-center gap-3 rounded-full bg-white px-4 py-1.5 sm:gap-5 sm:px-5">
                  <span className="text-sm font-black uppercase tracking-wide text-black sm:text-2xl">
                    Info Supplier
                  </span>
                  <span className="truncate text-sm font-bold uppercase tracking-widest text-[#FFA800] sm:text-2xl">
                    {product.supplier}
                  </span>
                </div>
                <Link
                  href={`/shop?q=${encodeURIComponent(product.supplier)}`}
                  className="flex items-center px-5 text-sm font-black uppercase tracking-widest text-black transition hover:opacity-70 sm:px-8"
                >
                  Kunjungi
                </Link>
              </div>

              {/* ----- Produk lainnya ----- */}
              <h2 className="mt-5 flex items-center gap-2 px-2 text-xl font-black uppercase tracking-wide text-black sm:ml-6 sm:text-2xl">
                Rekomendasi Grosir Lainnya
                <span aria-hidden="true">↓</span>
              </h2>

              <ul className="mt-3 grid grid-cols-2 gap-4 sm:ml-6 sm:gap-8 lg:grid-cols-4">
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="group block rounded-t-[3rem] rounded-b-2xl border-[6px] border-[#D48A00] bg-white p-1 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-t-[2.4rem]">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(min-width: 1024px) 15vw, 40vw"
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="px-2 pb-2 pt-1 text-center">
                        <p className="text-[10px] font-black uppercase text-black line-clamp-1">{p.name}</p>
                        <p className="font-mono text-xs font-black text-[#D48A00] mt-0.5">
                          {formatRupiah(p.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Track scrollbar dekoratif sesuai desain */}
            <div
              aria-hidden="true"
              className="hidden h-[70vh] w-3 shrink-0 rounded-full bg-[#D48A00] lg:block"
            >
              <div className="m-0.5 h-20 rounded-full bg-[#FFC21A]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}