import { useState } from 'react';
import { Circle, CircleDot } from 'lucide-react';

export default function NextBestCheck({ options = [], correct = 0, onAnswer, submitted = false }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-3">
      <div className="space-y-2" role="radiogroup" aria-label="Nächster Diagnoseschritt">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          let status = 'idle';
          if (submitted) {
            if (i === correct) status = 'correct';
            else if (isSelected) status = 'incorrect';
          } else if (isSelected) status = 'selected';
          const styles = {
            idle: 'border-[#00f0ff]/30 bg-[#0d2138]/60 hover:border-[#00f0ff]/70',
            selected: 'border-[#00f0ff] bg-[#00f0ff]/10',
            correct: 'border-[#00ff66] bg-[#00ff66]/10',
            incorrect: 'border-[#ff7b72] bg-[#ff7b72]/10',
          }[status];
          const Icon = isSelected ? CircleDot : Circle;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-lg border ${styles} flex items-center gap-3 transition-colors disabled:cursor-not-allowed`}
              role="radio"
              aria-checked={isSelected}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm flex-1">{opt}</span>
            </button>
          );
        })}
      </div>
      {!submitted && (
        <button
          type="button"
          onClick={() => selected !== null && onAnswer?.({ allCorrect: selected === correct, selectedIndex: selected, correctIndex: correct })}
          disabled={selected === null}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Prüfen
        </button>
      )}
    </div>
  );
}
