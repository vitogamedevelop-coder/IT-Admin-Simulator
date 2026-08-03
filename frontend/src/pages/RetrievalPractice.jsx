import { useEffect, useState } from 'react';
import { Shuffle, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { modules } from '../lib/localData';
import { playQuizFeedback } from '../lib/sound';

function getCompletedQuestionIds() {
  try {
    const state = JSON.parse(localStorage.getItem('cyberlearn:offline-state') || '{}');
    return new Set(state.answers || []);
  } catch {
    return new Set();
  }
}

function buildSession(count = 10) {
  const answered = getCompletedQuestionIds();
  const pool = modules.flatMap((m) =>
    (m.questions || []).map((q) => ({ ...q, moduleTitle: m.title, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options }))
  );
  const answeredPool = pool.filter((q) => answered.has(q.id));
  const rest = pool.filter((q) => !answered.has(q.id));
  const selected = [...answeredPool, ...rest].sort(() => Math.random() - 0.5).slice(0, count);
  return selected.sort(() => Math.random() - 0.5);
}

export default function RetrievalPractice() {
  const [session, setSession] = useState([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setSession(buildSession());
  }, []);

  const question = session[active];

  function submit() {
    if (!question || selected === null) return;
    const correct = selected === question.answer;
    setResult({ correct, answer: question.answer, explanation: question.explanation, diagnostic: question.diagnostic });
    if (correct) setCorrectCount((count) => count + 1);
    playQuizFeedback(correct);
  }

  function next() {
    if (active + 1 >= session.length) {
      setDone(true);
      return;
    }
    setActive((i) => i + 1);
    setSelected(null);
    setResult(null);
  }

  function restart() {
    setSession(buildSession());
    setActive(0);
    setSelected(null);
    setResult(null);
    setDone(false);
    setCorrectCount(0);
  }

  if (session.length === 0) return <div className="text-[#00ff66] py-10 text-center">Fragen werden gemischt...</div>;

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <CheckCircle size={56} className="text-[#00ff66]" />
        <h2 className="text-xl font-bold text-white">Abruftraining abgeschlossen</h2>
        <p className="text-[#8b949e] text-sm">{correctCount} von {session.length} zufälligen Fragen richtig beantwortet.</p>
        <button onClick={restart} className="cyber-btn mt-4 flex items-center gap-2"><RotateCcw size={16} /> neue Runde</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] mb-2">
          <Shuffle size={18} />
          <h2 className="font-bold text-sm uppercase tracking-widest">abruftraining</h2>
        </div>
        <p className="text-xs text-[#8b949e]">Zufällige Fragen aus bereits gelernten und neuen Modulen.</p>
      </div>

      <div className="cyber-card p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-[#8b949e]">F{active + 1} / {session.length}</span>
          <span className="text-[10px] text-[#8b949e] bg-[#1f2937] px-2 py-1 rounded">{question.moduleTitle}</span>
        </div>
        <h3 className="text-white font-bold mb-4">{question.question}</h3>
        <div className="flex flex-col gap-2">
          {(question.options || []).map((opt, i) => {
            const color = result
              ? opt === result.answer
                ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                : opt === selected && opt !== result.answer
                ? 'border-[#ff3355] bg-[#ff3355]/10 text-[#ff3355]'
                : 'border-[#1f2937] text-[#8b949e]'
              : opt === selected
              ? 'border-[#00ff66] text-[#00ff66]'
              : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00ff66]';
            return (
              <button
                key={i}
                disabled={result !== null}
                onClick={() => setSelected(opt)}
                className={`text-left p-3 rounded-lg border text-sm transition ${color}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {result && (
          <div className="mt-4 p-3 rounded-lg border border-[#1f2937] bg-[#0d1117]">
            <div className={`font-bold text-sm flex items-center gap-2 ${result.correct ? 'text-[#00ff66]' : 'text-[#ff3355]'}`}>
              {result.correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
              {result.correct ? 'richtig' : 'falsch'}
            </div>
            {!result.correct && (
              <div className="mt-2 text-sm text-[#ffcc00] flex items-start gap-2">
                <AlertTriangle size={18} />
                <span>{result.diagnostic}</span>
              </div>
            )}
            <p className="mt-2 text-sm text-[#8b949e]">{result.explanation}</p>
          </div>
        )}

        <div className="mt-4">
          {!result ? (
            <button onClick={submit} disabled={selected === null} className="cyber-btn w-full">antwort prüfen</button>
          ) : (
            <button onClick={next} className="cyber-btn w-full">weiter</button>
          )}
        </div>
      </div>
    </div>
  );
}
