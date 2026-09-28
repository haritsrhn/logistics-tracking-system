import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../../data/store';
import { formatMonth } from '../../lib/date';

export function PicShell() {
  const { me, units, bulanBerjalan, actions } = useStore();
  const navigate = useNavigate();
  const unit = units.find((u) => u.id === me?.unitId);

  const logout = () => {
    actions.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="pic">
      <header className="pic-header">
        <div className="pic-header-top">
          <div>
            <div className="pic-header-unit">{unit?.nama ?? 'Belum ada unit'}</div>
            <div className="small muted">
              {me?.nama} · {formatMonth(bulanBerjalan)}
            </div>
          </div>
          <button type="button" className="btn-text" onClick={logout}>
            Keluar
          </button>
        </div>
        <nav className="pic-tabs" aria-label="Menu PIC">
          <NavLink to="/pic/kebutuhan">Kebutuhan</NavLink>
          <NavLink to="/pic/realisasi">Realisasi</NavLink>
          <NavLink to="/pic/riwayat">Riwayat</NavLink>
        </nav>
      </header>
      <main className="pic-main">
        {unit ? (
          <Outlet />
        ) : (
          <div className="pic-empty">
            <h1 className="page-title">Belum ada unit</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Akun Anda belum ditautkan ke unit SPPG. Hubungi admin untuk assignment unit.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/** Item unit PIC yang sedang login untuk bulan tertentu. */
export function useUnitItems(bulan: string) {
  const { me, items } = useStore();
  return items.filter((it) => it.unitId === me?.unitId && it.bulan === bulan);
}
