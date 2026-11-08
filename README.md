Frontend Next.js untuk Juragan Mangga Reang, yaitu platform B2B supply chain
dan katalog mangga. Produk ini bukan toko retail/B2C; checkout mengirim RFQ
berbasis ton ke backend.

Frontend production mendukung area sesuai role:

- `BUYER_B2B`: katalog, pengajuan RFQ, pesanan, dan tracking.
- `PETANI`: dashboard untuk menambah inventaris.
- `ADMIN_GUDANG`: dashboard untuk approval RFQ dan update tracking/QC.

Operasional production dilakukan melalui halaman `/dashboard`, bukan Swagger
UI. Swagger/OpenAPI hanya boleh digunakan untuk inspeksi atau pengembangan
backend, bukan sebagai antarmuka pengguna.

Panduan integrasi API, autentikasi, RFQ, dan tracking ada di
[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Jalankan backend pada `http://127.0.0.1:8000` dan buat `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Untuk deployment Vercel, isi `NEXT_PUBLIC_API_URL` dengan URL backend Render,
misalnya `https://mangga-reang-api.onrender.com`. Jangan masukkan
`DATABASE_URL`, `SECRET_KEY`, atau credential SMTP ke environment frontend.

Setelah login, buka `/dashboard` untuk role `PETANI` atau `ADMIN_GUDANG`.
Buyer menggunakan `/shop`, `/checkout`, dan `/pesanan`.
Semua role yang sudah login dapat membuka `/profil` untuk melihat dan
memperbarui nama serta nama perusahaan. Email dan role bersifat read-only.
Semua role dapat membuka `/notifikasi` untuk melihat notifikasi aktivitas
frontend. Notifikasi saat ini disimpan di `localStorage` browser dan bukan
pengganti notifikasi backend, email, WhatsApp, atau push notification.
Login menyediakan `/lupa-password` dan `/reset-password` untuk reset password
melalui link email SMTP yang dikirim backend.

UI/UX mengikuti tema Juragan Mangga Reang: latar cream, aksen kuning-oranye,
teks uppercase untuk label utama, kartu rounded, dan state error/sukses yang
terlihat jelas. Fitur baru wajib mempertahankan pola visual ini tanpa
mengubah kontrak B2B atau menambahkan alur retail.

## Status Login Google dan WhatsApp

Tombol Google dan WhatsApp belum menjadi login aktif. Rencana integrasi:

- Google OAuth/OIDC langsung melalui Google Cloud OAuth Client.
- WhatsApp OTP melalui Meta WhatsApp Cloud API.

Tombol tidak boleh mengklaim login berhasil sebelum backend menyelesaikan
callback/token exchange atau verifikasi OTP. Credential provider diatur
melalui environment backend dan tidak boleh ditulis di frontend, commit, atau
file dokumentasi. Sebelum provider dikonfigurasi, tombol sosial harus
disabled atau menampilkan bahwa integrasi belum diaktifkan.

Etalase 3D, bila digunakan, hanya berfungsi sebagai visualisasi produk.
Sumber stok, harga, RFQ, QC, dan tracking tetap berasal dari backend.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
