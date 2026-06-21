import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

/** Logowanie i rejestracja w jednym widoku (przelacznik trybu). */
export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.details?.map((d) => d.message).join(', ') || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card narrow">
      <h2>{mode === 'login' ? 'Logowanie' : 'Rejestracja'}</h2>
      <form onSubmit={submit} className="form">
        {mode === 'register' && (
          <label>
            Nazwa użytkownika
            <input value={form.username} onChange={set('username')} required minLength={3} />
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>
          Hasło
          <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? 'Czekaj...' : mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
        </button>
      </form>
      <p className="muted">
        {mode === 'login' ? 'Nie masz konta? ' : 'Masz już konto? '}
        <button className="btn-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
          {mode === 'login' ? 'Zarejestruj się' : 'Zaloguj się'}
        </button>
      </p>
      <p className="muted small">Konto testowe (po seed): alice@example.com / haslo123</p>
    </div>
  );
}
