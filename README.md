# PORPROV XIII Kalimantan Tengah 2026

Landing page portal informasi Pekan Olahraga Provinsi XIII Kalimantan Tengah
2026, dibangun dengan Next.js App Router, TypeScript, dan Tailwind CSS.

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

Jadwal, hasil pertandingan, venue, dan informasi resmi lain ditandai sebagai
segera hadir hingga data penyelenggara tersedia.

## Mengatur tanggal countdown

Countdown memakai `NEXT_PUBLIC_EVENT_START_AT` dalam format ISO 8601 dan zona
waktu WIB. Secara default tanggalnya 7 November 2026 pukul 00.00 WIB sebagai
tanggal sementara. Atur nilai berikut di `.env.local` setelah jadwal resmi
diumumkan:

```env
NEXT_PUBLIC_EVENT_START_AT=2026-11-07T00:00:00+07:00
```
