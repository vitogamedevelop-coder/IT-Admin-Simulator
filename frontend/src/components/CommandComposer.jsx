import { useMemo, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

export default function CommandComposer({
  tokens = [],
  correctOrder = [],
  onAnswer,
  submitted = false,
  submitLabel = 'Reihenfolge prüfen',
  resetLabel = 'Zurücksetzen',
}) {
  const [selected, setSelected] = useState([]);

  const bank = useMemo(() => {
    const used = new Set(selected);
    return tokens.map((t) => ({ ...t, used: used.has(t.id) }));
  }, [tokens, selected]);

  function add(id) {
    if (submitted) return;
    setSelected((prev) => [...prev, id]);
  }

  function remove(index) {
    if (submitted) return;
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setSelected([]);
  }

  function submit() {
    if (submitted || selected.length === 0) return;
    const allCorrect = selected.length === correctOrder.length && selected.every((id, i) => id === correctOrder[i]);
    const partial = !allCorrect && selected.some((id, i) => id === correctOrder[i]);
    onAnswer?.({ allCorrect, selectedIds: selected, expectedIds: correctOrder, partial });
  }

  return (
    <div className="space-y-3">
      <div className="min-h-[44px] p-2 rounded-lg border border-dashed border-[#00f0ff]/40 bg-[#0a1628]/80 flex flex-wrap gap-2">
        {selected.length === 0 && <span className="text-xs text-[#8b949e] self-center">Tippe die Teile in der richtigen Reihenfolge an.</span>}
        {selected.map((id, i) => {
          const token = tokens.find((t) => t.id === id);
          return (
            <button
              key={`${id}-${i}`}
              type="button"
              onClick={() => remove(i)}
              disabled={submitted}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-xs text-[#c9d1d9] active:bg-[#00f0ff]/20 disabled:opacity-60"
            >
              {token?.label || id}
              {!submitted && <X className="w-3 h-3" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {bank.map((token) => (
          <button
            key={token.id}
            type="button"
            onClick={() => add(token.id)}
            disabled={token.used || submitted}
            className="px-3 py-2 rounded-full border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#0d2138]/60 border-[#00f0ff]/30 text-[#c9d1d9] hover:border-[#00f0ff] active:bg-[#00f0ff]/10"
          >
            {token.label}
          </button>
        ))}
      </div>

      {!submitted && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={selected.length === 0}
            className="flex-1 cyber-btn py-2 text-sm disabled:opacity-40"
          >
            {submitLabel}
          </button>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="px-3 py-2 rounded-lg border border-[#8b949e]/30 text-xs text-[#8b949e] hover:text-white active:bg-[#8b949e]/10"
              aria-label={resetLabel}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
