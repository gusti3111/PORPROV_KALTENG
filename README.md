# PORPROV XIII Kalimantan Tengah 2026

Landing page portal informasi Pekan Olahraga Provinsi XIII Kalimantan Tengah
2026, dibangun dengan React, TypeScript, Vite, dan React Router.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Pemeriksaan

```bash
npm run lint
npm run build
```

GitHub Actions menjalankan lint, type-check, dan production build pada setiap
pull request ke `master` serta setiap push ke `master`.

## CD ke VPS dengan Docker

Setelah job CI berhasil pada push ke `master`, GitHub Actions membangun image
Docker, mengirimnya ke VPS melalui SSH, lalu menjalankan ulang container Nginx
yang menyajikan aplikasi React statis.
Pull request hanya menjalankan CI dan tidak melakukan deployment.

Siapkan VPS dengan Docker Engine dan Docker Compose plugin. Buat GitHub Actions
repository secrets berikut:

- `VPS_HOST`: alamat IP atau hostname VPS.
- `VPS_USER`: user SSH yang boleh menjalankan Docker.
- `VPS_SSH_KEY`: private SSH key untuk user tersebut.
- `VPS_KNOWN_HOSTS`: baris host key VPS yang sudah diverifikasi.

Siapkan direktori deployment dan akses Docker untuk user SSH di VPS:

```bash
sudo mkdir -p /opt/porprov-kalteng
sudo chown "$USER":"$USER" /opt/porprov-kalteng
```

Pastikan user SSH dapat menjalankan `docker compose` tanpa prompt `sudo`.
Deployment berjalan otomatis setelah CI berhasil pada push ke `master`.

Container akan mendengarkan pada port `3000`. Untuk akses publik, arahkan domain
dan HTTPS melalui reverse proxy seperti Caddy atau Nginx. Jangan menyimpan
private key atau host key yang belum diverifikasi di repository.

Daftar venue pada halaman `/venue` disalin dari revisi jadwal sementara yang
diberikan. Peta Leaflet memakai OpenStreetMap; pin adalah perkiraan area
Pangkalan Bun karena sumber tidak menyertakan alamat atau koordinat resmi.
Peta memerlukan koneksi internet untuk memuat ubin OpenStreetMap. Konfirmasi
lokasi venue kepada panitia sebelum berkunjung.
Halaman `/jadwal` memakai rentang 28 November–9 Desember 2026 sesuai pembaruan
terbaru. Jam dan sesi pertandingan belum tersedia dan tidak ditampilkan
sebagai jadwal resmi. Hasil pertandingan dan informasi resmi lain akan
diperbarui saat data penyelenggara tersedia.

## Mengatur tanggal countdown

Countdown memakai `VITE_EVENT_START_AT` dalam format ISO 8601 dan zona
waktu WIB. Secara default tanggalnya 28 November 2026 pukul 00.00 WIB sebagai
tanggal sementara. Atur nilai berikut di `.env.local` setelah jadwal resmi
diumumkan:

```env
VITE_EVENT_START_AT=2026-11-28T00:00:00+07:00
```
