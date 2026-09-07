import { useMemo, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { recordAnswer } from '../lib/competency';
import { playQuizFeedback } from '../lib/sound';
import { createRng, makeSeed, shuffle, RNG_NAMESPACE_QUESTIONS } from '../lib/random.js';
import LearningOrderingList from './LearningOrderingList.jsx';
import LearningOptionList from './LearningOptionList.jsx';
import LearningFeedback from './LearningFeedback.jsx';
import GlossaryText from './GlossaryText';

// Generic learning interaction component
// Supports: 'sort' (reorder items) and 'choice' (pick one option)
export default function LearningInteraction({ interaction, onComplete }) {
  if (!interaction) return null;

  if (interaction.type === 'sort') {
    return <SortInteraction interaction={interaction} onComplete={onComplete} />;
  }
  if (interaction.type === 'choice') {
    return <ChoiceInteraction interaction={interaction} onComplete={onComplete} />;
  }
  return <div className="text-sm text-[#8b949e]">Unbekannter Interaktionstyp.</div>;
}

function SortInteraction({ interaction, onComplete }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [seed, setSeed] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const items = useMemo(() => {
    const rng = createRng(makeSeed({ subsystem: RNG_NAMESPACE_QUESTIONS, topic: interaction.id, nonce: seed }));
    return shuffle(rng, [...interaction.items]);
  }, [interaction.items, interaction.id, seed]);

  function handleSubmit(answer) {
    const isCorrect = answer.every((id, idx) => id === interaction.correctOrder[idx]);
    setCorrect(isCorrect);
    setSubmitted(true);
    playQuizFeedback(isCorrect);
    recordAnswer({
      question: { id: interaction.id, question: interaction.prompt, answer: interaction.correctOrder.join(','), difficulty: 2, type: 'scenario', topic: interaction.topic },
      module: { title: interaction.title },
      correct: isCorrect,
      elapsedMs: Date.now() - startedAt,
      confidence: 2,
      mode: 'interaction',
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#c9d1d9] whitespace-pre-line">{interaction.prompt}</p>
      <LearningOrderingList
        items={items}
        correctOrder={interaction.correctOrder}
        onSubmit={handleSubmit}
        submitted={submitted}
        submitLabel="Reihenfolge prüfen"
      />
      {submitted && (
        <LearningFeedback
          status={correct ? 'correct' : 'incorrect'}
          explanation={correct ? undefined : 'Probiere es noch einmal. Kein Punktabzug.'}
        >
          {correct && <CompletionBody interaction={interaction} onComplete={onComplete} />}
          {!correct && (
            <button onClick={() => { setSubmitted(false); setCorrect(false); setSeed(Date.now()); }} className="cyber-btn w-full mt-3">Erneut versuchen</button>
          )}
        </LearningFeedback>
      )}
    </div>
  );
}

function ChoiceInteraction({ interaction, onComplete }) {
  const startedAt = useMemo(() => Date.now(), []);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const correctId = useMemo(() => interaction.options.find((o) => o.correct)?.id, [interaction.options]);

  function submit() {
    if (selected === null) return;
    setSubmitted(true);
    const option = interaction.options.find((o) => o.id === selected);
    const isCorrect = option?.correct || false;
    playQuizFeedback(isCorrect);
    recordAnswer({
      question: { id: interaction.id, question: interaction.prompt, answer: interaction.options.find((o) => o.correct)?.label, difficulty: 2, type: 'scenario', topic: interaction.topic },
      module: { title: interaction.title },
      correct: isCorrect,
      elapsedMs: Date.now() - startedAt,
      confidence: 2,
      mode: 'interaction',
    });
  }

  function retry() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#c9d1d9] whitespace-pre-line"><GlossaryText>{interaction.prompt}</GlossaryText></p>
      <LearningOptionList
        options={interaction.options}
        selected={selected}
        onSelect={setSelected}
        mode="single"
        correct={correctId}
        submitted={submitted}
        questionId={interaction.id}
      />
      {!submitted && (
        <button onClick={submit} disabled={selected === null} className="cyber-btn w-full disabled:opacity-40">Antwort prüfen</button>
      )}
      {submitted && (
        <LearningFeedback
          status={selected === correctId ? 'correct' : 'incorrect'}
          explanation={selected === correctId ? undefined : 'Die richtige Antwort ist markiert. Versuche es noch einmal.'}
        >
          {selected === correctId ? (
            <CompletionBody interaction={interaction} onComplete={onComplete} />
          ) : (
            <button onClick={retry} className="cyber-btn w-full mt-3">Erneut versuchen</button>
          )}
        </LearningFeedback>
      )}
    </div>
  );
}

function CompletionBody({ interaction, onComplete }) {
  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center gap-2 text-[#00ff66] text-sm font-bold"><CheckCircle size={16} /> Richtig!</div>
      {interaction.explanation?.length > 0 && (
        <div className="cyber-card p-3">
          <div className="text-[10px] uppercase tracking-widest text-[#00f0ff] mb-2">Praxisbezug</div>
          {interaction.explanation.map((item) => (
            <div key={item.label} className="flex gap-2 text-xs mb-1.5">
              <span className="text-[#ffcc00] shrink-0">{item.label}:</span>
              <span className="text-[#c9d1d9]">{item.detail}</span>
            </div>
          ))}
        </div>
      )}
      {interaction.takeaway && (
        <div className="p-2.5 rounded border border-[#ffcc00]/30 bg-[#ffcc00]/5">
          <span className="text-[10px] text-[#ffcc00] block mb-1">Merksatz</span>
          <span className="text-sm text-white">{interaction.takeaway}</span>
        </div>
      )}
      <button onClick={() => onComplete?.(true)} className="cyber-btn w-full">Weiter</button>
    </div>
  );
}
