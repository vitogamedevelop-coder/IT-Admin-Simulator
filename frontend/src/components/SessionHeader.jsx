import { ArrowLeft, X } from 'lucide-react';

export default function SessionHeader({ title, current, total, onBack, onExit }) {
  const progress = total > 0 ? current / total : 0;
  return (
    <div className="sticky top-0 z-20 bg-[#0a1628]/95 backdrop-blur border-b border-[#00f0ff]/10 px-4 py-3 safe-area-top">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg text-[#c9d1d9] hover:bg-[#00f0ff]/10 active:bg-[#00f0ff]/20"
            aria-label="Zurück"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider truncate">{title}</span>
            <span className="text-xs text-[#8b949e] shrink-0">{current} / {total}</span>
          </div>
          <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded-full transition-all duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="p-2 rounded-lg text-[#8b949e] hover:bg-[#ff7b72]/10 hover:text-[#ff7b72] active:bg-[#ff7b72]/20"
            aria-label="Beenden"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
