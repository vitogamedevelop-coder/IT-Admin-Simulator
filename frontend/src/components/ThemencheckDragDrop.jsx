import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function ThemencheckDragDrop({ question, answer, onAnswer, confirmed }) {
  const [active, setActive] = useState(null);
  const mode = question.mode;
  const items = question.items || [];
  const targets = question.targets || [];
  const categories = question.categories || [];

  function isAssigned(id) {
    if (mode === 'ordering') return (answer || []).includes(id);
    return answer && answer[id] !== undefined;
  }

  function assignedValue(id) {
    if (mode === 'ordering') return null;
    return answer ? answer[id] : null;
  }

  function handleItemClick(id) {
    if (confirmed) return;
    if (mode === 'ordering') {
      if ((answer || []).includes(id)) return;
      onAnswer([...(answer || []), id]);
    } else {
      if (answer && answer[id] !== undefined) {
        const next = { ...answer };
        delete next[id];
        onAnswer(next);
        setActive(null);
      } else {
        setActive(id);
      }
    }
  }

  function handleTargetClick(value) {
    if (confirmed || !active) return;
    onAnswer({ ...answer, [active]: value });
    setActive(null);
  }

  function removeOrderAt(index) {
    if (confirmed) return;
    const next = [...(answer || [])];
    next.splice(index, 1);
    onAnswer(next);
  }

  function resetAnswer() {
    if (confirmed) return;
    if (mode === 'ordering') onAnswer([]);
    else onAnswer({});
    setActive(null);
  }

  function isCorrectItem(id) {
    if (mode === 'ordering') {
      const idx = (answer || []).indexOf(id);
      return idx !== -1 && answer[idx] === question.correctOrder[idx];
    }
    return answer && answer[id] === question.correctMapping[id];
  }

  const isComplete = mode === 'ordering'
    ? (answer || []).length === items.length
    : answer && Object.keys(answer).length === items.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-[#ffcc00] flex items-center gap-1">
        <span className="uppercase tracking-widest">
          {mode === 'ordering' ? 'Reihenfolge' : mode === 'matching' ? 'Zuordnung' : 'Kategorisierung'}
        </span>
        <span className="text-[#8b949e]">— Tippe Item, dann Zielbereich</span>
      </div>

      {mode === 'ordering' && (
        <div className="cyber-card p-3 bg-[#0a1628]/80 border-[#00f0ff]/20">
          <p className="text-xs text-[#8b949e] mb-2">Deine Reihenfolge:</p>
          <div className="flex flex-wrap gap-2">
            {(answer || []).map((id, i) => {
              const it = items.find((x) => x.id === id);
              const correct = confirmed && answer[i] === question.correctOrder[i];
              return (
                <button
                  key={`${id}-${i}`}
                  onClick={() => removeOrderAt(i)}
                  disabled={confirmed}
                  className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${
                    confirmed
                      ? correct
                        ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]'
                        : 'bg-[#ff3355]/10 border-[#ff3355]/40 text-[#ff3355]'
                      : 'bg-[#0a1628]/80 border-[#00f0ff]/40 text-[#c9d1d9]'
                  }`}
                >
                  {i + 1}. {it?.label}
                  {!confirmed && <XCircle size={12} />}
                  {confirmed && (correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />)}
                </button>
              );
            })}
            {!isComplete && <span className="text-xs text-[#8b949e] self-center">…</span>}
          </div>
        </div>
      )}

      {mode !== 'ordering' && active && (
        <p className="text-xs text-[#00f0ff]">
          Gewählt: {items.find((it) => it.id === active)?.label} — tippe nun ein Ziel.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((it) => {
          const assigned = isAssigned(it.id);
          const value = assignedValue(it.id);
          const currentActive = active === it.id;
          let cls = 'p-3 rounded-lg border text-xs sm:text-sm text-left min-h-[3.5rem] flex items-center gap-2';
          if (confirmed) {
            cls += isCorrectItem(it.id)
              ? ' bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]'
              : ' bg-[#ff3355]/10 border-[#ff3355]/40 text-[#ff3355]';
          } else if (currentActive) {
            cls += ' bg-[#00f0ff]/20 border-[#00f0ff] text-white';
          } else if (assigned) {
            cls += ' bg-[#0a1628]/40 border-[#00f0ff]/30 text-[#8b949e]';
          } else {
            cls += ' bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9]';
          }
          return (
            <button key={it.id} onClick={() => handleItemClick(it.id)} disabled={confirmed} className={cls}>
              <span className="flex-1">{it.label}</span>
              {mode !== 'ordering' && assigned && (
                <span className="text-[10px] text-[#00f0ff] truncate max-w-[8ch]">{value}</span>
              )}
            </button>
          );
        })}
      </div>

      {mode !== 'ordering' && (
        <div className="flex flex-wrap gap-2">
          {(targets.length ? targets : categories).map((val) => (
            <button
              key={val}
              onClick={() => handleTargetClick(val)}
              disabled={confirmed || !active}
              className={`text-xs px-3 py-2 rounded border ${
                confirmed
                  ? 'bg-[#0a1628]/40 border-[#30363d] text-[#8b949e]'
                  : active
                    ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-white'
                    : 'bg-[#0a1628]/60 border-[#00f0ff]/20 text-[#c9d1d9] opacity-60'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      )}

      {confirmed && (
        <div className="text-xs text-[#8b949e] border-t border-[#30363d] pt-2">
          {mode === 'ordering' ? (
            <p>
              Korrekte Reihenfolge: {question.correctOrder.map((id) => items.find((it) => it.id === id)?.label).join(' → ')}
            </p>
          ) : (
            <ul className="space-y-1 mt-1">
              {items.map((it) => (
                <li key={it.id} className={isCorrectItem(it.id) ? 'text-[#00ff66]' : 'text-[#ff3355]'}>
                  {it.label} → {question.correctMapping[it.id]}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!confirmed && (
        <button
          onClick={resetAnswer}
          className="text-xs text-[#8b949e] flex items-center gap-1 self-start hover:text-[#00f0ff]"
        >
          <RotateCcw size={12} /> Zurücksetzen
        </button>
      )}
    </div>
  );
}
