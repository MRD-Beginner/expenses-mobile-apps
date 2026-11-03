# 📱 Rencana Pengembangan Aplikasi Mobile Catatan Pengeluaran
**Proyek:** Expense Tracker Mobile App (Native)  
**Bahasa:** JavaScript / TypeScript  
**Framework:** React Native (Expo)  
**Tipe:** Aplikasi Mobile Standalone (Offline-First, Bukan Web)

---

## 1. 💡 Jawaban: Apakah Bisa Menggunakan JavaScript Tanpa Berupa Web?

**Sangat Bisa!**  
Banyak orang mengira JavaScript hanya untuk membuat website, padahal di dunia mobile development, JavaScript adalah salah satu bahasa paling populer berkat teknologi **React Native**.

### Kenapa ini BUKAN Web?
1. **Native UI Rendering:** React Native tidak berjalan di dalam browser/WebView. Kode JavaScript yang Anda tulis diterjemahkan menjadi elemen antarmuka bawaan sistem operasi (Android Views dan iOS UIViews).
2. **Performa & Feel Native:** Animasi, gesture geser, transisi layar, haptic feedback (getaran), dan scroll terasa 100% seperti aplikasi native yang diunduh dari Play Store/App Store.
3. **Akses Hardware Penuh:** Dapat mengakses kamera (foto struk), biometrik (sidik jari/Face ID), penyimpanan lokal (SQLite), hingga notifikasi lokal tanpa koneksi internet.
4. **Bisa Di-build Jadi File Installer:** Menghasilkan file `.apk` / `.aab` untuk Android dan `.ipa` untuk iOS.

---

## 2. 🛠️ Tech Stack yang Direkomendasikan

| Komponen | Pilihan Teknologi | Alasan |
| :--- | :--- | :--- |
| **Framework Mobile** | **React Native + Expo** | Sangat ramah pengembang, setup cepat tanpa ribet konfigurasi Android Studio di awal, dan bisa langsung di-preview di HP fisik via Expo Go. |
| **Bahasa** | **JavaScript (ES6+)** *(bisa opsional TypeScript)* | Sesuai permintaan Anda; mudah dipelajari, fleksibel, dan memiliki ekosistem pustaka yang sangat luas. |
| **Penyimpanan Data** | **Expo SQLite** / **AsyncStorage** | **Offline-First**. Data keuangan Anda disimpan di memori HP Anda sendiri, tidak bergantung server luar, cepat, dan aman untuk privasi. |
| **UI Component & Styling** | **React Native Paper** / **Tamagui** / **NativeWind (Tailwind)** | Mempermudah pembuatan tampilan yang modern, rapi, responsif, dan mendukung Dark Mode. |
| **Navigasi Layar** | **Expo Router** atau **React Navigation** | Navigasi tab bawah (Bottom Tabs) dan perpindahan halaman yang halus. |
| **Visualisasi / Grafik** | **Victory Native** atau **React Native Gifted Charts** | Menampilkan grafik lingkaran (pie chart) dan grafik batang (bar chart) untuk rincian pengeluaran. |
| **Ikon** | **Lucide Icons** / **Expo Vector Icons** | Beragam ikon lengkap untuk kategori (makanan, transportasi, hiburan, dll). |

---

## 3. 🎯 Rencana Fitur Aplikasi (Roadmap)

### Fase 1: Kebutuhan Inti (MVP - Minimum Viable Product)
- [ ] **Input Pengeluaran:**
  - Input jumlah nominal (dengan format mata uang Rupiah `Rp`).
  - Pilih Kategori (Makanan, Belanja, Transportasi, Tagihan, Hiburan, dll).
  - Pilih Tanggal & Waktu transaksi.
  - Catatan / Keterangan opsional.
  - Pilihan Sumber Dana / Metode Pembayaran (Tunai, Rekening Bank, E-Wallet / QRIS).
- [ ] **Dashboard Ringkasan:**
  - Total pengeluaran hari ini.
  - Total pengeluaran bulan ini.
  - Daftar 5 transaksi terakhir.
- [ ] **Riwayat Transaksi (History):**
  - List pengeluaran yang dikelompokkan per tanggal.
  - Fitur Hapus dan Ubah (Edit) transaksi.
- [ ] **Manajemen Kategori:**
  - Daftar kategori default.
  - Fitur menambah atau mengedit nama & ikon kategori sendiri.

### Fase 2: Analisis & Visualisasi
- [ ] **Grafik Pengeluaran:**
  - Pie Chart: Persentase pengeluaran berdasarkan kategori (misal: 45% Makanan, 20% Transportasi).
  - Bar Chart: Tren pengeluaran harian/mingguan dalam satu bulan.
- [ ] **Filter & Pencarian Lanjutan:**
  - Filter rentang tanggal kustom (custom date range).
  - Filter berdasarkan kategori tertentu atau metode pembayaran.
- [ ] **Fitur Anggaran / Budgeting Bulanan:**
  - Menentukan batas maksimal pengeluaran bulanan.
  - Indikator bar progres (peringatan jika pengeluaran sudah mencapai 80% atau melebihi limit).

### Fase 3: Keamanan & Kenyamanan Pengguna
- [ ] **Keamanan Aplikasi:**
  - Kunci aplikasi menggunakan PIN atau Biometrik (Fingerprint / Face ID).
- [ ] **Ekspor Laporan:**
  - Ekspor riwayat transaksi ke format CSV / Excel / PDF.
- [ ] **Notifikasi Pengingat:**
  - Pengingat harian (misal setiap jam 20:00) agar tidak lupa mencatat pengeluaran harian.
- [ ] **Backup & Restore:**
  - Backup data dalam bentuk file JSON lokal untuk dipindahkan ke perangkat lain jika ganti HP.

---

## 4. 🗄️ Desain Basis Data (Lokal SQLite)

Aplikasi ini menggunakan database relasional ringan di dalam perangkat HP:

### Tabel `categories` (Kategori)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | ID unik kategori |
| `name` | TEXT NOT NULL | Nama kategori (cth: "Makanan & Minuman") |
| `icon` | TEXT NOT NULL | Nama ikon yang digunakan |
| `color` | TEXT NOT NULL | Kode warna heksadesimal (cth: `#FF5733`) |

### Tabel `transactions` (Transaksi Pengeluaran)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | ID unik transaksi |
| `amount` | REAL NOT NULL | Nominal pengeluaran (cth: 25000) |
| `category_id` | INTEGER | Relasi ke tabel `categories` |
| `date` | TEXT NOT NULL | Format ISO string tanggal transaksi |
| `payment_method` | TEXT | Tunai, BCA, GoPay, OVO, dll. |
| `notes` | TEXT | Catatan tambahan |
| `created_at` | TEXT NOT NULL | Waktu input data |

### Tabel `budgets` (Batas Anggaran)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | ID unik budget |
| `month_year` | TEXT NOT NULL | Format `YYYY-MM` (cth: `2026-11`) |
| `monthly_limit` | REAL NOT NULL | Batas anggaran dalam sebulan |

---

## 5. 🗺️ Struktur Layar / Tampilan (Sitemap)

```
[ Navigasi Tab Bawah ]
 ├── 🏠 Beranda (Dashboard)
 │    ├── Kartu Total Pengeluaran Bulan Ini
 │    ├── Ringkasan Hari Ini & Minggu Ini
 │    └── Transaksi Terakhir
 │
 ├── ➕ Tombol Cepat Tambah Transaksi (Modal Popup / Floating Action Button)
 │    ├── Form Input Nominal
 │    ├── Pemilihan Kategori (Grid Ikon)
 │    └── Pemilihan Metode Pembayaran & Tanggal
 │
 ├── 📜 Riwayat Transaksi (History)
 │    ├── Pencarian & Filter Kategori/Tanggal
 │    └── Detail Transaksi (Edit & Hapus)
 │
 ├── 📊 Statistik & Laporan
 │    ├── Pie Chart Komposisi Pengeluaran
 │    ├── Bar Chart Tren Harian/Mingguan
 │    └── Evaluasi Budget / Anggaran
 │
 └── ⚙️ Pengaturan
      ├── Kelola Kategori
      ├── Set Anggaran Bulanan
      ├── Kunci Keamanan (PIN / Fingerprint)
      └── Ekspor Data (Excel / CSV)
```

---

## 6. 🚀 Langkah Mulai Pembuatan

Jika Anda setuju dengan konsep di atas, tahapan teknis yang akan kita lakukan:
1. **Inisialisasi Project:** Membuat template project menggunakan `npx create-expo-app@latest`.
2. **Setup Navigasi & Tampilan:** Menyiapkan halaman utama, tab navigasi, dan tema tampilan yang nyaman di mata.
3. **Setup Database SQLite:** Menyiapkan skrip tabel database dan fungsi CRUD (Create, Read, Update, Delete).
4. **Implementasi Form Transaksi & Dashboard:** Menghubungkan input pengguna dengan data di database.
5. **Pengujian langsung di HP Anda:** Menggunakan aplikasi **Expo Go** (cukup download di Play Store/App Store, lalu scan QR Code dari terminal).

