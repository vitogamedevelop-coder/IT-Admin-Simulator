import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Terminal, Settings, ChevronLeft, Radio } from 'lucide-react';
import Onboarding from './Onboarding';
import PlayerNameGate from './PlayerNameGate';
import ObjectivePanel from './ObjectivePanel';

const NAME_PROMPTED_KEY = 'it-learn:name-prompted';

export default function Layout({ children, title, showLogout = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = location.pathname === '/' || location.pathname === '/workspace';
  // Strict sequencing: the name gate always resolves (submit or skip)
  // before the tutorial overlay is even mounted, so the two full-screen
  // overlays never compete for the same screen.
  const [namePrompted, setNamePrompted] = useState(() => localStorage.getItem(NAME_PROMPTED_KEY) === 'true');
  function goBack() { if (window.history.length > 1) navigate(-1); else navigate('/'); }

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-10 flex h-[var(--header-h)] items-center border-b border-[#1f2937] bg-[#050505]/95 backdrop-blur">
        <div className="app-container flex-row items-center justify-between py-1">
          <div className="flex items-center gap-1 text-[#00ff66]">
            {location.pathname !== '/' && <button onClick={goBack} aria-label="Zurück" className="p-2"><ChevronLeft size={20} /></button>}
            <button onClick={() => navigate('/')} aria-label="Zur Einsatzzentrale" className="flex items-center gap-2 p-1"><Shield size={22} className="shrink-0" /><span><span className="font-bold tracking-wider">NEXUS</span><span className="hidden sm:inline text-[9px] text-[#8b949e] ml-2">IT-LEARN SIM</span></span></button>
          </div>
          {user && (
            <div className="flex items-center gap-1 text-xs">
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#00ff66]"><Radio size={12} /> ONLINE</div>
              <button onClick={() => navigate('/settings')} aria-label="Einstellungen" className="p-2 text-[#8b949e]"><Settings size={17} /></button>
              <button onClick={() => navigate('/career')} className="hidden text-right sm:block">
                <div className="text-[#00f0ff]">Karriere</div>
                <div className="text-[#00ff66]">{user.xp} Lern-XP</div>
              </button>
              {showLogout && user.role !== 'offline' && (
                <button onClick={logout} className="p-2 rounded-md border border-[#1f2937] text-[#8b949e] hover:text-[#00ff66]">
                  <LogOut size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      {isWorkspace && <ObjectivePanel />}
      {title && (
        <div className="border-b border-[#1f2937] bg-[#0d1117]">
          <div className="app-container py-4">
            <div className="flex items-center gap-2 text-[#00f0ff]">
              <Terminal size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">{title}</span>
            </div>
          </div>
        </div>
      )}
      <main className="app-container flex-1 min-h-0 overflow-y-auto">{children}</main>
      <PlayerNameGate onDone={() => setNamePrompted(true)} />
      {namePrompted && <Onboarding />}
    </div>
  );
}
