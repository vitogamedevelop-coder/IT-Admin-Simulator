import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  startMission001,
  loadActiveMission,
  executeMissionCommand,
  getMissionHint,
  consumeMissionHint,
  revealMissionSolution,
  evaluateMission001,
  mission001Feedback,
} from '../lib/missionV2';
import { buildPrompt } from '../lib/ciscoCliEngine';
import { RotateCcw, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Terminal as TermIcon, Send, ChevronLeft } from 'lucide-react';

export default function MissionV2() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottom = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const active = loadActiveMission();
    if (active && active.missionId === missionId) {
      setState(active);
    } else {
      setState(startMission001());
    }
    setLoading(false);
  }, [missionId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, output]);



  function sendCommand() {
    if (!state || !input.trim()) return;
    const trimmed = input.trim();
    const oldMode = state.device.cli.mode;
    const result = executeMissionCommand(state, trimmed);
    setState({ ...result.state });
    setInput('');
    setHistory((h) => [...h, { command: trimmed, result: result.output || result.prompt || '', cliBefore: oldMode }]);
    setOutput(result.output);
    inputRef.current?.focus();
    setHint(null);
    if (result.errorType) {
      // no extra UI, output already contains the Cisco error
    }
    inputRef.current?.focus();
  }

  function handleKey(e) {
    if (e.key === 'Enter') sendCommand();
  }

  function requestHint() {
    if (!state) return;
    const subskillPath = 'cisco.basic_configuration.interface_enable';
    const next = getMissionHint(state, subskillPath);
    if (next) {
      consumeMissionHint(state, subskillPath);
      setState({ ...state });
      setHint(next);
    } else {
      setHint({ text: 'Keine weiteren Hinweise verfügbar.' });
    }
  }

  function revealSolution() {
    if (!state) return;
    const subskillPath = 'cisco.basic_configuration.interface_enable';
    const explanation = 'Cisco-Interfaces sind im Auslieferungszustand administrativ deaktiviert. Wechsle in das Interface und führe "no shutdown" aus.';
    revealMissionSolution(state, subskillPath, 'no shutdown', explanation, 'show ip interface brief');
    setState({ ...state });
    setHint({ text: 'Lösung aufgedeckt: no shutdown\n\n' + explanation, level: 4 });
  }

  function attemptComplete() {
    if (!state) return;
    const evaluation = evaluateMission001(state);
    setState(evaluation.state);
    const fb = mission001Feedback(evaluation.state, evaluation);
    setFeedback(fb);
  }

  function newVariant() {
    setState(startMission001());
    setHistory([]);
    setOutput('');
    setFeedback(null);
    setHint(null);
  }

  if (loading) return <div className="app-shell flex items-center justify-center text-[#00ff66]">Mission wird geladen...</div>;
  if (!state) return <div className="app-shell p-4 text-[#ff3355]">Mission konnte nicht geladen werden.</div>;

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

      {hint && (
        <div className="cyber-card border border-[#ffcc00]/30 p-3 mb-3 text-sm text-[#ffcc00]">
          {hint.label && <div className="text-xs uppercase tracking-wider text-[#ffcc00] mb-1">{hint.label}</div>}
          {hint.text}
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
          {feedback.mistakes.length > 0 && (
            <div className="mt-2 text-xs text-[#ff3355]">
              Auffälligkeiten: {feedback.mistakes.join(', ')}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button onClick={() => setFeedback(null)} className="cyber-btn-outline flex-1 text-xs py-2">Weiterarbeiten</button>
            <button onClick={newVariant} className="cyber-btn flex-1 text-xs py-2 flex items-center justify-center gap-1"><RotateCcw size={12} /> Neue Variante</button>
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

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={requestHint} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><Lightbulb size={14} /> Hinweis</button>
        <button onClick={revealSolution} className="cyber-btn-outline py-2 text-xs flex items-center justify-center gap-1"><HelpCircle size={14} /> Lösung</button>
        <button onClick={attemptComplete} className="cyber-btn py-2 text-xs flex items-center justify-center gap-1"><CheckCircle size={14} /> Abschluss</button>
      </div>
    </div>
  );
}
