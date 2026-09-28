import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { currentMonth, todayISO } from '../lib/date';
import { applyProgress } from '../lib/rules';
import type { ItemKebutuhan, ItemMaster, Progress, Unit, User } from '../lib/types';
import { createSeed, DEMO_PASSWORD, type Snapshot } from './seed';

/**
 * Store lokal (localStorage) yang meniru backend. Semua mutasi lewat
 * aksi di bawah; saat API tersedia, ganti implementasi aksi dengan
 * panggilan API (optimistic update) tanpa mengubah layar.
 */

const STORAGE_KEY = 'tracking-sppg:v1';
const SESSION_KEY = 'tracking-sppg:session';

interface State extends Snapshot {
  sessionUserId: string | null;
}

function load(): State {
  let snap: Snapshot | null = null;
  let sessionUserId: string | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) snap = JSON.parse(raw) as Snapshot;
    sessionUserId = sessionStorage.getItem(SESSION_KEY);
  } catch {
    /* storage tidak tersedia: pakai seed */
  }
  return { ...(snap ?? createSeed()), sessionUserId };
}

let idCounter = 0;
const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export type NewItem = Pick<ItemKebutuhan, 'kategori' | 'uraianBarang' | 'qty' | 'satuan'>;
export type ItemPatch = Partial<Pick<ItemKebutuhan, 'uraianBarang' | 'qty' | 'satuan' | 'tanggalSelesai' | 'keterangan'>>;

function useStoreValue() {
  const [state, setState] = useState<State>(load);
  const bulanBerjalan = currentMonth();

  useEffect(() => {
    try {
      const { sessionUserId, ...snap } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
      if (sessionUserId) sessionStorage.setItem(SESSION_KEY, sessionUserId);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* abaikan */
    }
  }, [state]);

  const me = state.users.find((u) => u.id === state.sessionUserId) ?? null;

  /** Hanya item bulan berjalan yang boleh diubah; PIC hanya unitnya sendiri. */
  const canEdit = useCallback(
    (item: ItemKebutuhan) => {
      if (!me || item.bulan !== bulanBerjalan) return false;
      return me.peran === 'admin' || item.unitId === me.unitId;
    },
    [me, bulanBerjalan],
  );

  const mutateItem = useCallback(
    (id: string, fn: (it: ItemKebutuhan) => ItemKebutuhan) =>
      setState((s) => ({ ...s, items: s.items.map((it) => (it.id === id && canEdit(it) ? fn(it) : it)) })),
    [canEdit],
  );

  const actions = useMemo(
    () => ({
      login(username: string, password: string): User | null {
        const user = state.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
        if (!user || password !== DEMO_PASSWORD) return null;
        setState((s) => ({ ...s, sessionUserId: user.id }));
        return user;
      },
      logout() {
        setState((s) => ({ ...s, sessionUserId: null }));
      },

      addItem(input: NewItem) {
        if (!me || me.peran !== 'pic' || !me.unitId) return;
        const item: ItemKebutuhan = {
          ...input,
          id: newId('i'),
          unitId: me.unitId,
          bulan: bulanBerjalan,
          progress: 'belum',
          tanggalSelesai: null,
          keterangan: '',
          diinputOleh: me.nama,
        };
        setState((s) => ({ ...s, items: [...s.items, item] }));
      },
      updateItem(id: string, patch: ItemPatch) {
        mutateItem(id, (it) => ({ ...it, ...patch }));
      },
      setProgress(id: string, progress: Progress) {
        mutateItem(id, (it) => applyProgress(it, progress, todayISO()));
      },
      deleteItem(id: string) {
        setState((s) => ({ ...s, items: s.items.filter((it) => !(it.id === id && canEdit(it))) }));
      },

      addMaster(input: Omit<ItemMaster, 'id'>): string {
        const id = newId('m');
        setState((s) => ({ ...s, master: [{ ...input, id }, ...s.master] }));
        return id;
      },
      updateMaster(id: string, patch: Partial<Omit<ItemMaster, 'id'>>) {
        setState((s) => ({ ...s, master: s.master.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
      },

      addUnit(input: Omit<Unit, 'id'>) {
        setState((s) => ({ ...s, units: [...s.units, { ...input, id: newId('u') }] }));
      },
      updateUnit(id: string, patch: Partial<Omit<Unit, 'id'>>) {
        setState((s) => ({ ...s, units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
      },

      /** Mengembalikan pesan error, atau null jika berhasil. */
      addPic(input: { nama: string; username: string; unitId: string | null }): string | null {
        const username = input.username.trim();
        if (!input.nama.trim()) return 'Nama wajib diisi.';
        if (!/^[a-z0-9._-]{3,}$/i.test(username)) return 'Username minimal 3 karakter: huruf, angka, titik, garis bawah, atau strip.';
        if (state.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return 'Username sudah dipakai.';
        setState((s) => ({
          ...s,
          users: [...s.users, { id: newId('p'), nama: input.nama.trim(), username, peran: 'pic', unitId: input.unitId }],
        }));
        return null;
      },
      /** Memindahkan PIC tidak mengubah `diinputOleh` pada data lama. */
      assignUnit(userId: string, unitId: string | null) {
        setState((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === userId && u.peran === 'pic' ? { ...u, unitId } : u)),
        }));
      },

      resetDemo() {
        setState((s) => ({ ...createSeed(), sessionUserId: s.sessionUserId }));
      },
    }),
    [state.users, me, bulanBerjalan, mutateItem, canEdit],
  );

  return { ...state, me, bulanBerjalan, canEdit, actions };
}

type Store = ReturnType<typeof useStoreValue>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore harus di dalam StoreProvider');
  return s;
}
