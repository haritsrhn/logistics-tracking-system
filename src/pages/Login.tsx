import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DEMO_PASSWORD } from '../data/seed';
import { useStore } from '../data/store';

export const homeFor = (peran: 'admin' | 'pic') => (peran === 'admin' ? '/admin' : '/pic/kebutuhan');

export function Login() {
  const { me, users, actions } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (me) return <Navigate to={homeFor(me.peran)} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const user = actions.login(username, password);
    if (!user) return setError('Username atau password salah.');
    navigate(homeFor(user.peran), { replace: true });
  };

  return (
    <main className="login">
      <h1>Tracking SPPG</h1>
      <p className="muted" style={{ marginTop: 6 }}>
        Kebutuhan vs realisasi barang per unit.
      </p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            autoComplete="username"
            autoCapitalize="none"
            value={username}
            aria-invalid={!!error}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="error-text" id="login-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Masuk
        </button>
      </form>
      {import.meta.env.DEV && (
        <div className="demo-hint small muted">
          <p>
            Akun demo, password <strong>{DEMO_PASSWORD}</strong>:
          </p>
          <p>{users.map((u) => u.username).join(', ')}</p>
          <button type="button" className="btn-text small" onClick={actions.resetDemo}>
            Reset data demo
          </button>
        </div>
      )}
    </main>
  );
}
