import LearningOrderingList from './LearningOrderingList.jsx';
import LearningMatchingBoard from './LearningMatchingBoard.jsx';
import LearningCategorizationBoard from './LearningCategorizationBoard.jsx';
import LearningFeedback from './LearningFeedback.jsx';

export default function ThemencheckDragDrop({ question, answer, onAnswer, confirmed }) {
  const mode = question.mode;
  const items = question.items || [];
  const targets = question.targets || [];
  const categories = question.categories || [];

  const label = mode === 'ordering' ? 'Reihenfolge' : mode === 'matching' ? 'Zuordnung' : 'Kategorisierung';

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-[#ffcc00] flex items-center gap-1">
        <span className="uppercase tracking-widest">{label}</span>
        <span className="text-[#8b949e]">— Tippe Item, dann Zielbereich</span>
      </div>

      {mode === 'ordering' && (
        <LearningOrderingList
          items={items}
          correctOrder={question.correctOrder}
          onChange={(next) => onAnswer(next.map((it) => it.id))}
          submitted={confirmed}
          disabled={confirmed}
          showSubmit={false}
          submitLabel="Reihenfolge prüfen"
        />
      )}

      {mode === 'matching' && (
        <LearningMatchingBoard
          items={items}
          targets={targets.map((t) => (typeof t === 'string' ? { id: t, label: t } : t))}
          correctMapping={question.correctMapping}
          answer={answer || {}}
          onChange={onAnswer}
          submitted={confirmed}
          disabled={confirmed}
          showSubmit={false}
          showReset={!confirmed}
        />
      )}

      {mode === 'categorization' && (
        <LearningCategorizationBoard
          items={items}
          categories={categories.map((c) => (typeof c === 'string' ? { id: c, label: c } : c))}
          correctMapping={question.correctMapping}
          answer={answer || {}}
          onChange={onAnswer}
          submitted={confirmed}
          disabled={confirmed}
          showSubmit={false}
          showReset={!confirmed}
        />
      )}

      {confirmed && (
        <LearningFeedback
          status={
            mode === 'ordering'
              ? (answer || []).every((id, i) => id === question.correctOrder[i]) ? 'correct' : 'incorrect'
              : Object.entries(question.correctMapping || {}).every(([id, target]) => (answer || {})[id] === target)
                ? 'correct'
                : 'incorrect'
          }
          explanation={question.explanation}
        >
          <div className="text-xs text-[#8b949e] border-t border-[#30363d] pt-2 mt-2">
            {mode === 'ordering' ? (
              <p>
                Korrekte Reihenfolge: {question.correctOrder.map((id) => items.find((it) => it.id === id)?.label).join(' → ')}
              </p>
            ) : (
              <ul className="space-y-1 mt-1">
                {items.map((it) => {
                  const expected = question.correctMapping[it.id];
                  const actual = (answer || {})[it.id];
                  const isCorrect = actual === expected;
                  return (
                    <li key={it.id} className={isCorrect ? 'text-[#00ff66]' : 'text-[#ff3355]'}>
                      {it.label} → {expected} {actual && actual !== expected && `(du: ${actual})`}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </LearningFeedback>
      )}
    </div>
  );
}
