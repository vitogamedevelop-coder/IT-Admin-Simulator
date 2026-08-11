import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Shield, MessageSquare, ChevronDown, ChevronUp, GripVertical, RotateCcw } from 'lucide-react';
import { getCurrentPlayerObjectives } from '../lib/objectives';

const POSITION_KEY = 'cyberlearn:current-goal-panel-position-v1';

function readPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writePosition(pos) {
  localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
}

function clampPosition(pos, rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = rect?.width || 260;
  const h = rect?.height || 120;
  return {
    x: Math.max(0, Math.min(pos.x, vw - w)),
    y: Math.max(0, Math.min(pos.y, vh - h)),
  };
}

export default function ObjectivePanel({ overrideObjective = null }) {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const panelRef = useRef(null);
  const [position, setPosition] = useState(() => {
    const saved = readPosition();
    if (saved) return clampPosition(saved, null);
    return { x: null, y: null };
  });

  const dragState = useRef({ dragging: false, startX: 0, startY: 0, panelX: 0, panelY: 0 });

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

  useEffect(() => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPosition((pos) => clampPosition(pos, rect));
  }, []);

  useEffect(() => {
    function onResize() {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      setPosition((pos) => {
        const next = clampPosition(pos, rect);
        writePosition(next);
        return next;
      });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function handlePointerDown(e) {
    e.preventDefault();
    if (!panelRef.current) return;
    dragState.current.dragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startY = e.clientY;
    const rect = panelRef.current.getBoundingClientRect();
    dragState.current.panelX = rect.left;
    dragState.current.panelY = rect.top;
  }

  useEffect(() => {
    function onPointerMove(e) {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const next = { x: dragState.current.panelX + dx, y: dragState.current.panelY + dy };
      setPosition(next);
    }
    function onPointerUp() {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      setPosition((pos) => {
        const clamped = clampPosition(pos, rect);
        writePosition(clamped);
        return clamped;
      });
    }
    if (dragState.current.dragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp, { once: true });
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [position]);

  function resetPosition() {
    setPosition({ x: null, y: null });
    localStorage.removeItem(POSITION_KEY);
  }

  const objectives = getCurrentPlayerObjectives();
  const currentObjective = overrideObjective || objectives.learning;
  const learningLabel = currentObjective ? currentObjective.title : 'Alle Lernziele abgeschlossen';

  const isPositioned = position.x !== null && position.y !== null;
  const style = isPositioned
    ? { position: 'fixed', left: position.x, top: position.y, zIndex: 50, maxWidth: '16rem' }
    : { position: 'fixed', top: 'calc(var(--safe-top,0px) + var(--header-h) + 0.5rem)', right: '0.75rem', zIndex: 50, maxWidth: '16rem' };

  return (
    <div ref={panelRef} style={style}>
      <div className="flex items-stretch rounded-lg border border-[#00f0ff]/30 bg-[#0d1117]/90 shadow-[0_0_1rem_rgba(0,240,255,0.15)] backdrop-blur-sm">
        <button
          onPointerDown={handlePointerDown}
          className="cursor-grab touch-none px-1 text-[#8b949e] active:cursor-grabbing active:text-[#00f0ff]"
          title="Zielpanel verschieben"
          aria-label="Zielpanel verschieben"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 px-2 py-2 text-left active:bg-[#00f0ff]/10"
        >
          <Target size={16} className="text-[#00f0ff] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-wider text-[#8b949e]">Aktuelles Ziel</div>
            <div className="truncate text-xs font-medium text-white">{learningLabel}</div>
          </div>
          {expanded ? <ChevronUp size={14} className="text-[#8b949e]" /> : <ChevronDown size={14} className="text-[#8b949e]" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 rounded-xl border border-[#00f0ff]/30 bg-[#0d1117]/95 p-3 shadow-[0_0_1.5rem_rgba(0,240,255,0.2)] backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#8b949e]">Position</span>
            <button
              onClick={resetPosition}
              className="flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-[#00f0ff]"
              title="Position zurücksetzen"
            >
              <RotateCcw size={10} /> Zurücksetzen
            </button>
          </div>

          {/* Learning */}
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#00f0ff]">
              <BookOpen size={12} /> Lernen bei Sam
            </div>
            {objectives.learning ? (
              <div className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                <div className="text-sm font-medium text-white">{objectives.learning.title}</div>
                <div className="mt-1 text-xs text-[#8b949e]">Fortschritt: {objectives.learning.progress}%</div>
                <div className="mt-1 text-xs text-[#ffcc00]">{objectives.learning.nextStepText}</div>
                <button
                  onClick={() => { setExpanded(false); navigate(`/academy/${objectives.learning.categoryId}/${objectives.learning.topicId}`); }}
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
            {objectives.main ? (
              <div className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                <div className="text-sm font-medium text-white">{objectives.main.quest.title}</div>
                {!objectives.main.available && (
                  <>
                    <div className="mt-1 text-xs text-[#ffcc00]">Noch nicht verfügbar</div>
                    <ul className="mt-1 list-disc pl-4 text-xs text-[#8b949e]">
                      {objectives.main.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </>
                )}
                {objectives.main.available && (
                  <button
                    onClick={() => { setExpanded(false); navigate(`/quest/${objectives.main.quest.id}`); }}
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
            {objectives.side.length > 0 ? (
              <div className="flex flex-col gap-2">
                {objectives.side.map((mission) => (
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
