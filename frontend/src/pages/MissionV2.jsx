import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  startMission001,
  loadActiveMission,
  executeMissionCommand,
  getMissionHint,
  consumeMissionHint,
  revealMissionSolution,
  getMission001Progress,
  evaluateMission001,
  mission001Feedback,
  MISSION_001_ID,
  MISSION_001_REQUIREMENTS,
} from '../lib/missionV2';
import { questById } from '../lib/questData';
import { buildPrompt } from '../lib/ciscoCliEngine';
import { completeQuest, setActiveQuest } from '../lib/gameState';
import { RotateCcw, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Terminal as TermIcon, Send, ChevronLeft, Shield } from 'lucide-react';

export default function MissionV2() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState('hostname');
  const [loading, setLoading] = useState(true);
  const bottom = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const active = loadActiveMission();
    if (active && active.missionId === missionId) {
      setState(active);
    } else if (missionId === MISSION_001_ID) {
      setState(startMission001());
    } else {
      setState(null);
    }
    if (missionId) setActiveQuest(missionId);
    setLoading(false);
  }, [missionId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, output]);

  if (loading) return <div className="app-shell flex items-center justify-center text-[#00ff66]">Mission wird geladen...</div>;
  if (!state) return <div className="app-shell p-4 text-[#ff3355]">Mission konnte nicht geladen werden.</div>;

  const progress = getMission001Progress(state.device, state.scenario);

  function sendCommand() {
    if (!state || !input.trim()) return;
    const trimmed = input.trim();
    const oldMode = state.device.cli.mode;
    const result = executeMissionCommand(state, trimmed);
    setState({ ...result.state });
    setInput('');
    setHistory((h) => [...h, { command: trimmed, result: result.output || result.prompt || '', cliBefore: oldMode }]);
    setOutput(result.output);
    setHint(null);
    inputRef.current?.focus();
  }

  function handleKey(e) {
    if (e.key === 'Enter') sendCommand();
  }

  function requestHint() {
    const next = getMissionHint(state, selectedRequirement);
    if (next) {
      consumeMissionHint(state, selectedRequirement);
      setState({ ...state });
      setHint(next);
    } else {
      setHint({ text: 'Keine weiteren Hinweise für diesen Punkt verfügbar.', requirementId: selectedRequirement });
    }
  }

  function revealSolution() {
    const next = getMissionHint(state, selectedRequirement);
    if (next) {
      consumeMissionHint(state, selectedRequirement);
    }
    const result = revealMissionSolution(state, selectedRequirement);
    setState({ ...result.state });
    setHint({
      text: `Lösung aufgedeckt: ${result.answer || selectedRequirement}`,
      explanation: `Erklärung: ${result.explanation || 'Die vollständige Lösung wurde aufgedeckt. Sie wird im Skillprofil vermerkt, aber nicht als selbstständig gelöst gewertet.'}`,
      level: 4,
    });
  }

  function checkMission() {
    const evaluation = evaluateMission001(state);
    setState(evaluation.state);
    const fb = mission001Feedback(evaluation.state, evaluation);
    setFeedback(fb);
  }

  function finishMission() {
    const evaluation = evaluateMission001(state);
    setState(evaluation.state);
    if (evaluation.allCorrect) {
      const quest = questById(MISSION_001_ID);
      if (quest) completeQuest(quest, { xp: 60, reputation: { network: 5, management: 3 } });
      const fb = mission001Feedback(evaluation.state, evaluation);
      setFeedback(fb);
    } else {
      const fb = mission001Feedback(evaluation.state, evaluation);
      setFeedback(fb);
    }
  }

  function newVariant() {
    setState(startMission001());
    setActiveQuest(MISSION_001_ID);
    setHistory([]);
    setOutput('');
    setFeedback(null);
    setHint(null);
  }

  const { scenario, device } = state;

  return (
    <div className="app-shell flex flex-col p-3">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => navigate('/')} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ChevronLeft size={18} /></button>
        <div className="flex-1">
          <div className="text-xs text-[#8b949e]">Hauptmission</div>
          <h1 className="text-base font-bold text-white">{scenario.title}</h1>
        </div>
      </div>

      <div className="cyber-card p-4 mb-3 text-sm text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
        {scenario.briefing}
      </div>

      <div className="cyber-card p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-[#8b949e]">Auftragsfortschritt</div>
          <div className="text-sm font-bold text-[#00f0ff]">{progress.completed}/{progress.total}</div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {progress.checks.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-xs">
              {c.ok ? <CheckCircle size={14} className="text-[#00ff66]" /> : <div className="h-3.5 w-3.5 rounded-full border border-[#8b949e]" />}
              <span className={c.ok ? 'text-[#00ff66]' : 'text-[#c9d1d9]'}>{c.label}</span>
            </div>
          ))}
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
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#8b949e]">
            <span>Hinweise: {feedback.hintsUsed}</span>
            <span>Lösungen aufgedeckt: {feedback.solutionRevealed}</span>
            <span>Verifikationen: {feedback.showCommandsUsed}</span>
          </div>
          {feedback.title.includes('abgeschlossen') && (
            <div className="mt-3 text-sm text-[#c9d1d9]">
              <p>Sieht gut aus. Der Switch kann so vorbereitet in den Einbau gehen.</p>
              <p className="text-xs text-[#8b949e] mt-1">Weitere Aufgaben folgen, sobald das Gerät eingebaut ist.</p>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button onClick={() => setFeedback(null)} className="cyber-btn-outline flex-1 text-xs py-2">Weiterarbeiten</button>
            {state.completed && <button onClick={newVariant} className="cyber-btn flex-1 text-xs py-2 flex items-center justify-center gap-1"><RotateCcw size={12} /> Neue Variante</button>}
          </div>
        </div>
      )}

      <div className="cyber-card flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 text-[#00ff66] text-xs uppercase tracking-wider mb-2">
          <TermIcon size={14} /> Cisco IOS Terminal
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-sm bg-[#0a0a0a] rounded p-2 text-[#c9d1d9] whitespace-pre-wrap">
          {history.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="text-[#00f0ff]">{buildPrompt({ ...device, cli: entry.cliBefore || device.cli })} {entry.command}</div>
              <div className="text-[#c9d1d9]">{entry.result}</div>
            </div>
          ))}
          {output && <div className="text-[#c9d1d9]">{output}</div>}
          <div className="text-[#00f0ff]">{buildPrompt(device)}</div>
          <div ref={bottom} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="cyber-input flex-1 font-mono text-sm"
            placeholder="Cisco-Befehl eingeben..."
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button onClick={sendCommand} className="cyber-btn p-2"><Send size={18} /></button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select
          value={selectedRequirement}
          onChange={(e) => setSelectedRequirement(e.target.value)}
          className="cyber-input text-xs py-2"
        >
          {MISSION_001_REQUIREMENTS.map((r) => (
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
          Erst nach 5/5 Erfüllung kannst du den Auftrag abschließen.
        </div>
      )}
    </div>
  );
}
