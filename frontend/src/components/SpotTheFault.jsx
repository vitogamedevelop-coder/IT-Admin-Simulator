import { useState } from 'react';

export default function SpotTheFault({ lines = [], faultIndex = -1, onAnswer, submitted = false }) {
  const [selected, setSelected] = useState(null);

  function select(i) {
    if (submitted) return;
    setSelected(i);
  }

  function submit() {
    if (submitted || selected === null) return;
    const isCorrect = selected === faultIndex;
    onAnswer?.({ allCorrect: isCorrect, selectedIndex: selected, faultIndex });
  }

  return (
    <div className="space-y-3">
      <pre className="bg-[#0a1628] border border-[#ff7b72]/20 rounded p-3 text-xs text-[#c9d1d9] font-mono whitespace-pre-wrap">
        {lines.map((line, i) => {
          const active = selected === i;
          const correct = submitted && i === faultIndex;
          const wrong = submitted && active && !correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => select(i)}
              disabled={submitted}
              className={`block w-full text-left px-2 py-1 rounded transition-colors ${
                active ? 'bg-[#ffcc00]/10 border border-[#ffcc00]/40' : 'hover:bg-[#ffcc00]/5'
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
