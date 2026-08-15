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
import { RotateCcw, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Terminal as TermIcon, Send, ChevronLeft, Shield } from 'lucide-react';

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
    <div className="app-shell flex flex-col p-3">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => navigate('/')} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ChevronLeft size={18} /></button>
        <div className="flex-1">
          <div className="text-xs text-[#8b949e]">{missionId === MISSION_001_ID ? 'Hauptmission' : 'Nebenmission'}</div>
          <h1 className="text-base font-bold text-white">{scenario.title}</h1>
        </div>
      </div>

      <div className="cyber-card p-4 mb-3 text-sm text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
        {scenario.briefing}
      </div>

      <div className="cyber-card p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-[#8b949e]">Auftragsfortschritt</div>
          <div className="text-sm font-bold text-[#00f0ff]">{progress.completed}/{progress.total}</div>
        </div>
      </div>

      {hint && (
        <div className="cyber-card border border-[#ffcc00]/30 p-3 mb-3 text-sm text-[#ffcc00]">
          {hint.label && <div className="text-xs uppercase tracking-wider text-[#ffcc00] mb-1">{hint.label}</div>}
          <div className="text-[#c9d1d9]">{hint.text}</div>
          {hint.explanation && <div className="mt-2 text-xs text-[#8b949e]">{hint.explanation}</div>}
        </div>
      )}

      {feedback && (
        <div className={`cyber-card p-4 mb-3 text-sm ${feedback.title.includes('abgeschlossen') ? 'border-[#00ff66]/30 text-[#00ff66]' : 'border-[#ffcc00]/30 text-[#ffcc00]'}`}>
          <div className="font-bold mb-2">{feedback.title}</div>
          <ul className="space-y-1 text-[#c9d1d9]">
            {feedback.checks.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                {c.ok ? <CheckCircle size={14} className="text-[#00ff66]" /> : <AlertCircle size={14} className="text-[#ffcc00]" />}
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
          {feedback.endingText && (
            <div className="mt-3 text-sm text-[#c9d1d9]">
              {feedback.endingText}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#8b949e]">
            <span>Hinweise: {feedback.hintsUsed}</span>
            <span>Lösungen aufgedeckt: {feedback.solutionRevealed}</span>
            <span>Verifikationen: {feedback.showCommandsUsed}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {state.completed ? (
              <button onClick={returnToWorkspace} className="cyber-btn flex-1 text-xs py-2 flex items-center justify-center gap-1"><ChevronLeft size={12} /> Zurück zum Arbeitsplatz</button>
            ) : (
              <button onClick={() => setFeedback(null)} className="cyber-btn-outline flex-1 text-xs py-2">Weiterarbeiten</button>
            )}
            {state.completed && <button onClick={newVariant} className="cyber-btn-outline flex-1 text-xs py-2 flex items-center justify-center gap-1"><RotateCcw size={12} /> Neue Variante</button>}
          </div>
        </div>
      )}

      <div className="cyber-card flex flex-col">
        <div className="flex items-center gap-2 text-[#00ff66] text-xs uppercase tracking-wider mb-2">
          <TermIcon size={14} /> Cisco IOS Terminal
        </div>
        {/*
          Fixed, bounded height (not flex-1 against an unbounded page) so the
          terminal never stretches the whole mission page. Only this inner
          area scrolls; the page height stays stable regardless of history
          length. touch-pan-y / overscroll-contain keep mobile scrolling
          inside the terminal instead of bouncing the whole page.
        */}
        <div
          ref={terminalRef}
          onScroll={handleTerminalScroll}
          className="h-64 sm:h-80 overflow-y-auto overscroll-contain touch-pan-y font-mono text-sm bg-[#0a0a0a] rounded p-2 text-[#c9d1d9] whitespace-pre-wrap"
        >
          {history.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="text-[#00f0ff]">{entry.prompt} {entry.command}</div>
              {entry.output && <div className="text-[#c9d1d9]">{entry.output}</div>}
            </div>
          ))}
          {helpOutput && (
            <div className="mb-2 text-[#c9d1d9]">
              {helpOutput}
            </div>
          )}
          <div className="text-[#00f0ff]">{buildPrompt(device)}</div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKey}
            className="cyber-input flex-1 font-mono text-sm"
            placeholder="Cisco-Befehl eingeben..."
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            autoComplete="off"
          />
          <button onClick={sendCommand} className="cyber-btn p-2"><Send size={18} /></button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select
          value={selectedRequirement || ''}
          onChange={(e) => setSelectedRequirement(e.target.value)}
          className="cyber-input text-xs py-2"
          style={{ gridColumn: '1 / 2' }}
        >
          {runtime.requirements.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
        <button onClick={requestHint} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><Lightbulb size={14} /> Hinweis</button>
        <button onClick={revealSolution} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><HelpCircle size={14} /> Lösung</button>
        <button onClick={checkMission} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><Shield size={14} /> Prüfen</button>
      </div>

      <button
        onClick={finishMission}
        disabled={progress.completed < progress.total}
        className={`mt-2 w-full py-2 text-xs font-medium rounded flex items-center justify-center gap-1 ${
          progress.completed === progress.total
            ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50'
            : 'bg-[#0d1117]/80 text-[#8b949e] border border-[#30363d] cursor-not-allowed'
        }`}
      >
        <CheckCircle size={14} /> Auftrag abschließen
      </button>

      {progress.completed < progress.total && (
        <div className="mt-1 text-[10px] text-center text-[#8b949e]">
          Erst nach {progress.total}/{progress.total} Erfüllung kannst du den Auftrag abschließen.
        </div>
      )}
    </div>
  );
}
