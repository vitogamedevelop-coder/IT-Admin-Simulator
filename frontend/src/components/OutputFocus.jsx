import { useState } from 'react';

export default function OutputFocus({ lines = [], correctIndex = -1, onAnswer, submitted = false }) {
  const [selected, setSelected] = useState(null);

  function select(i) {
    if (submitted) return;
    setSelected(i);
  }

  function submit() {
    if (submitted || selected === null) return;
    const isCorrect = selected === correctIndex;
    onAnswer?.({ allCorrect: isCorrect, selectedIndex: selected, correctIndex });
  }

  return (
    <div className="space-y-3">
      <pre className="bg-[#0a1628] border border-[#00f0ff]/20 rounded p-3 text-xs text-[#c9d1d9] font-mono whitespace-pre-wrap">
        {lines.map((line, i) => {
          const active = selected === i;
          const correct = submitted && i === correctIndex;
          const wrong = submitted && active && !correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => select(i)}
              disabled={submitted}
              className={`block w-full text-left px-2 py-1 rounded transition-colors ${
                active ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/40' : 'hover:bg-[#00f0ff]/5'
              } ${correct ? 'bg-[#00ff66]/10 border border-[#00ff66]/40' : ''} ${wrong ? 'bg-[#ff7b72]/10 border border-[#ff7b72]/40' : ''}`}
            >
              {line}
            </button>
          );
        })}
      </pre>
      {!submitted && (
        <button
          type="button"
          onClick={submit}
          disabled={selected === null}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Diese Zeile markieren
        </button>
      )}
    </div>
  );
}
