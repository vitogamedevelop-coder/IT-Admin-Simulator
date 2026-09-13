import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Lightbulb } from 'lucide-react';

export default function SessionFeedback({
  status = 'info',
  title,
  explanation,
  why,
  onContinue,
  continueLabel = 'Weiter',
  onHint,
  hintLabel = 'Hinweis',
  onSimple,
  simpleLabel = 'Einfach erklären',
}) {
  const [showWhy, setShowWhy] = useState(false);

  const config = {
    correct: {
      icon: CheckCircle,
      container: 'border-[#00ff66]/40 bg-[#00ff66]/10',
      headline: 'Richtig!',
      accent: 'text-[#00ff66]',
    },
    partial: {
      icon: AlertCircle,
      container: 'border-[#ffcc00]/40 bg-[#ffcc00]/10',
      headline: 'Fast.',
      accent: 'text-[#ffcc00]',
    },
    incorrect: {
      icon: XCircle,
      container: 'border-[#ff7b72]/40 bg-[#ff7b72]/10',
      headline: 'Noch nicht.',
      accent: 'text-[#ff7b72]',
    },
    info: {
      icon: AlertCircle,
      container: 'border-[#00f0ff]/40 bg-[#00f0ff]/10',
      headline: 'Hinweis',
      accent: 'text-[#00f0ff]',
    },
  }[status] || config.info;

  const Icon = config.icon;

  return (
    <div className={`rounded-t-2xl border-t border-x ${config.container} p-4 pb-safe shadow-lg`}>
      <div className="w-12 h-1 bg-[#8b949e]/40 rounded-full mx-auto mb-4" />
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${config.accent}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm ${config.accent}`}>{title || config.headline}</div>
          {explanation && <p className="text-xs text-[#c9d1d9] mt-1 whitespace-pre-line">{explanation}</p>}
          {why && (
            <button
              type="button"
              onClick={() => setShowWhy((s) => !s)}
              className="mt-2 text-xs text-[#00f0ff] hover:text-[#00ff66] flex items-center gap-1"
            >
              <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
              {showWhy ? 'Erklärung ausblenden' : 'Warum?'}
            </button>
          )}
          {showWhy && why && (
            <div className="mt-2 text-xs text-[#8b949e] whitespace-pre-line border-l-2 border-[#00f0ff]/30 pl-2">
              {why}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {onSimple && status !== 'correct' && (
          <button
            type="button"
            onClick={onSimple}
            className="flex-1 rounded-lg border border-[#00f0ff]/30 bg-[#0a1628]/60 px-3 py-2 text-xs text-[#c9d1d9] hover:border-[#00f0ff] active:bg-[#00f0ff]/10"
          >
            {simpleLabel}
          </button>
        )}
        {onHint && status !== 'correct' && (
          <button
            type="button"
            onClick={onHint}
            className="flex-1 rounded-lg border border-[#ffcc00]/30 bg-[#0a1628]/60 px-3 py-2 text-xs text-[#c9d1d9] hover:border-[#ffcc00] active:bg-[#ffcc00]/10"
          >
            {hintLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 cyber-btn py-2 text-sm flex items-center justify-center gap-1"
        >
          {continueLabel}
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
