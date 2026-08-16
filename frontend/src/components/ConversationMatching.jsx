import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function ConversationMatching({ question, disabled, onAnswer }) {
  const [matches, setMatches] = useState({});
  const [selectedLeftId, setSelectedLeftId] = useState(null);

  useEffect(() => {
    setMatches({});
    setSelectedLeftId(null);
  }, [question.instanceId]);

  function selectLeft(item) {
    if (disabled || matches[item.id]) return;
    setSelectedLeftId(item.id);
  }

  function selectRight(right) {
    if (!selectedLeftId || disabled) return;
    setMatches((prev) => ({ ...prev, [selectedLeftId]: right.id }));
    setSelectedLeftId(null);
  }

  function removeMatch(leftId) {
    if (disabled) return;
    setMatches((prev) => {
      const next = { ...prev };
      delete next[leftId];
      return next;
    });
  }

  const matchedLeftIds = new Set(Object.keys(matches));
  const remainingLeft = question.leftItems.filter((l) => !matchedLeftIds.has(l.id));
  const availableRight = question.rightItems.filter((r) => !Object.values(matches).includes(r.id));

  return (
    <div className="flex flex-col gap-3">
      {Object.keys(matches).length > 0 && (
        <div className="flex flex-col gap-2">
          {question.leftItems.filter((l) => matches[l.id]).map((left) => {
            const right = question.rightItems.find((r) => r.id === matches[left.id]);
            return (
              <div key={left.id} className="flex items-center gap-2 p-2 rounded-lg border border-[#00ff66]/40 bg-[#00ff66]/10 text-sm">
                <CheckCircle size={14} className="text-[#00ff66] shrink-0" />
                <span className="flex-1 text-[#c9d1d9]"><span className="text-[#00f0ff]">{left.label}</span> → {right?.label}</span>
                {!disabled && (
                  <button onClick={() => removeMatch(left.id)} className="p-1 text-[#8b949e] hover:text-white" aria-label="Paar lösen"><X size={14} /></button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedLeftId ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-[#00f0ff]">
            Gewählt: {question.leftItems.find((l) => l.id === selectedLeftId)?.label}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {availableRight.map((right) => (
              <button
                key={right.id}
                onClick={() => selectRight(right)}
                className="text-left p-3 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/60 text-sm text-[#c9d1d9] hover:bg-[#21262d] active:bg-[#00f0ff]/10"
              >
                {right.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedLeftId(null)} className="text-xs text-[#8b949e] hover:text-white text-left py-1">
            ← Zurück zur Auswahl
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {remainingLeft.map((left) => (
            <button
              key={left.id}
              disabled={disabled || matches[left.id]}
              onClick={() => selectLeft(left)}
              className="text-left p-3 rounded-lg border border-[#00f0ff]/20 bg-[#0a1628]/60 text-sm text-[#c9d1d9] hover:bg-[#21262d] active:bg-[#00f0ff]/10 disabled:opacity-50"
            >
              {left.label}
            </button>
          ))}
        </div>
      )}

      {!disabled && (
        <button
          onClick={() => onAnswer(matches)}
          disabled={Object.keys(matches).length !== question.correctPairs.length}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Zuordnung prüfen
        </button>
      )}
    </div>
  );
}
