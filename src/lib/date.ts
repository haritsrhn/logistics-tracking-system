const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Tanggal lokal hari ini, 'YYYY-MM-DD'. */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Bulan berjalan, 'YYYY-MM'. */
export function currentMonth(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7);
}

/** Geser bulan 'YYYY-MM' sebanyak `delta`. */
export function addMonths(bulan: string, delta: number): string {
  const [y, m] = bulan.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** '2026-09' -> 'September 2026' */
export function formatMonth(bulan: string): string {
  const [y, m] = bulan.split('-').map(Number);
  return `${BULAN[m - 1]} ${y}`;
}

/** '2026-09-12' -> '12 Sep 2026' */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${BULAN_PENDEK[m - 1]} ${y}`;
}

/** Tanggal arsip sebuah bulan: tanggal 1 bulan berikutnya. */
export function archiveDate(bulan: string): string {
  return `${addMonths(bulan, 1)}-01`;
}
