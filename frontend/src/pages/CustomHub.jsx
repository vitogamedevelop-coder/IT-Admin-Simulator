import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, Edit3, Lightbulb } from 'lucide-react';

export default function CustomHub() {
  const [tab, setTab] = useState('flashcards');

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <h2 className="text-lg font-bold text-[#ffcc00]">&gt; custom hub</h2>
        <p className="text-xs text-[#8b949e] mt-1">baue deine eigenen lernwerkzeuge.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'flashcards', label: 'karteikarten' },
          { id: 'blanks', label: 'lückentexte' },
          { id: 'mnemonics', label: 'eselsbrücken' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg border text-xs whitespace-nowrap ${tab === t.id ? 'border-[#ffcc00] text-[#ffcc00]' : 'border-[#1f2937] text-[#8b949e]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'flashcards' && <Flashcards />}
      {tab === 'blanks' && <Blanks />}
      {tab === 'mnemonics' && <Mnemonics />}
    </div>
  );
}

function Flashcards() {
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [flipped, setFlipped] = useState(null);

  function load() {
    api('/api/custom/flashcards').then(setCards);
  }

  useEffect(() => load(), []);

  async function add(e) {
    e.preventDefault();
    await api('/api/custom/flashcards', { method: 'POST', body: JSON.stringify({ front, back }) });
    setFront('');
    setBack('');
    load();
  }

  async function review(id, difficulty) {
    await api(`/api/custom/flashcards/${id}/review`, { method: 'POST', body: JSON.stringify({ difficulty }) });
    setFlipped(null);
    load();
  }

  async function remove(id) {
    await api(`/api/custom/flashcards/${id}`, { method: 'DELETE' });
    load();
  }

  const due = cards.filter((c) => new Date(c.next_review) <= new Date());

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={add} className="cyber-card p-3 flex flex-col gap-2">
        <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="vorderseite" className="cyber-input" required />
        <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="rückseite" className="cyber-input" required />
        <button type="submit" className="cyber-btn text-sm py-2"><Plus size={16} className="mr-1" /> karte hinzufügen</button>
      </form>
      <div className="text-xs text-[#8b949e]">{due.length} fällig jetzt · {cards.length} gesamt</div>
      {cards.map((c) => (
        <div key={c.id} className="cyber-card p-4">
          <button type="button" onClick={() => setFlipped(flipped === c.id ? null : c.id)} aria-label={`Karteikarte ${flipped === c.id ? 'Rückseite' : 'Vorderseite'} anzeigen`} className={`w-full min-h-[4rem] flex items-center justify-center rounded border border-[#1f2937] p-4 text-center cursor-pointer transition ${flipped === c.id ? 'bg-[#0d1117] text-[#00f0ff]' : 'bg-[#050505] text-[#00ff66]'}`}>
            {flipped === c.id ? c.back : c.front}
          </button>
          {flipped === c.id && (
            <div className="mt-3 flex gap-2">
              <button onClick={() => review(c.id, 'Hard')} className="flex-1 py-2 rounded border border-[#ff3355] text-[#ff3355] text-xs font-bold">Schwer</button>
              <button onClick={() => review(c.id, 'Medium')} className="flex-1 py-2 rounded border border-[#ffcc00] text-[#ffcc00] text-xs font-bold">Mittel</button>
              <button onClick={() => review(c.id, 'Easy')} className="flex-1 py-2 rounded border border-[#00ff66] text-[#00ff66] text-xs font-bold">Leicht</button>
            </div>
          )}
          <button onClick={() => remove(c.id)} className="mt-2 text-[#8b949e] hover:text-[#ff3355]"><Trash2 size={16} /></button>
        </div>
      ))}
    </div>
  );
}

function Blanks() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selected, setSelected] = useState([]);
  const [quiz, setQuiz] = useState(null);

  function load() {
    api('/api/custom/fillblanks').then(setItems);
  }

  useEffect(() => load(), []);

  function toggleWord(word) {
    setSelected((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]));
  }

  async function save() {
    await api('/api/custom/fillblanks', { method: 'POST', body: JSON.stringify({ title, text, hidden: selected }) });
    setTitle('');
    setText('');
    setSelected([]);
    load();
  }

  const words = text.split(/(\s+)/).filter((w) => w.trim().length > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="cyber-card p-3 flex flex-col gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="titel" className="cyber-input" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="text hier einfügen..." rows={4} className="cyber-input" />
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">tippe auf wörter, die versteckt werden sollen</div>
        <div className="flex flex-wrap gap-2">
          {words.map((w, i) => (
            <button key={i} onClick={() => toggleWord(w)} className={`px-2 py-1 rounded text-xs border ${selected.includes(w) ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#8b949e]'}`}>
              {w}
            </button>
          ))}
        </div>
        <button onClick={save} className="cyber-btn text-sm py-2"><Edit3 size={16} className="mr-1" /> quiz speichern</button>
      </div>
      {items.map((item) => (
        <button key={item.id} onClick={() => setQuiz(item)} className="cyber-card p-3 text-left">
          <div className="font-bold text-white text-sm">{item.title}</div>
          <div className="text-xs text-[#8b949e] mt-1">{item.hidden?.length} versteckte wörter</div>
        </button>
      ))}
      {quiz && <BlankQuiz item={quiz} onClose={() => setQuiz(null)} />}
    </div>
  );
}

function BlankQuiz({ item, onClose }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const words = item.text.split(/(\s+)/);

  function check() {
    setChecked(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 flex flex-col p-4">
      <div className="app-container flex-1 flex flex-col gap-4 overflow-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-[#00f0ff]">{item.title}</h3>
          <button onClick={onClose} className="text-[#8b949e]">schließen</button>
        </div>
        <div className="cyber-card p-4 leading-loose text-sm">
          {words.map((w, i) => {
            if (w.trim().length === 0) return <span key={i}>{w}</span>;
            if (item.hidden.includes(w)) {
              return (
                <span key={i} className="inline-block mx-1">
                  <input
                    value={answers[i] || ''}
                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    className={`w-24 px-2 py-1 rounded border text-center text-xs ${checked && answers[i]?.toLowerCase() === w.toLowerCase() ? 'border-[#00ff66] text-[#00ff66]' : checked ? 'border-[#ff3355] text-[#ff3355]' : 'border-[#30363d] text-white'}`}
                  />
                </span>
              );
            }
            return <span key={i}>{w}</span>;
          })}
        </div>
        <button onClick={check} className="cyber-btn">antworten prüfen</button>
      </div>
    </div>
  );
}

function Mnemonics() {
  const [list, setList] = useState([]);
  const [fact, setFact] = useState('');
  const [hook, setHook] = useState('');

  function load() {
    api('/api/custom/mnemonics').then(setList);
  }

  useEffect(() => load(), []);

  async function add(e) {
    e.preventDefault();
    await api('/api/custom/mnemonics', { method: 'POST', body: JSON.stringify({ fact, hook }) });
    setFact('');
    setHook('');
    load();
  }

  async function remove(id) {
    await api(`/api/custom/mnemonics/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={add} className="cyber-card p-3 flex flex-col gap-2">
        <input value={fact} onChange={(e) => setFact(e.target.value)} placeholder="fakt" className="cyber-input" required />
        <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="merkhilfe / akronym" className="cyber-input" required />
        <button type="submit" className="cyber-btn text-sm py-2"><Lightbulb size={16} className="mr-1" /> eselsbrücke hinzufügen</button>
      </form>
      {list.map((m) => (
        <div key={m.id} className="cyber-card p-3">
          <div className="font-bold text-white text-sm">{m.fact}</div>
          <div className="text-sm text-[#00f0ff] mt-1">{m.hook}</div>
          <button onClick={() => remove(m.id)} className="mt-2 text-[#8b949e] hover:text-[#ff3355]"><Trash2 size={16} /></button>
        </div>
      ))}
    </div>
  );
}
