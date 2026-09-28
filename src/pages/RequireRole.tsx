import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { homeFor } from './Login';

/** PIC tidak boleh ke rute admin, dan sebaliknya. */
export function RequireRole({ peran, children }: { peran: 'admin' | 'pic'; children: ReactNode }) {
  const { me } = useStore();
  if (!me) return <Navigate to="/login" replace />;
  if (me.peran !== peran) return <Navigate to={homeFor(me.peran)} replace />;
  return <>{children}</>;
}
