import { useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle, XCircle } from 'lucide-react';
import { recordAnswer } from '../lib/competency';
import { playQuizFeedback } from '../lib/sound';
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
  const [items, setItems] = useState(() => shuffle([...interaction.items]));
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const startedAt = Date.now();

  function moveUp(index) {
    if (index === 0 || submitted) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  }

  function moveDown(index) {
    if (index === items.length - 1 || submitted) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
  }

  function submit() {
    const isCorrect = items.every((item, idx) => item.id === interaction.correctOrder[idx]);
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

  function retry() {
    setItems(shuffle([...interaction.items]));
    setSubmitted(false);
    setCorrect(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#c9d1d9] whitespace-pre-line">{interaction.prompt}</p>

      <div className="flex flex-col gap-1.5">
        {items.map((item, idx) => {
          const isRight = submitted && item.id === interaction.correctOrder[idx];
          const isWrong = submitted && !isRight;
          return (
            <div key={item.id} className={`flex items-center gap-2 p-2.5 rounded border transition-colors ${
              isRight ? 'border-[#00ff66] bg-[#00ff66]/10' : isWrong ? 'border-[#ff3355]/50 bg-[#ff3355]/5' : 'border-[#30363d]'
            }`}>
              <span className="text-xs text-[#8b949e] w-5 shrink-0">{idx + 1}.</span>
              <span className="flex-1 text-sm text-white">{item.label}</span>
              {!submitted && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 rounded text-[#8b949e] hover:text-[#00f0ff] disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1} className="p-1 rounded text-[#8b949e] hover:text-[#00f0ff] disabled:opacity-30"><ArrowDown size={14} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && <button onClick={submit} className="cyber-btn w-full">Reihenfolge pr&uuml;fen</button>}

      {submitted && !correct && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#ffcc00] text-sm font-bold"><XCircle size={16} /> Noch nicht ganz richtig</div>
          <p className="text-xs text-[#c9d1d9]">Probiere es noch einmal. Kein Punktabzug.</p>
          <button onClick={retry} className="cyber-btn w-full">Erneut versuchen</button>
        </div>
      )}

      {submitted && correct && (
        <CompletionView interaction={interaction} onComplete={onComplete} />
      )}
    </div>
  );
}

function ChoiceInteraction({ interaction, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const startedAt = Date.now();

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

  const selectedOption = interaction.options.find((o) => o.id === selected);
  const isCorrect = submitted && selectedOption?.correct;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#c9d1d9] whitespace-pre-line">{interaction.prompt}</p>

      <div className="flex flex-col gap-2">
        {interaction.options.map((option) => {
          let style = 'border-[#30363d] text-[#c9d1d9]';
          if (submitted && option.correct) style = 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]';
          else if (submitted && option.id === selected && !option.correct) style = 'border-[#ff3355] bg-[#ff3355]/5 text-[#ff3355]';
          else if (!submitted && option.id === selected) style = 'border-[#00f0ff] text-[#00f0ff]';
          return (
            <button
              key={option.id}
              disabled={submitted}
              onClick={() => setSelected(option.id)}
              className={`text-left p-3 rounded border text-sm transition-colors ${style}`}
            >
              <GlossaryText>{option.label}</GlossaryText>
            </button>
          );
        })}
      </div>

      {!submitted && <button onClick={submit} disabled={selected === null} className="cyber-btn w-full">Antwort pr&uuml;fen</button>}

      {submitted && !isCorrect && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#ffcc00] text-sm font-bold"><XCircle size={16} /> Nicht ganz</div>
          <p className="text-xs text-[#c9d1d9]">Die richtige Antwort ist markiert. Versuche es noch einmal.</p>
          <button onClick={retry} className="cyber-btn w-full">Erneut versuchen</button>
        </div>
      )}

      {submitted && isCorrect && (
        <CompletionView interaction={interaction} onComplete={onComplete} />
      )}
    </div>
  );
}

function CompletionView({ interaction, onComplete }) {
  return (
    <div className="flex flex-col gap-3">
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
