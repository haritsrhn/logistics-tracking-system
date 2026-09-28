# Tracking Kebutuhan vs Realisasi SPPG

Frontend untuk mencatat kebutuhan barang per unit SPPG dan memantau realisasinya.

- PIC (mobile-first): Kebutuhan, Realisasi, Riwayat unit sendiri.
- Admin (desktop): Dashboard unit × kategori, Riwayat, Item master, Unit dan user.

Stack: Vite, React, TypeScript, React Router. Belum ada backend: data disimpan di
`localStorage` lewat `src/data/store.tsx` dan diisi data demo dari `src/data/seed.ts`.
Ganti aksi di store dengan panggilan API saat backend siap.

```sh
npm install
npm run dev        # server pengembangan
npm test           # unit test aturan status dan validasi
npm run build      # typecheck + build produksi
```

Akun demo (mode dev), password `sppg`: `admin`, `dedi`, `siti`, `agus`, `wulan`, `bayu` (PIC tanpa unit).
