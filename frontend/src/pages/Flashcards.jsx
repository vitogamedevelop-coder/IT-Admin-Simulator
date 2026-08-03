import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, RotateCcw, BrainCircuit } from 'lucide-react';
import { cheats } from '../lib/localData';

const PROGRESS_KEY = 'cyberlearn:flashcard-progress';
const MS_MINUTE = 60_000;
const MS_DAY = 86_400_000;

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function dueDate(bucket) {
  const interval = bucket <= 1 ? MS_MINUTE * 5 : MS_DAY * bucket;
  return Date.now() + interval;
}

export default function Flashcards() {
  const [progress, setProgress] = useState(readProgress());
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const initialized = cheats.map((c) => {
    if (!progress[c.id]) {
      return { ...c, bucket: 1, dueAt: 0 };
    }
    return { ...c, ...progress[c.id] };
  });

  const dueCards = initialized.filter((c) => c.dueAt <= Date.now()).sort((a, b) => a.dueAt - b.dueAt);
  const current = dueCards[index];

  useEffect(() => {
    if (index >= dueCards.length) setIndex(0);
  }, [dueCards.length, index]);

  function handle(correct) {
    const item = current;
    const nextBucket = correct ? Math.min(5, (progress[item.id]?.bucket || 1) + 1) : 1;
    const next = { ...progress, [item.id]: { bucket: nextBucket, dueAt: dueDate(nextBucket) } };
    setProgress(next);
    saveProgress(next);
    setFlipped(false);
    setIndex((i) => (i + 1) % Math.max(1, dueCards.length));
  }

  function reset() {
    localStorage.removeItem(PROGRESS_KEY);
    setProgress({});
    setIndex(0);
    setFlipped(false);
  }

  const totalDue = dueCards.length;
  const totalLearned = initialized.filter((c) => (progress[c.id]?.bucket || 1) > 1).length;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] mb-2">
          <BrainCircuit size={18} />
          <h2 className="font-bold text-sm uppercase tracking-widest">karteikasten</h2>
        </div>
        <p className="text-xs text-[#8b949e]">Spaced Repetition für Befehle, Ports und Syntax. Fällige Karten werden zuerst gezeigt.</p>
      </div>

      <div className="flex justify-between text-xs text-[#8b949e]">
        <span>fällig: {totalDue}</span>
        <span>gelernt: {totalLearned}/{cheats.length}</span>
      </div>

      {!current ? (
        <div className="cyber-card p-6 text-center">
          <BookOpen size={40} className="mx-auto text-[#00ff66] mb-3" />
          <p className="text-sm text-[#c9d1d9]">Aktuell keine fälligen Karten. Komm später wieder.</p>
          <button onClick={reset} className="cyber-btn-outline mt-4 text-xs"><RotateCcw size={14} className="inline mr-1" />Fortschritt zurücksetzen</button>
        </div>
      ) : (
        <div className="cyber-card p-4 flex flex-col gap-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">#{current.id} · {current.category}</div>
          <div
            onClick={() => setFlipped((f) => !f)}
            className="min-h-[8rem] flex items-center justify-center rounded-lg border border-[#1f2937] bg-[#0d1117] p-6 text-center cursor-pointer"
          >
            {flipped ? (
              <div className="flex flex-col gap-2">
                <code className="text-[#00ff66] font-mono text-sm break-all">{current.syntax}</code>
                <div className="text-xs text-[#8b949e]">{(current.tags || []).join(', ')}</div>
              </div>
            ) : (
              <div className="font-bold text-white">{current.title}</div>
            )}
          </div>
          <p className="text-center text-xs text-[#8b949e]">Karte antippen, um umzudrehen</p>

          {flipped && (
            <div className="flex gap-2">
              <button onClick={() => handle(false)} className="flex-1 cyber-btn-outline border-[#ff3355] text-[#ff3355] hover:bg-[#ff3355]/10 flex items-center justify-center gap-2"><XCircle size={16} /> nochmal</button>
              <button onClick={() => handle(true)} className="flex-1 cyber-btn flex items-center justify-center gap-2"><CheckCircle size={16} /> gewusst</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
