import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Terminal as TermIcon, Globe, FolderOpen, Inbox as InboxIcon, Shield, MonitorSmartphone, Network, Trash2, Power, Coffee, MessageSquare, Users, Phone } from 'lucide-react';
import { readNotifications, pendingNotifications } from '../lib/notificationSystem';
import { seedEmails } from '../lib/emails';
import { seedNotebook } from '../lib/notebook';
import { readGameState } from '../lib/gameState';
import { characterAsset } from '../lib/rpgAssets';
import { sortedInbox } from '../lib/sideMissionEngine';
import { colleagues } from '../lib/officeWorld';
import {
  CORRIDOR_ROOMS, buildDefaultDialog, buildSamOfficeDialog,
} from '../lib/corridorDialogs';
import EmailApp from '../components/EmailApp';
import PhoneApp from '../components/PhoneApp';
import Notebook from '../components/Notebook';
import TerminalApp from '../components/Terminal';
import Directory from '../components/Directory';
import DialogView from '../components/DialogView';
import BackBar from '../components/BackBar';
import { registerMission, updateMissionStatus, MissionStatus } from '../lib/missionLog';
import { interactionById } from '../lib/learningInteractions';
import LearningInteraction from '../components/LearningInteraction';
import ObjectivePanel from '../components/ObjectivePanel';
import { startAmbient, stopAmbient, playMonitorOn, playMailNotification, playPhoneRing } from '../lib/sound';
import { useAppBack, pushBackHandler } from '../lib/useAppBack';
import { stop as stopSpeech } from '../lib/speechSynthesis';

const appComponents = { email: EmailApp, phone: PhoneApp, notebook: Notebook, terminal: TerminalApp, directory: Directory };

// Atmospheric break room content. No missions or Academy here - just ambience,
// random notes from Lea and a coffee machine that reacts to the player.
const BREAK_ROOM_HINTS = [
  'Kaffee ist heute besonders stark. Sollte das Netzwerk mal wieder zusammenbrechen, sind wir zumindest wach.',
  'Lea hat einen Zettel hinterlassen: "Bitte keine VLANs in der Mikrowelle erhitzen."',
  'Jemand hat einen halben Donut auf dem Tisch stehenlassen. Cyber-Hygiene gilt auch für Snacks.',
  'Aus dem Flur hörst du, wie Sam jemandem erklärt, warum "es funktioniert nicht" kein Ticket ist.',
  'Der Kaffeeautomat blinzelt mit seinem Display: "Ready".',
  'Ein Post-it am Kühlschrank: "Backups sind wie Kaffee – am Morgen am wichtigsten."',
  'Hier riecht es nach frischem Kaffee und nach abgekühlten Serverräumen.',
  'Lea hat ihre Tasse mit "Admin" beschriftet. Sehr originell.',
];

const BREAK_ROOM_COFFEE = [
  'Der Kaffee läuft langsam in die Tasse. Perfekte Zeit, über Subnetting nachzudenken.',
  'Der Automat macht ein zufriedenes Glucksen. Frisch gebrüht.',
  'Der erste Schluck ist heiß. Genau wie ein frisch gepatchter Switch.',
  'Koffein-Level: erhöht. Netzwerk-Wissen: bald ebenfalls.',
];

function BreakRoom({ onBack }) {
  const leaPortrait = characterAsset('lea');
  const [hintIndex] = useState(() => Math.floor(Math.random() * BREAK_ROOM_HINTS.length));
  const [coffeeIndex, setCoffeeIndex] = useState(null);
  const [colleague, setColleague] = useState(null);

  function brewCoffee() {
    setCoffeeIndex(Math.floor(Math.random() * BREAK_ROOM_COFFEE.length));
  }

  function peekAtColleagues() {
    const names = ['Mara', 'David', 'Aylin', 'Weber'];
    const activities = [
      'sortiert gerade Kabelbinder nach Farbe.',
      'starrt auf drei Monitor-Tabs gleichzeitig.',
      'flucht leise über einen Drucker.',
      'trinkt ebenfalls Kaffee.',
      'diskutiert lautstark über IP-Adressen.',
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    setColleague(`${name} ${activity}`);
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 flex flex-col gap-3">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-3">
          {leaPortrait ? <img src={leaPortrait} alt="Lea" className="h-12 w-12 rounded-full border border-[#00f0ff] object-cover" /> : null}
          <div>
            <div className="text-xs text-[#00f0ff]">Lea Novak</div>
            <p className="text-sm text-[#c9d1d9] mt-1">„Willkommen im Aufenthaltsraum. Hier gibt es erst mal keine Tickets – nur Kaffee und Ruhe.“</p>
          </div>
        </div>
      </div>

      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e] flex items-center gap-1">
          <MessageSquare size={12} /> Hinweis
        </div>
        <p className="text-sm text-[#c9d1d9] mt-2">{BREAK_ROOM_HINTS[hintIndex]}</p>
      </div>

      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e] flex items-center gap-1">
          <Coffee size={12} /> Kaffee-Maschine
        </div>
        <p className="text-sm text-[#c9d1d9] mt-2">Der Kaffeeautomat summt leise.</p>
        <button onClick={brewCoffee} className="cyber-btn w-full mt-3 py-2 text-sm flex items-center justify-center gap-2">
          <Coffee size={16} /> Kaffee holen
        </button>
        {coffeeIndex !== null && (
          <p className="text-xs text-[#00ff66] mt-3">{BREAK_ROOM_COFFEE[coffeeIndex]}</p>
        )}
      </div>

      <div className="cyber-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e] flex items-center gap-1">
          <Users size={12} /> Kollegen
        </div>
        <p className="text-sm text-[#c9d1d9] mt-2">Im Hintergrund sind Stimmen zu hören.</p>
        <button onClick={peekAtColleagues} className="cyber-btn-outline w-full mt-3 py-2 text-sm flex items-center justify-center gap-2">
          <Users size={16} /> Lauschen
        </button>
        {colleague && (
          <p className="text-xs text-[#c9d1d9] mt-3 italic">„{colleague}“</p>
        )}
      </div>

      <button onClick={onBack} className="cyber-btn-outline w-full py-2 text-sm">Zurück zum Flur</button>
    </div>
  );
}

// Panorama v2 - composed for gameplay, not photorealism:
// Regal+Whiteboard (left) -> Arbeitsplatz mit sichtbarem NEXUS-Desktop (center)
// -> Tür zum Flur (right) -> Tür zum Serverraum (far right)
const PANORAMA_SRC = `${import.meta.env.BASE_URL}assets/location/Panorama2.png`;
// Intrinsic pixel size of Panorama2.png - required to project normalized
// hotspot coordinates onto the actually rendered image (see projectHotspot).
const PANORAMA_NATURAL = { w: 1672, h: 941 };

// Web/desktop viewport containment ("Workspace-Bühne"). Real phones (and the
// Android app, which always reports phone-sized dimensions) keep filling the
// screen edge-to-edge exactly as before. On larger browser viewports (desktop,
// tablet) the same panorama is shown inside a capped, centered stage that
// starts below the global header and never grows past an app-like size -
// otherwise "background-size: cover" blows the scene up to fill the entire
// window. Detection uses the shorter viewport side (Android's own sw600dp
// tablet threshold) so it doesn't misfire on a phone rotated to landscape.
const COMPACT_VIEWPORT_BREAKPOINT = 600;
const STAGE_MAX_WIDTH = 1600;
const STAGE_MAX_HEIGHT = 900;

// Computes the capped, centered stage box for non-compact viewports. Reads
// the real header height from the DOM (same approach already used by
// NexusDesktop below) instead of hardcoding it, so it keeps working if the
// header's height ever changes.
function computeStageFrame() {
  const headerEl = document.querySelector('header');
  const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
  const availW = window.innerWidth;
  const availH = Math.max(window.innerHeight - headerBottom, 200);
  const aspect = PANORAMA_NATURAL.w / PANORAMA_NATURAL.h;
  let width = Math.min(availW, STAGE_MAX_WIDTH);
  let height = width / aspect;
  const capHeight = Math.min(availH, STAGE_MAX_HEIGHT);
  if (height > capHeight) {
    height = capHeight;
    width = height * aspect;
  }
  return { top: headerBottom, left: Math.max(0, (availW - width) / 2), width: Math.round(width), height: Math.round(height) };
}

const ZONES = ['left', 'center', 'right', 'server'];
const ZONE_LABELS = { left: 'Regal', center: 'Arbeitsplatz', right: 'Flur', server: 'Serverraum' };
const ZONE_ICONS = { left: '📚', center: '💻', right: '🚪', server: '🖥' };
// Numeric background-position-x percentages used for portrait zone panning
// (background-size: auto 100%). Tuned so each zone's visible window roughly
// centers on its content; hotspot alignment itself is exact regardless of
// these values since it's computed from the same background-position math.
const ZONE_PAN_X = { left: 8, center: 49, right: 84, server: 100 };

// Central hotspot configuration - normalized coordinates (0-1) relative to
// the ORIGINAL Panorama2.png pixel dimensions (PANORAMA_NATURAL), NOT to the
// viewport. This is what makes hotspots line up with the real objects
// regardless of screen size, orientation or zone-panning: the exact same
// background-size/background-position formula used to render the image is
// used to project these rects onto the current viewport (see projectHotspot).
const HOTSPOTS = {
  // Regal-Hotspots bewusst weiter nach rechts in den sichtbaren Bereich
  // verschoben, damit Labels und Umrandungen im Portrait nicht am linken
  // Rand abgeschnitten werden. Whiteboard bleibt unverändert.
  notebook:   { zone: 'left',   x: 0.065, y: 0.06,  w: 0.105, h: 0.30, label: 'Wissensbibliothek', app: 'notebook' },
  runbooks:   { zone: 'left',   x: 0.065, y: 0.49,  w: 0.105, h: 0.21, label: 'Runbooks', app: 'runbooks' },
  directory:  { zone: 'left',   x: 0.065, y: 0.74,  w: 0.090, h: 0.16, label: 'Verzeichnis', app: 'directory' },
  whiteboard: { zone: 'left',   x: 0.175, y: 0.11,  w: 0.145, h: 0.44, label: 'Whiteboard', app: 'hints' },
  // x starts right after the whiteboard hotspot (which ends at 0.32) so the
  // two never overlap in landscape mode, where all zones render at once
  // without zone-panning; previously the wider left edge (0.185) stole
  // clicks from the whiteboard in that shared region.
  workstation:{ zone: 'center', x: 0.33,  y: 0.225, w: 0.33,  h: 0.71, label: 'Arbeitsplatz', app: '__monitor__' },
  door:       { zone: 'right',  x: 0.655, y: 0.145, w: 0.175, h: 0.75, label: 'Tür zum Flur', app: 'people' },
  serverDoor: { zone: 'server', x: 0.855, y: 0.07,  w: 0.145, h: 0.86, label: 'Tür zum Serverraum', app: 'infrastructure' },
};

// Projects a normalized hotspot rect (0-1 relative to PANORAMA_NATURAL) onto
// the currently rendered panorama container, replicating the exact
// background-size/background-position formula used for the visible image:
//  - landscape: background-size: cover, background-position: 50% center
//  - portrait:  background-size: auto 100%, background-position: `${pan}% center`
// Returns CSS percentage strings relative to the container, or null if the
// container hasn't been measured yet.
function projectHotspot(h, landscape, size, panPercent) {
  if (!size.w || !size.h) return null;
  const { w: imgW, h: imgH } = PANORAMA_NATURAL;
  const cw = size.w, ch = size.h;
  let dispW, dispH, offsetX, offsetY;
  if (landscape) {
    const scale = Math.max(cw / imgW, ch / imgH);
    dispW = imgW * scale; dispH = imgH * scale;
    offsetX = (cw - dispW) / 2;
    offsetY = (ch - dispH) / 2;
  } else {
    const scale = ch / imgH;
    dispW = imgW * scale; dispH = ch;
    offsetX = (cw - dispW) * (panPercent / 100);
    offsetY = 0;
  }
  const left = offsetX + h.x * dispW;
  const top = offsetY + h.y * dispH;
  const width = h.w * dispW;
  const height = h.h * dispH;
  return {
    left: `${(left / cw) * 100}%`,
    top: `${(top / ch) * 100}%`,
    width: `${(width / cw) * 100}%`,
    height: `${(height / ch) * 100}%`,
    leftPct: (left / cw) * 100,
    rightPct: ((left + width) / cw) * 100,
  };
}

// Determines whether a projected hotspot rect is clipped at the left/right
// viewport edge, so its label can be shifted inward instead of running off
// screen (the hotspot's own clickable area is never touched by this).
function edgeSideOf(rect) {
  if (!rect) return null;
  if (rect.leftPct < 6) return 'left';
  if (rect.rightPct > 94) return 'right';
  return null;
}

// Desktop apps - shown when monitor is opened
const DESKTOP_APPS = [
  { id: 'email', label: 'E-Mail', icon: Mail, color: '#00f0ff', app: 'email' },
  { id: 'phone', label: 'Telefon', icon: Phone, color: '#ffcc00', app: 'phone' },
  { id: 'tickets', label: 'Tickets', icon: InboxIcon, color: '#ff3355', app: 'missions' },
  { id: 'terminal', label: 'Terminal', icon: TermIcon, color: '#00ff66', app: 'terminal' },
  { id: 'browser', label: 'Browser', icon: Globe, color: '#ffcc00', app: null },
  { id: 'ad', label: 'Active Directory', icon: Shield, color: '#8b949e', app: null },
  { id: 'linux', label: 'Linux', icon: MonitorSmartphone, color: '#ff9933', app: null },
  { id: 'cisco', label: 'Cisco', icon: Network, color: '#33ccff', app: null },
  { id: 'files', label: 'Dateien', icon: FolderOpen, color: '#cc99ff', app: 'notebook' },
  { id: 'trash', label: 'Papierkorb', icon: Trash2, color: '#6b7280', app: null },
];

export default function Workspace() {
  const navigate = useNavigate();
  useAppBack();
  const [zone, setZone] = useState(() => {
    const saved = sessionStorage.getItem('cyberlearn:workspace-area');
    return ZONES.includes(saved) ? saved : 'center';
  });
  const [monitorOpen, setMonitorOpen] = useState(false); // desktop view
  const [openApp, setOpenApp] = useState(null);            // app running on monitor
  const [zoomPhase, setZoomPhase] = useState('none');      // none | zooming-in | desktop | zooming-out
  const [notifications, setNotifications] = useState(readNotifications);
  const [corridorDialog, setCorridorDialog] = useState(null);
  const [corridorMenu, setCorridorMenu] = useState(false); // room-selection menu shown when entering the hallway
  const [corridorMenuReady, setCorridorMenuReady] = useState(false); // touch-through guard
  const [breakRoom, setBreakRoom] = useState(false); // atmosphere-only break room screen
  const [activeInteraction, setActiveInteraction] = useState(null);
  const [activeHint, setActiveHint] = useState(null);
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);
  const [interactionMode, setInteractionMode] = useState(false); // shows all hotspots when active
  const [debugHotspots] = useState(() => new URLSearchParams(window.location.search).get('debug') === '1');
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [isCompactViewport, setIsCompactViewport] = useState(() => Math.min(window.innerWidth, window.innerHeight) < COMPACT_VIEWPORT_BREAKPOINT);
  const [stageFrame, setStageFrame] = useState(null); // {top,left,width,height} px, only used when !isCompactViewport
  const [activeHotspotKey, setActiveHotspotKey] = useState(null); // hotspot currently pressed/highlighted (tap or longpress in progress)
  const gestureRef = useRef({ pointerId: null, startX: 0, startY: 0, startTime: 0, targetKey: null, mode: 'pending' });
  const longPressTimer = useRef(null);
  const resizeObserverRef = useRef(null);
  const panoramaElRef = useRef(null);
  const pending = useMemo(() => pendingNotifications(notifications), [notifications]);
  const emailCount = pending.filter((n) => n.type === 'email').length;

  // --- Back handler stack ---
  useEffect(() => {
    if (!openApp) return;
    // App open: back closes app → returns to desktop
    return pushBackHandler(() => { setOpenApp(null); });
  }, [openApp]);

  useEffect(() => {
    if (!monitorOpen || openApp) return;
    // Desktop open (no app): back closes desktop → returns to workspace
    return pushBackHandler(() => closeMonitor());
  }, [monitorOpen, openApp]);

  useEffect(() => {
    if (!corridorDialog) stopSpeech();
    return pushBackHandler(() => { stopSpeech(); setCorridorDialog(null); });
  }, [corridorDialog]);

  // Pre-check native TTS availability while the dialog is open.
  useEffect(() => {
    if (corridorDialog) {
      import('../lib/speechSynthesis.js').then((m) => m.isSupported()).catch(() => {});
    }
  }, [corridorDialog]);

  useEffect(() => {
    if (!corridorMenu) return;
    return pushBackHandler(() => setCorridorMenu(false));
  }, [corridorMenu]);

  // Touch-through guard: when the corridor menu opens, block interaction for
  // 200 ms so that the pointerup from the door-tap gesture cannot accidentally
  // activate a menu button that rendered under the still-pressed finger.
  useEffect(() => {
    if (!corridorMenu) { setCorridorMenuReady(false); return; }
    const id = setTimeout(() => setCorridorMenuReady(true), 200);
    return () => clearTimeout(id);
  }, [corridorMenu]);

  useEffect(() => {
    if (!breakRoom) return;
    return pushBackHandler(() => setBreakRoom(false));
  }, [breakRoom]);

  useEffect(() => {
    if (!activeInteraction) return;
    return pushBackHandler(() => setActiveInteraction(null));
  }, [activeInteraction]);

  useEffect(() => {
    if (!activeHint) return;
    return pushBackHandler(() => setActiveHint(null));
  }, [activeHint]);

  useEffect(() => {
    if (!interactionMode) return;
    return pushBackHandler(() => setInteractionMode(false));
  }, [interactionMode]);

  useEffect(() => {
    seedEmails();
    seedNotebook();
    startAmbient();
    const handler = () => setNotifications(readNotifications());
    window.addEventListener('it-learn:game-state', handler);
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })), 60_000);
    const orientationHandler = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', orientationHandler);
    return () => {
      window.removeEventListener('it-learn:game-state', handler);
      window.removeEventListener('resize', orientationHandler);
      clearInterval(timer);
      stopAmbient();
    };
  }, []);

  useEffect(() => {
    function recomputeStage() {
      const compact = Math.min(window.innerWidth, window.innerHeight) < COMPACT_VIEWPORT_BREAKPOINT;
      setIsCompactViewport(compact);
      setStageFrame(compact ? null : computeStageFrame());
    }
    recomputeStage();
    window.addEventListener('resize', recomputeStage);
    window.addEventListener('orientationchange', recomputeStage);
    return () => {
      window.removeEventListener('resize', recomputeStage);
      window.removeEventListener('orientationchange', recomputeStage);
    };
  }, []);

  const switchZone = useCallback((newZone) => {
    setZone(newZone);
    sessionStorage.setItem('cyberlearn:workspace-area', newZone);
  }, []);

  // =====================================================================
  // Tutorial bridge. The Onboarding overlay lives outside Workspace (it's a
  // sibling rendered by Layout), so it has no direct access to component
  // state. This mirrors the existing `it-learn:game-state` event pattern
  // already used elsewhere in the app: Workspace broadcasts a snapshot of
  // its live state (zone, interaction mode, open app/desktop, and the real
  // projected screen-space rect of every hotspot) whenever anything
  // tutorial-relevant changes; Onboarding listens and positions its markers
  // from that data instead of hardcoded coordinates. Onboarding can in turn
  // request a zone switch (e.g. to bring an off-screen hotspot into view)
  // via a second event that Workspace listens for below.
  // =====================================================================
  useEffect(() => {
    const el = panoramaElRef.current;
    const hotspotRects = {};
    if (el && containerSize.w && containerSize.h) {
      const containerRect = el.getBoundingClientRect();
      Object.entries(HOTSPOTS).forEach(([key, h]) => {
        const pan = isLandscape ? 50 : ZONE_PAN_X[h.zone];
        const rect = projectHotspot(h, isLandscape, containerSize, pan);
        if (!rect) return;
        hotspotRects[key] = {
          zone: h.zone,
          visible: isLandscape || h.zone === zone,
          left: containerRect.left + (parseFloat(rect.left) / 100) * containerRect.width,
          top: containerRect.top + (parseFloat(rect.top) / 100) * containerRect.height,
          width: (parseFloat(rect.width) / 100) * containerRect.width,
          height: (parseFloat(rect.height) / 100) * containerRect.height,
        };
      });
    }
    window.dispatchEvent(new CustomEvent('cyberlearn:workspace-state', {
      detail: { zone, interactionMode, monitorOpen, openApp, corridorMenu, activeHint: Boolean(activeHint), isLandscape, hotspotRects },
    }));
  }, [zone, interactionMode, monitorOpen, openApp, corridorMenu, activeHint, isLandscape, containerSize]);

  useEffect(() => {
    function handleZoneRequest(e) {
      const targetZone = e.detail?.zone;
      if (targetZone && ZONES.includes(targetZone) && targetZone !== zone) switchZone(targetZone);
    }
    window.addEventListener('cyberlearn:tutorial-request-zone', handleZoneRequest);
    return () => window.removeEventListener('cyberlearn:tutorial-request-zone', handleZoneRequest);
  }, [zone, switchZone]);

  // Measures the panorama background container so hotspots can be projected
  // exactly onto the visible image (see projectHotspot). Re-attaches
  // automatically whenever the container element changes (orientation swap,
  // returning from a sub-view, etc.) via callback-ref semantics. The element
  // itself is also kept (panoramaElRef) so the tutorial bridge below can
  // convert projected hotspot rects into real viewport pixel coordinates via
  // getBoundingClientRect().
  const setPanoramaRef = useCallback((el) => {
    if (resizeObserverRef.current) { resizeObserverRef.current.disconnect(); resizeObserverRef.current = null; }
    panoramaElRef.current = el;
    if (!el) return;
    const update = () => setContainerSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    resizeObserverRef.current = ro;
  }, []);

  // =====================================================================
  // Unified gesture state machine for the panorama layer.
  //
  // A single pointer (mouse or touch) always resolves to EXACTLY ONE of:
  //   tap | swipe | longpress | cancelled
  // The hotspot the gesture started on (if any) is recorded up-front via
  // the `data-hotspot-key` attribute (see Hotspot component) - hotspots do
  // NOT stopPropagation(), so a drag that begins on a hotspot can still be
  // reclassified as a swipe once it crosses the movement threshold.
  // =====================================================================
  const GESTURE_MOVE_THRESHOLD = 20; // px - horizontal movement to classify as swipe
  const GESTURE_SWIPE_THRESHOLD = 60; // px - total distance required to actually change zone
  const GESTURE_LONGPRESS_MS = 600;

  function clearLongPressTimer() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }

  function resetGesture(e) {
    clearLongPressTimer();
    setActiveHotspotKey(null);
    if (e && e.currentTarget && e.pointerId != null && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }
    gestureRef.current = { pointerId: null, startX: 0, startY: 0, startTime: 0, targetKey: null, mode: 'pending' };
  }

  function handleGesturePointerDown(e) {
    const hotspotEl = e.target.closest ? e.target.closest('[data-hotspot-key]') : null;
    const targetKey = hotspotEl ? hotspotEl.getAttribute('data-hotspot-key') : null;
    console.log('[Gesture] pointerdown');
    console.log(`[Gesture] target hotspot: ${targetKey || 'none'}`);

    e.currentTarget.setPointerCapture(e.pointerId);
    gestureRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startTime: Date.now(), targetKey, mode: 'pending' };
    if (targetKey) setActiveHotspotKey(targetKey);

    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      const g = gestureRef.current;
      if (g.pointerId !== e.pointerId || g.mode !== 'pending') return; // already resolved as swipe/cancelled
      g.mode = 'longpress';
      console.log('[Gesture] classified: longpress');
      // Long press on empty space reveals ALL hotspots. Long press on a
      // specific hotspot only keeps that one highlighted (activeHotspotKey
      // is already set) - no global reveal, and releasing never fires the
      // hotspot's action.
      if (!g.targetKey) setInteractionMode(true);
    }, GESTURE_LONGPRESS_MS);
  }

  function handleGesturePointerMove(e) {
    const g = gestureRef.current;
    if (g.pointerId !== e.pointerId || g.mode !== 'pending') return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (Math.abs(dx) > GESTURE_MOVE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      console.log(`[Gesture] move dx=${dx.toFixed(0)} dy=${dy.toFixed(0)}`);
      console.log('[Gesture] classified: swipe');
      g.mode = 'swipe';
      clearLongPressTimer();
      setActiveHotspotKey(null); // cancel any hotspot highlight - this is now a camera pan, not a tap
    }
  }

  function handleGesturePointerUp(e) {
    const g = gestureRef.current;
    if (g.pointerId !== e.pointerId) { resetGesture(e); return; }
    clearLongPressTimer();
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (g.mode === 'swipe') {
      if (!isLandscape && Math.abs(dx) > GESTURE_SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const idx = ZONES.indexOf(zone);
        if (dx < 0 && idx < ZONES.length - 1) { console.log(`[Gesture] zone: ${idx + 1} -> ${idx + 2}`); switchZone(ZONES[idx + 1]); }
        else if (dx > 0 && idx > 0) { console.log(`[Gesture] zone: ${idx + 1} -> ${idx}`); switchZone(ZONES[idx - 1]); }
      }
    } else if (g.mode === 'longpress') {
      if (!g.targetKey) setInteractionMode(false); // release global reveal-all
      // hotspot long-press: never fires the action on release
    } else {
      // still 'pending' at pointerup -> short tap
      console.log('[Gesture] classified: tap');
      if (g.targetKey && HOTSPOTS[g.targetKey]) {
        console.log(`[Gesture] hotspot action: ${g.targetKey}`);
        openObject(HOTSPOTS[g.targetKey].app, g.targetKey);
      }
    }
    resetGesture(e);
  }

  function handleGesturePointerCancel(e) {
    console.log('[Gesture] cancelled');
    const g = gestureRef.current;
    if (g.mode === 'longpress' && !g.targetKey) setInteractionMode(false);
    resetGesture(e);
  }

  // --- Monitor open/close with zoom ---
  function openMonitor() {
    playMonitorOn();
    setZoomPhase('zooming-in');
    setTimeout(() => {
      setMonitorOpen(true);
      setZoomPhase('desktop');
    }, 450);
  }

  function closeMonitor() {
    setZoomPhase('zooming-out');
    setTimeout(() => {
      setMonitorOpen(false);
      setZoomPhase('none');
    }, 300);
  }

  function openDesktopApp(dApp) {
    if (!dApp.app) return;
    if (dApp.app === 'missions') { navigate('/inbox'); return; }
    if (appComponents[dApp.app]) {
      if (dApp.app === 'email') playMailNotification();
      else if (dApp.app === 'phone') playPhoneRing();
      else playMonitorOn();
      setOpenApp(dApp.app);
    }
  }

  const ActiveApp = openApp ? appComponents[openApp] : null;

  function openObject(app, hotspotKey) {
    console.log(`[Hotspot] resolved action: ${app} (key=${hotspotKey})`);
    window.dispatchEvent(new CustomEvent('cyberlearn:hotspot-activated', { detail: { app, key: hotspotKey } }));
    if (app === '__monitor__') { openMonitor(); return; }
    if (appComponents[app]) { if (app === 'email') playMailNotification(); else if (app === 'phone') playPhoneRing(); else playMonitorOn(); setOpenApp(app); }
    else if (app === 'runbooks') navigate('/runbooks');
    else if (app === 'missions') navigate('/inbox');
    else if (app === 'training') navigate('/training');
    else if (app === 'hints') setActiveHint(randomHint());
    else if (app === 'people') { setCorridorDialog(null); setBreakRoom(false); setCorridorMenu(true); }
    else if (app === 'infrastructure') navigate('/infrastructure');
    else if (app === 'career') navigate('/career');
    else if (app === 'import') navigate('/import');
  }

  // Generic dispatcher for CORRIDOR_ROOMS - keyed purely by `action`, so a
  // future 4th room only needs a new list entry + one more branch here, not
  // new hotspot geometry or a parallel menu system.
  // Guard: can ONLY be entered from the corridor menu itself.
  function enterCorridorRoom(action) {
    if (!corridorMenu) return; // safety: never bypass corridor menu
    setCorridorMenu(false);
    if (action === 'sams-office') {
      const person = colleagues.find((c) => c.id === 'sam') || colleagues[0];
      setCorridorDialog({ dialog: buildSamOfficeDialog(), person });
    } else if (action === 'break-room') {
      setBreakRoom(true);
    } else if (action === 'colleagues') {
      triggerCorridorEncounter();
    }
  }

  function triggerCorridorEncounter() {
    const sideMissions = sortedInbox();
    if (sideMissions.length > 0) {
      const mission = sideMissions[0];
      const personId = mission.personId || 'sam';
      const person = colleagues.find((c) => c.id === personId) || colleagues[0];
      const intro = mission.personIntro || `${person.name} spricht dich an:`;
      // `mission.title` is written for the ticket/notification list (e.g.
      // "Mara König ruft an: DNS-Konfiguration" for phone-channel missions)
      // and must never be spoken verbatim in a face-to-face hallway
      // encounter - "ruft an" only makes sense on the phone. Build a clean,
      // channel-agnostic spoken phrase from the topic instead.
      const topic = mission.topic || 'einem aktuellen Thema';
      const spokenAsk = `Ich habe eine Frage zu ${topic}`;
      setCorridorDialog({
        dialog: {
          id: `corridor-${mission.id}`, personId, mode: 'face-to-face',
          nodes: [
            { id: 'start', text: `${intro}\n\n„${spokenAsk}. Hast du kurz Zeit?“`, autoNext: 'ask' },
            { id: 'ask', text: 'Was möchtest du tun?', options: [
              { label: 'Ja, ich übernehme das.', nextId: 'accept' },
              { label: 'Später, ich trage es mir ein.', nextId: 'defer' },
              { label: 'Nein, das passt gerade nicht.', nextId: 'decline' },
            ] },
            { id: 'accept', text: 'Super, danke. Ich leite dir alles weiter.', onComplete: { action: 'accept', missionId: mission.id } },
            { id: 'defer', text: 'Alles klar, ich schreib dir ein Ticket. Melde dich, wenn du Zeit hast.', onComplete: { action: 'defer', missionId: mission.id } },
            { id: 'decline', text: person.tone === 'direkt und freundlich' ? 'Okay, kein Problem. Dann frag ich jemand anderen.' : person.tone === 'fragt nach Risiko und Auswirkung' ? 'Verstehe. Hoffen wir, dass es nicht dringender wird.' : 'Gut, dann schaue ich, wer sonst verfügbar ist.', onComplete: { action: 'decline', missionId: mission.id } },
          ],
          entryNode: 'start',
        },
        person, mission,
      });
      return;
    }
    const learningDialogs = [
      { interactionId: 'osi-layers', personId: 'david', intro: 'Sam hat vorhin wieder vom Schichtenmodell gesprochen. Ich bekomme die Reihenfolge nie vollständig zusammen. Hilfst du mir kurz?' },
      { interactionId: 'subnet-powers', personId: 'mara', intro: 'Für die Subnetting-Übung brauche ich die Zweierpotenzen. Kannst du die kurz in die richtige Reihenfolge bringen?' },
      { interactionId: 'subnet-cidr', personId: 'david', intro: 'Kurze Frage: Wenn ich ein /26-Netz habe – wie groß ist der Block und welche Maske ist das?' },
      { interactionId: 'subnet-calculate', personId: 'lea', intro: 'Wir haben einen Server auf 192.168.1.50/26. Kannst du mir schnell sagen, was Netz-ID und Broadcast sind?' },
    ];
    const completed = JSON.parse(localStorage.getItem('cyberlearn:completed-interactions') || '[]');
    const available = learningDialogs.filter((d) => !completed.includes(d.interactionId));
    if (available.length > 0) {
      const chosen = available[Math.floor(Math.random() * available.length)];
      const person = colleagues.find((c) => c.id === chosen.personId) || colleagues[0];
      setCorridorDialog({
        dialog: {
          id: `learning-${chosen.interactionId}`, personId: chosen.personId, mode: 'face-to-face',
          nodes: [
            { id: 'start', text: chosen.intro, options: [{ label: 'Klar, machen wir.', nextId: 'interact' }, { label: 'Gerade nicht.', nextId: 'skip' }] },
            { id: 'interact', text: '__INTERACTION__', onComplete: { action: 'interaction', interactionId: chosen.interactionId } },
            { id: 'skip', text: 'Alles klar, ein andermal!' },
          ],
          entryNode: 'start',
        },
        person,
      });
      return;
    }
    // Fallback smalltalk always features Sam (matches defaultDialog's
    // personId and is the reliable entry point into the NEXUS Academy).
    const person = colleagues.find((c) => c.id === 'sam') || colleagues[0];
    setCorridorDialog({ dialog: buildDefaultDialog(), person });
  }

  async function handleDialogComplete(node) {
    const action = node?.onComplete?.action;
    const missionId = node?.onComplete?.missionId;
    const interactionId = node?.onComplete?.interactionId;
    if (action === 'close') { await stopSpeech(); setCorridorDialog(null); return; }
    if (action === 'academy') { await stopSpeech(); setCorridorDialog(null); navigate('/academy'); return; }
    if (action === 'interaction' && interactionId) { await stopSpeech(); setCorridorDialog(null); setActiveInteraction(interactionById(interactionId)); return; }
    if (missionId) {
      const mission = corridorDialog?.mission;
      registerMission({ instanceId: missionId, questId: missionId, source: 'hallway', title: mission?.title || '' });
      if (action === 'accept') { await stopSpeech(); updateMissionStatus(missionId, MissionStatus.ACCEPTED); setCorridorDialog(null); navigate(`/side-mission/${encodeURIComponent(missionId)}`); return; }
      if (action === 'defer') updateMissionStatus(missionId, MissionStatus.ACCEPTED);
      if (action === 'decline') updateMissionStatus(missionId, MissionStatus.DECLINED);
    }
    await stopSpeech();
    setCorridorDialog(null);
  }

  function handleInteractionComplete() {
    if (activeInteraction) {
      const completed = JSON.parse(localStorage.getItem('cyberlearn:completed-interactions') || '[]');
      if (!completed.includes(activeInteraction.id)) { completed.push(activeInteraction.id); localStorage.setItem('cyberlearn:completed-interactions', JSON.stringify(completed)); }
    }
    setActiveInteraction(null);
  }

  // === SUB-VIEWS ===

  // 1. App running (fullscreen)
  if (ActiveApp) {
    const backLabel = 'Desktop';
    const handleAppClose = () => { setOpenApp(null); };
    return (
      <div className="fullscreen-overlay bg-[#030508]">
        <BackBar label={backLabel} onBack={handleAppClose} />
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2"><ActiveApp missionId={readGameState().activeQuest || 'first-day'} onClose={handleAppClose} /></div>
      </div>
    );
  }

  // 2. Desktop view (monitor opened, no app yet)
  if (monitorOpen && zoomPhase === 'desktop') return (
    <div className="fullscreen-overlay bg-[#060a10] select-none" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <NexusDesktop apps={DESKTOP_APPS} emailCount={emailCount} clock={clock} onOpen={openDesktopApp} onClose={closeMonitor} />
    </div>
  );

  // 3a. Corridor room menu ("Wohin im Flur?") - data-driven from
  // CORRIDOR_ROOMS, no per-room hotspot geometry.
  if (corridorMenu) return (
    <div className="fullscreen-overlay bg-[#030508]">
      <BackBar label="Flur" onBack={() => setCorridorMenu(false)} />
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 flex flex-col gap-2">
        <div className="cyber-card p-4 text-center">
          <p className="text-sm text-[#c9d1d9]">Wohin möchtest du im Flur gehen?</p>
        </div>
        {CORRIDOR_ROOMS.map((room) => (
          <button key={room.id} onClick={() => enterCorridorRoom(room.action)}
            disabled={!corridorMenuReady}
            style={corridorMenuReady ? undefined : { pointerEvents: 'none' }}
            className="cyber-card p-3 text-left flex items-center gap-3 active:border-[#00f0ff]/40">
            <span className="text-xl shrink-0">{room.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">{room.label}</div>
              <div className="text-[11px] text-[#8b949e] mt-0.5 leading-snug">{room.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // 3b. Aufenthaltsraum - atmospheric break room with random ambience, coffee
  // machine and colleague chatter. No missions or Academy here.
  if (breakRoom) return (
    <div className="fullscreen-overlay bg-[#030508]">
      <BackBar label="Flur" onBack={() => setBreakRoom(false)} />
      <BreakRoom onBack={() => setBreakRoom(false)} />
    </div>
  );

  // 3c. Corridor dialog (Sams Büro / Mitarbeitergespräche)
  if (corridorDialog) return (
    <div className="fullscreen-overlay bg-[#030508]">
      <BackBar label="Flur" onBack={() => setCorridorDialog(null)} />
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2"><DialogView dialog={corridorDialog.dialog} person={corridorDialog.person} onComplete={handleDialogComplete} /></div>
    </div>
  );

  // 4. Learning interaction
  if (activeInteraction) return (
    <div className="fullscreen-overlay bg-[#030508]">
      <BackBar label={`Flur · ${activeInteraction.title}`} onBack={() => setActiveInteraction(null)} />
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2"><div className="cyber-card p-4"><LearningInteraction interaction={activeInteraction} onComplete={handleInteractionComplete} /></div></div>
    </div>
  );

  // === MAIN WORKSPACE ===
  const panX = ZONE_PAN_X[zone];
  const zoneHotspots = Object.entries(HOTSPOTS).filter(([, h]) => h.zone === zone);

  // Zoom transform for monitor enter/exit animation
  const isZooming = zoomPhase === 'zooming-in' || zoomPhase === 'zooming-out';
  // Zoom targets the monitor screen center on Panorama2.png (approx 50% X, 40% Y)
  const zoomStyle = isZooming ? {
    transform: zoomPhase === 'zooming-in' ? 'scale(4)' : 'scale(1)',
    transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.15, 1)',
    transformOrigin: '50% 40%',
  } : {};

  // Hint modal.
  // IMPORTANT: this must NOT close on a backdrop `onClick`. The same physical
  // tap that opens the hint (via the central gesture state machine's
  // pointerup -> openObject('hints')) also produces a browser-synthesized
  // "click" event shortly after. Because the backdrop is freshly rendered at
  // that exact screen position, that synthesized click would immediately
  // land on it and re-close the hint in the same gesture. Closing is
  // therefore only possible via the explicit button or Android back
  // (registered separately below), matching the requested "close only via
  // deliberate action" behavior.
  const hintModal = activeHint && (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 pointer-events-none" style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      <div className="cyber-card relative p-4 max-w-sm w-full max-h-[70dvh] overflow-y-auto pointer-events-auto" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <div className="text-[#00f0ff] font-bold text-xs mb-2">{activeHint.title}</div>
        <p className="text-sm text-[#c9d1d9]">{activeHint.text}</p>
        <button onClick={() => setActiveHint(null)} className="cyber-btn w-full mt-3 text-sm py-2">Verstanden</button>
      </div>
    </div>
  );

  // (workstation modal removed – phone is now a desktop icon)

  // Stage container: unchanged full-bleed fixed-to-viewport box on phones and
  // in the Android app. On larger (desktop/tablet) viewports it's instead
  // capped and centered below the header via computeStageFrame() above, so
  // the panorama can't blow up to fill an entire desktop window. This only
  // changes the outer box's position/size - the panorama ref div inside it
  // still fills it exactly via `absolute inset-0`, so containerSize (and
  // therefore every hotspot projection) automatically adapts with zero
  // changes to the hotspot/gesture/zoom logic itself.
  const stagePositionStyle = (isCompactViewport || !stageFrame)
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }
    : { position: 'fixed', top: stageFrame.top, left: stageFrame.left, width: stageFrame.width, height: stageFrame.height };
  const stageClassName = `overflow-hidden bg-[#030508] select-none${isCompactViewport ? '' : ' rounded-2xl border border-[#1f2937]/80 shadow-[0_0_2.5rem_rgba(0,0,0,0.6)]'}`;

  // === LANDSCAPE ===
  if (isLandscape) return (
    <div className={stageClassName} style={{ ...stagePositionStyle, ...zoomStyle }}>
      <div ref={setPanoramaRef} className="absolute inset-0" style={{ backgroundImage: `url(${PANORAMA_SRC})`, backgroundSize: 'cover', backgroundPosition: '50% center', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute inset-0 bg-black/10" />
      {/* Hotspots - invisible by default, revealed in interaction mode or while
          pressed. This div is the central gesture layer: tap/swipe/longpress
          are classified here (see handleGesturePointer*), never on individual
          hotspots, so a drag started on a hotspot can still become a swipe.
          touch-action: pan-y lets the browser keep vertical gestures while we
          own horizontal panning ourselves. */}
      <div className="absolute inset-0 z-20" style={{ touchAction: 'pan-y' }}
        onPointerDown={handleGesturePointerDown} onPointerMove={handleGesturePointerMove}
        onPointerUp={handleGesturePointerUp} onPointerCancel={handleGesturePointerCancel}>
        {Object.entries(HOTSPOTS).map(([key, h], i) => {
          const rect = projectHotspot(h, true, containerSize, 50);
          if (!rect) return null;
          return (
            <Hotspot key={key} id={key} index={i + 1}
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
              edgeSide={edgeSideOf(rect)} label={h.label} coords={h} pressed={activeHotspotKey === key}
              onActivate={() => openObject(h.app, key)} debug={debugHotspots} showAll={interactionMode}
              badge={key === 'workstation' && (emailCount > 0 || pending.some((n) => n.type === 'phone'))} />
          );
        })}
      </div>
      <ObjectivePanel />
      {hintModal}

    </div>
  );

  // === PORTRAIT ===
  return (
    <div className={`flex flex-col ${stageClassName}`} style={stagePositionStyle}>
      <div className="flex-1 relative overflow-hidden" style={zoomStyle}>
        <div ref={setPanoramaRef} className="absolute inset-0 transition-all duration-500 ease-out" style={{ backgroundImage: `url(${PANORAMA_SRC})`, backgroundSize: 'auto 100%', backgroundPosition: `${panX}% center`, backgroundRepeat: 'no-repeat' }} />
        <div className="absolute inset-0 bg-black/5" />
        {/* Hotspots for current zone + central gesture layer (see landscape comment above) */}
        <div className="absolute inset-0 z-20" style={{ touchAction: 'pan-y' }}
          onPointerDown={handleGesturePointerDown} onPointerMove={handleGesturePointerMove}
          onPointerUp={handleGesturePointerUp} onPointerCancel={handleGesturePointerCancel}>
          {zoneHotspots.map(([key, h], i) => {
            const rect = projectHotspot(h, false, containerSize, panX);
            if (!rect) return null;
            return (
              <Hotspot key={key} id={key} index={i + 1}
                style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
                edgeSide={edgeSideOf(rect)} label={h.label} coords={h} pressed={activeHotspotKey === key}
                onActivate={() => openObject(h.app, key)} debug={debugHotspots} showAll={interactionMode}
                badge={key === 'workstation' && (emailCount > 0 || pending.some((n) => n.type === 'phone'))} />
            );
          })}
        </div>
        {/* Edge navigation hints */}
        {!isZooming && ZONES.indexOf(zone) > 0 && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="text-[#00f0ff]/25 text-lg animate-[pulse_2s_ease-in-out_infinite]">&lsaquo;</div>
          </div>
        )}
        {!isZooming && ZONES.indexOf(zone) < ZONES.length - 1 && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="text-[#00f0ff]/25 text-lg animate-[pulse_2s_ease-in-out_infinite]">&rsaquo;</div>
          </div>
        )}
        {/* Ambient vignette */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#030508] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#030508] to-transparent" />
        </div>
  
      </div>
      {/* Zone station bar - explicit safe-area-bottom padding so this row
          (icons + labels) never ends up underneath Android's on-screen
          navigation bar/gesture pill on devices that don't reserve that
          space themselves. */}
      {!isZooming && (
        <div className="flex items-center justify-center gap-1 px-2 py-1.5 shrink-0" style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}>
          {ZONES.map((z) => {
            const active = zone === z;
            const icon = ZONE_ICONS[z];
            return (
              <button key={z} onClick={() => switchZone(z)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${active
                  ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/30 shadow-[0_0_12px_rgba(0,240,255,0.08)]'
                  : 'bg-transparent border border-transparent active:bg-white/5'}`}>
                <span className={`text-xs transition-colors ${active ? 'text-[#00f0ff]' : 'text-[#8b949e]/40'}`}>{icon}</span>
                <span className={`text-[9px] font-medium tracking-wide uppercase transition-colors ${active ? 'text-[#00f0ff]/90' : 'text-[#8b949e]/40'}`}>{ZONE_LABELS[z]}</span>
              </button>
            );
          })}
        </div>
      )}
      {hintModal}

    </div>
  );
}

// =====================================================
// NexusOS Desktop - realistic OS-style desktop
// =====================================================
function NexusDesktop({ apps, emailCount, clock, onOpen, onClose }) {
  // Local fix: this view used `fixed inset-0`, which anchors it to the true
  // viewport top - underneath the global sticky NEXUS header (z-10), hiding
  // the first icon row behind it. Instead of `inset-0`, pin `top` to the
  // real, measured bottom edge of the header (re-measured on resize/rotate)
  // and `bottom` to the safe-area inset. This is scoped entirely to this
  // component - no shared class, parent container or the header itself is
  // touched.
  const [topOffset, setTopOffset] = useState(0);
  useEffect(() => {
    function measure() {
      const header = document.querySelector('header');
      setTopOffset(header ? header.getBoundingClientRect().bottom : 0);
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  return (
    <div className="fixed left-0 right-0 flex flex-col overflow-hidden select-none"
      style={{
        top: topOffset,
        bottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'linear-gradient(135deg, #0a1628 0%, #0c1a2e 30%, #081420 60%, #060e18 100%)',
      }}>

      {/* Wallpaper logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="text-center">
          <div className="text-8xl font-bold tracking-widest text-[#00ff66]">N</div>
          <div className="text-sm tracking-[0.5em] text-[#00ff66] mt-2">NEXUS</div>
        </div>
      </div>

      {/* Desktop icon area */}
      <div className="flex-1 p-4 pt-6">
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 max-w-xs">
          {apps.map((dApp) => {
            const Icon = dApp.icon;
            const enabled = !!dApp.app;
            const hasNotif = dApp.id === 'email' && emailCount > 0;
            return (
              <button key={dApp.id} onClick={() => onOpen(dApp)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${enabled ? 'active:bg-white/10 active:scale-90' : 'opacity-40'}`}>
                <div className="relative w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${dApp.color}15`, border: `1px solid ${dApp.color}30` }}>
                  <Icon size={20} style={{ color: dApp.color }} />
                  {hasNotif && (
                    <div className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-[#ff3355] flex items-center justify-center px-0.5">
                      <span className="text-[8px] text-white font-bold">{emailCount}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#c9d1d9]/70 text-center leading-tight truncate w-full">{dApp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Taskbar */}
      <div className="shrink-0 border-t border-[#1a2332]/60 bg-[#0a0e14]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2">
          <button onClick={onClose} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 active:bg-white/10 transition-colors">
            <Power size={14} className="text-[#00ff66]/70" />
            <span className="text-[9px] text-[#8b949e]/70">Zurück</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]/50" />
              <span className="text-[8px] text-[#8b949e]/60">LAN</span>
            </div>
            <span className="text-[10px] text-[#c9d1d9]/60 tabular-nums">{clock}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Hotspot - invisible clickable zone over a real object in the panorama.
//
// Interaction model (full writeup accompanies this change):
//  - This component is now PURELY presentational. It does NOT run its own
//    tap/long-press logic and does NOT call stopPropagation() - the central
//    gesture state machine on the panorama layer (see
//    handleGesturePointerDown/Move/Up/Cancel in Workspace) owns all gesture
//    classification, so a drag that starts on a hotspot can still become a
//    swipe once it crosses the movement threshold.
//  - `pressed` is passed in from the parent (true while this hotspot is the
//    gesture's current target AND the gesture hasn't been reclassified as a
//    swipe). `data-hotspot-key` lets the central handler identify which
//    hotspot (if any) a pointerdown landed on via `element.closest(...)`.
//  - Every visual child (border, glow, label, badge, debug markers) is
//    pointer-events-none so they can never intercept the gesture.
// =====================================================
function Hotspot({ id, style, label, index, coords, onActivate, debug, badge, showAll, pressed, edgeSide }) {
  const revealed = showAll || pressed;
  const labelAlign = edgeSide === 'left' ? 'left-1' : edgeSide === 'right' ? 'right-1' : 'left-1/2 -translate-x-1/2';
  const debugLabelAlign = edgeSide === 'right' ? 'right-0' : 'left-0';

  return (
    <div data-hotspot-key={id} role="button" tabIndex={0} style={style}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
      className="absolute pointer-events-auto rounded-xl cursor-pointer outline-none">
      {/* Visual-only layer - pointer-events-none throughout, carries the press-scale so it never interferes with gesture hit-testing */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-transform duration-200 ${pressed ? 'scale-[1.02]' : 'scale-100'} ${debug ? 'border-2 border-red-500/80 bg-red-500/10' : ''}`}>
        {debug && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_red] pointer-events-none" />
            <span className={`absolute -top-4 ${debugLabelAlign} whitespace-nowrap text-[8px] font-bold text-white bg-red-600 px-1 rounded-sm pointer-events-none`}>#{index} {label}</span>
            {coords && (
              <span className={`absolute -bottom-4 ${debugLabelAlign} whitespace-nowrap text-[7px] font-mono text-red-200 bg-black/85 px-1 rounded-sm pointer-events-none`}>
                x:{coords.x.toFixed(3)} y:{coords.y.toFixed(3)} w:{coords.w.toFixed(3)} h:{coords.h.toFixed(3)}
              </span>
            )}
          </>
        )}
        {revealed && !debug && (
          <>
            <div className={`absolute inset-0 rounded-xl border pointer-events-none transition-all duration-300 ${pressed ? 'border-[#00f0ff]/70 bg-[#00f0ff]/10 shadow-[0_0_18px_rgba(0,240,255,0.3)]' : 'border-[#00f0ff]/25 bg-[#00f0ff]/5 shadow-[0_0_10px_rgba(0,240,255,0.1)]'}`}
              style={{ animation: 'fadeIn 0.25s ease-out' }} />
            <span className={`absolute bottom-1.5 ${labelAlign} whitespace-nowrap px-2 py-0.5 rounded text-[8px] font-medium tracking-wider uppercase text-[#00f0ff]/85 bg-[#030508]/70 border border-[#00f0ff]/20 backdrop-blur-sm pointer-events-none`}
              style={{ animation: 'fadeIn 0.25s ease-out' }}>{label}</span>
          </>
        )}
        {badge && <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#ff3355] animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_8px_#ff3355] pointer-events-none" />}
      </div>
    </div>
  );
}

const hints = [
  { title: 'APIPA', text: 'Eine 169.254.x.x-Adresse bedeutet: Der Client hat keinen DHCP-Lease bekommen und hat sich selbst eine Adresse vergeben.' },
  { title: 'DHCP', text: 'DHCP vergibt automatisch IP-Adresse, Subnetzmaske, Gateway und DNS-Server. Ohne DHCP musst du alles manuell prüfen.' },
  { title: 'DNS', text: 'Wenn ein Ziel per IP erreichbar ist, aber nicht per Name, liegt das Problem meist an der DNS-Auflösung.' },
  { title: 'ipconfig', text: 'Mit ipconfig /all siehst du MAC-Adresse, DHCP-Status, Gateway und DNS-Server – nicht nur die IP.' },
  { title: 'ping', text: 'ping prüft Erreichbarkeit. Bei Zeitüberschreitungen liegt ein Routing-, Firewall- oder Kabelproblem vor.' },
];

function randomHint() { return hints[Math.floor(Math.random() * hints.length)]; }
