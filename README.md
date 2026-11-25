# StudyGear — Platform Multi-Vendor E-Commerce Alat Tulis & Perlengkapan Belajar

![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Raw_SQL_(pg)-4169E1?style=flat-square&logo=postgresql&logoColor=white)

**StudyGear** adalah aplikasi web *multi-vendor e-commerce* yang dirancang khusus untuk penjualan alat tulis kantor/sekolah (*stationery*), buku catatan, *organizer* meja belajar, dan perlengkapan penunjang aktivitas studi bagi pelajar maupun mahasiswa. Proyek ini dikembangkan sebagai **Tugas Final Praktikum Pemrograman Web 2026** dengan arsitektur *full-stack* modern menggunakan **Next.js App Router** (`.jsx`/`.js`), **Tailwind CSS**, dan **PostgreSQL Raw SQL** tanpa ORM.

---

## Daftar Isi

1. [Fitur Utama Berdasarkan Role](#1-fitur-utama-berdasarkan-role)
2. [Tech Stack & Arsitektur](#2-tech-stack--arsitektur)
3. [Struktur Direktori](#3-struktur-direktori)
4. [Skema Database (ERD Ringkas)](#4-skema-database-erd-ringkas)
5. [Panduan Instalasi & Menjalankan Secara Lokal](#5-panduan-instalasi--menjalankan-secara-lokal)
6. [Akun Demo, Data Seed & Daftar Rute Utama](#6-akun-demo-data-seed--daftar-rute-utama)

---

## 1. Fitur Utama Berdasarkan Role

StudyGear menerapkan *Role-Based Access Control* (RBAC) untuk empat tingkat pengguna:

### Public User (Guest)
* **Beranda & Produk Pilihan Terbaru**: Menampilkan *hero banner* StudyGear, fitur unggulan, daftar kategori, dan 8 produk terbaru (`ORDER BY p.created_at DESC LIMIT 8`).
* **Eksplorasi Katalog (`/products`)**: Pencarian produk berdasarkan nama/deskripsi, filter berdasarkan kategori, serta pengurutan (*Terbaru*, *Terlama*, *Harga Terendah*, *Harga Tertinggi*).
* **Detail Produk (`/products/[id]`)**: Melihat informasi lengkap produk, stok tersedia, profil singkat toko penjual, skor rata-rata rating, dan daftar ulasan pembeli.
* **Autentikasi**: Registrasi akun baru sebagai **Buyer** maupun **Seller** melalui `/register` serta login di `/login`.

### Buyer (Pembeli)
* **Beranda Personal (`ORDER BY RANDOM()`)**: Menampilkan bagian *"Rekomendasi Untukmu"* berisi 8 produk acak (`ORDER BY RANDOM() LIMIT 8`) beserta status *wishlist*.
* **Keranjang Belanja & Wishlist**: Menambah/mengubah kuantitas item di keranjang (`ON CONFLICT (buyer_id, product_id) DO UPDATE`), menyimpan produk ke daftar favorit (*wishlist*), serta memindahkan item dari *wishlist* langsung ke keranjang.
* **Multi-Toko Checkout Atomik**: Melakukan *checkout* tanpa integrasi *payment gateway* pihak ketiga. Item dikelompokkan otomatis per `store_id` dalam transaksi PostgreSQL (`BEGIN` → `FOR UPDATE OF p` → validasi stok → pembuatan `orders` & `order_items` → pengurangan stok → pengosongan `carts` → `COMMIT`).
* **Manajemen Alamat Pengiriman**: Menyimpan alamat pengiriman default pada profil (`/buyer/profile`) dan menyesuaikan alamat tujuan saat *checkout*.
* **Pelacakan Pesanan & Ulasan**: Memantau status pesanan secara berurutan (**`Menunggu Pembayaran`** → **`Diproses`** → **`Selesai`**) serta memberikan rating bintang (`1–5`) dan komentar ulasan khusus untuk pesanan yang sudah berstatus **`Selesai`**.

### Seller (Penjual)
* **Registrasi & Verifikasi Dokumen Toko**: Saat mendaftar sebagai Seller, pengguna wajib mengunggah dokumen bukti verifikasi toko (JPG, PNG, WEBP, atau PDF maks. 5 MB) yang disimpan ke `public/uploads/`.
* **Halaman Status Verifikasi (`/seller/pending`)**:
  * Status `pending`: Menampilkan informasi bahwa akun sedang ditinjau oleh Admin beserta tombol logout.
  * Status `rejected`: Menampilkan keterangan penolakan dan opsi **hapus akun secara permanen** agar dapat mendaftar ulang.
* **Manajemen Profil Toko (`/seller/store`)**: Mengubah nama toko, deskripsi, dan mengunggah foto/banner toko (khusus Seller berstatus `approved`).
* **CRUD Produk (`/seller/products`)**: Menambah, mengedit, dan menghapus produk milik tokonya sendiri dengan validasi kepemilikan (`WHERE id = $... AND store_id = $...`).
* **Manajemen Pesanan Masuk (`/seller/orders`)**: Melihat rincian pesanan pembeli ke tokonya beserta alamat tujuan dan memperbarui status pesanan (`Menunggu Pembayaran` → `Diproses` → `Selesai`).

### Admin
* **Dashboard Ringkasan (`/admin`)**: Menampilkan metrik KPI real-time (verifikasi seller tertunda, total pendapatan, jumlah pesanan, total pengguna/pembeli/penjual aktif, jumlah produk & kategori, serta ringkasan pesanan terbaru).
* **Verifikasi Seller (`/admin/verifications`)**: Meninjau dokumen bukti toko dan melakukan keputusan **`Approve`** (mengubah status menjadi `approved` dan memastikan entri `stores` tersedia) atau **`Reject`**.
* **Manajemen User (`/admin/users`)**: Melihat seluruh daftar akun dan melakukan *toggle* status aktif/nonaktif (`is_active`) dengan proteksi agar Admin tidak dapat menonaktifkan akunnya sendiri.
* **CRUD Kategori (`/admin/categories`)**: Menambah, mengubah, dan menghapus kategori produk *stationery*.
* **Moderasi Produk (`/admin/products`)**: Memantau produk dari seluruh toko dan menghapus produk yang melanggar ketentuan.
* **Pengaturan Profil Admin (`/admin/profile`)**: Memperbarui nama, email (disertai pembaruan token sesi), dan kata sandi Admin.

---

## 2. Tech Stack & Arsitektur

Seluruh dependensi di bawah ini sesuai dengan konfigurasi di [`package.json`](./package.json):

| Lapisan | Teknologi & Versi | Keterangan Implementasi |
| :--- | :--- | :--- |
| **Framework Full-Stack** | **Next.js** `16.4.6` (App Router) | Menggunakan format `.jsx` & `.js` (tanpa TypeScript) dengan Server Components, Server Actions (`src/actions/`), dan Route Handlers (`src/app/api/`). |
| **UI Library** | **React** `19.3.0` & **React DOM** `19.3.0` | Kombinasi Server Components untuk *data fetching* langsung dan Client Components (`*Client.jsx`) untuk interaktivitas. |
| **Styling & Ikon** | **Tailwind CSS** `4.3.3` (`@tailwindcss/turbopack`) & **Lucide React** `^1.77.0` | Desain responsif dengan tipografi Google Font **Poppins** dan ikon vektor SVG dari `lucide-react`. |
| **Database** | **PostgreSQL** via **`pg`** `^8.23.1` | Menggunakan **Raw SQL Query** terparameterisasi (`$1, $2, ...`) melalui *connection pool* (`src/lib/db.js`) tanpa ORM/query builder. |
| **Autentikasi & Keamanan** | **`jose`** `^6.2.17` & **`bcryptjs`** `^3.0.3` | Hashing password dengan `bcryptjs` (salt rounds `10`), pembuatan/verifikasi JWT (`HS256`, masa berlaku 7 hari) yang disimpan di HTTP-only cookie (`studygear_session`), serta proteksi rute di `src/proxy.js`. |
| **Linter** | **ESLint** `^9` & `eslint-config-next` `16.4.6` | Pengecekan kualitas kode standar Next.js. |

---

## 3. Struktur Direktori

```text
StudyGear/
├── database/
│   └── studygear.sql                 # Skema DDL 9 tabel PostgreSQL + seed kategori & admin
├── public/
│   ├── images/                       # Aset gambar statis UI (termasuk hero_bg.jpg)
│   ├── uploads/                      # Penyimpanan lokal file upload (gambar produk/toko & dokumen)
│   └── *.svg                         # Aset ikon default Next.js
├── src/
│   ├── actions/                      # Next.js Server Actions (Raw SQL PostgreSQL)
│   │   ├── adminActions.js           # Verifikasi seller, profil admin, toggle user, kategori, moderasi
│   │   ├── authActions.js            # Login, register buyer/seller, logout, hapus akun ditolak
│   │   ├── buyerActions.js           # Pembaruan profil & alamat pengiriman buyer
│   │   ├── cartActions.js            # Keranjang, wishlist, dan transaksi checkout multi-toko
│   │   ├── orderActions.js           # Pembaruan status order (seller) & submit ulasan (buyer)
│   │   ├── productActions.js         # CRUD produk milik seller dengan ownership check
│   │   └── storeActions.js           # Pengaturan informasi & gambar toko seller
│   ├── app/                          # Next.js App Router Pages & API Route Handlers
│   │   ├── admin/                    # Dashboard, verifications, users, categories, products, profile
│   │   ├── api/                      # Route Handlers: /api/auth, /api/products, /api/upload
│   │   ├── buyer/                    # Profile, cart, orders, wishlist
│   │   ├── login/                    # Halaman masuk
│   │   ├── products/                 # Katalog (/products) & detail produk (/products/[id])
│   │   ├── register/                 # Halaman pendaftaran Buyer/Seller
│   │   ├── seller/                   # Pending, store, products, orders
│   │   ├── globals.css               # Konfigurasi gaya global Tailwind CSS
│   │   ├── layout.jsx                # Root layout (Font Poppins, Navbar, Footer)
│   │   └── page.jsx                  # Homepage (Public: terbaru, Buyer: ORDER BY RANDOM())
│   ├── components/
│   │   ├── layout/                   # Navbar, NavbarClient, Footer, FooterClient, LogoutButton
│   │   ├── product/                  # ProductCard
│   │   └── ui/                       # Pagination
│   ├── lib/
│   │   ├── auth.js                   # Helper bcryptjs, JWT (jose), & manajemen cookie sesi
│   │   ├── db.js                     # Pool koneksi PostgreSQL ('pg') & helper parameterized query
│   │   └── validations.js            # Helper validasi string, angka, integer, dan email
│   └── proxy.js                      # Proteksi rute & redirect otomatis berbasis role/status
├── eslint.config.mjs                 # Konfigurasi ESLint
├── jsconfig.json                     # Path alias '@/*' -> './src/*'
├── next.config.mjs                   # Konfigurasi Next.js & Turbopack CSS loader
└── package.json                      # Dependensi & skrip npm
```

---

## 4. Skema Database (ERD Ringkas)

Skema database didefinisikan pada [`database/studygear.sql`](./database/studygear.sql) dan terdiri atas **9 tabel**:

```text
[users] 1 ────── 0..1 [stores]
   │                     │
   │ 1                   │ 1
   ▼ *                   ▼ *
[carts] * ────── 1 [products] * ────── 0..1 [categories]
   │                     │
   │ 1                   │ 1
   ▼ *                   ▼ *
[wishlists]        [order_items] * ────── 1 [orders] * ────── 1 [stores]
                         │                     │
                         │                     │ *
                         ▼                     ▼ 1
                     [reviews] * ─────────── [users]
```

| No | Nama Tabel | Deskripsi & Kolom Kunci |
| :-: | :--- | :--- |
| 1 | `users` | Menyimpan seluruh akun (`id`, `name`, `email`, `password`, `role` [`admin`/`seller`/`buyer`], `seller_status` [`pending`/`approved`/`rejected`/`NULL`], `address`, `is_active`, `created_at`). |
| 2 | `stores` | Informasi toko milik Seller (`id`, `seller_id` UNIQUE FK ke `users`, `store_name`, `description`, `store_image`, `document_url`, `created_at`). |
| 3 | `categories` | Daftar kategori produk *stationery* yang dikelola Admin (`id`, `name` UNIQUE, `created_at`). |
| 4 | `products` | Katalog produk tiap toko (`id`, `store_id` FK ke `stores`, `category_id` FK ke `categories`, `name`, `description`, `price`, `stock`, `image_url`, `created_at`). |
| 5 | `carts` | Keranjang belanja Buyer (`id`, `buyer_id`, `product_id`, `quantity`, `created_at`) dengan constraint `UNIQUE (buyer_id, product_id)`. |
| 6 | `orders` | Header transaksi pesanan per toko (`id`, `buyer_id`, `store_id`, `total_price`, `shipping_address`, `status` default `'Menunggu Pembayaran'`, `created_at`). |
| 7 | `order_items` | Rincian item di setiap pesanan (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`). |
| 8 | `reviews` | Rating (`1–5`) dan komentar ulasan Buyer setelah order berstatus `'Selesai'` (`id`, `product_id`, `buyer_id`, `order_id`, `rating`, `comment`, `created_at`) dengan `UNIQUE (product_id, buyer_id, order_id)`. |
| 9 | `wishlists` | Daftar produk favorit Buyer (`id`, `buyer_id`, `product_id`, `created_at`) dengan `UNIQUE (buyer_id, product_id)`. |

---

## 5. Panduan Instalasi & Menjalankan Secara Lokal

### Prasyarat
* **Node.js** (disarankan v18 LTS atau lebih baru) dan **npm**
* **PostgreSQL** (lokal atau instance database PostgreSQL aktif)

### Langkah Instalasi

1. **Clone repository & masuk ke direktori proyek**
   ```bash
   git clone <url-repository-anda>
   cd StudyGear
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Buat database & impor skema + seed data**
   Buat database baru di PostgreSQL (misalnya `studygear`), lalu jalankan skrip [`database/studygear.sql`](./database/studygear.sql) melalui `psql` atau pgAdmin:
   ```bash
   createdb -U postgres studygear
   psql -U postgres -d studygear -f database/studygear.sql
   ```

4. **Konfigurasi Environment Variables**
   Buat file `.env.local` pada root proyek dan sesuaikan nilai placeholder berikut:
   ```env
   DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/studygear
   JWT_SECRET=your_random_secure_jwt_secret_key_here
   ```
   > **Catatan:** Variabel `DATABASE_URL` dibaca oleh `src/lib/db.js`, sedangkan `JWT_SECRET` digunakan oleh `src/lib/auth.js` dan `src/proxy.js` untuk menandatangani serta memverifikasi token JWT pada cookie `studygear_session`.

5. **Jalankan server pengembangan**
   ```bash
   npm run dev
   ```
   Buka browser dan akses aplikasi di: **`http://localhost:3000`**

6. **Perintah Tambahan (`package.json`)**
   ```bash
   # Memeriksa kualitas kode dengan ESLint
   npm run lint

   # Membangun aplikasi untuk produksi
   npm run build

   # Menjalankan hasil build produksi
   npm run start
   ```

---

## 6. Akun Demo, Data Seed & Daftar Rute Utama

### Akun Demo

Gunakan kredensial berikut untuk mencoba fitur berdasarkan peran pada halaman `/login`:

| Role | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@studygear.id` | `admin123` | Akun administrator bawaan dari seed database |
| **Seller** | `jaya3@gmail.com` | `jaya3123` | Akun penjual demo (untuk lokal baru, daftarkan via `/register` lalu setujui melalui panel Admin jika belum ada di database) |

> **Catatan:** Akun **Buyer** baru juga dapat dibuat langsung melalui halaman **`/register`**.

### Data Seed Awal (`database/studygear.sql`)

Skrip [`database/studygear.sql`](./database/studygear.sql) secara otomatis mengisi:
* **5 Kategori Awal**: *Alat Tulis & Pena*, *Buku Catatan & Kertas*, *Perlengkapan Meja Belajar*, *Binder & Organizer*, dan *Alat Gambar & Highlighters*.
* **1 Akun Administrator Seed**: `Administrator Studygear` (`admin@studygear.id`, role `admin`).

### Daftar Rute Aplikasi

| Kategori | Rute | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Publik & Auth** | `/` | Public & Buyer | Halaman utama (Admin/Seller otomatis diarahkan ke dashboard masing-masing) |
| | `/products` | Public & Buyer | Katalog produk dengan pencarian, filter kategori, & sorting |
| | `/products/[id]` | Public | Halaman detail produk, info toko, rating, & ulasan |
| | `/login` | Guest | Halaman masuk pengguna |
| | `/register` | Guest | Halaman registrasi Buyer & Seller (dengan unggah dokumen bukti toko) |
| **Buyer** | `/buyer/profile` | Buyer | Kelola nama dan alamat pengiriman default |
| | `/buyer/cart` | Buyer | Keranjang belanja & checkout atomik multi-toko |
| | `/buyer/orders` | Buyer | Riwayat pesanan, pelacakan status, & pengisian ulasan |
| | `/buyer/wishlist` | Buyer | Daftar produk favorit |
| **Seller** | `/seller/pending` | Seller (`pending`/`rejected`) | Halaman status peninjauan & opsi hapus akun jika ditolak |
| | `/seller/store` | Seller (`approved`) | Pengaturan nama, deskripsi, & gambar/banner toko |
| | `/seller/products` | Seller (`approved`) | Daftar & CRUD produk toko |
| | `/seller/orders` | Seller (`approved`) | Daftar pesanan masuk & pembaruan status pesanan |
| **Admin** | `/admin` | Admin | Dashboard ringkasan metrik KPI |
| | `/admin/verifications` | Admin | Persetujuan (`Approve`) atau penolakan (`Reject`) pendaftaran Seller |
| | `/admin/users` | Admin | Daftar seluruh pengguna & toggle status aktif/nonaktif |
| | `/admin/categories` | Admin | CRUD kategori produk |
| | `/admin/products` | Admin | Moderasi seluruh produk dari semua toko |
| | `/admin/profile` | Admin | Ubah profil dan kata sandi Admin |
| **API Routes** | `/api/auth` | Public / Session | `GET` cek sesi, `POST` login, `DELETE` logout |
| | `/api/products` | Public | `GET` daftar produk JSON (mendukung parameter query filter/sort/random) |
| | `/api/upload` | Admin & Seller | `POST` unggah file gambar/PDF ke `public/uploads/` (maks. 5 MB) |
