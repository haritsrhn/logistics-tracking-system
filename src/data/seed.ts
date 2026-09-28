import { addMonths, currentMonth } from '../lib/date';
import type { ItemKebutuhan, ItemMaster, Progress, Unit, User } from '../lib/types';

/**
 * Data demo. Dibuat relatif terhadap bulan berjalan supaya selalu ada
 * bulan aktif + dua bulan arsip. Ganti dengan API saat backend siap.
 */

export const DEMO_PASSWORD = 'sppg';

const units: Unit[] = [
  { id: 'u1', nama: 'SPPG Sukajadi', lokasi: 'Kec. Sukajadi, Bandung' },
  { id: 'u2', nama: 'SPPG Cicendo', lokasi: 'Kec. Cicendo, Bandung' },
  { id: 'u3', nama: 'SPPG Coblong', lokasi: 'Kec. Coblong, Bandung' },
  { id: 'u4', nama: 'SPPG Antapani', lokasi: 'Kec. Antapani, Bandung' },
];

const users: User[] = [
  { id: 'a1', nama: 'Rina Kusuma', username: 'admin', peran: 'admin', unitId: null },
  { id: 'p1', nama: 'Dedi Hermawan', username: 'dedi', peran: 'pic', unitId: 'u1' },
  { id: 'p2', nama: 'Siti Nurhaliza', username: 'siti', peran: 'pic', unitId: 'u2' },
  { id: 'p3', nama: 'Agus Saputra', username: 'agus', peran: 'pic', unitId: 'u3' },
  { id: 'p4', nama: 'Wulan Sari', username: 'wulan', peran: 'pic', unitId: 'u4' },
  { id: 'p5', nama: 'Bayu Pratama', username: 'bayu', peran: 'pic', unitId: null },
];

const masterRaw: [number, string, string, boolean?][] = [
  [0, 'Gas LPG 12 kg', 'tabung'],
  [0, 'Galon air mineral', 'galon'],
  [0, 'Lampu LED 18 W', 'pcs'],
  [1, 'Kertas HVS A4', 'rim'],
  [1, 'Tinta printer', 'botol'],
  [1, 'Map plastik', 'pcs'],
  [2, 'Termometer makanan', 'pcs'],
  [2, 'Timbangan digital', 'unit'],
  [3, 'Ompreng stainless', 'pcs'],
  [3, 'Kontainer plastik', 'pcs'],
  [3, 'Tali pengikat', 'roll', false],
  [4, 'Sendok sayur', 'pcs'],
  [4, 'Penjepit makanan', 'pcs'],
  [4, 'Sarung tangan plastik', 'box'],
  [4, 'Masker', 'box'],
  [5, 'Wajan besar', 'pcs'],
  [5, 'Spatula', 'pcs'],
  [5, 'Celemek', 'pcs'],
  [6, 'Pisau dapur', 'pcs'],
  [6, 'Talenan', 'pcs'],
  [6, 'Baskom', 'pcs'],
  [7, 'Sabun cuci piring', 'liter'],
  [7, 'Spons', 'pcs'],
  [7, 'Sikat', 'pcs'],
  [8, 'Senter', 'pcs'],
  [8, 'Baterai AA', 'pack'],
  [8, 'Buku tamu', 'pcs'],
  [9, 'Kantong sampah', 'pack'],
  [9, 'Sapu', 'pcs'],
  [9, 'Pel lantai', 'pcs'],
  [9, 'Karbol', 'liter'],
];

const master: ItemMaster[] = masterRaw.map(([kategori, nama, satuan, aktif = true], i) => ({
  id: `m${i + 1}`,
  kategori,
  nama,
  satuan,
  aktif,
}));

const KETERANGAN = ['Menunggu pencairan dana', 'Dipesan ke toko langganan', 'Stok toko kosong, cari alternatif', ''];

/** RNG deterministik supaya data demo stabil. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Snapshot {
  units: Unit[];
  users: User[];
  items: ItemKebutuhan[];
  master: ItemMaster[];
}

export function createSeed(now: Date = new Date()): Snapshot {
  const rand = mulberry32(20260901);
  const cur = currentMonth(now);
  const items: ItemKebutuhan[] = [];
  let seq = 0;

  for (const offset of [-2, -1, 0]) {
    const bulan = addMonths(cur, offset);
    const archived = offset < 0;
    for (const unit of units) {
      // Satu unit belum mengisi daftar bulan ini.
      if (!archived && unit.id === 'u4') continue;
      const pic = users.find((u) => u.unitId === unit.id)!;
      for (const m of master) {
        if (!m.aktif || rand() < 0.55) continue;
        const r = rand();
        const progress: Progress = archived
          ? r < 0.8 ? 'selesai' : r < 0.9 ? 'proses' : 'belum'
          : r < 0.35 ? 'selesai' : r < 0.65 ? 'proses' : 'belum';
        const day = 1 + Math.floor(rand() * (archived ? 27 : Math.max(1, now.getDate() - 1)));
        items.push({
          id: `i${++seq}`,
          unitId: unit.id,
          bulan,
          kategori: m.kategori,
          uraianBarang: m.nama,
          qty: 1 + Math.floor(rand() * 12),
          satuan: m.satuan,
          progress,
          tanggalSelesai: progress === 'selesai' ? `${bulan}-${String(day).padStart(2, '0')}` : null,
          keterangan: progress === 'selesai' ? '' : KETERANGAN[Math.floor(rand() * KETERANGAN.length)],
          diinputOleh: pic.nama,
        });
      }
      if (rand() < 0.5) {
        items.push({
          id: `i${++seq}`,
          unitId: unit.id,
          bulan,
          kategori: 10,
          uraianBarang: 'Kipas angin dinding',
          qty: 2,
          satuan: 'unit',
          progress: archived ? 'selesai' : 'belum',
          tanggalSelesai: archived ? `${bulan}-20` : null,
          keterangan: '',
          diinputOleh: pic.nama,
        });
      }
    }
  }

  return { units: [...units], users: [...users], items, master };
}
