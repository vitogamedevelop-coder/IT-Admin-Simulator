import { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Send, ChevronLeft, Clock, Trash2 } from 'lucide-react';
import { executeCommand } from '../lib/terminal/commands';
import { getScenario } from '../lib/terminal/scenarios';

export default function TerminalApp({ missionId, onClose }) {
  const scenario = getScenario(missionId || 'first-day');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`it-learn:terminal:${missionId || 'default'}`) || '[]');
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottom = useRef(null);

  useEffect(() => {
    localStorage.setItem(`it-learn:terminal:${missionId || 'default'}`, JSON.stringify(history));
  }, [history, missionId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  function run(command) {
    const trimmed = command.trim();
    if (!trimmed) return;
    const output = executeCommand(trimmed, scenario);
    setHistory((h) => [...h, { command: trimmed, output, timestamp: Date.now() }]);
    setInput('');
    setHistoryIndex(-1);
  }

  function handleKey(event) {
    if (event.key === 'Enter') {
      run(input);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (next >= 0) {
        setHistoryIndex(next);
        setInput(history[history.length - 1 - next].command);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next >= 0 ? history[history.length - 1 - next].command : '');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        {onClose && <button onClick={onClose} className="p-2 rounded border border-[#30363d] text-[#8b949e]"><ChevronLeft size={18} /></button>}
        <div className="flex items-center gap-2 text-[#00ff66]"><TerminalIcon size={20} /><h2 className="font-bold">NEXUS Terminal</h2></div>
      </div>
      <div className="cyber-card flex-1 min-h-0 overflow-y-auto p-3 font-mono text-sm">
        <div className="text-[#8b949e] text-xs mb-2">Szenario: {scenario.hostname}</div>
        {history.map((entry, index) => (
          <div key={index} className="mb-3">
            <div className="text-[#00f0ff]">{`C:\\Users\\Operator> ${entry.command}`}</div>
            <pre className="text-[#c9d1d9] whitespace-pre-wrap mt-1">{entry.output}</pre>
            <div className="text-[10px] text-[#30363d] mt-1"><Clock size={10} className="inline mr-1" />{new Date(entry.timestamp).toLocaleTimeString('de-DE')}</div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="cyber-input flex-1 font-mono text-sm"
          placeholder="Befehl eingeben..."
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button onClick={() => run(input)} className="cyber-btn p-2"><Send size={18} /></button>
        <button onClick={() => { setHistory([]); setHistoryIndex(-1); }} className="p-2 rounded border border-[#30363d] text-[#8b949e]" aria-label="Verlauf löschen"><Trash2 size={18} /></button>
      </div>
      <div className="mt-2 text-[10px] text-[#8b949e]">Verfügbar: help, hostname, ipconfig, ping, tracert, nslookup, netstat</div>
    </div>
  );
}
