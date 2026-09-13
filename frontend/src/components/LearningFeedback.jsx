import { CheckCircle, XCircle, AlertCircle, Info, Lightbulb, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
  correct: {
    icon: CheckCircle,
    container: 'border-[#00ff66]/40 bg-[#00ff66]/10',
    headline: 'Richtig!',
    title: 'Korrekt',
  },
  incorrect: {
    icon: XCircle,
    container: 'border-[#ff7b72]/40 bg-[#ff7b72]/10',
    headline: 'Noch nicht.',
    title: 'Leider falsch',
  },
  partial: {
    icon: AlertCircle,
    container: 'border-[#ffcc00]/40 bg-[#ffcc00]/10',
    headline: 'Fast.',
    title: 'Teilweise richtig',
  },
  incomplete: {
    icon: AlertCircle,
    container: 'border-[#ffcc00]/40 bg-[#ffcc00]/10',
    headline: 'Fast.',
    title: 'Unvollständig',
  },
  info: {
    icon: Info,
    container: 'border-[#00f0ff]/40 bg-[#00f0ff]/10',
    headline: 'Hinweis',
    title: 'Info',
  },
};

export default function LearningFeedback({
  status = 'info',
  headline,
  explanation,
  reasoning,
  correctAnswer,
  selectedMistakes,
  nextHint,
  onNextHint,
  children,
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.info;
  const Icon = config.icon;
  const title = headline || config.headline;

  return (
    <div
      className={`cyber-card p-4 border ${config.container}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm mb-1">{title}</div>

          {reasoning && (
            <div className="text-xs text-[#c9d1d9] mb-2 whitespace-pre-wrap">{reasoning}</div>
          )}

          {explanation && (
            <div className="text-xs text-[#8b949e] mb-2 whitespace-pre-wrap">{explanation}</div>
          )}

          {correctAnswer && (
            <div className="text-xs text-[#c9d1d9] mb-2">
              <span className="text-[#00f0ff]">Richtige Antwort:</span> {correctAnswer}
            </div>
          )}

          {selectedMistakes && selectedMistakes.length > 0 && (
            <div className="text-xs text-[#ffcc00] mb-2">
              <div className="font-semibold mb-1">Fehler:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {selectedMistakes.map((m, i) => (
                  <li key={i}>{typeof m === 'string' ? m : `${m.selected} → richtig wäre ${m.expected}`}</li>
                ))}
              </ul>
            </div>
          )}

          {nextHint && (
            <button
              type="button"
              onClick={onNextHint}
              className="inline-flex items-center gap-1 text-xs text-[#00f0ff] hover:text-[#00ff66] mt-1"
              aria-label="Nächster Hinweis anzeigen"
            >
              <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
              Nächster Hinweis
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
