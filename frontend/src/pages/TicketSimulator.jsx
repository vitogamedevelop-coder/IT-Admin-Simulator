import { useState } from 'react';
import { Ticket, Terminal, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const scenario = {
  title: 'Keine Internet-Verbindung',
  description: 'Ein Nutzer meldet: „Ich komme nicht ins Internet. Im Browser steht nur Seite nicht erreichbar.“ Der PC hat eine IP, aber du musst einschränken, wo das Problem liegt.',
  steps: [
    {
      id: 1,
      question: 'Welchen Befehl führst du zuerst aus, um den lokalen Netzwerk-Stack zu prüfen?',
      options: [
        { label: 'ping 8.8.8.8', correct: false, feedback: 'Sinnvoll, aber zuerst prüfst du die lokale IP-Konfiguration.' },
        { label: 'ipconfig /all', correct: true, feedback: 'Richtig. So siehst du IP, Subnetz, Gateway und DNS.' },
        { label: 'tracert google.de', correct: false, feedback: 'Zu früh – ohne Gateway-Info ist das Routing unklar.' },
        { label: 'nslookup google.de', correct: false, feedback: 'DNS-Test kommt später, zuerst lokale Konfiguration.' },
      ],
    },
    {
      id: 2,
      question: 'ipconfig zeigt: 169.254.x.x. Was bedeutet das?',
      options: [
        { label: 'DNS-Server ist offline', correct: false, feedback: '169.254.x.x ist eine APIPA-Adresse, kein DNS-Problem.' },
        { label: 'DHCP konnte keine Adresse vergeben', correct: true, feedback: 'Richtig. Der Client hat sich selbst eine Link-Local-Adresse gegeben.' },
        { label: 'Das Gateway ist falsch', correct: false, feedback: 'Ohne DHCP-Lease gibt es oft gar kein Gateway.' },
        { label: 'Netzwerkkabel ist defekt', correct: false, feedback: 'Kabeldefekt würde meist „Netzwerk nicht identifiziert“ zeigen, nicht unbedingt APIPA.' },
      ],
    },
    {
      id: 3,
      question: 'Welche Maßnahme ergreifst du als Nächstes?',
      options: [
        { label: 'PC neu starten', correct: false, feedback: 'Kann helfen, aber zuerst prüfst du die physische Verbindung und den DHCP-Server.' },
        { label: 'ipconfig /release und /renew', correct: true, feedback: 'Richtig. Ein erneuter DHCP-Lease-Versuch ist der logische nächste Schritt.' },
        { label: 'Netzwerkkartentreiber deinstallieren', correct: false, feedback: 'Zu invasiv vor einem simplen Lease-Renew.' },
        { label: 'Firewall deaktivieren', correct: false, feedback: 'Firewall verhindert keine IP-Vergabe.' },
      ],
    },
  ],
  final: 'Wahrscheinliche Ursache: DHCP-Problem oder Verbindungsstörung zum DHCP-Server. Mit ipconfig /release und /renew lässt sich das oft beheben.',
};

export default function TicketSimulator() {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const step = scenario.steps[stepIndex];

  function choose(option) {
    setFeedback(option);
    if (stepIndex === scenario.steps.length - 1) {
      setDone(true);
    }
  }

  function next() {
    setFeedback(null);
    setStepIndex((i) => i + 1);
  }

  function reset() {
    setStepIndex(0);
    setDone(false);
    setFeedback(null);
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="cyber-card p-4">
        <div className="flex items-center gap-2 text-[#00f0ff] mb-2">
          <Ticket size={18} />
          <h2 className="font-bold text-sm uppercase tracking-widest">ticket-simulator</h2>
        </div>
        <p className="text-xs text-[#8b949e]">Löse Schritt für Schritt ein echtes Support-Ticket.</p>
      </div>

      <div className="cyber-card p-4">
        <h3 className="font-bold text-white mb-2">{scenario.title}</h3>
        <p className="text-sm text-[#c9d1d9] leading-relaxed">{scenario.description}</p>
      </div>

      {!done && step && (
        <div className="cyber-card p-4 flex flex-col gap-3">
          <div className="text-xs text-[#8b949e]">Schritt {stepIndex + 1} / {scenario.steps.length}</div>
          <h4 className="font-bold text-white">{step.question}</h4>
          <div className="flex flex-col gap-2">
            {step.options.map((opt, i) => (
              <button
                key={i}
                disabled={feedback !== null}
                onClick={() => choose(opt)}
                className={`text-left p-3 rounded-lg border text-sm transition ${
                  feedback
                    ? opt === feedback
                      ? opt.correct
                        ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66]'
                        : 'border-[#ff3355] bg-[#ff3355]/10 text-[#ff3355]'
                      : 'border-[#1f2937] text-[#8b949e]'
                    : 'border-[#30363d] text-[#c9d1d9] hover:border-[#00ff66]'
                }`}
              >
                <span className="font-mono mr-2 text-[#00f0ff]">&gt;</span>{opt.label}
              </button>
            ))}
          </div>
          {feedback && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${feedback.correct ? 'border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66]' : 'border-[#ff3355] bg-[#ff3355]/5 text-[#ff3355]'}`}>
              {feedback.correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <span className="text-sm">{feedback.feedback}</span>
            </div>
          )}
          {feedback && stepIndex < scenario.steps.length - 1 && (
            <button onClick={next} className="cyber-btn w-full">weiter</button>
          )}
          {feedback && stepIndex === scenario.steps.length - 1 && (
            <button onClick={next} className="cyber-btn w-full">Auswertung</button>
          )}
        </div>
      )}

      {done && (
        <div className="cyber-card p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#00ff66]">
            <Terminal size={20} />
            <h3 className="font-bold">Lösungsweg</h3>
          </div>
          <p className="text-sm text-[#c9d1d9]">{scenario.final}</p>
          <button onClick={reset} className="cyber-btn-outline flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Ticket wiederholen
          </button>
        </div>
      )}
    </div>
  );
}
