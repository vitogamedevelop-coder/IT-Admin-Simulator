import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, RotateCcw, Network, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

function ipToNumber(octets) {
  return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
}

function numberToIp(num) {
  return [((num >>> 24) & 255), ((num >>> 16) & 255), ((num >>> 8) & 255), (num & 255)].join('.');
}

function maskFromCidr(cidr) {
  return cidr === 0 ? 0 : (-1 << (32 - cidr)) >>> 0;
}

function ipOctets(ip) {
  return ip.split('.').map(Number);
}

function generateTask() {
  const first = Math.random() < 0.5 ? 192 : 10;
  const octets = [
    first,
    first === 10 ? Math.floor(Math.random() * 256) : Math.floor(Math.random() * 256),
    first === 10 ? Math.floor(Math.random() * 256) : Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
  const cidr = 24 + Math.floor(Math.random() * 7); // /24 bis /30
  const ipNum = ipToNumber(octets);
  const mask = maskFromCidr(cidr);
  const networkNum = ipNum & mask;
  const broadcastNum = networkNum | (~mask >>> 0);
  const hosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);
  return {
    ip: octets.join('.'),
    cidr,
    network: numberToIp(networkNum >>> 0),
    broadcast: numberToIp(broadcastNum >>> 0),
    hosts,
    mask: numberToIp(mask >>> 0),
  };
}

function buildExplanation(task) {
  const hostBits = 32 - task.cidr;
  const maskOctets = ipOctets(task.mask);
  return [
    `Schritt 1 – Subnetzmaske aus /${task.cidr} bilden: /${task.cidr} bedeutet ${task.cidr} Netzwerkbits und ${hostBits} Hostbits.`,
    `Die Subnetzmaske ist ${task.mask} (${maskOctets.join('.')}).`,
    `Schritt 2 – Netzadresse berechnen: IP UND Subnetzmaske.`,
    `${task.ip} & ${task.mask} = ${task.network}`,
    `Schritt 3 – Broadcast-Adresse berechnen: Netzadresse ODER invertierte Maske.`,
    `${task.network} | ${numberToIp(~maskFromCidr(task.cidr) >>> 0)} = ${task.broadcast}`,
    `Schritt 4 – Nutzbare Hosts: 2^${hostBits} - 2 = ${task.hosts}.`,
  ];
}

export default function SubnetTrainer() {
  const [task, setTask] = useState(generateTask);
  const [answers, setAnswers] = useState({ network: '', broadcast: '', hosts: '' });
  const [checked, setChecked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const fields = [
    { key: 'network', label: 'Netzadresse', explanation: 'Behalte die ersten Bits gemäß CIDR, setze die restlichen Hostbits auf 0.' },
    { key: 'broadcast', label: 'Broadcast-Adresse', explanation: 'Behalte die Netzwerkbits, setze alle Hostbits auf 1.' },
    { key: 'hosts', label: 'Nutzbare Hosts', explanation: 'Berechne 2^(32-CIDR) und ziehe 2 für Netz- und Broadcast-Adresse ab.' },
  ];

  function next() {
    setTask(generateTask());
    setAnswers({ network: '', broadcast: '', hosts: '' });
    setChecked(false);
    setShowHelp(false);
  }

  const allCorrect = checked && fields.every((f) => answers[f.key].trim() === String(task[f.key]));
  const explanation = useMemo(() => buildExplanation(task), [task]);

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] mb-2">
          <Network size={18} />
          <h2 className="font-bold text-sm uppercase tracking-widest">subnetting-trainer</h2>
        </div>
        <p className="text-xs text-[#8b949e]">Berechne Netzadresse, Broadcast und Hosts für die Aufgabe.</p>
      </div>

      <div className="cyber-card p-4 text-center">
        <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">gegeben</div>
        <div className="text-2xl font-bold text-white mt-1">{task.ip}/{task.cidr}</div>
      </div>

      <div className="cyber-card p-4 flex flex-col gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="cyber-label text-xs flex items-center gap-1">
              {f.label}
              <Lightbulb size={12} className="text-[#ffcc00]" title={f.explanation} />
            </label>
            <input
              type="text"
              inputMode={f.key === 'hosts' ? 'numeric' : 'text'}
              className="cyber-input w-full"
              value={answers[f.key]}
              disabled={checked}
              onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
              placeholder={f.key === 'hosts' ? 'z. B. 254' : 'z. B. 192.168.1.0'}
            />
            {checked && (
              <div className={`text-xs mt-2 p-2 rounded border ${answers[f.key].trim() === String(task[f.key]) ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]' : 'border-[#ff3355] bg-[#ff3355]/5 text-[#ff3355]'}`}>
                <div className="flex items-center gap-1 mb-1">
                  {answers[f.key].trim() === String(task[f.key]) ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  <span className="font-bold">{answers[f.key].trim() === String(task[f.key]) ? 'richtig' : 'falsch'}</span>
                </div>
                <div>Deine Antwort: {answers[f.key].trim() || '-'}</div>
                <div>Richtige Antwort: {task[f.key]}</div>
                {!answers[f.key].trim() && <div className="mt-1 text-[#ffcc00]">Du hast nichts eingegeben.</div>}
                {answers[f.key].trim() && answers[f.key].trim() !== String(task[f.key]) && (
                  <div className="mt-1 text-[#c9d1d9]">{f.explanation}</div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          {!checked ? (
            <button onClick={() => setChecked(true)} className="cyber-btn flex-1">prüfen</button>
          ) : (
            <button onClick={next} className="cyber-btn flex-1 flex items-center justify-center gap-2"><RotateCcw size={14} /> nächste Aufgabe</button>
          )}
        </div>
      </div>

      <div className="cyber-card p-4">
        <button onClick={() => setShowHelp((s) => !s)} className="flex items-center justify-between w-full text-[#00f0ff] font-bold text-sm">
          <span>Schritt-für-Schritt Anleitung</span>
          {showHelp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showHelp && (
          <ol className="mt-3 flex flex-col gap-2 text-sm text-[#c9d1d9] list-decimal list-inside">
            <li>Schreibe die CIDR-Maske als Subnetzmaske auf. /{task.cidr} = {task.mask}.</li>
            <li>Bilde die Netzadresse: IP UND Subnetzmaske. Ergebnis: {task.network}.</li>
            <li>Bilde die Broadcast: Netzadresse ODER invertierte Maske. Ergebnis: {task.broadcast}.</li>
            <li>Hosts = 2<sup>{32 - task.cidr}</sup> - 2 = {task.hosts}.</li>
          </ol>
        )}
      </div>

      {checked && (
        <div className="cyber-card p-4">
          <h3 className="font-bold text-[#00f0ff] mb-2">Lösungsweg für {task.ip}/{task.cidr}</h3>
          <div className="flex flex-col gap-1 text-sm text-[#c9d1d9]">
            {explanation.map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      )}

      {checked && allCorrect && (
        <p className="text-center text-[#00ff66] text-sm font-bold">Alle Werte korrekt – gut gerechnet!</p>
      )}
    </div>
  );
}
