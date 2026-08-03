import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Terminal } from 'lucide-react';

export default function Login() {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password);
    } catch (err) {
      setError(err.message || 'zugriff verweigert');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell flex flex-col items-center justify-center">
      <div className="app-container flex flex-col items-center gap-6 py-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-full border border-[#00ff66] bg-[#0d1117] shadow-[0_0_1rem_#00ff6620]">
          <Shield size={32} className="text-[#00ff66]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-widest text-[#00ff66]">IT-Learn</h1>
          <p className="text-sm text-[#8b949e] mt-1">lokale Zugangskontrolle</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="cyber-label">benutzername</label>
            <input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="cyber-input" required />
          </div>
          <div>
            <label htmlFor="password" className="cyber-label">passwort</label>
            <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} className="cyber-input" required />
          </div>
          {error && <div className="text-[#ff3355] text-sm font-mono">&gt; {error}</div>}
          <button type="submit" disabled={busy} className="cyber-btn">
            <Terminal size={18} className="mr-2" />
            {mode === 'login' ? 'anmelden' : 'zugang beantragen'}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-xs text-[#00f0ff] underline">
          {mode === 'login' ? 'whitelist-registrierung' : 'zurück zum login'}
        </button>
        <p className="text-[10px] text-[#8b949e] text-center max-w-[16rem]">
          Der Eigentümer richtet den ersten Zugang über die Server-Konfiguration ein.
        </p>
      </div>
    </div>
  );
}
