import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '../lib/api';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const [results, setResults] = useState([]); const navigate = useNavigate();
  useEffect(() => { const handler = (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);
  useEffect(() => { if (query.trim().length < 2) return setResults([]); const timer = setTimeout(() => api(`/api/search?q=${encodeURIComponent(query)}`).then(setResults).catch(() => setResults([])), 250); return () => clearTimeout(timer); }, [query]);
  function choose(item) { setOpen(false); setQuery(''); if (item.type === 'module') navigate(`/module/${item.id}`); else if (item.type === 'cheat') navigate('/cheat'); else navigate('/custom'); }
  return <><button onClick={() => setOpen(true)} aria-label="Globale Suche öffnen" className="p-2 text-[#00f0ff]"><Search size={18} /></button>{open && <div className="fixed inset-0 z-50 bg-black/80 p-4"><div className="app-container pt-10"><div className="cyber-card p-3"><div className="flex gap-2"><Search className="text-[#00f0ff]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Module, Cheats, eigene Inhalte suchen..." className="cyber-input" /><button onClick={() => setOpen(false)} aria-label="Suche schließen"><X /></button></div><div className="mt-3 max-h-[60vh] overflow-auto">{results.map((item) => <button key={`${item.type}-${item.id}`} onClick={() => choose(item)} className="w-full border-b border-[#1f2937] py-3 text-left"><span className="text-[10px] uppercase text-[#00f0ff]">{item.type}</span><div className="text-sm text-white">{item.title}</div><div className="truncate text-xs text-[#8b949e]">{item.description}</div></button>)}{query.length >= 2 && !results.length && <p className="p-3 text-sm text-[#8b949e]">Keine Treffer.</p>}</div></div></div></div>}</>;
}
