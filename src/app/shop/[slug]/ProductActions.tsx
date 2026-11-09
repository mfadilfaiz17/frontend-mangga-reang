"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../products";

const formatTotal = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

// Skala B2B/Grosir murni
const VARIANTS = [
  { label: "1 Ton", tons: 1 },
  { label: "5 Ton", tons: 5 },
  { label: "10 Ton", tons: 10 },
  { label: "20 Ton", tons: 20 },
];

const UNITS = [
  { label: "Ton", tons: 1 },
];

export default function ProductActions({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();

  const [variant, setVariant] = useState<string | null>("1 Ton");
  const [jumlah, setJumlah] = useState("");
  const [satuan, setSatuan] = useState("Ton");
  const [notice, setNotice] = useState("");

  const customQty = Number(jumlah) || 0;
  const customTons =
    customQty * (UNITS.find((u) => u.label === satuan)?.tons ?? 1);

  const variantTons =
    VARIANTS.find((v) => v.label === variant)?.tons ?? 0;

  const usingCustom = customQty > 0;
  const totalTons = usingCustom ? customTons : variantTons;
  const label = usingCustom
    ? `${customQty} ${satuan}`
    : variant ?? "-";

  const total = totalTons * product.price;

  const pill = (active: boolean) =>
    `rounded-full px-3 py-0.5 text-[10px] font-bold shadow-sm transition focus-visible:outline-2 focus-visible:outline-black ${
      active
        ? "bg-black text-white"
        : "bg-white text-black hover:bg-stone-100"
    }`;

  // =========================
  // DIRECT CHECKOUT B2B
  // =========================
  const handleCheckout = () => {
    if (totalTons <= 0) {
      setNotice("Masukkan jumlah pesanan yang valid.");
      return;
    }

    const params = new URLSearchParams({
      inventoryId: String(product.id), // ID database untuk API FastAPI (Wajib)
      name: product.name,
      price: String(product.price),
      quantity: String(totalTons),
      label: label,
      supplier: product.supplier,
      address: product.address,
      image: product.image,
    });

    router.push(`/checkout?${params.toString()}`);
  };

  // =========================
  // SIMULASI KERANJANG (Hanya UI)
  // =========================
  const handleCart = () => {
    if (totalTons <= 0) return;
    
    // Fitur cart dimatikan untuk mencegah error, hanya menampilkan notifikasi UI
    setNotice(`Fitur keranjang sedang dalam pengembangan. Silakan gunakan tombol Checkout langsung.`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">

        {/* VARIAN TONASE */}
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-black uppercase tracking-wide text-black sm:text-4xl">
            Varian
          </h2>

          <div
            className="grid grid-cols-4 gap-1"
            role="group"
            aria-label="Pilih varian tonase B2B"
          >
            {VARIANTS.map((v) => (
              <button
                key={v.label}
                type="button"
                aria-pressed={!usingCustom && variant === v.label}
                onClick={() => {
                  setVariant(v.label);
                  setJumlah("");
                  setNotice("");
                }}
                className={pill(!usingCustom && variant === v.label)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM INPUT */}
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-black uppercase tracking-wide text-black sm:text-4xl">
            Custom
          </h2>

          <input
            type="number"
            min={0}
            value={jumlah}
            onChange={(e) => {
              setJumlah(e.target.value);
              setNotice("");
            }}
            placeholder="Jumlah (Ton)"
            aria-label="Masukan jumlah tonase"
            className="w-28 rounded-lg bg-white px-2 py-2 text-center text-[10px] font-bold outline-none placeholder:text-stone-500 focus-visible:outline-2 focus-visible:outline-black"
          />

          <select
            value={satuan}
            onChange={(e) => setSatuan(e.target.value)}
            aria-label="Pilih satuan"
            className="rounded-lg bg-black px-2 py-2 text-center text-[10px] font-bold text-white outline-none"
          >
            {UNITS.map((u) => (
              <option key={u.label} value={u.label}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex items-center gap-3 lg:ml-auto">
          <button
            type="button"
            disabled={totalTons <= 0}
            onClick={handleCheckout}
            className="rounded-full bg-[#1EEB1E] px-3 py-1 text-sm font-black uppercase text-black shadow-md transition hover:scale-105 hover:brightness-95 disabled:opacity-50"
          >
            Checkout
          </button>

          <button
            type="button"
            disabled={totalTons <= 0}
            onClick={handleCart}
            className="rounded-full bg-[#FFF200] px-3 py-1 text-sm font-black uppercase text-black shadow-md transition hover:scale-105 hover:brightness-95 disabled:opacity-50"
          >
            Keranjang
          </button>
        </div>
      </div>

      {/* TOTAL ESTIMASI HARGA */}
      <p className="mt-3 text-sm font-bold text-black" aria-live="polite">
        Total Estimasi: {formatTotal(total)}
        <span className="font-medium text-black/70">
          {" "}({label})
        </span>
      </p>

      {/* NOTIFIKASI */}
      {notice && (
        <p className="mt-1 text-xs font-bold text-black/80" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}