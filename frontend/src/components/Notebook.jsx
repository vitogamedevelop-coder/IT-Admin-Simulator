import { useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { readNotebook, notebookCategories } from '../lib/notebook';

export default function Notebook({ onClose }) {
  const notebook = readNotebook();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = notebook.entries.filter((entry) => {
    const matchesSearch = !search || entry.title.toLowerCase().includes(search.toLowerCase()) || entry.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || entry.category === category;
    return entry.unlocked && matchesSearch && matchesCategory;
  });

  const active = selected ? notebook.entries.find((e) => e.id === selected) : null;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#00f0ff]"><BookOpen size={20} /><h2 className="font-bold">Notizheft</h2></div>
        {onClose && <button onClick={onClose} className="text-[#8b949e]"><X size={18} /></button>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="cyber-input w-full pl-9 text-sm" placeholder="Suchen…" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="cyber-input text-sm">
          <option value="all">Alle</option>
          {notebookCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
        {active ? (
          <div className="cyber-card p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">{notebookCategories.find((c) => c.id === active.category)?.label}</div>
            <h3 className="font-bold text-white text-lg mt-1">{active.title}</h3>
            <p className="text-sm text-[#c9d1d9] leading-relaxed mt-3">{active.explanation}</p>
            {active.syntax && <div className="mt-3"><div className="text-xs text-[#00f0ff] font-bold">Syntax</div><code className="block mt-1 p-2 rounded bg-black text-[#00ff66] text-sm">{active.syntax}</code></div>}
            {active.example && <div className="mt-3"><div className="text-xs text-[#00f0ff] font-bold">Beispiel</div><code className="block mt-1 p-2 rounded bg-black text-[#00ff66] text-sm">{active.example}</code></div>}
            {active.useCase && <div className="mt-3"><div className="text-xs text-[#00f0ff] font-bold">Anwendungsfall</div><p className="text-sm text-[#c9d1d9] mt-1">{active.useCase}</p></div>}
            <button onClick={() => setSelected(null)} className="cyber-btn w-full mt-4 text-sm">Zurück zur Übersicht</button>
          </div>
        ) : (
          (filtered.length > 0 ? filtered.map((entry) => (
            <button key={entry.id} onClick={() => setSelected(entry.id)} className="cyber-card p-3 text-left">
              <div className="text-[10px] text-[#8b949e] uppercase tracking-widest">{notebookCategories.find((c) => c.id === entry.category)?.label}</div>
              <div className="font-bold text-white text-sm mt-1">{entry.title}</div>
              <div className="text-xs text-[#c9d1d9] mt-1 line-clamp-2">{entry.explanation}</div>
            </button>
          )) : <div className="cyber-card p-4 text-sm text-[#8b949e]">Noch keine Einträge freigeschaltet. Schließe Hauptmissionen ab, um Notizen zu sammeln.</div>)
        )}
      </div>
    </div>
  );
}
