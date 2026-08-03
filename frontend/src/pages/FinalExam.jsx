import { useState } from 'react';
import { Award, RotateCcw } from 'lucide-react';
import { modules } from '../lib/localData';
import { playQuizFeedback } from '../lib/sound';

const BADGES_KEY = 'cyberlearn:exam-badges';

function readBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY)) || {}; } catch { return {}; }
}
function saveBadges(badges) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
}

function buildExam(facultyId, count = 15) {
  const pool = modules
    .filter((m) => m.faculty_id === facultyId)
    .flatMap((m) =>
      (m.questions || []).map((q) => ({ ...q, moduleTitle: m.title, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options }))
    );
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export default function FinalExam() {
  const [faculty, setFaculty] = useState(null);
  const [exam, setExam] = useState([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [badges, setBadges] = useState(readBadges());

  function start(facultyId) {
    setFaculty(facultyId);
    setExam(buildExam(facultyId));
    setActive(0);
    setSelected(null);
    setResults([]);
  }

  const question = exam[active];

  function submit() {
    if (!question || selected === null) return;
    const correct = selected === question.answer;
    playQuizFeedback(correct);
    setResults((r) => [...r, { correct }]);
    setActive((i) => i + 1);
    setSelected(null);
  }

  function finish() {
    const correctCount = results.filter((r) => r.correct).length;
    const passed = correctCount / exam.length >= 0.7;
    if (passed && !badges[faculty]) {
      const next = { ...badges, [faculty]: true };
      setBadges(next);
      saveBadges(next);
    }
    return { correctCount, passed };
  }

  if (!faculty) {
    return (
      <div className="flex flex-col gap-4 py-2">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 text-[#00f0ff] mb-2">
            <Award size={18} />
            <h2 className="font-bold text-sm uppercase tracking-widest">abschlussprüfung</h2>
          </div>
          <p className="text-xs text-[#8b949e]">15 zufällige Fragen aus einem Fachbereich. Ab 70 % gibt es das Experten-Abzeichen.</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {['it', 'coding'].map((id) => (
            <button key={id} onClick={() => start(id)} className="cyber-card p-4 text-left hover:border-[#00ff66]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">{id}</span>
                {badges[id] && <span className="text-[#00ff66] text-xs">Abzeichen erhalten</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (active >= exam.length) {
    const { correctCount, passed } = finish();
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <Award size={56} className={passed ? 'text-[#00ff66]' : 'text-[#ffcc00]'} />
        <h2 className="text-xl font-bold text-white">prüfung abgeschlossen</h2>
        <p className="text-[#8b949e] text-sm">{correctCount} / {exam.length} richtig ({Math.round((correctCount / exam.length) * 100)}%)</p>
        {passed && <p className="text-[#00ff66] text-sm font-bold">Experten-Abzeichen {faculty.toUpperCase()} freigeschaltet!</p>}
        {!passed && <p className="text-[#ff3355] text-sm">Mindestens 70 % sind nötig. Versuche es erneut.</p>}
        <button onClick={() => { setFaculty(null); setExam([]); setResults([]); }} className="cyber-btn mt-4 flex items-center gap-2"><RotateCcw size={16} /> zurück zur Auswahl</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[#00f0ff] font-bold uppercase text-sm">prüfung {faculty}</span>
          <span className="text-xs text-[#8b949e]">{active + 1} / {exam.length}</span>
        </div>
        <div className="h-1.5 w-full rounded bg-[#1f2937]"><div className="h-1.5 rounded bg-[#00ff66]" style={{ width: `${((active) / exam.length) * 100}%` }} /></div>
      </div>
      <div className="cyber-card p-4">
        <div className="text-[10px] text-[#8b949e] mb-2">{question.moduleTitle}</div>
        <h3 className="text-white font-bold mb-4">{question.question}</h3>
        <div className="flex flex-col gap-2">
          {(question.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`text-left p-3 rounded-lg border text-sm transition ${
                selected === opt ? 'border-[#00ff66] text-[#00ff66]' : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00ff66]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <button onClick={submit} disabled={selected === null} className="cyber-btn w-full mt-4">antwort prüfen</button>
      </div>
    </div>
  );
}
