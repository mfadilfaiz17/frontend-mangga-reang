import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProducts, formatRupiah } from "./products";
import FilterPanel from "./FilterPanel";

// Opsi filter (Tetap statis untuk mempercepat purwarupa UI)
const lokasiOptions = [
  "Indramayu",
  "Majalengka",
  "Cirebon",
  "Subang",
];

const jenisOptions = [
  "Harum Manis",
  "Manalagi",
  "Gedong Gincu",
  "Madu",
];

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

const toArray = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

// HALAMAN UTAMA SHOP
export default function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white p-10 flex flex-col items-center justify-center">
          <p className="text-2xl font-black text-black animate-pulse">Memuat Katalog B2B...</p>
        </main>
      }
    >
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}

// KOMPONEN YANG MEMBACA SEARCH PARAMS & FETCH DATA BACKEND
async function ShopContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Menarik data parameter URL dan Data API Backend secara bersamaan (paralel) agar web tidak lemot
  const [params, products] = await Promise.all([
    searchParams,
    fetchProducts()
  ]);

  const q = toArray(params.q)[0]?.toLowerCase().trim() ?? "";
  const lokasi = toArray(params.lokasi);
  const jenis = toArray(params.jenis);
  const min = Number(toArray(params.min)[0]) || 0;
  const max = Number(toArray(params.max)[0]) || Infinity;

  const activeCount =
    lokasi.length + jenis.length + (min ? 1 : 0) + (max !== Infinity ? 1 : 0);

  // FILTER PRODUK DINAMIS
  const filtered = products.filter((p) => {
    const text = `${p.name} ${p.supplier} ${p.address}`.toLowerCase();

    return (
      (!q || text.includes(q)) &&
      (lokasi.length === 0 || lokasi.some((l) => p.address.includes(l))) &&
      (jenis.length === 0 || jenis.some((j) => p.name.includes(j))) &&
      p.price >= min &&
      p.price <= max
    );
  });

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">

        {/* HEADER */}
        <header className="relative flex min-h-48 items-center gap-3 pt-40 sm:gap-8 min-[701px]:pt-14 lg:pr-64">
          <div className="w-fit shrink-0">
            <p className="font-serif text-[length:clamp(0.75rem,3.6vw,1.1rem)] uppercase tracking-wider text-black sm:text-4xl lg:text-5xl">
              Juragan Mangga
            </p>

            <p className="mt-1 flex justify-between text-[length:clamp(1.5rem,7vw,2.25rem)] font-black leading-none text-[#FFA800] sm:text-6xl lg:text-7xl">
              {"REANG".split("").map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </p>

            <div className="mt-3 h-1.5 w-full bg-[#FFA800]" />
          </div>

          <div className="h-14 w-0.5 shrink-0 bg-black sm:h-28" />

          <h1 className="text-[length:clamp(1.9rem,9vw,2.5rem)] font-black uppercase leading-none text-black drop-shadow-[0_12px_14px_rgba(0,0,0,0.25)] sm:text-7xl lg:text-8xl xl:text-9xl">
            Shop
          </h1>

          <Image
            src="/images/manggaLandingP.png"
            alt="Mangga segar"
            width={320}
            height={260}
            priority
            className="pointer-events-none absolute right-0 top-0 z-0 hidden w-60 drop-shadow-2xl lg:block"
          />
        </header>

        <form action="/shop" method="GET">

          {/* SEARCH BAR */}
          <div className="relative z-10 mt-6 flex max-w-4xl items-center rounded-full border-[3px] border-black bg-white px-4 py-2 shadow-md sm:px-6">
            <input
              type="search"
              name="q"
              defaultValue={toArray(params.q)[0] ?? ""}
              placeholder="CARI STOK MANGGA B2B TERBAIK"
              aria-label="Cari mangga"
              className="min-w-0 flex-1 bg-transparent text-xs uppercase tracking-wide text-stone-700 text-ellipsis outline-none placeholder:text-stone-400 sm:text-sm"
            />

            <button
              type="submit"
              aria-label="Cari"
              className="text-2xl"
            >
              🔍
            </button>
          </div>

          {/* PANEL ORANYE */}
          <div className="-mt-7 rounded-t-[3rem] bg-[#FFA800] px-4 pb-0 pt-12 shadow-[0_0_60px_rgba(255,168,0,0.6)] sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row">

              {/* FILTER RESPONSIF (Memanggil komponen eksternal) */}
              <FilterPanel activeCount={activeCount}>

                {/* FILTER LOKASI */}
                <fieldset className="mt-3">
                  <legend className="text-xs font-black uppercase text-black">
                    Lokasi
                  </legend>

                  <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 sm:block sm:space-y-0.5">
                    {lokasiOptions.map((l) => (
                      <li key={l}>
                        <label className="flex cursor-pointer items-center gap-2 py-1 text-xs sm:py-0 uppercase tracking-wide text-stone-800">
                          <input
                            type="checkbox"
                            name="lokasi"
                            value={l}
                            defaultChecked={lokasi.includes(l)}
                            className="size-4 accent-black sm:size-3"
                          />
                          {l}
                        </label>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 text-xs uppercase text-stone-400">
                    Lainnya &gt;
                  </p>
                </fieldset>

                <hr className="my-2 border-black" />

                {/* FILTER JENIS MANGGA */}
                <fieldset>
                  <legend className="text-xs font-black uppercase text-black">
                    Jenis Mangga
                  </legend>

                  <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 sm:block sm:space-y-0.5">
                    {jenisOptions.map((j) => (
                      <li key={j}>
                        <label className="flex cursor-pointer items-center gap-2 py-1 text-xs sm:py-0 uppercase tracking-wide text-stone-800">
                          <input
                            type="checkbox"
                            name="jenis"
                            value={j}
                            defaultChecked={jenis.includes(j)}
                            className="size-4 accent-black sm:size-3"
                          />
                          {j}
                        </label>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 text-xs uppercase text-stone-400">
                    Lainnya &gt;
                  </p>
                </fieldset>

                <hr className="my-2 border-black" />

                {/* FILTER HARGA */}
                <fieldset>
                  <legend className="text-xs font-black uppercase text-black">
                    Harga / Ton
                  </legend>

                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <input
                      type="number"
                      name="min"
                      min={0}
                      placeholder="MIN"
                      defaultValue={toArray(params.min)[0] ?? ""}
                      aria-label="Harga minimum"
                      className="w-full min-w-0 rounded-full bg-white px-3 py-2 text-sm shadow-md sm:px-2 sm:py-1 sm:text-[10px] outline-none placeholder:text-stone-300"
                    />

                    <span>&gt;</span>

                    <input
                      type="number"
                      name="max"
                      min={0}
                      placeholder="MAX"
                      defaultValue={toArray(params.max)[0] ?? ""}
                      aria-label="Harga maksimum"
                      className="w-full min-w-0 rounded-full bg-white px-3 py-2 text-sm shadow-md sm:px-2 sm:py-1 sm:text-[10px] outline-none placeholder:text-stone-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mx-auto mt-3 block w-full rounded-full bg-[#FFA800] px-8 py-3 sm:w-auto text-xs font-bold sm:mt-2 sm:px-5 sm:py-0.5 sm:text-[10px] uppercase text-black shadow-md transition hover:brightness-95"
                  >
                    Apply
                  </button>
                </fieldset>

                <hr className="mt-3 border-black" />
              </FilterPanel>

              {/* GRID PRODUK B2B */}
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="mango-scroll grid max-h-none min-w-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pb-6 pr-0 sm:max-h-[75vh] sm:gap-5 sm:pr-2 sm:grid-cols-3 xl:grid-cols-4">

                  {filtered.length === 0 && (
                    <p className="col-span-full py-16 text-center font-bold text-black">
                      Stok mangga tidak ditemukan. Coba ubah kata kunci pencarian.
                    </p>
                  )}

                  {filtered.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/shop/${product.slug}`}
                      className="block rounded-[2.2rem] bg-[#F5A000] p-2 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.18),0_4px_8px_rgba(0,0,0,0.12)] transition hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem] bg-white">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1280px) 20vw, 50vw"
                          className="object-contain p-2"
                        />
                        {/* Label Badge Grade / Stok */}
                        <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                          {product.stockTons} Ton
                        </div>
                      </div>

                      <div className="px-2 pb-4 pt-3">
                        <h3 className="text-xs font-black uppercase tracking-wide text-black">
                          {product.name}
                        </h3>

                        <p className="mt-0.5 font-mono text-base font-black sm:text-xl text-black">
                          {formatRupiah(product.price)}
                        </p>

                        <p className="mt-0.5 text-xs font-medium uppercase leading-tight tracking-wide text-white sm:text-sm">
                          {product.supplier}
                        </p>

                        <p className="text-xs font-medium uppercase leading-tight tracking-wide text-white sm:text-sm">
                          {product.address}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* SCROLLBAR DEKORATIF */}
                <div
                  aria-hidden="true"
                  className="hidden h-[75vh] w-3 shrink-0 rounded-full bg-[#D48A00] lg:block"
                >
                  <div className="m-0.5 h-24 rounded-full bg-[#FFC21A]" />
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* CUSTOM SCROLLBAR */}
      <style>{`
        .mango-scroll {
          scrollbar-width: thin;
          scrollbar-color: #FFC21A transparent;
        }
      `}</style>
    </main>
  );
}