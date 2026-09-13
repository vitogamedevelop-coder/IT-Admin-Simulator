import { CheckCircle2, XCircle } from 'lucide-react';
import { checkCiscoInput } from '../lib/ciscoCli';
import LearningFeedback from './LearningFeedback.jsx';

export default function LearningCommandInput({
  expectedLines = [],
  value = '',
  onChange,
  onCheck,
  submitted = false,
  result,
  explanation,
  startContext,
  hint,
  placeholder = 'Befehle eingeben, eine pro Zeile...',
  disabled = false,
}) {
  const status = submitted && result
    ? (result.allCorrect ? 'correct' : (result.results?.some((r) => r.ok) ? 'partial' : 'incorrect'))
    : 'info';

  function handleCheck() {
    if (submitted || disabled) return;
    const outcome = checkCiscoInput(value, expectedLines);
    onCheck?.(outcome);
  }

  const rows = Math.max(3, expectedLines.length);

  return (
    <div className="space-y-3">
      {startContext && (
        <div className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
          Aktueller Modus: {startContext}
        </div>
      )}
      {hint && <p className="text-xs text-[#8b949e]">{hint}</p>}

      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={submitted || disabled}
        rows={rows}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="w-full p-2 rounded-lg bg-[#0a1628] border border-[#00f0ff]/30 text-sm text-[#c9d1d9] placeholder-[#8b949e] font-mono focus:outline-none focus:border-[#00f0ff] disabled:opacity-60"
      />

      {!submitted && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!value.trim() || disabled}
          className="cyber-btn w-full py-2 text-sm disabled:opacity-40"
        >
          Prüfen
        </button>
      )}

      {submitted && result && (
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            {result.results.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {r.ok ? <CheckCircle2 size={14} className="text-[#00ff66] shrink-0 mt-0.5" /> : <XCircle size={14} className="text-[#ffcc00] shrink-0 mt-0.5" />}
                <span className={r.ok ? 'text-[#00ff66]' : 'text-[#ffcc00]'}>
                  {r.userLine || <span className="italic text-[#8b949e]">(fehlt)</span>}
                  {!r.ok && <span className="text-[#8b949e]"> – erwartet: {r.expected}</span>}
                </span>
              </div>
            ))}
            {result.extraLines.map((line, i) => (
              <div key={`extra-${i}`} className="flex items-start gap-2 text-xs">
                <XCircle size={14} className="text-[#ffcc00] shrink-0 mt-0.5" />
                <span className="text-[#ffcc00]">{line} <span className="text-[#8b949e]">– nicht erwartet</span></span>
              </div>
            ))}
          </div>
          <LearningFeedback
            status={status}
            explanation={explanation}
          />
        </div>
      )}
    </div>
  );
}
