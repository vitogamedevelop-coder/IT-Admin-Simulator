import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ArrowRight, Maximize2 } from 'lucide-react';
import { characterAsset } from '../lib/rpgAssets';
import { questPath } from '../lib/questRouter';
import { ONBOARDING_STEPS } from '../lib/onboardingSteps';
import DraggableWindow from './DraggableWindow';

const KEY = 'it-learn:onboarding-completed';

export function resetOnboarding() {
  localStorage.removeItem(KEY);
  window.location.href = '/';
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(() => localStorage.getItem(KEY) !== 'true');
  const [minimized, setMinimized] = useState(false);
  const [wsState, setWsState] = useState(null);
  const lastHotspotRef = useRef(null);
  const requestedZoneRef = useRef(null);

  const onWorkspacePage = location.pathname === '/' || location.pathname === '/workspace';
  const current = ONBOARDING_STEPS[step];

  // Listen to Workspace's live state and hotspot activation events.
  useEffect(() => {
    function handleState(e) {
      setWsState(e.detail);
    }
    function handleHotspot(e) {
      const key = e.detail?.key ?? e.detail?.app ?? null;
      lastHotspotRef.current = key;
      // Eagerly check the current step's success condition so that hotspots
      // whose action triggers a navigate() (e.g. server room) can still
      // advance the tutorial before the component unmounts.
      setStep((prev) => {
        const cur = ONBOARDING_STEPS[prev];
        if (cur?.success && cur.success({}, null, false, key)) {
          return Math.min(prev + 1, ONBOARDING_STEPS.length - 1);
        }
        return prev;
      });
    }
    window.addEventListener('cyberlearn:workspace-state', handleState);
    window.addEventListener('cyberlearn:hotspot-activated', handleHotspot);
    return () => {
      window.removeEventListener('cyberlearn:workspace-state', handleState);
      window.removeEventListener('cyberlearn:hotspot-activated', handleHotspot);
    };
  }, []);

  // Reset per-step tracking whenever the step changes.
  useEffect(() => {
    requestedZoneRef.current = null;
    lastHotspotRef.current = null;
    setMinimized(false);
  }, [step]);

  // If the current hotspot lives in a different zone, ask Workspace to switch there.
  useEffect(() => {
    if (!visible || !onWorkspacePage || !wsState || !current?.target) return;
    const target = current.target;
    if (target.type !== 'hotspot' || wsState.isLandscape) return;
    const wantedZone = target.zone;
    if (wantedZone && wsState.zone !== wantedZone && requestedZoneRef.current !== wantedZone) {
      requestedZoneRef.current = wantedZone;
      window.dispatchEvent(new CustomEvent('cyberlearn:tutorial-request-zone', { detail: { zone: wantedZone } }));
    }
  }, [visible, onWorkspacePage, wsState, current]);

  // Auto-advance when the step's success condition is met.
  useEffect(() => {
    if (!visible || !onWorkspacePage || !wsState || !current?.success) return;
    if (current.success(wsState, null, false, lastHotspotRef.current)) {
      const timer = setTimeout(() => setStep((v) => Math.min(v + 1, ONBOARDING_STEPS.length - 1)), 450);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, onWorkspacePage, wsState, current]);

  if (!visible) return null;
  // Informational/finish steps may be shown outside the workspace, but interactive
  // hotspot steps only make sense while the player is actually in the office.
  if (!onWorkspacePage && current?.target) return null;

  const Icon = current.icon;
  const portrait = current.character ? characterAsset(current.character) : null;
  const isLastStep = step === ONBOARDING_STEPS.length - 1;

  // Resolve the marker rect for hotspot-targeted steps from the broadcast state.
  let markerRect = null;
  if (current.target?.type === 'hotspot' && wsState?.hotspotRects) {
    const r = wsState.hotspotRects[current.target.key];
    if (r && r.visible) markerRect = r;
  }

  function finish(startQuest) {
    localStorage.setItem(KEY, 'true');
    setVisible(false);
    if (startQuest) navigate(questPath('first-day'));
  }

  function next() {
    setStep((v) => Math.min(v + 1, ONBOARDING_STEPS.length - 1));
  }

  function skip() {
    finish(true);
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {markerRect && (
        <div className="fixed rounded-xl border-2 border-[#00ff66] shadow-[0_0_1.5rem_rgba(0,255,102,0.7)] pointer-events-none"
          style={{
            top: markerRect.top - 6, left: markerRect.left - 6,
            width: markerRect.width + 12, height: markerRect.height + 12,
            animation: 'fadeIn 0.25s ease-out',
          }} />
      )}

      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed left-3 z-[102] flex items-center gap-2 rounded-full border border-[#00f0ff]/40 bg-[#0d1117]/90 px-3 py-2 text-xs text-[#00f0ff] shadow-[0_0_1rem_rgba(0,240,255,0.25)] pointer-events-auto"
          style={{ top: 'calc(var(--safe-top,0px) + var(--header-h) + 0.5rem)' }}
        >
          <Maximize2 size={14} /> Tutorial
        </button>
      )}

      {!minimized && (
        <DraggableWindow
          initialPosition="bottom-center"
          resetKey={step}
          className="inset-x-4 mx-auto max-h-[36dvh] max-w-sm overflow-y-auto rounded-2xl border border-[#00f0ff] bg-[#0d1117] p-4 shadow-[0_0_3rem_rgba(0,240,255,0.3)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {portrait ? <img src={portrait} alt={current.person} className="h-10 w-10 rounded-full border border-[#00f0ff] object-cover" draggable={false} /> : null}
              <div>
                <div className="text-xs text-[#00f0ff]">{current.person}</div>
                <h3 className="mt-0.5 text-sm font-bold text-white">{current.title}</h3>
              </div>
            </div>
            {!isLastStep && (
              <button onClick={() => setMinimized(true)} className="text-[#8b949e] hover:text-white" aria-label="Tutorialfenster schließen">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mt-2 space-y-1.5">
            {current.lines.map((line, i) => (
              <p key={i} className="text-xs text-[#c9d1d9] leading-relaxed">{line}</p>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {current.finish ? (
              <button onClick={() => finish(true)} className="cyber-btn w-full py-2 text-xs flex items-center justify-center gap-2">
                <Icon size={14} /> Erste Mission starten
              </button>
            ) : current.nextLabel ? (
              <button onClick={next} className="cyber-btn w-full py-2 text-xs flex items-center justify-center gap-2">
                {current.nextLabel} <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                <Icon size={14} /> Führe die Aktion im Büro aus, um fortzufahren.
              </div>
            )}

            {!isLastStep && (
              <button onClick={skip} className="text-[10px] text-[#8b949e] hover:text-white underline">
                Tutorial überspringen
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1">
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} className={`h-1 w-1 rounded-full ${i === step ? 'bg-[#00f0ff]' : 'bg-[#8b949e]/40'}`} />
            ))}
          </div>
        </DraggableWindow>
      )}
    </div>
  );
}
