import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { downloadModulesForOffline, getReminderEnabled, setDailyReminder } from '../lib/offline';
import { Trophy, Download, Bell, KeyRound, Users, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [reminder, setReminder] = useState(getReminderEnabled());
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [whitelist, setWhitelist] = useState([]);
  const [newUser, setNewUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => { api('/api/user/profile').then(setProfile); }, []);
  useEffect(() => {
    if (profile?.user.role === 'owner' || profile?.user.role === 'admin') api('/api/user/whitelist').then(setWhitelist);
  }, [profile]);

  async function downloadOffline() {
    setMessage('Lerninhalte werden gespeichert...');
    try { setMessage(`${await downloadModulesForOffline(api)} Module für Offline-Nutzung gespeichert.`); } catch (error) { setMessage(error.message); }
  }
  async function toggleReminder() {
    try { const enabled = await setDailyReminder(!reminder); setReminder(enabled); setMessage(enabled ? 'Tägliche Erinnerung aktiviert.' : 'Tägliche Erinnerung deaktiviert.'); } catch (error) { setMessage(error.message); }
  }
  async function changePassword(event) {
    event.preventDefault();
    try { await api('/api/user/password', { method: 'POST', body: JSON.stringify(password) }); setPassword({ currentPassword: '', newPassword: '' }); setMessage('Passwort wurde geändert.'); } catch (error) { setMessage(error.message); }
  }
  async function addWhitelist(event) {
    event.preventDefault();
    try { await api('/api/user/whitelist', { method: 'POST', body: JSON.stringify({ username: newUser }) }); setNewUser(''); setWhitelist(await api('/api/user/whitelist')); setMessage('Benutzer wurde freigeschaltet.'); } catch (error) { setMessage(error.message); }
  }
  async function removeWhitelist(username) {
    try { await api(`/api/user/whitelist/${encodeURIComponent(username)}`, { method: 'DELETE' }); setWhitelist((items) => items.filter((item) => item.username !== username)); } catch (error) { setMessage(error.message); }
  }

  if (!profile) return <div className="text-[#00ff66] py-10 text-center">profil wird geladen...</div>;
  const { user, xpLog } = profile;
  const manager = user.role === 'owner' || user.role === 'admin';
  return <div className="flex flex-col gap-4 py-2">
    <div className="cyber-card p-4 text-center"><Trophy size={40} className="mx-auto text-[#00f0ff]" /><h2 className="text-xl font-bold text-white mt-2">{user.username}</h2><p className="text-[#00ff66] font-bold mt-1">{user.rank}</p><p className="text-sm text-[#8b949e]">{user.xp} XP · {profile.streak?.current_streak || 0} Lerntage in Folge</p><div className="w-full h-2 bg-[#1f2937] rounded mt-3"><div className="h-full bg-[#00ff66] rounded" style={{ width: `${Math.min(100, (user.xp % 500) / 5)}%` }} /></div></div>
    <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3">offline & erinnerung</h3><div className="flex flex-col gap-2"><button onClick={downloadOffline} className="cyber-btn-outline text-left flex items-center gap-2"><Download size={16} /> Lernmodule offline speichern</button><button onClick={toggleReminder} className="cyber-btn-outline text-left flex items-center gap-2"><Bell size={16} /> Tägliche Erinnerung: {reminder ? 'an' : 'aus'}</button></div></div>
    <form onSubmit={changePassword} className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3 flex gap-2 items-center"><KeyRound size={16} /> passwort ändern</h3><div className="flex flex-col gap-2"><input className="cyber-input" type="password" required value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} placeholder="aktuelles Passwort" /><input className="cyber-input" type="password" minLength="8" required value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} placeholder="neues Passwort (mind. 8 Zeichen)" /><button className="cyber-btn">passwort speichern</button></div></form>
    {manager && <button onClick={() => navigate('/admin')} className="cyber-btn-outline"><Shield size={16} className="mr-2" />verwaltung öffnen</button>}
    {manager && <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-3 flex gap-2 items-center"><Users size={16} /> benutzer-freigaben</h3><form onSubmit={addWhitelist} className="flex gap-2 mb-3"><input className="cyber-input flex-1" value={newUser} onChange={(e) => setNewUser(e.target.value)} placeholder="Benutzername" required /><button className="cyber-btn">hinzufügen</button></form>{whitelist.map((item) => <div key={item.username} className="flex justify-between items-center text-sm py-2 border-b border-[#1f2937] last:border-0"><span className="text-[#c9d1d9]">{item.username}</span>{item.username !== 'admin' && <button onClick={() => removeWhitelist(item.username)} className="text-[#ff3355] p-1" aria-label={`${item.username} entfernen`}><Trash2 size={15} /></button>}</div>)}</div>}
    {message && <p className="text-xs text-[#00ff66]">{message}</p>}
    <div className="cyber-card p-4"><h3 className="font-bold text-[#00f0ff] text-sm mb-2">letzte XP</h3>{xpLog.map((entry, index) => <div key={index} className="flex justify-between text-xs border-b border-[#1f2937] py-2 last:border-0"><span className="text-[#c9d1d9]">{entry.reason}</span><span className="text-[#00ff66]">+{entry.amount}</span></div>)}</div>
  </div>;
}
