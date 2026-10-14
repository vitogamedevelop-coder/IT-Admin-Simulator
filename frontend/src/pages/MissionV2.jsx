import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  startMainMission,
  loadActiveMainMission,
  clearActiveMission,
  executeMissionCommand,
  getMissionHint,
  consumeMissionHint,
  revealMissionSolution,
  getMainMissionProgress,
  evaluateMainMission,
  mainMissionFeedback,
  getMainMissionRequirements,
  isMainMission,
  MISSION_001_ID,
} from '../lib/missionV2';
import {
  isCiscoSideMission,
  startCiscoSideMission,
  loadActiveCiscoSideMission,
  clearActiveCiscoSideMission,
  executeCiscoSideMissionCommand,
  getCiscoSideMissionHint,
  consumeCiscoSideMissionHint,
  revealCiscoSideMissionSolution,
  getCiscoSideMissionProgress,
  evaluateCiscoSideMission,
  ciscoSideMissionFeedback,
  SIDE_001_REQUIREMENTS,
  SIDE_002_REQUIREMENTS,
  SIDE_003_REQUIREMENTS,
  SIDE_004_REQUIREMENTS,
} from '../lib/ciscoSideMissions';
import { completeQuest, setActiveQuest, completeCiscoSideMission } from '../lib/gameState';
import { notifyMissionCompleted } from '../lib/missionGenerator';
import { recordKnownCredentialsFromMission001 } from '../lib/credentials';
import { questById } from '../lib/questData';
import { buildPrompt, getCommandHelp, completeInput } from '../lib/ciscoCliEngine';
import CiscoNetworkStatePanel from '../components/CiscoNetworkStatePanel';
import { RotateCcw, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Terminal as TermIcon, Send, ChevronLeft, Shield, ClipboardList, Activity, Award, Network } from 'lucide-react';

const SIDE_REQUIREMENTS = {
  'cisco-side-basic-001': SIDE_001_REQUIREMENTS,
  'cisco-side-basic-002': SIDE_002_REQUIREMENTS,
  'cisco-side-basic-003': SIDE_003_REQUIREMENTS,
  'cisco-side-l2-001': SIDE_004_REQUIREMENTS,
};

function buildMainRuntime(missionId) {
  return {
    start: () => startMainMission(missionId),
    load: () => loadActiveMainMission(missionId),
    clear: () => clearActiveMission(),
    execute: (state, input) => executeMissionCommand(state, input),
    getProgress: (state) => getMainMissionProgress(state),
    evaluate: (state) => evaluateMainMission(state),
    feedback: (state, evaluation) => mainMissionFeedback(evaluation.state, evaluation),
    getHint: (state, req) => getMissionHint(state, req),
    consumeHint: (state, req) => consumeMissionHint(state, req),
    revealSolution: (state, req) => revealMissionSolution(state, req),
    requirements: getMainMissionRequirements(missionId),
    reward: { xp: 80, reputation: { network: 8, management: 4 } },
    complete: (state) => {
      const quest = questById(missionId);
      if (quest) completeQuest(quest, { xp: 80, reputation: { network: 8, management: 4 } });
      if (missionId === MISSION_001_ID && state?.device && state?.scenario) {
        recordKnownCredentialsFromMission001(state.device, state.scenario);
      }
      clearActiveMission();
      notifyMissionCompleted();
    },
  };
}

function buildSideRuntime(missionId) {
  return {
    start: () => startCiscoSideMission(missionId),
    load: () => {
      const active = loadActiveCiscoSideMission();
      if (active && active.missionId === missionId) return active;
      return null;
    },
    clear: () => clearActiveCiscoSideMission(),
    execute: (state, input) => executeCiscoSideMissionCommand(state, input),
    getProgress: (state) => getCiscoSideMissionProgress(state),
    evaluate: (state) => evaluateCiscoSideMission(state),
    feedback: (state, evaluation) => ciscoSideMissionFeedback(evaluation.state, evaluation),
    getHint: (state, req) => getCiscoSideMissionHint(state, req),
    consumeHint: (state, req) => consumeCiscoSideMissionHint(state, req),
    revealSolution: (state, req) => revealCiscoSideMissionSolution(state, req),
    requirements: SIDE_REQUIREMENTS[missionId] || [],
    reward: { xp: 30, reputation: { network: 3, security: 3 } },
    complete: (state) => {
      completeCiscoSideMission(state.missionId, { xp: 30, reputation: { network: 3, security: 3 } });
      clearActiveCiscoSideMission();
      notifyMissionCompleted();
    },
  };
}

const RUNTIME_CACHE = {};

function getRuntime(missionId) {
  if (RUNTIME_CACHE[missionId]) return RUNTIME_CACHE[missionId];
  if (isMainMission(missionId)) {
    const rt = buildMainRuntime(missionId);
    RUNTIME_CACHE[missionId] = rt;
    return rt;
  }
  if (isCiscoSideMission(missionId)) {
    const rt = buildSideRuntime(missionId);
    RUNTIME_CACHE[missionId] = rt;
    return rt;
  }
  return null;
}

export default function MissionV2() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const runtime = getRuntime(missionId);

  const [state, setState] = useState(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [helpOutput, setHelpOutput] = useState(null);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const savedInput = useRef('');
  // Auto-scroll only while the player is at (or near) the bottom of the
  // terminal history. If they scroll up to re-read older output, new lines
  // must not rip the view back down. A command the player sends themselves
  // always re-anchors to the bottom (they are acting "at the prompt").
  const autoScrollRef = useRef(true);

  useEffect(() => {
    const active = runtime.load();
    if (active && active.missionId === missionId) {
      setState(active);
    } else if (isMainMission(missionId) || isCiscoSideMission(missionId)) {
      setState(runtime.start());
    } else {
      setState(null);
    }
    if (missionId) setActiveQuest(missionId);
    setLoading(false);
  }, [missionId, runtime]);

  useEffect(() => {
    if (state) {
      const first = runtime.requirements[0];
      if (first && selectedRequirement === null) setSelectedRequirement(first.id);
    }
  }, [state, runtime, selectedRequirement]);

  useEffect(() => {
    const el = terminalRef.current;
    if (el && autoScrollRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [history, helpOutput]);

  // Manual scroll must not be overridden: only keep auto-scrolling while the
  // player is already near the bottom of the terminal history.
  const SCROLL_BOTTOM_THRESHOLD_PX = 24;
  function handleTerminalScroll() {
    const el = terminalRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX;
  }

  function scrollTerminalToBottom() {
    autoScrollRef.current = true;
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  if (loading) return <div className="app-shell flex items-center justify-center text-[#00ff66]">Mission wird geladen...</div>;
  if (!runtime || !state) return <div className="app-shell p-4 text-[#ff3355]">Mission konnte nicht geladen werden.</div>;

  const progress = runtime.getProgress(state);

  function isHelpRequest(raw) {
    const trimmed = raw.trimEnd();
    return trimmed.endsWith('?');
  }

  function showHelp(raw) {
    if (!state || !raw) return;
    const help = getCommandHelp(state.device, raw, { helpCompact: true });
    setHelpOutput(help.help || null);
    setInput(help.inputAfterHelp);
    inputRef.current?.focus();
  }

  function sendCommand() {
    if (!state || !input.trim()) return;
    const trimmed = input.trim();
    if (isHelpRequest(trimmed)) {
      showHelp(trimmed);
      return;
    }
    const promptBefore = buildPrompt(state.device);
    const result = runtime.execute(state, trimmed);
    setState({ ...result.state });
    setInput('');
    setHelpOutput(null);
    setHistoryIndex(-1);
    setHistory((h) => [...h, { command: trimmed, prompt: promptBefore, output: result.output || '' }]);
    setHint(null);
    // The player just acted "at the prompt" - always scroll to the current
    // prompt, even if they had previously scrolled up to re-read output.
    scrollTerminalToBottom();
    inputRef.current?.focus();
  }

  function handleInputChange(value) {
    setInput(value);
    setHistoryIndex(-1);
  }

  function handleTab(e) {
    if (!state) return;
    e.preventDefault();
    const trimmed = input.trimEnd();
    const base = trimmed.endsWith('?') ? trimmed.slice(0, -1).trimEnd() : trimmed;
    if (!base) return;
    const result = completeInput(state.device, base);
    if (result.completion) {
      setInput(`${result.completion} `);
      setHelpOutput(null);
    } else if (result.suggestions.length > 0) {
      setHelpOutput(result.suggestions.join('  '));
    } else {
      setHelpOutput(null);
    }
    inputRef.current?.focus();
  }

  function handleHistoryNav(e) {
    if (!history.length) return;
    if (historyIndex === -1) {
      savedInput.current = input;
    }
    let nextIndex = historyIndex;
    if (e.key === 'ArrowUp') {
      if (nextIndex === -1) nextIndex = history.length - 1;
      else nextIndex = Math.max(0, nextIndex - 1);
    } else if (e.key === 'ArrowDown') {
      nextIndex += 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput(savedInput.current);
        return;
      }
    }
    setHistoryIndex(nextIndex);
    setInput(history[nextIndex].command);
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendCommand();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTab(e);
      return;
    }
    if (e.key === '?' || (e.shiftKey && e.key === '?')) {
      e.preventDefault();
      const next = input + '?';
      setInput(next);
      showHelp(next);
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleHistoryNav(e);
    }
  }

  function requestHint() {
    const next = runtime.getHint(state, selectedRequirement);
    if (next) {
      runtime.consumeHint(state, selectedRequirement);
      setState({ ...state });
      setHint(next);
    } else {
      setHint({ text: 'Keine weiteren Hinweise für diesen Punkt verfügbar.', requirementId: selectedRequirement });
    }
  }

  function revealSolution() {
    const next = runtime.getHint(state, selectedRequirement);
    if (next) {
      runtime.consumeHint(state, selectedRequirement);
    }
    const result = runtime.revealSolution(state, selectedRequirement);
    setState({ ...result.state });
    setHint({
      text: `Lösung aufgedeckt: ${result.answer || selectedRequirement}`,
      explanation: `Erklärung: ${result.explanation || 'Die vollständige Lösung wurde aufgedeckt. Sie wird im Skillprofil vermerkt, aber nicht als selbstständig gelöst gewertet.'}`,
      level: 4,
    });
  }

  function checkMission() {
    const evaluation = runtime.evaluate(state);
    setState(evaluation.state);
    const fb = runtime.feedback(evaluation.state, evaluation);
    setFeedback(fb);
  }

  function finishMission() {
    const evaluation = runtime.evaluate(state);
    setState(evaluation.state);
    const fb = runtime.feedback(evaluation.state, evaluation);
    setFeedback(fb);
    if (evaluation.allCorrect) {
      runtime.complete(state);
    }
  }

  function returnToWorkspace() {
    setActiveQuest(null);
    navigate('/');
  }

  function newVariant() {
    setState(runtime.start());
    setActiveQuest(missionId);
    setHistory([]);
    autoScrollRef.current = true;
    setHelpOutput(null);
    setInput('');
    setHistoryIndex(-1);
    setFeedback(null);
    setHint(null);
    const first = runtime.requirements[0];
    if (first) setSelectedRequirement(first.id);
  }

  const { scenario, device } = state;

  return (
    <div className="app-shell flex flex-col p-3 lg:p-5">
      <div className="mx-auto flex w-full max-w-[1680px] flex-1 min-h-0 flex-col">
        <div className="flex items-center gap-3 mb-3 lg:mb-4">
          <button onClick={() => navigate('/')} className="p-2 rounded border border-[#30363d] text-[#8b949e] hover:border-[#00f0ff]/50 hover:text-[#00f0ff]"><ChevronLeft size={18} /></button>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-[#8b949e]">{isMainMission(missionId) ? 'Hauptmission' : 'Nebenmission'} · NEXUS Network Operations</div>
            <h1 className="truncate text-lg font-bold text-white lg:text-2xl">{scenario.title}</h1>
          </div>
          <div className="hidden items-center gap-3 rounded-lg border border-[#30363d] bg-[#0d1117]/80 px-4 py-2 lg:flex">
            <Activity size={16} className="text-[#00f0ff]" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#8b949e]">Auftragsstatus</div>
              <div className="text-sm font-bold text-[#00f0ff]">{progress.completed} / {progress.total} erfüllt</div>
            </div>
          </div>
        </div>

        <details className="cyber-card mb-3 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-3 text-xs font-bold uppercase tracking-wider text-[#00f0ff]"><Network size={15} /> Live-System anzeigen</summary>
          <div className="px-3 pb-3"><CiscoNetworkStatePanel device={device} scenario={scenario} compact /></div>
        </details>

        <div className="grid flex-1 min-h-0 gap-3 lg:grid-cols-[minmax(280px,0.72fr)_minmax(560px,1.65fr)_minmax(300px,0.85fr)] lg:gap-4">
          <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
            <section className="cyber-card p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-[#00f0ff]"><ClipboardList size={15} /> Einsatzbriefing</div>
              <div className="text-sm text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">{scenario.briefing}</div>
            </section>
            <section className="cyber-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#8b949e]">Fortschritt</span>
                <span className="text-sm font-bold text-[#00f0ff]">{progress.completed}/{progress.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#161b22]">
                <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] transition-all duration-300" style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }} />
              </div>
            </section>
            <section className="cyber-card p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-[#ffcc00]"><Award size={15} /> Einsatzwert</div>
              <div className="flex items-center justify-between text-sm"><span className="text-[#8b949e]">Karriere-XP</span><strong className="text-white">+{runtime.reward.xp}</strong></div>
              <div className="mt-2 text-xs text-[#8b949e]">Belohnt wird ein nachweislich funktionierender Zustand – nicht eine vorgegebene Befehlsfolge.</div>
            </section>
          </aside>

          <main className="flex min-h-0 flex-col gap-3">
            {hint && (
              <div className="cyber-card border border-[#ffcc00]/30 p-3 text-sm text-[#ffcc00]">
                {hint.label && <div className="text-xs uppercase tracking-wider text-[#ffcc00] mb-1">{hint.label}</div>}
                <div className="text-[#c9d1d9]">{hint.text}</div>
                {hint.explanation && <div className="mt-2 text-xs text-[#8b949e]">{hint.explanation}</div>}
              </div>
            )}

            {feedback && (
              <div className={`cyber-card p-4 text-sm ${feedback.title.includes('abgeschlossen') ? 'border-[#00ff66]/30 text-[#00ff66]' : 'border-[#ffcc00]/30 text-[#ffcc00]'}`}>
                <div className="font-bold mb-2">{feedback.title}</div>
                <ul className="grid gap-1 text-[#c9d1d9] sm:grid-cols-2">
                  {feedback.checks.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {c.ok ? <CheckCircle size={14} className="text-[#00ff66]" /> : <AlertCircle size={14} className="text-[#ffcc00]" />}
                      <span>{c.label}</span>
                    </li>
                  ))}
                </ul>
                {feedback.endingText && <div className="mt-3 text-sm text-[#c9d1d9]">{feedback.endingText}</div>}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#8b949e]"><span>Hinweise: {feedback.hintsUsed}</span><span>Lösungen: {feedback.solutionRevealed}</span><span>Verifikationen: {feedback.showCommandsUsed}</span></div>
                <div className="mt-3 flex gap-2">
                  {state.completed ? <button onClick={returnToWorkspace} className="cyber-btn flex-1 text-xs py-2 flex items-center justify-center gap-1"><ChevronLeft size={12} /> Arbeitsplatz</button> : <button onClick={() => setFeedback(null)} className="cyber-btn-outline flex-1 text-xs py-2">Weiterarbeiten</button>}
                  {state.completed && <button onClick={newVariant} className="cyber-btn-outline flex-1 text-xs py-2 flex items-center justify-center gap-1"><RotateCcw size={12} /> Neue Variante</button>}
                </div>
              </div>
            )}

            <section className="cyber-card flex min-h-[28rem] flex-1 flex-col p-3 lg:min-h-0 lg:p-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2 text-[#00ff66] text-xs uppercase tracking-wider"><TermIcon size={14} /> Cisco IOS Terminal</div>
                <div className="hidden text-[10px] text-[#8b949e] sm:block">Tab: vervollständigen · ?: Hilfe · ↑/↓: Verlauf</div>
              </div>
              <div ref={terminalRef} onScroll={handleTerminalScroll} className="mt-3 h-64 overflow-y-auto overscroll-contain touch-pan-y font-mono text-sm bg-[#050806] rounded p-3 text-[#c9d1d9] whitespace-pre-wrap sm:h-80 lg:h-[calc(100vh-14rem)] lg:min-h-[24rem]">
                {history.map((entry, index) => <div key={index} className="mb-2"><div className="text-[#00f0ff]">{entry.prompt} {entry.command}</div>{entry.output && <div className="text-[#c9d1d9]">{entry.output}</div>}</div>)}
                {helpOutput && <div className="mb-2 text-[#c9d1d9]">{helpOutput}</div>}
                <div className="text-[#00f0ff]">{buildPrompt(device)}</div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input ref={inputRef} value={input} onChange={(e) => handleInputChange(e.target.value)} onKeyDown={handleKey} className="cyber-input flex-1 font-mono text-sm" placeholder="Cisco-Befehl eingeben..." autoCapitalize="off" autoCorrect="off" spellCheck="false" autoComplete="off" />
                <button onClick={sendCommand} className="cyber-btn p-2" aria-label="Befehl senden"><Send size={18} /></button>
              </div>
            </section>
          </main>

          <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pl-1">
            <CiscoNetworkStatePanel device={device} scenario={scenario} />
            <section className="cyber-card p-4">
              <div className="mb-3 text-xs uppercase tracking-wider text-[#8b949e]">Abnahmekriterien</div>
              <ul className="space-y-2">
                {progress.checks.map((check) => <li key={check.id} className={`flex items-start gap-2 text-sm ${check.ok ? 'text-[#00ff66]' : 'text-[#c9d1d9]'}`}>{check.ok ? <CheckCircle size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0 text-[#8b949e]" />}<span>{check.label}</span></li>)}
              </ul>
            </section>
            <section className="cyber-card p-4">
              <div className="mb-3 text-xs uppercase tracking-wider text-[#8b949e]">Arbeitsunterstützung</div>
              <select value={selectedRequirement || ''} onChange={(e) => setSelectedRequirement(e.target.value)} className="cyber-input w-full text-xs py-2">
                {runtime.requirements.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={requestHint} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><Lightbulb size={14} /> Hinweis</button>
                <button onClick={revealSolution} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><HelpCircle size={14} /> Lösung</button>
              </div>
              <button onClick={checkMission} className="cyber-btn-outline mt-2 w-full py-2 text-xs flex items-center justify-center gap-1"><Shield size={14} /> Zustand prüfen</button>
            </section>
            <button onClick={finishMission} disabled={progress.completed < progress.total} className={`w-full py-3 text-sm font-medium rounded flex items-center justify-center gap-2 ${progress.completed === progress.total ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50 hover:bg-[#00ff66]/30' : 'bg-[#0d1117]/80 text-[#8b949e] border border-[#30363d] cursor-not-allowed'}`}><CheckCircle size={16} /> Auftrag abschließen</button>
            {progress.completed < progress.total && <div className="text-[10px] text-center text-[#8b949e]">Noch {progress.total - progress.completed} Abnahmekriterium{progress.total - progress.completed === 1 ? '' : 'en'} offen.</div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
