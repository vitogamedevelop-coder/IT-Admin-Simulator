import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, KeyRound, Database } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]); const [message, setMessage] = useState('');
  useEffect(() => { api('/api/user/admin/users').then(setUsers).catch((error) => setMessage(error.message)); }, []);
  async function reset(id) { const password = window.prompt('Neues Passwort (mindestens 8 Zeichen):'); if (!password) return; try { await api(`/api/user/admin/users/${id}/password`, { method: 'POST', body: JSON.stringify({ newPassword: password }) }); setMessage('Passwort wurde zurückgesetzt.'); } catch (error) { setMessage(error.message); } }
  async function backup() { try { const result = await api('/api/user/admin/backups', { method: 'POST' }); setMessage(`Backup erstellt: ${result.file}`); } catch (error) { setMessage(error.message); } }
  return <div className="flex flex-col gap-4 py-2"><div className="cyber-card p-4"><h2 className="flex items-center gap-2 font-bold text-[#00f0ff]"><Users size={20} />verwaltung</h2><p className="mt-1 text-xs text-[#8b949e]">Nutzerübersicht, Passwort-Reset und Datenbanksicherung.</p></div><button onClick={backup} className="cyber-btn-outline"><Database size={16} className="mr-2" />Backup jetzt erstellen</button><div className="cyber-card p-4">{users.map((user) => <div key={user.id} className="flex items-center justify-between border-b border-[#1f2937] py-3 last:border-0"><div><div className="text-sm text-white">{user.username}</div><div className="text-xs text-[#8b949e]">{user.role} · {user.xp} XP · {user.rank}</div></div><button onClick={() => reset(user.id)} className="p-2 text-[#ffcc00]" aria-label={`${user.username}-Passwort zurücksetzen`}><KeyRound size={17} /></button></div>)}</div>{message && <p className="text-xs text-[#00ff66]">{message}</p>}</div>;
}
