import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Shield, MessageSquare, ChevronDown, ChevronUp, GripVertical, RotateCcw } from 'lucide-react';
import { getCurrentPlayerObjectives, getTopObjective } from '../lib/objectives';

const POSITION_KEY = 'cyberlearn:current-goal-panel-position-v1';
const CLICK_THRESHOLD = 5; // px

function getEnvPixels(name, fallback = '0px') {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;
  const px = parseFloat(raw);
  return Number.isNaN(px) ? 0 : px;
}

function getSafeArea() {
  return {
    top: getEnvPixels('--safe-top', '0px'),
    bottom: getEnvPixels('--safe-bottom', '0px'),
    left: getEnvPixels('--safe-left', '0px'),
    right: getEnvPixels('--safe-right', '0px'),
    header: getEnvPixels('--header-h', '3rem'),
  };
}

function getDefaultPosition() {
  const { top, header } = getSafeArea();
  return { x: null, y: top + header + 8, right: 12 };
}

function readPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const pos = JSON.parse(raw);
    if (pos && (pos.x === null || pos.x === undefined) && pos.right === undefined) {
      pos.right = 12;
    }
    return pos;
  } catch {
    return null;
  }
}

function writePosition(pos) {
  localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
}

function clampPosition(pos, rect) {
  const { innerWidth: vw, innerHeight: vh } = window;
  const { top, bottom, left, right } = getSafeArea();
  const w = rect?.width || 260;
  const h = rect?.height || 120;
  const minY = top + getSafeArea().header + 8;
  const maxX = vw - right - w - 8;
  const maxY = vh - bottom - h - 8;
  const base = getDefaultPosition();

  let nextX = pos.x ?? base.x ?? (vw - right - w - 12);
  let nextY = pos.y ?? base.y;

  if (nextX === null || nextX === undefined) {
    nextX = vw - right - w - 12;
  }

  // Treat very small/almost-off-screen values as legacy bad positions.
  if (nextX < left + 4) nextX = left + 8;
  if (nextX > maxX) nextX = maxX;
  if (nextY < minY) nextY = minY;
  if (nextY > maxY) nextY = maxY;

  if (nextX + w > vw - right - 8) nextX = Math.max(left + 8, vw - right - w - 8);
  if (nextY + h > vh - bottom - 8) nextY = Math.max(minY, vh - bottom - h - 8);

  return { x: nextX, y: nextY };
}

export default function ObjectivePanel({ overrideObjective = null }) {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const panelRef = useRef(null);
  const handleRef = useRef(null);
  const [position, setPosition] = useState(() => {
    const saved = readPosition();
    if (saved) return clampPosition(saved, null);
    return getDefaultPosition();
  });

  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    panelX: 0,
    panelY: 0,
    pointerId: null,
    moved: false,
    totalDx: 0,
    totalDy: 0,
  });

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
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  function handlePointerDown(e) {
    if (!handleRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      handleRef.current.setPointerCapture(e.pointerId);
    } catch {
      // ignore if unsupported
    }

    dragState.current.dragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startY = e.clientY;
    dragState.current.pointerId = e.pointerId;
    dragState.current.moved = false;
    dragState.current.totalDx = 0;
    dragState.current.totalDy = 0;

    const rect = panelRef.current?.getBoundingClientRect();
    dragState.current.panelX = rect?.left ?? position.x ?? 0;
    dragState.current.panelY = rect?.top ?? position.y ?? 0;
  }

  function handlePointerMove(e) {
    if (!dragState.current.dragging) return;
    if (e.pointerId !== dragState.current.pointerId) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    dragState.current.totalDx = dx;
    dragState.current.totalDy = dy;

    if (Math.max(Math.abs(dx), Math.abs(dy)) > CLICK_THRESHOLD) {
      dragState.current.moved = true;
    }

    if (!dragState.current.moved) return;

    const next = {
      x: dragState.current.panelX + dx,
      y: dragState.current.panelY + dy,
    };
    setPosition(next);
  }

  function handlePointerUp(e) {
    if (!dragState.current.dragging) return;
    if (e.pointerId !== dragState.current.pointerId) return;
    dragState.current.dragging = false;

    try {
      handleRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!dragState.current.moved) {
      // It was a tap, not a drag. Don't toggle or navigate; leave for other handlers.
      return;
    }

    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPosition((pos) => {
      const clamped = clampPosition(pos, rect);
      writePosition(clamped);
      return clamped;
    });
  }

  function handlePointerCancel(e) {
    if (!dragState.current.dragging) return;
    if (e.pointerId !== dragState.current.pointerId) return;
    dragState.current.dragging = false;
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPosition((pos) => {
      const clamped = clampPosition(pos, rect);
      writePosition(clamped);
      return clamped;
    });
  }

  function resetPosition() {
    const next = getDefaultPosition();
    setPosition(next);
    localStorage.removeItem(POSITION_KEY);
  }

  const objectives = getCurrentPlayerObjectives();
  const top = getTopObjective(objectives);
  const learningLabel = overrideObjective?.title
    || (top ? (top.item.title || top.item.quest?.title || 'Verfügbar') : 'Alle Ziele abgeschlossen');

  const sectionOrder = [
    { key: 'main', data: objectives.main, score: objectives.relevance.main },
    { key: 'side', data: objectives.side, score: objectives.relevance.side },
    { key: 'learning', data: objectives.learning, score: objectives.relevance.learning },
  ].filter((s) => {
    if (!s.data) return false;
    if (Array.isArray(s.data) && s.data.length === 0) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  const isPositioned = position.x !== null && position.y !== null;
  const style = isPositioned
    ? { position: 'fixed', left: position.x, top: position.y, zIndex: 50, maxWidth: '16rem' }
    : { position: 'fixed', top: position.y, right: position.right, zIndex: 50, maxWidth: '16rem' };

  return (
    <div ref={panelRef} style={style} className="select-none">
      <div className="flex items-stretch rounded-lg border border-[#00f0ff]/30 bg-[#0d1117]/90 shadow-[0_0_1rem_rgba(0,240,255,0.15)] backdrop-blur-sm">
        <button
          ref={handleRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="cursor-grab touch-none px-1 text-[#8b949e] active:cursor-grabbing active:text-[#00f0ff]"
          style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
          title="Zielpanel verschieben"
          aria-label="Zielpanel verschieben"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 px-2 py-2 text-left active:bg-[#00f0ff]/10 select-none"
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

          {sectionOrder.length === 0 && (
            <p className="text-xs text-[#8b949e]">Aktuell keine offenen Ziele.</p>
          )}

          {sectionOrder.map(({ key, data }, idx) => {
            const isLast = idx === sectionOrder.length - 1;
            if (key === 'learning' && data) {
              return (
                <div key={key} className={isLast ? '' : 'mb-3'}>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#00f0ff]">
                    <BookOpen size={12} /> Lernen bei Sam
                  </div>
                  <div className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                    <div className="text-sm font-medium text-white">{data.title}</div>
                    <div className="mt-1 text-xs text-[#8b949e]">Fortschritt: {data.progress}%</div>
                    <div className="mt-1 text-xs text-[#ffcc00]">{data.nextStepText}</div>
                    <button
                      onClick={() => { setExpanded(false); navigate(`/academy/${data.categoryId}/${data.topicId}`); }}
                      className="mt-2 w-full rounded-md border border-[#00f0ff]/30 px-2 py-1.5 text-xs text-[#00f0ff] hover:bg-[#00f0ff]/10"
                    >
                      Zu Sam
                    </button>
                  </div>
                </div>
              );
            }
            if (key === 'main' && data) {
              return (
                <div key={key} className={isLast ? '' : 'mb-3'}>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#00ff66]">
                    <Shield size={12} /> Hauptmission
                  </div>
                  <div className="rounded-lg border border-[#30363d] bg-[#0a1628]/60 p-2">
                    <div className="text-sm font-medium text-white">{data.quest.title}</div>
                    {!data.available && (
                      <>
                        <div className="mt-1 text-xs text-[#ffcc00]">Noch nicht verfügbar</div>
                        <ul className="mt-1 list-disc pl-4 text-xs text-[#8b949e]">
                          {data.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </>
                    )}
                    {data.available && (
                      <button
                        onClick={() => { setExpanded(false); navigate(`/mission/${data.quest.id}`); }}
                        className="mt-2 w-full rounded-md bg-[#00ff66]/10 px-2 py-1.5 text-xs font-medium text-[#00ff66] hover:bg-[#00ff66]/20"
                      >
                        Mission starten
                      </button>
                    )}
                  </div>
                </div>
              );
            }
            if (key === 'side' && data.length > 0) {
              return (
                <div key={key} className={isLast ? '' : 'mb-3'}>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8b949e]">
                    <MessageSquare size={12} /> Nebenmissionen
                  </div>
                  <div className="flex flex-col gap-2">
                    {data.map((mission) => (
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
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
