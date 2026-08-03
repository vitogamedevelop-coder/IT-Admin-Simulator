import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Shield, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { getCurrentPlayerObjectives } from '../lib/objectives';

export default function ObjectivePanel() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handler = () => setTick((v) => v + 1);
    window.addEventListener('cyberlearn:academy-progress', handler);
    window.addEventListener('it-learn:game-state', handler);
    window.addEventListener('cyberlearn:competency-changed', handler);
    return () => {
      window.removeEventListener('cyberlearn:academy-progress', handler);
      window.removeEventListener('it-learn:game-state', handler);
      window.removeEventListener('cyberlearn:competency-changed', handler);
    };
  }, []);

  const objectives = getCurrentPlayerObjectives();
  const learning = objectives.learning;
  const main = objectives.main;
  const side = objectives.side;

  function learningLabel() {
    if (!learning) return 'Alle Lernziele abgeschlossen';
    return `${learning.title}`;
  }

  return (
    <div className="fixed top-[calc(var(--safe-top,0px)+var(--header-h)+0.5rem)] right-3 z-50 max-w-[16rem]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-[#00f0ff]/30 bg-[#0d1117]/90 px-3 py-2 text-left shadow-[0_0_1rem_rgba(0,240,255,0.15)] backdrop-blur-sm active:bg-[#00f0ff]/10"
      >
        <Target size={16} className="text-[#00f0ff] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] uppercase tracking-wider text-[#8b949e]">Aktuelles Ziel</div>
          <div className="truncate text-xs font-medium text-white">{learningLabel()}</div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-[#8b949e]" /> : <ChevronDown size={14} className="text-[#8b949e]" />}
      </button>

      {expanded && (
        <div className="mt-2 rounded-xl border border-[#00f0ff]/30 bg-[#0d1117]/95 p-3 shadow-[0_0_1.5rem_rgba(0,240,255,0.2)] backdrop-blur-sm">
          {/* Learning */}
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#00f0ff]">
              <BookOpen size={12} /> Lernen bei Sam
            </div>
            {learning ? (
              <div className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                <div className="text-sm font-medium text-white">{learning.title}</div>
                <div className="mt-1 text-xs text-[#8b949e]">Fortschritt: {learning.progress}%</div>
                <div className="mt-1 text-xs text-[#ffcc00]">{learning.nextStepText}</div>
                <button
                  onClick={() => { setExpanded(false); navigate(`/academy/${learning.categoryId}/${learning.topicId}`); }}
                  className="mt-2 w-full rounded-md border border-[#00f0ff]/30 px-2 py-1.5 text-xs text-[#00f0ff] hover:bg-[#00f0ff]/10"
                >
                  Zu Sam
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#8b949e]">Aktuell keine offenen Lernziele.</p>
            )}
          </div>

          {/* Main mission */}
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#00ff66]">
              <Shield size={12} /> Hauptmission
            </div>
            {main ? (
              <div className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                <div className="text-sm font-medium text-white">{main.quest.title}</div>
                {!main.available && (
                  <>
                    <div className="mt-1 text-xs text-[#ffcc00]">Noch nicht verfügbar</div>
                    <ul className="mt-1 list-disc pl-4 text-xs text-[#8b949e]">
                      {main.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </>
                )}
                {main.available && (
                  <button
                    onClick={() => { setExpanded(false); navigate(`/quest/${main.quest.id}`); }}
                    className="mt-2 w-full rounded-md bg-[#00ff66]/10 px-2 py-1.5 text-xs font-medium text-[#00ff66] hover:bg-[#00ff66]/20"
                  >
                    Mission starten
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#8b949e]">Keine weiteren Hauptmissionen verfügbar.</p>
            )}
          </div>

          {/* Side missions */}
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8b949e]">
              <MessageSquare size={12} /> Nebenmissionen
            </div>
            {side.length > 0 ? (
              <div className="flex flex-col gap-2">
                {side.map((mission) => (
                  <div key={mission.id} className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                    <div className="text-xs text-[#c9d1d9]">{mission.title}</div>
                    <button
                      onClick={() => { setExpanded(false); navigate(`/side-mission/${mission.id}`); }}
                      className="mt-1.5 w-full rounded-md border border-[#8b949e]/30 px-2 py-1 text-[10px] text-[#8b949e] hover:bg-white/5"
                    >
                      Annehmen
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8b949e]">Keine offenen Nebenmissionen.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
