# PORPROV XIII Kalimantan Tengah 2026 (Monorepo)

Monorepo portal informasi dan sistem API Pekan Olahraga Provinsi XIII Kalimantan Tengah 2026.

## Struktur Direktori

```text
PORPROV_KALTENG/
├── frontend/             # Aplikasi Web React 19 + TypeScript + Vite + React Router
│   ├── src/              # Komponen, views, assets, dan data
│   ├── public/           # Static icons & manifest
│   ├── Dockerfile        # Multi-stage build Nginx
│   └── nginx.conf        # Nginx config dengan reverse-proxy /api ke backend
├── backend/              # RESTful API Go (Chi) + PostgreSQL (pgx/v5)
│   ├── cmd/api/          # Entrypoint server Go
│   ├── internal/         # Config, Database, Model, Repository, Handlers
│   ├── migrations/       # SQL Migrations schema & seed data
│   ├── Dockerfile        # Go multi-stage build Alpine
│   └── .env.example      # Template konfigurasi environment
├── compose.yaml          # Orchestration Docker (PostgreSQL, Backend API, Frontend)
├── compose.https.yaml    # Optional HTTPS reverse proxy for local/IP testing
├── deploy/               # Reverse proxy configuration and generated TLS files
├── package.json          # Root scripts monorepo
└── .github/workflows/    # CI/CD pipeline
```

## Menjalankan Secara Lokal

### 1. Menjalankan Semua Layanan via Docker Compose (Rekomendasi)

Jalankan database PostgreSQL, backend Go, dan frontend sekaligus:

```bash
docker compose up --build
```

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:8081/api/v1](http://localhost:8081/api/v1)
- **API Health Check**: [http://localhost:8081/healthz](http://localhost:8081/healthz)
- **PostgreSQL**: `localhost:5432` (db: `porprov_kalteng`, user: `postgres`, pass: `postgres`)

### HTTPS Tanpa Domain (Testing)

Untuk menguji HTTPS sebelum memiliki domain, buat sertifikat self-signed untuk
localhost:

```bash
bash scripts/generate-self-signed-cert.sh localhost
docker compose -f compose.yaml -f compose.https.yaml up --build
```

Buka [https://localhost](https://localhost). Browser akan menampilkan
peringatan karena sertifikat self-signed belum dipercaya. Untuk mengakses
server melalui IPv4, ganti `localhost` dengan IP server saat membuat
sertifikat, lalu buka `https://<IP-server>`. Sertifikat ini berlaku satu tahun
dan hanya untuk pengujian; jangan gunakan sebagai sertifikat produksi.

Reverse proxy HTTPS menerima port 80 dan 443, mengalihkan HTTP ke HTTPS, dan
meneruskan API ke backend. Pastikan port 80/443 tersedia. Untuk deployment,
batasi akses langsung ke port frontend, backend, dan PostgreSQL dari firewall;
akses publik sebaiknya hanya melalui reverse proxy. Setelah memiliki domain,
ganti sertifikat self-signed dengan sertifikat tepercaya (misalnya Let's
Encrypt) dan sesuaikan konfigurasi proxy.

### 2. Menjalankan Per Service Manual

#### Frontend
```bash
npm run dev:frontend
# atau
cd frontend && npm install && npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Request ke `/api` akan otomatis di-*proxy* ke backend Compose di `http://localhost:8081`. Jika backend dijalankan manual pada port default `8080`, atur `VITE_BACKEND_PROXY_TARGET=http://localhost:8080` pada `frontend/.env.local`.
Frontend menggunakan Axios untuk request HTTP dan Zustand untuk menyimpan
data API beserta status loading/error. Secara default, request memakai
`/api/v1` agar dapat melalui Vite proxy saat development atau reverse proxy
saat deployment. Salin `frontend/.env.example` ke `frontend/.env.local` jika
perlu mengatur `VITE_API_BASE_URL` secara eksplisit.

UI menggunakan Tailwind CSS v4 dan komponen shadcn/ui berbasis Base UI.
Komponen tersedia di `frontend/src/components/ui/`. Untuk menambahkan komponen
lain dari root repo, jalankan:

```bash
npx shadcn@latest add <component> -c frontend
```

#### Backend (Go)
Pastikan Go 1.24+ terpasang:
```bash
npm run dev:backend
# atau
cd backend
go run ./cmd/api
```

## Pemeriksaan & Pengujian

Jalankan pengujian dan build dari root:

```bash
# Linting frontend (ESLint) & backend (go vet)
npm run lint

# Unit test backend
npm run test

# Production build kedua service
npm run build
```

## Endpoint API Backend (`/api/v1`)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/healthz` | Status server & koneksi database |
| `GET` | `/api/v1/sports` | Daftar seluruh Cabang Olahraga (Utama & Eksebisi) |
| `GET` | `/api/v1/sports/{id}` | Detail Cabor berdasarkan ID |
| `GET` | `/api/v1/venues` | Daftar venue, koordinat GPS, & fasilitas |
| `GET` | `/api/v1/contingents` | Daftar 14 Kabupaten/Kota peserta di Kalteng |
| `GET` | `/api/v1/medals/standings` | Klasemen perolehan medali (Emas, Perak, Perunggu) |
| `GET` | `/api/v1/medals/by-sport` | Klasemen perolehan medali per cabang olahraga |
| `GET` | `/api/v1/matches` | Jadwal dan hasil pertandingan dengan filter opsional |

Filter endpoint pertandingan: `date=YYYY-MM-DD`, `sport_id`, `venue_id`, dan
`status` (`SCHEDULED`, `ONGOING`, `FINISHED`, `POSTPONED`, atau `CANCELLED`).
Contoh: `/api/v1/matches?date=2026-11-28&status=FINISHED`.

Beranda dan halaman `/cabor` mengambil cabang olahraga dari API; halaman
`/venue` mengambil venue dan koordinat; `/jadwal` mengambil jadwal pertandingan;
dan `/hasil` mengambil hasil serta klasemen medali dari API. Data seed yang
tersedia untuk development adalah data simulasi, bukan informasi resmi, dan
harus dikonfirmasi panitia sebelum dipublikasikan.

## CI/CD ke VPS

Pipeline GitHub Actions (`.github/workflows/ci.yml`):
1. **validate-frontend**: Menjalankan lint, type-check, dan production build React di `frontend/`.
2. **validate-backend**: Menjalankan `go vet`, unit tests, dan `go build` di `backend/`.
3. **deploy**: Membangun image Docker frontend & backend, mentransfer image dan migrasi ke VPS via SSH, lalu me-restart `docker compose`.
