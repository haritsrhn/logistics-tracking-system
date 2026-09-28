import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../../data/store';

export function AdminShell() {
  const { me, actions } = useStore();
  const navigate = useNavigate();
  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="sidebar-brand">Tracking SPPG</div>
        <nav aria-label="Menu admin">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/riwayat">Riwayat</NavLink>
          <NavLink to="/admin/item">Item master</NavLink>
          <NavLink to="/admin/unit">Unit dan user</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span style={{ fontWeight: 500 }}>{me?.nama}</span>
          <span className="small muted">Admin</span>
          <button
            type="button"
            className="btn-text"
            onClick={() => {
              actions.logout();
              navigate('/login', { replace: true });
            }}
          >
            Keluar
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
