import { useMemo, useState } from 'react';
import { createRng, makeSeed, shuffle, RNG_NAMESPACE_QUESTIONS } from '../lib/random.js';
import LearningOrderingList from './LearningOrderingList.jsx';
import LearningFeedback from './LearningFeedback.jsx';

const ordered = [
  { id: 'l1', label: 'Physikalisch' },
  { id: 'l2', label: 'Sicherung' },
  { id: 'l3', label: 'Vermittlung / Netzwerk' },
  { id: 'l4', label: 'Transport' },
  { id: 'l5', label: 'Sitzung' },
  { id: 'l6', label: 'Darstellung' },
  { id: 'l7', label: 'Anwendung' },
];
const orderedIds = ordered.map((o) => o.id);

export default function OsiOrderExercise() {
  const initialItems = useMemo(() => {
    const rng = createRng(makeSeed({ subsystem: RNG_NAMESPACE_QUESTIONS, nonce: Date.now() }));
    return shuffle(rng, [...ordered]);
  }, []);
  const [items, setItems] = useState(initialItems);
  const [submitted, setSubmitted] = useState(false);

  const correct = orderedIds.every((id, i) => id === items[i]?.id);

  return (
    <div className="cyber-card p-4">
      <h3 className="font-bold text-[#ffcc00]">OSI-Reihenfolge</h3>
      <p className="mt-1 text-xs text-[#8b949e]">Ordne die Schichten von 1 (unten) bis 7 (oben) an.</p>
      <div className="mt-3">
        <LearningOrderingList
          items={items}
          correctOrder={orderedIds}
          onChange={setItems}
          onSubmit={() => setSubmitted(true)}
          submitted={submitted}
          submitLabel="Reihenfolge prüfen"
        />
      </div>
      {submitted && (
        <div className="mt-3">
          <LearningFeedback
            status={correct ? 'correct' : 'incorrect'}
            headline={correct ? 'Korrekt: Schicht 1 bis 7 sitzt.' : 'Noch nicht.'}
            explanation={correct ? undefined : 'Tipp: Bits und Kabel beginnen bei Schicht 1.'}
          />
        </div>
      )}
    </div>
  );
}
