import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

export default function LearningOrderingList({
  items: initialItems = [],
  correctOrder,
  onChange,
  onSubmit,
  submitted = false,
  disabled = false,
  submitLabel = 'Reihenfolge prüfen',
  children,
  showHandles = false,
  showSubmit = true,
}) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function move(from, to) {
    if (disabled || submitted) return;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    onChange?.(next);
  }

  function handleSubmit() {
    if (!submitted && !disabled) onSubmit?.(items.map((it) => it.id));
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const correct = submitted && correctOrder && item.id === correctOrder[index];
        const wrong = submitted && correctOrder && item.id !== correctOrder[index];
        const rowClass = correct
          ? 'border-[#00ff66] bg-[#00ff66]/10'
          : wrong
            ? 'border-[#ff7b72] bg-[#ff7b72]/10'
            : 'border-[#00f0ff]/30 bg-[#0d2138]/60';

        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${rowClass}`}
            role="listitem"
          >
            {showHandles && (
              <div className="text-[#8b949e]" aria-label="Ziehen">
                <GripVertical className="w-4 h-4" aria-hidden="true" />
              </div>
            )}
            <span className="text-sm flex-1 min-w-0" aria-label={`Position ${index + 1}`}>{item.label}</span>
            {!submitted && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-[#00f0ff]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`${item.label} nach oben`}
                >
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="p-1.5 rounded hover:bg-[#00f0ff]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`${item.label} nach unten`}
                >
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {!submitted && showSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          className="cyber-btn w-full mt-3 py-2 text-sm"
          disabled={disabled}
          aria-label={submitLabel}
        >
          {submitLabel}
        </button>
      )}

      {children}
    </div>
  );
}
