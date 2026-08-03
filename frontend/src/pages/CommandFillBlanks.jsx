import { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const tasks = [
  { command: 'ipconfig /all', display: 'ipconfig /___', blanks: ['all'], hint: 'Zeigt die vollständige Netzwerkkonfiguration.' },
  { command: 'ssh -i key.pem user@server', display: 'ssh -i ___ user@server', blanks: ['key.pem'], hint: 'SSH-Login mit privatem Schlüssel.' },
  { command: 'chmod 755 script.sh', display: 'chmod ___ script.sh', blanks: ['755'], hint: 'Standardberechtigungen für ausführbare Scripts.' },
  { command: 'git commit -m "fix bug"', display: 'git commit -m "___"', blanks: ['fix bug'], hint: 'Commit mit Nachricht.' },
  { command: 'SELECT * FROM users WHERE active = 1', display: 'SELECT * FROM users ___ active = 1', blanks: ['WHERE'], hint: 'Filtert Zeilen in SQL.' },
  { command: 'Get-Process | Where-Object {$_.CPU -gt 100}', display: 'Get-Process | ___ {$_.CPU -gt 100}', blanks: ['Where-Object'], hint: 'PowerShell-FilterCmdlet.' },
  { command: 'ping 8.8.8.8 -t', display: 'ping 8.8.8.8 ___', blanks: ['-t'], hint: 'Endloses Pingen unter Windows.' },
  { command: 'nslookup example.com', display: '___ example.com', blanks: ['nslookup'], hint: 'DNS-Auflösung testen.' },
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function CommandFillBlanks() {
  const [queue] = useState(() => shuffle(tasks));
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState(() => tasks[0].blanks.map(() => ''));
  const [checked, setChecked] = useState(false);

  const current = queue[index];

  function next() {
    const nextIndex = (index + 1) % queue.length;
    setIndex(nextIndex);
    setValues(queue[nextIndex].blanks.map(() => ''));
    setChecked(false);
  }

  const results = current.blanks.map((blank, i) => values[i].trim().toLowerCase() === blank.toLowerCase());
  const allCorrect = results.every(Boolean);

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] mb-2">
          <ClipboardList size={18} />
          <h2 className="font-bold text-sm uppercase tracking-widest">befehls-lückentext</h2>
        </div>
        <p className="text-xs text-[#8b949e]">Ergänze den richtigen Befehlsteil. Groß-/Kleinschreibung wird ignoriert.</p>
      </div>

      <div className="cyber-card p-4 flex flex-col gap-4">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">Aufgabe {index + 1} / {queue.length}</div>
        <div className="font-mono text-lg text-[#00ff66] bg-[#0d1117] p-3 rounded border border-[#1f2937]">{current.display}</div>
        <div className="text-sm text-[#8b949e]">{current.hint}</div>

        <div className="flex flex-col gap-2">
          {current.blanks.map((_, i) => (
            <div key={i}>
              <input
                type="text"
                disabled={checked}
                className={`cyber-input w-full ${checked ? (results[i] ? 'border-[#00ff66]' : 'border-[#ff3355]') : ''}`}
                value={values[i]}
                onChange={(e) => setValues((v) => v.map((old, idx) => (idx === i ? e.target.value : old)))}
                placeholder="Fehlenden Teil eingeben"
              />
              {checked && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${results[i] ? 'text-[#00ff66]' : 'text-[#ff3355]'}`}>
                  {results[i] ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {results[i] ? 'korrekt' : `richtig: ${current.blanks[i]}`}
                </div>
              )}
            </div>
          ))}
        </div>

        {!checked ? (
          <button onClick={() => setChecked(true)} className="cyber-btn w-full">prüfen</button>
        ) : (
          <div className="flex flex-col gap-2">
            {allCorrect && <p className="text-[#00ff66] text-sm font-bold text-center">Perfekt – Befehl vervollständigt!</p>}
            <button onClick={next} className="cyber-btn-outline w-full flex items-center justify-center gap-2"><RotateCcw size={14} /> nächste Aufgabe</button>
          </div>
        )}
      </div>
    </div>
  );
}
