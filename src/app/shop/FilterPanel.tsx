"use client";

import { useState, type ReactNode } from "react";

export default function FilterPanel({
  children,
  activeCount = 0,
}: {
  children: ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="h-fit w-full shrink-0 rounded-3xl bg-white p-5 lg:sticky lg:top-6 lg:w-60 shadow-md">
      {/* Tombol toggle: hanya tampil di layar kecil (HP & tablet) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filter-body"
        className="flex w-full items-center justify-between lg:hidden focus:outline-none"
      >
        <span className="text-xl font-black uppercase tracking-[0.35em] text-black">
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
        <span
          aria-hidden="true"
          className={`text-xl font-bold transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* 
        Isi filter (Children): tertutup di HP, tapi selalu terbuka di Desktop.
        Catatan: Sengaja menggunakan CSS 'hidden' alih-alih menghapus dari DOM, 
        agar input form di dalamnya tetap bisa disubmit/dikirim ke URL.
      */}
      <div id="filter-body" className={`${open ? "block mt-4" : "hidden"} lg:block lg:mt-0 transition-all`}>
        <h2 className="hidden text-2xl font-black uppercase tracking-[0.45em] text-black lg:block">
          Filter
        </h2>
        {children}
      </div>
    </aside>
  );
}