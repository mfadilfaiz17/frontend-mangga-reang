import React from 'react';

// Next.js App Router mewajibkan export default untuk halaman
export default function DetailProduk({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1>Detail Produk</h1>
      <p>Menampilkan produk dengan ID: {params.id}</p>
    </div>
  );
}