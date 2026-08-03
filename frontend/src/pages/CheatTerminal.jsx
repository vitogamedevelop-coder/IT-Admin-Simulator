import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Copy, Check } from 'lucide-react';

export default function CheatTerminal() {
  const [cheats, setCheats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [copied, setCopied] = useState(null);

  function load() {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (category !== 'all') qs.set('category', category);
    api(`/api/cheat?${qs.toString()}`).then(setCheats);
  }

  useEffect(() => {
    api('/api/cheat/categories').then(setCategories);
    load();
  }, []);

  useEffect(() => {
    load();
  }, [search, category]);

  function copy(text, id) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <h2 className="text-lg font-bold text-[#00f0ff]">&gt; cheat-sheet terminal</h2>
        <p className="text-xs text-[#8b949e] mt-1">befehle durchsuchen und zum kopieren antippen.</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-[#8b949e]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="suchen..." className="cyber-input pl-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="cyber-input">
          <option value="all">alle kategorien</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-3">
        {cheats.map((c) => (
          <div key={c.id} className="cyber-card p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">{c.category}</div>
              <button onClick={() => copy(c.syntax, c.id)} className="text-[#00ff66] hover:text-white">
                {copied === c.id ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="font-bold text-white text-sm mt-1">{c.title}</div>
            <code className="block mt-2 text-xs bg-[#050505] border border-[#1f2937] rounded p-2 text-[#00ff66] overflow-x-auto">{c.syntax}</code>
          </div>
        ))}
        {cheats.length === 0 && <div className="text-center text-[#8b949e] text-sm">keine einträge gefunden.</div>}
      </div>
    </div>
  );
}
