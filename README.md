# Sistem Monitoring Level Air & Otomatisasi Pompa

Sebuah aplikasi full-stack untuk monitoring level air secara real-time dan pengendalian pompa air secara otomatis maupun manual. Proyek ini dibangun dengan Vue.js untuk dasbor interaktif, Node.js (Express) sebagai backend, dan diintegrasikan dengan perangkat keras ESP32 melalui protokol MQTT.

![Screenshot Dasbor](https://i.imgur.com/xZHSl8O.png)

## Fitur Utama

- **Dasbor Real-time**: Memantau level air dan status semua perangkat secara langsung.
- **Grafik Histori**: Menampilkan data histori pembacaan level air dalam bentuk grafik area yang dinamis.
- **Tabel Histori**: Menyajikan data histori dalam format tabel dengan sistem halaman (pagination) dan opsi jumlah data per halaman.
- **Kontrol Pompa Ganda**:
    - **Mode Otomatis**: Sistem secara otomatis menyalakan pompa berdasarkan ambang batas level air (`NORMAL`, `SIAGA`, `BANJIR`).
    - **Mode Manual**: Pengguna dapat menyalakan atau mematikan setiap pompa secara individu melalui dasbor.
- **Komunikasi MQTT**: Perintah dari dasbor ke perangkat keras dikirim melalui MQTT, memungkinkan kontrol yang andal meskipun perangkat tidak memiliki IP publik.
- **Ekspor Data**: Fungsionalitas untuk mengunduh seluruh data histori dalam format file `.csv`.

## Arsitektur Sistem

Sistem ini menggunakan arsitektur modern yang memisahkan antara frontend, backend, dan perangkat IoT.

```
+-----------+      (HTTP API)      +-----------+      (MQTT Publish)      +------------+
|           | -------------------> |           | ------------------------> |            |
|  Vue.js   | <------------------- |  Node.js  |                           | MQTT Broker|
| (Dasbor)  |      (HTTP API)      | (Backend) | <------------------------ |            |
|           |                      |           |      (MQTT Subscribe)     +------------+
+-----------+                      +-----------+                                 ^
                                         ^                                       |
                                         | (HTTP POST - Laporan)                 | (MQTT Subscribe - Perintah)
                                         |                                       |
                                    +----------+                                 |
                                    |          | --------------------------------+
                                    |  ESP32   |
                                    | (Device) |
                                    +----------+
```

## Teknologi yang Digunakan

### Frontend
- **Vue 3** (Composition API dengan `<script setup>`)
- **Vite** sebagai build tool
- **Tailwind CSS** untuk styling
- **Chart.js** dengan **vue-chartjs** untuk visualisasi data

### Backend
- **Node.js** dengan **Express.js**
- **MongoDB** dengan **Mongoose** sebagai ODM
- **MongoDB Atlas** sebagai hosting database
- **MQTT.js** untuk klien MQTT
- **`json2csv`** untuk ekspor data
- **`dotenv`** untuk manajemen environment variables

### Perangkat Keras
- **ESP32**

## Instalasi & Setup

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah berikut.

### Prasyarat
- Node.js (v18 atau lebih baru)
- npm / yarn / pnpm
- Akun MongoDB Atlas (cluster gratis sudah cukup)
- Broker MQTT (bisa menggunakan broker publik seperti `broker.hivemq.com` atau instalasi Mosquitto lokal)

### 1. Backend Setup
```bash
# Masuk ke direktori backend
cd /path/to/backend-folder

# Instal semua dependensi
npm install

# Buat file .env di root direktori backend dan isi sesuai contoh di bawah
touch .env

# Jalankan server pengembangan
npm run dev
```

### 2. Frontend Setup
```bash
# Masuk ke direktori frontend
cd /path/to/frontend-folder

# Instal semua dependensi
npm install

# Buat file .env di root direktori frontend dan isi sesuai contoh di bawah
touch .env

# Jalankan server pengembangan Vite
npm run dev
```

## Konfigurasi Environment (`.env`)

#### Backend (`.env`)
```env
# Port untuk server Express
PORT=5000

# URL koneksi ke MongoDB Atlas Anda
MONGODB_URL="mongodb+srv://<username>:<password>@cluster...mongodb.net/nama_database?retryWrites=true&w=majority"

# Konfigurasi Broker MQTT
MQTT_BROKER_URL="broker.hivemq.com"
MQTT_BROKER_PORT=1883
```

#### Frontend (`.env`)
```env
# URL base dari server backend Anda
VITE_API_BASE_URL="http://localhost:5000/"
```

## Dokumentasi API

Berikut adalah daftar endpoint utama yang tersedia.

| Method | Endpoint                    | Deskripsi                                                        | Digunakan oleh |
|--------|-----------------------------|------------------------------------------------------------------|----------------|
| `GET`  | `/system/status`            | Mengambil status terkini dari keseluruhan sistem.                | Frontend       |
| `POST` | `/system/status`            | Menerima laporan status lengkap dari perangkat ESP32.            | ESP32          |
| `POST` | `/system/mode`              | Mengirim perintah untuk mengubah mode sistem (AUTO/MANUAL).      | Frontend       |
| `GET`  | `/pump/status`              | Mengambil daftar status semua pompa saja.                        | Frontend       |
| `PATCH`| `/pump/:pumpId`             | Mengirim perintah untuk mengubah status satu pompa secara manual.| Frontend       |
| `GET`  | `/history/graph`            | Mengambil data histori terbaru untuk ditampilkan di grafik.      | Frontend       |
| `GET`  | `/history/table`            | Mengambil data histori dengan sistem halaman (pagination).       | Frontend       |
| `GET`  | `/history/download/csv`     | Mengunduh seluruh data histori dalam format file CSV.            | Frontend       |


## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).

