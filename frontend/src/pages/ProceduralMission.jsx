import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RotateCcw, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Terminal as TermIcon, Send, ChevronLeft, Shield } from 'lucide-react';
import {
  getInstance, markProceduralMissionRead, startProceduralMission,
  executeProceduralMissionCommand, getProceduralMissionProgress, evaluateProceduralMission,
  getProceduralMissionHint, consumeProceduralMissionHint, revealProceduralMissionSolution,
  getProceduralRequirementOptions, proceduralMissionId,
} from '../lib/missionGenerator';
import { buildPrompt, getCommandHelp, completeInput } from '../lib/ciscoCliEngine';
import { setActiveQuest } from '../lib/gameState';

// Procedural Mission runtime page (Phase 1H). Deliberately mirrors
// MissionV2.jsx's terminal (fixed-height, internally-scrolling, manual
// scroll respected - see Phase 1G) so generated missions feel identical to
// hand-built ones, but drives entirely off missionGenerator.js instead of a
// hand-authored scenario/device pair.
export default function ProceduralMission() {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const [instance, setInstance] = useState(null);
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
  const autoScrollRef = useRef(true);

  useEffect(() => {
    const found = getInstance(instanceId);
    if (found) {
      markProceduralMissionRead(instanceId);
      setInstance(found);
      setState(startProceduralMission(instanceId));
      setActiveQuest(proceduralMissionId(instanceId));
      const options = getProceduralRequirementOptions(found.templateId);
      if (options[0]) setSelectedRequirement(options[0].id);
    }
    setLoading(false);
  }, [instanceId]);

  useEffect(() => {
    const el = terminalRef.current;
    if (el && autoScrollRef.current) el.scrollTop = el.scrollHeight;
  }, [history, helpOutput]);

  const SCROLL_BOTTOM_THRESHOLD_PX = 24;
  function handleTerminalScroll() {
    const el = terminalRef.current;
    if (!el) return;
    autoScrollRef.current = (el.scrollHeight - el.scrollTop - el.clientHeight) <= SCROLL_BOTTOM_THRESHOLD_PX;
  }
  function scrollTerminalToBottom() {
    autoScrollRef.current = true;
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }

  if (loading) return <div className="app-shell flex items-center justify-center text-[#00ff66]">Auftrag wird geladen...</div>;
  if (!instance || !state) return <div className="app-shell p-4 text-[#ff3355]">Auftrag konnte nicht geladen werden. Er wurde vermutlich bereits abgeschlossen oder existiert nicht mehr.</div>;

  const progress = getProceduralMissionProgress(state);
  const requirementOptions = getProceduralRequirementOptions(instance.templateId);

  function isHelpRequest(raw) { return raw.trimEnd().endsWith('?'); }

  function showHelp(raw) {
    const help = getCommandHelp(state.device, raw, { helpCompact: true });
    setHelpOutput(help.help || null);
    setInput(help.inputAfterHelp);
    inputRef.current?.focus();
  }

  function sendCommand() {
    if (!input.trim()) return;
    const trimmed = input.trim();
    if (isHelpRequest(trimmed)) { showHelp(trimmed); return; }
    const promptBefore = buildPrompt(state.device);
    const result = executeProceduralMissionCommand(state, trimmed);
    setState({ ...result.state });
    setInput('');
    setHelpOutput(null);
    setHistoryIndex(-1);
    setHistory((h) => [...h, { command: trimmed, prompt: promptBefore, output: result.output || '' }]);
    setHint(null);
    scrollTerminalToBottom();
    inputRef.current?.focus();
  }

  function handleInputChange(value) { setInput(value); setHistoryIndex(-1); }

  function handleTab(e) {
    e.preventDefault();
    const trimmed = input.trimEnd();
    const base = trimmed.endsWith('?') ? trimmed.slice(0, -1).trimEnd() : trimmed;
    if (!base) return;
    const result = completeInput(state.device, base);
    if (result.completion) { setInput(`${result.completion} `); setHelpOutput(null); }
    else if (result.suggestions.length > 0) setHelpOutput(result.suggestions.join('  '));
    else setHelpOutput(null);
    inputRef.current?.focus();
  }

  function handleHistoryNav(e) {
    if (!history.length) return;
    if (historyIndex === -1) savedInput.current = input;
    let nextIndex = historyIndex;
    if (e.key === 'ArrowUp') {
      nextIndex = nextIndex === -1 ? history.length - 1 : Math.max(0, nextIndex - 1);
    } else if (e.key === 'ArrowDown') {
      nextIndex += 1;
      if (nextIndex >= history.length) { setHistoryIndex(-1); setInput(savedInput.current); return; }
    }
    setHistoryIndex(nextIndex);
    setInput(history[nextIndex].command);
  }

  function handleKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); sendCommand(); return; }
    if (e.key === 'Tab') { e.preventDefault(); handleTab(e); return; }
    if (e.key === '?') { e.preventDefault(); const next = `${input}?`; setInput(next); showHelp(next); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); handleHistoryNav(e); }
  }

  function requestHint() {
    if (!selectedRequirement) return;
    const next = getProceduralMissionHint(state, selectedRequirement);
    if (next) {
      consumeProceduralMissionHint(state, selectedRequirement);
      setState({ ...state });
      setHint(next);
    } else {
      setHint({ text: 'Keine weiteren Hinweise für diesen Punkt verfügbar.' });
    }
  }

  function revealSolutionForRequirement() {
    if (!selectedRequirement) return;
    const next = getProceduralMissionHint(state, selectedRequirement);
    if (next) consumeProceduralMissionHint(state, selectedRequirement);
    const result = revealProceduralMissionSolution(state, selectedRequirement);
    setState({ ...result.state });
    setHint({
      text: `Lösung aufgedeckt: ${result.answer || selectedRequirement}`,
      explanation: `Erklärung: ${result.explanation || 'Die vollständige Lösung wurde aufgedeckt.'}`,
    });
  }

  function checkMission() {
    const evaluation = evaluateProceduralMission(state);
    setState(evaluation.state);
    setFeedback({
      title: evaluation.allCorrect ? 'Auftrag abgeschlossen' : 'Auftrag noch nicht vollständig',
      checks: evaluation.checks,
    });
  }

  function returnToWorkspace() { setActiveQuest(null); navigate('/'); }

  const { device } = state;

  return (
    <div className="app-shell flex flex-col p-3">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => navigate('/')} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ChevronLeft size={18} /></button>
        <div className="flex-1">
          <div className="text-xs text-[#8b949e]">Nebenmission (generiert)</div>
          <h1 className="text-base font-bold text-white">{instance.title}</h1>
        </div>
      </div>

      <div className="cyber-card p-4 mb-3 text-sm text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
        {instance.briefing}
      </div>

      <div className="cyber-card p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-[#8b949e]">Auftragsfortschritt</div>
          <div className="text-sm font-bold text-[#00f0ff]">{progress.checks.filter((c) => c.ok).length}/{progress.checks.length}</div>
        </div>
      </div>

      {hint && (
        <div className="cyber-card border border-[#ffcc00]/30 p-3 mb-3 text-sm text-[#ffcc00]">
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
          <div className="mt-3 flex gap-2">
            {state.completed ? (
              <button onClick={returnToWorkspace} className="cyber-btn flex-1 text-xs py-2 flex items-center justify-center gap-1"><ChevronLeft size={12} /> Zurück zum Arbeitsplatz</button>
            ) : (
              <button onClick={() => setFeedback(null)} className="cyber-btn-outline flex-1 text-xs py-2">Weiterarbeiten</button>
            )}
          </div>
        </div>
      )}

      <div className="cyber-card flex flex-col">
        <div className="flex items-center gap-2 text-[#00ff66] text-xs uppercase tracking-wider mb-2">
          <TermIcon size={14} /> Cisco IOS Terminal
        </div>
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
          {helpOutput && <div className="mb-2 text-[#c9d1d9]">{helpOutput}</div>}
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

      {requirementOptions.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select
            value={selectedRequirement || ''}
            onChange={(e) => setSelectedRequirement(e.target.value)}
            className="cyber-input text-xs py-2"
            style={{ gridColumn: '1 / 2' }}
          >
            {requirementOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <button onClick={requestHint} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><Lightbulb size={14} /> Hinweis</button>
          <button onClick={revealSolutionForRequirement} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><HelpCircle size={14} /> Lösung</button>
          <button onClick={checkMission} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><Shield size={14} /> Prüfen</button>
        </div>
      )}

      <button
        onClick={checkMission}
        className="mt-2 w-full py-2 text-xs font-medium rounded flex items-center justify-center gap-1 bg-[#0d1117]/80 text-[#c9d1d9] border border-[#30363d]"
      >
        <CheckCircle size={14} /> Auftrag prüfen / abschließen
      </button>

      {feedback === null && (
        <div className="mt-1 text-[10px] text-center text-[#8b949e] flex items-center justify-center gap-1">
          <RotateCcw size={10} /> Auftrag lässt sich jederzeit verlassen - er bleibt in Mail/Ticket/Telefon erhalten.
        </div>
      )}
    </div>
  );
}
