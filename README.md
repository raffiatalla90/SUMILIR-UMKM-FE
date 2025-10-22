# SUMILIR - Frontend (Vue 3)

## Deskripsi Singkat 🖼️

Repository ini berisi kode sumber untuk sisi frontend dari platform **SUMILIR**. Aplikasi ini dibangun sebagai *Single Page Application* (SPA) menggunakan **Vue 3 (Composition API)** dan **Vite**, serta mengonsumsi data dari Backend API Laravel [https://github.com/satriaksm/KMI-SIMSLIFE-BE.git]. Frontend ini menyediakan antarmuka pengguna untuk Pelanggan, Pelaku UMKM, dan Admin.

## Fitur Utama di Frontend ✨

* **Untuk Pelanggan:**
    * Pendaftaran & Login.
    * Browsing UMKM, Produk, dan Jasa (termasuk tampilan peta dengan Leaflet).
    * Pencarian & Filter.
    * Proses Pemesanan (Keranjang ala Shopee Food, Checkout, Voucher, Pembayaran).
    * Melihat Riwayat & Status Pesanan.
    * Memberikan Review & Rating.
    * Forum Komunitas (Melihat, Membuat Post, Komentar).
    * Proses Konsultasi Jasa.
    * Manajemen Profil & Alamat.
* **Untuk UMKM Owner:**
    * Dashboard Merchant.
    * Manajemen Katalog (Produk, Jasa, Varian, Add-on, Gambar).
    * Manajemen Pesanan & Pengiriman.
    * Melihat & Membalas Review.
    * Manajemen Voucher & Event.
    * Melihat Laporan Dasar.
    * Manajemen Konsultasi
* **Untuk Admin:**
    * Dashboard Admin.
    * Manajemen Pengguna & UMKM.
    * Manajemen Kategori & Event.
    * Moderasi Konten (Komunitas, Review, Laporan).

## Tech Stack Utama 🎨

* **Framework:** Vue 3 (Composition API)
* **Build Tool:** Vite
* **Routing:** Vue Router
* **State Management:** Pinia
* **HTTP Client:** Axios
* **Styling:** Tailwind CSS 
* **Peta:** Leaflet.js & OpenStreetMap
* **Real-time:** Laravel Echo
* **Manajemen Paket:** NPM (atau Yarn/pnpm)

## Prasyarat ⚙️

* Node.js
* NPM (atau Yarn/pnpm)

## Instalasi 🚀

1.  **Clone repository:**
    ```bash
    git clone https://github.com/satriaksm/KMI-SIMSLIFE-FE.git
    cd KMI-SIMSLIFE-FE
    ```
2.  **Install dependensi NPM:**
    ```bash
    npm install
    # atau: yarn install / pnpm install
    ```
3.  **Salin file environment:**
    ```bash
    cp .env.example .env
    ```
4.  **Konfigurasi file `.env`:**
      - Wajib set sesuai environment:
    - App/Router:
      - VITE_APP_URL, VITE_PUBLIC_BASE_PATH
    - API + Sanctum:
      - VITE_API_BASE_URL (URL backend Laravel)
      - VITE_API_PREFIX, VITE_SANCTUM_ENDPOINT
      - VITE_WITH_CREDENTIALS, VITE_HTTP_TIMEOUT_MS
    - Echo/Pusher (chat & notifikasi):
      - VITE_ECHO_DRIVER, VITE_ECHO_AUTH_ENDPOINT, VITE_ECHO_WITH_CREDENTIALS, VITE_ECHO_NAMESPACE
      - VITE_PUSHER_APP_KEY, VITE_PUSHER_CLUSTER
      - VITE_PUSHER_HOST, VITE_PUSHER_PORT, VITE_PUSHER_WSS_PORT
      - VITE_PUSHER_SCHEME, VITE_PUSHER_FORCE_TLS, VITE_PUSHER_DISABLE_STATS, VITE_PUSHER_WS_ENABLED
    - Map (Leaflet/OSM):
      - VITE_MAP_TILE_URL, VITE_MAP_ATTRIBUTION, VITE_MAP_MAX_ZOOM
    - Feature flag:
      - VITE_FEATURE_ECHO
  
    - Contoh minimal (development):
      - VITE_APP_URL=http://localhost:5173
      - VITE_PUBLIC_BASE_PATH=/
      - VITE_API_BASE_URL=http://localhost:8000
      - VITE_API_PREFIX=/api
      - VITE_SANCTUM_ENDPOINT=/sanctum/csrf-cookie
      - VITE_WITH_CREDENTIALS=true
      - VITE_ECHO_DRIVER=pusher
      - VITE_PUSHER_APP_KEY=local
      - VITE_PUSHER_HOST=localhost
      - VITE_PUSHER_PORT=6001
    
    - Sesuaikan dengan backend Laravel:
      - Kredensial Pusher/laravel-websockets harus sama dengan backend.
      - CORS harus mengizinkan origin frontend dan `supports_credentials=true`.
      - Tambahkan frontend ke `SANCTUM_STATEFUL_DOMAINS` (contoh: `localhost:5173`).
      - Gunakan HTTPS dan cookie `Secure` di production.
        
## Menjalankan Aplikasi (Development) ▶️

```bash
npm run dev
# atau: yarn dev / pnpm dev
