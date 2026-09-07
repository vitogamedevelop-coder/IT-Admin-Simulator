import { useMemo } from 'react';
import { Check, X, Circle, CircleDot, Square, CheckSquare } from 'lucide-react';
import { createRng, makeSeed, shuffle, RNG_NAMESPACE_QUESTIONS } from '../lib/random.js';

function normalize(option, index) {
  if (typeof option === 'string') {
    return { id: `opt-${index}`, label: option };
  }
  return {
    id: option.id ?? option.value ?? `opt-${index}`,
    label: option.label ?? option.text ?? option.value ?? String(option.id ?? index),
    ...option,
  };
}

export default function LearningOptionList({
  options: rawOptions = [],
  selected = [],
  onSelect,
  mode = 'single',
  correct,
  correctIndices,
  submitted = false,
  disabled = false,
  questionId = '',
  seed,
}) {
  const selectedSet = useMemo(() => {
    if (Array.isArray(selected)) return new Set(selected);
    return new Set([selected].filter(Boolean));
  }, [selected]);

  const isSingle = mode === 'single';

  const options = useMemo(() => {
    const normalized = rawOptions.map(normalize);
    if (seed || questionId) {
      const rng = createRng(seed ?? makeSeed({ subsystem: RNG_NAMESPACE_QUESTIONS, topic: questionId, nonce: Date.now() }));
      return shuffle(rng, [...normalized]);
    }
    return normalized;
  }, [rawOptions, questionId, seed]);

  function handleSelect(id) {
    if (disabled || submitted) return;
    if (isSingle) {
      onSelect?.(id);
      return;
    }
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect?.(Array.from(next));
  }

  const correctSet = useMemo(() => {
    const set = new Set();
    if (correctIndices) {
      correctIndices.forEach((i) => { if (options[i]?.id) set.add(options[i].id); });
    } else if (correct !== undefined) {
      const values = Array.isArray(correct) ? correct : [correct];
      values.forEach((v) => {
        if (typeof v === 'number') {
          if (options[v]?.id) set.add(options[v].id);
        } else if (v != null) {
          set.add(v);
        }
      });
    }
    return set;
  }, [correct, correctIndices, options]);

  return (
    <div className="space-y-2" role="group" aria-label={isSingle ? 'Eine Antwort auswählen' : 'Mehrere Antworten auswählen'}>
      {options.map((opt) => {
        const isSelected = selectedSet.has(opt.id);
        let status = isSelected ? 'selected' : 'idle';
        if (submitted) {
          if (correctSet.has(opt.id)) status = 'correct';
          else if (isSelected) status = 'incorrect';
          else if (mode === 'multi' && !isSelected) status = 'missing';
        }

        const styles = {
          idle: 'border-[#00f0ff]/30 bg-[#0d2138]/60 hover:border-[#00f0ff]/70',
          selected: 'border-[#00f0ff] bg-[#00f0ff]/10',
          correct: 'border-[#00ff66] bg-[#00ff66]/10',
          incorrect: 'border-[#ff7b72] bg-[#ff7b72]/10',
          missing: 'border-[#ffcc00]/60 bg-[#ffcc00]/10',
        }[status];

        const Icon = isSingle
          ? (isSelected ? CircleDot : Circle)
          : (isSelected ? CheckSquare : Square);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelect(opt.id)}
            disabled={disabled || submitted || opt.disabled}
            className={`w-full text-left px-4 py-3 rounded-lg border ${styles} flex items-center gap-3 transition-colors disabled:cursor-not-allowed`}
            aria-pressed={isSelected}
            role={isSingle ? 'radio' : 'checkbox'}
            aria-checked={isSelected}
          >
            <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm flex-1">{opt.label}</span>
            {submitted && status === 'correct' && <Check className="w-4 h-4 text-[#00ff66]" aria-hidden="true" />}
            {submitted && status === 'incorrect' && <X className="w-4 h-4 text-[#ff7b72]" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
