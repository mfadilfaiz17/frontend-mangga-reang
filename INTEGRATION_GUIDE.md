# Panduan Integrasi Frontend - Backend

Dokumen ini menjadi urutan kerja integrasi FE dengan backend Mangga Reang.
Fokus tahap awal adalah membuat alur data berjalan; perubahan tampilan
dikerjakan setelah integrasi API stabil.

## Batas Produk dari Proposal

- Produk ini adalah platform B2B supply chain untuk pembelian partai besar,
  bukan toko retail/B2C.
- `tonaseDiminta` menggunakan satuan ton. Jangan mengirim kuantitas kilogram
  sebagai tonase RFQ.
- Katalog stok, RFQ, QC, dan tracking adalah alur bisnis utama.
- Etalase 3D hanya visualisasi frontend untuk varietas Gedong Gincu,
  Harumanis, dan Cengkir; stok dan harga tetap diambil dari API.
- QC dan status logistik diperbarui manual oleh admin pada tahap prototipe.
- Payment gateway, invoice/payment settlement, GPS real-time, chat, dan
  notifikasi eksternal belum tersedia.

## Status Implementasi

### Notifikasi frontend

Halaman `/notifikasi` menampilkan notifikasi aktivitas yang dibuat frontend,
termasuk konfirmasi RFQ berhasil diajukan. Data disimpan lokal di browser,
dapat ditandai sudah dibaca, dan tidak mengklaim sebagai notifikasi lintas
akun. Backend sekarang menyediakan notifikasi user-scoped melalui
`GET /api/notifications/me` dan `PATCH /api/notifications/me/read-all`.
Halaman frontend ini masih memakai localStorage dan belum mengonsumsi
endpoint tersebut; integrasi API frontend diperlukan sebelum fitur dianggap
lintas browser atau production-ready. Email, WhatsApp, dan push tetap berada
di luar scope hingga provider tersedia.

Alur berikut sudah tersambung:

- Register buyer melalui `POST /api/auth/register`.
- Login buyer dan penyimpanan `accessToken`.
- Pengambilan produk dari `GET /api/mangga/`.
- Checkout membuat RFQ melalui `POST /api/rfq/`.
- Halaman `/pesanan` membaca RFQ buyer dan tracking logistik.

## Prioritas Pertama

Hal pertama yang harus diselesaikan adalah **koneksi FE ke backend dan alur
autentikasi**:

1. Pastikan backend hidup dan dapat diakses.
2. Konfigurasikan URL backend pada environment FE.
3. Integrasikan register.
4. Integrasikan login.
5. Simpan `accessToken` setelah login dan kirim sebagai Bearer token.
6. Uji alur register -> login -> request terautentikasi.

Jangan mengintegrasikan checkout atau merapikan tampilan sebelum keenam
langkah tersebut berhasil.

## Menjalankan Backend

Dari repository backend:

```powershell
python -m alembic upgrade head
python -m uvicorn main:app --reload
```

Backend berjalan pada:

```text
http://127.0.0.1:8000
```

Verifikasi:

```text
http://127.0.0.1:8000/health
```

Operasional admin dan petani dilakukan melalui dashboard frontend pada
`http://localhost:3000/dashboard` setelah login dengan role yang sesuai.
Swagger/OpenAPI hanya artefak pengembangan backend dan bukan bagian dari
workflow production.

## Konfigurasi FE

Buat file `.env.local` di root repository FE:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Database Supabase hanya dikonfigurasi di environment backend melalui
`DATABASE_URL`; frontend tidak boleh menerima connection string, password
database, `SECRET_KEY`, atau credential SMTP. Frontend tetap berkomunikasi
dengan backend melalui `NEXT_PUBLIC_API_URL`.

`.env.local` tidak boleh di-commit. Gunakan nilai yang sama dengan host dan
port backend yang sedang dijalankan.

## Aturan Kontrak API

- Semua request menggunakan `Content-Type: application/json`.
- Field JSON menggunakan `camelCase`.
- Prefix endpoint adalah `/api`.
- Error minimal memiliki field `detail`.
- Nilai enum menggunakan `UPPER_SNAKE_CASE`.
- Request terautentikasi menggunakan:

```http
Authorization: Bearer <accessToken>
```

Contoh helper dasar:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;

  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: ["Bearer", token].join(" ") }
        : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request gagal (${response.status})`);
  }

  return response.json() as Promise<T>;
}
```

## Tahap Integrasi

### 1. Register

Endpoint:

```text
POST /api/auth/register
```

Payload buyer:

```json
{
  "email": "buyer@example.com",
  "password": "password123",
  "namaLengkap": "Buyer B2B",
  "role": "BUYER_B2B",
  "namaPerusahaan": "PT Contoh"
}
```

Register publik hanya boleh menggunakan `PETANI` atau `BUYER_B2B`.
`ADMIN_GUDANG` dibuat melalui provisioning backend.

### 2. Login

Endpoint:

```text
POST /api/auth/login
```

Payload:

```json
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

Setelah login, frontend memanggil `GET /api/auth/me` untuk memvalidasi session
dan menentukan dashboard berdasarkan role server.

### 2.1 Profil

Halaman `/profil` membaca identitas dari `GET /api/auth/me` dan memperbarui
nama serta perusahaan melalui `PATCH /api/auth/me`. Email dan role hanya
ditampilkan sebagai informasi dan tidak dapat diubah dari frontend.
Tombol `LOGOUT` menghapus access token dan session user, lalu mengarahkan user
keluar dari `/profil` ke beranda. Jika session kedaluwarsa saat halaman profil
dibuka, frontend juga membersihkan session dan melakukan redirect otomatis.
Halaman yang sama menyediakan perubahan password melalui
`POST /api/auth/me/password`; password lama wajib diverifikasi.
Response `204 No Content` diperlakukan sebagai sukses tanpa parsing JSON.
Setelah berhasil, kedua field password dikosongkan. Field password memiliki
kontrol tampil/sembunyi untuk membantu input tanpa menyimpan password di
frontend.

### 2.2 Reset password melalui email

Login menyediakan link **Lupa password?** ke `/lupa-password`. User
memasukkan email dan frontend memanggil `POST /api/auth/password-reset/request`.
Untuk alasan keamanan, UI menampilkan pesan generik yang sama untuk email
terdaftar maupun tidak terdaftar.

Link dari email membuka `/reset-password?token=...`. Halaman tersebut
memanggil `POST /api/auth/password-reset/confirm`, memvalidasi password baru
dan konfirmasi di browser, lalu menampilkan status berhasil atau error token.
Token tidak disimpan di localStorage dan tidak pernah ditampilkan oleh response
API. SMTP dikonfigurasi hanya di backend melalui `.env`.

### 2.3 Login pihak ketiga (planned)

Login Google memakai Google OAuth/OIDC dan login WhatsApp memakai OTP Meta
WhatsApp Cloud API. Keduanya belum aktif pada environment lokal. Jangan
menganggap tombol sosial sebagai autentikasi berhasil sebelum backend
memvalidasi callback/provider dan menerbitkan session internal.

Konfigurasi yang direncanakan berada di environment backend:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_OTP_TEMPLATE_NAME=
```

Nilai di atas hanya nama variabel dan placeholder. Jangan mengisi secret di
repository atau mengirimkannya melalui issue/chat.

Response:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "bearer"
}
```

Simpan `accessToken` hanya setelah response berhasil. Jangan menyimpan
password.

### 3. Ambil Produk

Endpoint publik:

```text
GET /api/mangga/?offset=0&limit=50
```

Gunakan response backend sebagai sumber data produk, bukan array hardcode.
Backend mengembalikan `hargaPerTon`. Tampilkan dan input pembelian dalam ton
untuk menjaga konteks B2B; jangan mengubah RFQ menjadi pembelian kilogram.

### 4. Buat RFQ dari Checkout

Endpoint:

```text
POST /api/rfq/
```

Wajib menggunakan token buyer:

```json
{
  "idMangga": 1,
  "tonaseDiminta": 2
}
```

Status awal dibuat server sebagai `PENDING`. FE tidak mengirim status final.
Checkout hanya mengirim RFQ; pilihan `TRANSFER`, `COD`, `QRIS`, atau
`E-WALLET` tidak memproses pembayaran karena payment gateway belum tersedia.
Tombol checkout belum dianggap berhasil sebelum response `201` diterima.

### 5. Lihat Pesanan Buyer

Endpoint:

```text
GET /api/rfq/me?offset=0&limit=50
```

Endpoint ini otomatis membatasi data berdasarkan buyer dari token.

### 6. Lihat Tracking

Endpoint:

```text
GET /api/logistik/{idRfq}?offset=0&limit=50
```

Buyer hanya dapat melihat tracking RFQ miliknya.

## Urutan Pengujian Integrasi

1. Buka `GET /health`.
2. Register buyer baru.
3. Login menggunakan email dan password buyer.
4. Pastikan `accessToken` tersimpan.
5. Panggil `GET /api/mangga/`.
6. Buat RFQ dari salah satu `id` inventaris.
7. Panggil `GET /api/rfq/me`.
8. Panggil `GET /api/logistik/{idRfq}`.
9. Uji token hilang dan token tidak valid untuk memastikan FE menangani `401`.
10. Login sebagai `ADMIN_GUDANG` dan lakukan approval/tracking dari dashboard
    frontend, bukan Swagger.
11. Pastikan pengguna tidak dapat menyelesaikan checkout retail atau menganggap
    pilihan metode pembayaran sebagai pembayaran berhasil.

## Pembagian Role

| Fitur | PETANI | BUYER_B2B | ADMIN_GUDANG |
|---|---:|---:|---:|
| Register publik | Ya | Ya | Tidak |
| Melihat inventaris | Ya | Ya | Ya |
| Membuat inventaris | Ya | Tidak | Ya |
| Membuat RFQ | Tidak | Ya | Tidak |
| Melihat RFQ sendiri | Tidak | Ya | Tidak |
| Dashboard operasional | Inventaris | Tidak | Approval, QC, tracking |
| Melihat semua RFQ | Tidak | Tidak | Ya |
| Approve RFQ | Tidak | Tidak | Ya |
| Update tracking | Tidak | Tidak | Ya |

## Di Luar Scope Tahap Awal

Backend versi ini belum menyediakan payment, invoice, refund, GPS real-time,
chat, notifikasi eksternal, multi-warehouse, pajak, atau rendering 3D.
Implementasi tampilan dan komponen UI dilakukan setelah alur API di atas
berhasil.

## Referensi

- Kontrak lengkap endpoint: `../API_SPEC.md` pada repository backend.
- Dokumentasi backend: `../README.md` pada repository backend.
