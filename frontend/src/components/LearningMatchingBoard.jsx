import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function LearningMatchingBoard({
  items = [],
  targets = [],
  correctMapping = {},
  answer = {},
  onChange,
  onSubmit,
  submitted = false,
  disabled = false,
  submitLabel = 'Zuordnung prüfen',
  children,
  maxPerTarget = 1,
  showSubmit = true,
  showReset = true,
}) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    setActive(null);
  }, [items, targets]);

  const usedTargets = new Set(Object.values(answer));

  function selectItem(id) {
    if (disabled || submitted) return;
    setActive((prev) => (prev === id ? null : id));
  }

  function assign(targetId) {
    if (disabled || submitted || !active) return;
    const next = { ...answer };
    const currentTargetCount = Object.values(next).filter((v) => v === targetId).length;

    if (next[active] === targetId) {
      delete next[active];
      onChange?.(next);
      setActive(null);
      return;
    }

    // For strict one-to-one matching, clear any previous assignment to this target.
    if (maxPerTarget === 1) {
      for (const [item, target] of Object.entries(next)) {
        if (target === targetId) delete next[item];
      }
    } else if (currentTargetCount >= maxPerTarget) {
      return;
    }

    next[active] = targetId;
    onChange?.(next);
    setActive(null);
  }

  function remove(itemId) {
    if (disabled || submitted) return;
    const next = { ...answer };
    delete next[itemId];
    onChange?.(next);
  }

  function reset() {
    if (disabled || submitted) return;
    onChange?.({});
    setActive(null);
  }

  function isComplete() {
    return items.every((it) => answer[it.id] !== undefined);
  }

  function handleSubmit() {
    if (!disabled && !submitted && isComplete()) {
      onSubmit?.(answer);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#8b949e] mb-2" aria-live="polite">
        {active ? `Gewählt: ${items.find((it) => it.id === active)?.label} – tippe nun ein Ziel.` : 'Tippe ein Item, dann das passende Ziel.'}
      </div>

      <div className="grid gap-2" role="group" aria-label="Zuordenbare Items">
        {items.map((it) => {
          const selected = active === it.id;
          const targetId = answer[it.id];
          const targetLabel = targetId ? targets.find((t) => t.id === targetId)?.label : null;
          const isCorrect = submitted && correctMapping[it.id] === targetId;
          const isWrong = submitted && correctMapping[it.id] !== targetId;

          const styles = {
            idle: 'border-[#00f0ff]/30 bg-[#0d2138]/60',
            selected: 'border-[#00f0ff] bg-[#00f0ff]/10',
            correct: 'border-[#00ff66] bg-[#00ff66]/10',
            wrong: 'border-[#ff7b72] bg-[#ff7b72]/10',
          }[submitted ? (isCorrect ? 'correct' : 'wrong') : (selected ? 'selected' : 'idle')];

          return (
            <button
              key={it.id}
              type="button"
              onClick={() => selectItem(it.id)}
              disabled={submitted}
              className={`text-left px-3 py-2 rounded-lg border ${styles} flex items-center gap-2 transition-colors disabled:cursor-not-allowed`}
              aria-pressed={selected}
              aria-label={it.label}
            >
              <span className="text-sm flex-1">{it.label}</span>
              {targetLabel && (
                <span className="text-xs text-[#00f0ff]">→ {targetLabel}</span>
              )}
              {submitted && isCorrect && <Check className="w-4 h-4 text-[#00ff66]" aria-hidden="true" />}
              {submitted && isWrong && <X className="w-4 h-4 text-[#ff7b72]" aria-hidden="true" />}
              {!submitted && targetLabel && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(it.id); }}
                  className="p-1 rounded hover:bg-[#ff7b72]/20"
                  aria-label={`Zuordnung für ${it.label} entfernen`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Ziele">
        {targets.map((t) => {
          const count = Object.values(answer).filter((v) => v === t.id).length;
          const isUsed = usedTargets.has(t.id);
          const isActiveTarget = active && answer[active] === t.id;
          const style = isActiveTarget
            ? 'border-[#00f0ff] bg-[#00f0ff]/20'
            : isUsed
              ? 'border-[#00ff66]/60 bg-[#00ff66]/10'
              : 'border-[#00f0ff]/30 bg-[#0d2138]/60 hover:border-[#00f0ff]';

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => assign(t.id)}
              disabled={!active || submitted}
              className={`px-3 py-2 rounded-lg border ${style} text-sm transition-colors disabled:cursor-not-allowed`}
              aria-pressed={isActiveTarget}
            >
              <div className="font-medium text-xs">{t.label}</div>
              {count > 0 && <div className="text-[10px] text-[#8b949e] text-right">{count}</div>}
            </button>
          );
        })}
      </div>

      {!submitted && (showSubmit || showReset) && (
        <div className="flex gap-2">
          {showSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isComplete() || disabled}
              className="cyber-btn flex-1 py-2 text-sm disabled:opacity-50"
              aria-label={submitLabel}
            >
              {submitLabel}
            </button>
          )}
          {showReset && (
            <button
              type="button"
              onClick={reset}
              className="cyber-btn-outline py-2 px-4 text-sm"
              disabled={disabled}
              aria-label="Zurücksetzen"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
