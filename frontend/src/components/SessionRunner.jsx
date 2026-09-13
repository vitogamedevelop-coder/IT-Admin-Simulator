import { useMemo, useState } from 'react';
import {
  recordLessonCompletion, recordQuestionAnswer, recordExerciseCompletion, recordSectionView,
} from '../lib/academyEngine';
import { resolveFacetIds } from '../lib/learningEvidence';
import SessionHeader from './SessionHeader.jsx';
import SamLine from './SamLine.jsx';
import SessionFeedback from './SessionFeedback.jsx';
import LearningOptionList from './LearningOptionList.jsx';
import LearningCommandInput from './LearningCommandInput.jsx';
import CommandComposer from './CommandComposer.jsx';
import NextBestCheck from './NextBestCheck.jsx';
import OutputFocus from './OutputFocus.jsx';
import SpotTheFault from './SpotTheFault.jsx';
import DiagnosticQuestionRenderer from './DiagnosticQuestionRenderer.jsx';

export default function SessionRunner({ categoryId, topicId, lesson, onDone }) {
  const steps = useMemo(() => lesson.session?.steps || [], [lesson.session]);
  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const totalSteps = steps.length;
  const step = steps[stepIndex];
  const answered = !!feedback;

  function recordStepResult(stepData, isCorrect) {
    const facetIds = resolveFacetIds({
      facet: stepData.facet,
      relatedKnowledgeIds: stepData.relatedKnowledgeIds,
      id: stepData.id,
      sectionId: stepData.sectionId,
      topicId: `${categoryId}/${topicId}`,
    });
    if (['choice', 'next-best-check', 'diagnostic'].includes(stepData.type)) {
      recordQuestionAnswer(categoryId, topicId, stepData.id, 'theory', isCorrect, stepData.evidenceType, facetIds, stepData.difficulty);
    } else if (['composer', 'cli', 'output-focus', 'spot-fault', 'transfer'].includes(stepData.type)) {
      recordExerciseCompletion(categoryId, topicId, stepData.id, stepData.evidenceType, facetIds);
    }
    if (stepData.sectionId) {
      recordSectionView(categoryId, topicId, stepData.sectionId, facetIds);
    }
  }

  function handleAnswer(stepData, result) {
    if (answered) return;
    const isCorrect = result.allCorrect || result.correct;
    const partial = result.partial || false;
    const status = isCorrect ? 'correct' : (partial ? 'partial' : 'incorrect');

    recordStepResult(stepData, isCorrect);

    setFeedback({
      status,
      title: stepData.feedback?.[status]?.title || defaultTitle(status),
      explanation: stepData.feedback?.[status]?.text || defaultExplanation(status, stepData),
      why: stepData.why,
    });
  }

  function next() {
    if (stepIndex + 1 >= totalSteps) {
      setFinished(true);
      recordLessonCompletion(categoryId, topicId, 'session');
    } else {
      setStepIndex((i) => i + 1);
      setFeedback(null);
    }
  }

  if (!step || finished) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="cyber-card p-6 text-center">
          <div className="text-[#00ff66] font-bold text-lg mb-2">Session abgeschlossen</div>
          <p className="text-sm text-[#c9d1d9]">{lesson.title} – Du hast alle Aufgaben durchgearbeitet.</p>
          <button onClick={onDone} className="cyber-btn w-full mt-4 py-2 text-sm">Fertig</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0a1628]">
      <SessionHeader
        title={lesson.title}
        current={stepIndex + 1}
        total={totalSteps}
        onBack={stepIndex > 0 ? () => setStepIndex((i) => Math.max(0, i - 1)) : undefined}
        onExit={onDone}
      />
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {step.sam && <SamLine text={step.sam} mood={step.samMood || 'neutral'} />}
        {step.title && step.type !== 'narrative' && (
          <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">{step.title}</div>
        )}
        <StepCard step={step} submitted={answered} onAnswer={(r) => handleAnswer(step, r)} />
      </main>
      {feedback && (
        <div className="shrink-0">
          <SessionFeedback
            status={feedback.status}
            title={feedback.title}
            explanation={feedback.explanation}
            why={feedback.why}
            onContinue={next}
            continueLabel={stepIndex + 1 >= totalSteps ? 'Abschließen' : 'Weiter'}
          />
        </div>
      )}
    </div>
  );
}

function StepCard({ step, submitted, onAnswer }) {
  switch (step.type) {
    case 'narrative':
      return <NarrativeStep step={step} onContinue={onAnswer} />;
    case 'choice':
      return <ChoiceStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'composer':
      return <ComposerStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'cli':
      return <CliStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'next-best-check':
      return <NextBestCheckStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'output-focus':
      return <OutputFocusStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'spot-fault':
      return <SpotFaultStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'diagnostic':
      return <DiagnosticStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    case 'transfer':
      return <TransferStep step={step} submitted={submitted} onAnswer={onAnswer} />;
    default:
      return <p className="text-sm text-[#8b949e]">Unbekannter Schritttyp: {step.type}</p>;
  }
}

function NarrativeStep({ step, onContinue }) {
  return (
    <div className="cyber-card p-4">
      {step.content && <p className="text-sm text-[#c9d1d9] whitespace-pre-line">{step.content}</p>}
      <button onClick={() => onContinue({ allCorrect: true, correct: true })} className="cyber-btn w-full mt-4 py-2 text-sm">
        {step.button || 'Weiter'}
      </button>
    </div>
  );
}

function ChoiceStep({ step, submitted, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const correctId = step.options.find((o) => o.correct)?.id;
  const options = step.options.map((o) => ({ id: o.id, label: o.label }));

  return (
    <div className="cyber-card p-4 space-y-3">
      <p className="text-sm text-white font-bold">{step.question}</p>
      <LearningOptionList
        options={options}
        selected={selected}
        onSelect={setSelected}
        mode="single"
        correct={correctId}
        submitted={submitted}
        questionId={step.id}
      />
      {!submitted && (
        <button
          type="button"
          onClick={() => selected !== null && onAnswer({ allCorrect: selected === correctId, correct: selected === correctId, selected })}
          disabled={selected === null}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Antwort prüfen
        </button>
      )}
    </div>
  );
}

function ComposerStep({ step, submitted, onAnswer }) {
  return (
    <div className="cyber-card p-4 space-y-3">
      <p className="text-sm text-white font-bold">{step.question}</p>
      <CommandComposer
        tokens={step.tokens}
        correctOrder={step.correctOrder}
        onAnswer={onAnswer}
        submitted={submitted}
      />
    </div>
  );
}

function CliStep({ step, submitted, onAnswer }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  return (
    <div className="cyber-card p-4 space-y-3">
      <p className="text-sm text-white font-bold">{step.question}</p>
      <LearningCommandInput
        expectedLines={step.expectedLines}
        value={value}
        onChange={setValue}
        onCheck={(outcome) => { setResult(outcome); onAnswer(outcome); }}
        submitted={submitted}
        result={result}
        explanation={step.explanation}
        startContext={step.startContext}
        hint={step.hint}
      />
    </div>
  );
}

function NextBestCheckStep({ step, submitted, onAnswer }) {
  return (
    <div className="cyber-card p-4 space-y-3">
      <DiagnosticQuestionRenderer diagnostic={step.diagnostic} question={step.question} />
      <NextBestCheck options={step.options} correct={step.correct} onAnswer={onAnswer} submitted={submitted} />
    </div>
  );
}

function OutputFocusStep({ step, submitted, onAnswer }) {
  return (
    <div className="cyber-card p-4 space-y-3">
      <p className="text-sm text-white font-bold">{step.question}</p>
      <OutputFocus lines={step.lines} correctIndex={step.correctIndex} onAnswer={onAnswer} submitted={submitted} />
    </div>
  );
}

function SpotFaultStep({ step, submitted, onAnswer }) {
  return (
    <div className="cyber-card p-4 space-y-3">
      <p className="text-sm text-white font-bold">{step.question}</p>
      <SpotTheFault lines={step.lines} faultIndex={step.faultIndex} onAnswer={onAnswer} submitted={submitted} />
    </div>
  );
}

function DiagnosticStep({ step, submitted, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const correctId = step.options.find((o) => o.correct)?.id;
  const options = step.options.map((o) => ({ id: o.id, label: o.label }));

  return (
    <div className="cyber-card p-4 space-y-3">
      <DiagnosticQuestionRenderer diagnostic={step.diagnostic} question={step.question} />
      <LearningOptionList
        options={options}
        selected={selected}
        onSelect={setSelected}
        mode="single"
        correct={correctId}
        submitted={submitted}
        questionId={step.id}
      />
      {!submitted && (
        <button
          type="button"
          onClick={() => selected !== null && onAnswer({ allCorrect: selected === correctId, correct: selected === correctId, selected })}
          disabled={selected === null}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Diagnose prüfen
        </button>
      )}
    </div>
  );
}

function TransferStep({ step, submitted, onAnswer }) {
  if (step.mode === 'composer') {
    return (
      <div className="cyber-card p-4 space-y-3">
        <p className="text-sm text-white font-bold">{step.question}</p>
        <CommandComposer tokens={step.tokens} correctOrder={step.correctOrder} onAnswer={onAnswer} submitted={submitted} />
      </div>
    );
  }
  if (step.mode === 'choice') {
    return <TransferChoiceStep step={step} submitted={submitted} onAnswer={onAnswer} />;
  }
  return <CliStep step={step} submitted={submitted} onAnswer={onAnswer} />;
}

function TransferChoiceStep({ step, submitted, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const correctId = step.options.find((o) => o.correct)?.id;
  const options = step.options.map((o) => ({ id: o.id, label: o.label }));
  return (
    <div className="cyber-card p-4 space-y-3">
      <p className="text-sm text-white font-bold">{step.question}</p>
      <LearningOptionList options={options} selected={selected} onSelect={setSelected} mode="single" correct={correctId} submitted={submitted} questionId={step.id} />
      {!submitted && (
        <button
          type="button"
          onClick={() => selected !== null && onAnswer({ allCorrect: selected === correctId, correct: selected === correctId, selected })}
          disabled={selected === null}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Antwort prüfen
        </button>
      )}
    </div>
  );
}

function defaultTitle(status) {
  return { correct: 'Richtig!', partial: 'Fast.', incorrect: 'Noch nicht.' }[status] || 'Hinweis';
}

function defaultExplanation(status, step) {
  if (status === 'correct') return step.explanation;
  if (status === 'partial') return step.partialExplanation || step.explanation;
  return step.incorrectExplanation || step.explanation;
}
