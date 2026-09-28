export type Progress = 'belum' | 'proses' | 'selesai';

export interface Unit {
  id: string;
  nama: string;
  lokasi: string;
}

export interface User {
  id: string;
  nama: string;
  username: string;
  peran: 'admin' | 'pic';
  /** null = belum di-assign. Admin selalu null (akses semua unit). */
  unitId: string | null;
}

/**
 * Nomor urut dalam kategori tidak disimpan; dihitung saat tampil
 * dari urutan item di store (lihat `numberInCategory`).
 */
export interface ItemKebutuhan {
  id: string;
  unitId: string;
  /** 'YYYY-MM' */
  bulan: string;
  /** index KATEGORI */
  kategori: number;
  uraianBarang: string;
  qty: number;
  satuan: string;
  progress: Progress;
  /** 'YYYY-MM-DD' */
  tanggalSelesai: string | null;
  keterangan: string;
  /** Nama user, tidak berubah saat PIC pindah unit. */
  diinputOleh: string;
}

export interface ItemMaster {
  id: string;
  kategori: number;
  nama: string;
  satuan: string;
  aktif: boolean;
}
