import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generic guided UI procedure exercise.
 *
 * Data shape:
 * {
 *   id: string,
 *   type: 'guided-ui',
 *   title?: string,
 *   intro?: string,
 *   steps: [
 *     {
 *       id: string,
 *       title?: string,
 *       instruction: string,
 *       kind?: 'navigation' | 'decision',
 *       screen?: { title?: string, subtitle?: string },
 *       targets: [
 *         { id: string, label: string, ui?: string, description?: string }
 *       ],
 *       correctTarget: string,   // id of the right target
 *       feedbackCorrect: string,
 *       feedbackWrong: string,
 *       explanation?: string,
 *     }
 *   ]
 * }
 *
 * This is intentionally NOT a Windows simulation. It renders reduced, didactic
 * UI surfaces (cards, buttons, menus) and lets the learner pick the right
 * control in the right order. Wrong clicks explain why that path is wrong.
 */
export default function GuidedUiExercise({ exercise, index: _index, onComplete }) {
  const steps = useMemo(() => (exercise.steps || []), [exercise.steps]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [completed, setCompleted] = useState(false);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const targets = step?.targets || [];

  useEffect(() => {
    setSelectedId(null);
    setFeedback('idle');
  }, [stepIndex]);

  useEffect(() => {
    if (completed && onComplete) onComplete();
  }, [completed, onComplete]);

  if (!step) return null;

  function handleTargetClick(id) {
    if (feedback === 'correct') return;
    setSelectedId(id);
    if (id === step.correctTarget) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  }

  function handleAdvance() {
    if (!isLast) {
      setStepIndex((i) => i + 1);
    } else {
      setCompleted(true);
    }
  }

  const targetUiClass = classNames(
    'w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50',
  );

  function targetStateClasses(id) {
    if (feedback === 'correct' && id === step.correctTarget) {
      return 'border-[#00ff66]/50 bg-[#00ff66]/10 text-[#00ff66]';
    }
    if (feedback === 'wrong' && id === selectedId) {
      return 'border-[#ffcc00]/50 bg-[#ffcc00]/10 text-[#ffcc00]';
    }
    if (feedback === 'correct') {
      return 'border-[#30363d] text-[#8b949e] opacity-60 cursor-default';
    }
    return 'border-[#30363d] bg-[#0d1117]/60 text-[#c9d1d9] hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5';
  }

  return (
    <div className="cyber-card p-4 space-y-4">
      {(exercise.title || exercise.intro) && (
        <div className="space-y-1">
          {exercise.title && <h4 className="text-sm font-bold text-[#c9d1d9]">{exercise.title}</h4>}
          {exercise.intro && <p className="text-xs text-[#8b949e]">{exercise.intro}</p>}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[#8b949e]">
        <span className="uppercase tracking-wider">{step.kind === 'decision' ? 'Entscheidung' : 'Navigation'}</span>
        <span>Schritt {stepIndex + 1} von {steps.length}</span>
      </div>

      {step.screen && (
        <div className="rounded border border-[#30363d] bg-[#0a1628] p-3">
          {step.screen.title && <div className="text-sm font-semibold text-[#00f0ff]">{step.screen.title}</div>}
          {step.screen.subtitle && <div className="text-xs text-[#8b949e]">{step.screen.subtitle}</div>}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-[#c9d1d9] font-medium">{step.instruction}</p>
        <div className="grid gap-2">
          {targets.map((target) => (
            <button
              key={target.id}
              type="button"
              disabled={feedback === 'correct'}
              onClick={() => handleTargetClick(target.id)}
              className={classNames(targetUiClass, targetStateClasses(target.id))}
              aria-pressed={selectedId === target.id}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{target.label}</span>
                {feedback === 'correct' && target.id === step.correctTarget && (
                  <CheckCircle2 size={16} className="shrink-0" />
                )}
                {feedback === 'wrong' && target.id === selectedId && (
                  <XCircle size={16} className="shrink-0" />
                )}
              </span>
              {target.description && (
                <span className="mt-1 block text-xs opacity-80">{target.description}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {feedback === 'wrong' && (
        <div className="rounded border border-[#ffcc00]/30 bg-[#ffcc00]/5 p-3 text-xs text-[#ffcc00]">
          <div className="flex items-start gap-2">
            <XCircle size={14} className="shrink-0 mt-0.5" />
            <span>{step.feedbackWrong || 'Das ist hier nicht der richtige Schritt.'}</span>
          </div>
        </div>
      )}

      {feedback === 'correct' && (
        <div className="space-y-3">
          <div className="rounded border border-[#00ff66]/30 bg-[#00ff66]/5 p-3 text-xs text-[#00ff66]">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>{step.feedbackCorrect || 'Richtig.'}</span>
            </div>
          </div>
          {step.explanation && (
            <p className="text-xs text-[#8b949e]">{step.explanation}</p>
          )}
          <button
            type="button"
            onClick={handleAdvance}
            className="cyber-btn w-full py-2 text-sm flex items-center justify-center gap-2"
          >
            {isLast ? 'Abschließen' : 'Weiter'}
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
