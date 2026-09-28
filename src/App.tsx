import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from './data/store';
import { AdminRiwayat } from './pages/admin/AdminRiwayat';
import { AdminShell } from './pages/admin/AdminShell';
import { Dashboard } from './pages/admin/Dashboard';
import { ItemMaster } from './pages/admin/ItemMaster';
import { UnitUser } from './pages/admin/UnitUser';
import { homeFor, Login } from './pages/Login';
import { Kebutuhan } from './pages/pic/Kebutuhan';
import { PicRiwayat } from './pages/pic/PicRiwayat';
import { PicShell } from './pages/pic/PicShell';
import { Realisasi } from './pages/pic/Realisasi';
import { RequireRole } from './pages/RequireRole';

function Home() {
  const { me } = useStore();
  return <Navigate to={me ? homeFor(me.peran) : '/login'} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/pic"
        element={
          <RequireRole peran="pic">
            <PicShell />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="kebutuhan" replace />} />
        <Route path="kebutuhan" element={<Kebutuhan />} />
        <Route path="realisasi" element={<Realisasi />} />
        <Route path="riwayat" element={<PicRiwayat />} />
      </Route>
      <Route
        path="/admin"
        element={
          <RequireRole peran="admin">
            <AdminShell />
          </RequireRole>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="riwayat" element={<AdminRiwayat />} />
        <Route path="item" element={<ItemMaster />} />
        <Route path="unit" element={<UnitUser />} />
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
