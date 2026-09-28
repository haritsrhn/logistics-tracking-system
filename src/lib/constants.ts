import type { Progress } from './types';

export const KATEGORI = [
  'Fasilitas (Yayasan)',
  'Staff BGN',
  'Aslap',
  'Tim Distribusi',
  'Tim Pemorsian',
  'Tim Pengolahan',
  'Tim Persiapan',
  'Tim Cuci Peralatan',
  'Tim Keamanan',
  'Tim Kebersihan',
  'Lain-lain',
] as const;

export const KATEGORI_LAIN = KATEGORI.length - 1;

export const PROGRESS_ORDER: Progress[] = ['belum', 'proses', 'selesai'];

export const PROGRESS_LABEL: Record<Progress, string> = {
  belum: 'Belum Selesai',
  proses: 'Dalam Proses',
  selesai: 'Selesai',
};

/** Kontrol status di editor Realisasi PIC: 'segmented' (default) atau 'select'. */
export const PIC_STATUS_CONTROL: 'segmented' | 'select' = 'segmented';
