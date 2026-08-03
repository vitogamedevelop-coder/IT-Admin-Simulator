import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Terminal, Send, ChevronLeft } from 'lucide-react';

const SCENARIOS = {
  1: {
    title: 'OSI-Zwischenfall: Der nicht erreichbare Server',
    steps: [
      { prompt: 'junior-admin: "Der Webserver ist von meinem Platz aus nicht erreichbar. Wo fangen wir an?"', expected: ['ping 8.8.8.8'], response: 'system: ping ins internet klappt. also sind physical/data link wahrscheinlich ok. prüfe als nächstes die lokale ip-konfiguration.' },
      { prompt: 'junior-admin: "Wie prüfe ich die IP-Einstellungen dieses Rechners?"', expected: ['ipconfig', 'ipconfig /all', 'ifconfig'], response: 'system: host hat 192.168.1.50 /24, gateway 192.168.1.1, dns 8.8.8.8. prüfe als nächstes die DNS-auflösung des ziels.' },
      { prompt: 'junior-admin: "Kannst du den Servernamen auflösen?"', expected: ['nslookup server.local', 'nslookup'], response: 'system: server.local wird zu 192.168.1.10 aufgelöst. das problem liegt wahrscheinlich oberhalb von schicht 3.' },
      { prompt: 'junior-admin: "Antwortet der Webdienst überhaupt?"', expected: ['curl http://server.local', 'curl', 'telnet server.local 80'], response: 'system: webserver liefert 200 OK. das problem war ein zwischengespeicherter DNS-eintrag auf dem client. bereinigt und wiederhergestellt.' },
    ],
    reward: 'du hast ein DNS/cache-problem in schicht 7 isoliert. gute arbeit.',
  },
  2: {
    title: 'Netzwerkdienst: DNS- und Port-Check',
    steps: [
      { prompt: 'ticket: "Die Website ist nicht erreichbar. Wie prüfst du zuerst die Namensauflösung?"', expected: ['nslookup intranet.local', 'nslookup'], response: 'system: intranet.local zeigt auf 10.0.0.25. als nächstes den HTTPS-port prüfen.' },
      { prompt: 'ticket: "Wie testen wir den Dienst auf Port 443?"', expected: ['curl -i https://intranet.local', 'curl', 'test-netconnection intranet.local -port 443'], response: 'system: der dienst antwortet mit 200 OK. untersuche die lokale browserkonfiguration.' },
      { prompt: 'ticket: "Welche Einstellung kann einen einzelnen Browser blockieren?"', expected: ['netsh winhttp show proxy', 'netsh'], response: 'system: ein veralteter proxy war gesetzt. die verbindung ist wiederhergestellt.' },
    ],
    reward: 'du hast DNS, Dienst und Proxy systematisch geprüft.',
  },
  3: {
    title: 'Active-Directory: Richtlinie aktualisieren',
    steps: [
      { prompt: 'helpdesk: "Die neue Gruppenrichtlinie ist noch nicht angekommen. Was ist der erste Prüfbefehl?"', expected: ['gpresult /r', 'gpresult'], response: 'system: die richtlinie ist verknüpft, aber noch nicht aktualisiert.' },
      { prompt: 'helpdesk: "Wie erzwinge ich die sofortige Aktualisierung?"', expected: ['gpupdate /force', 'gpupdate'], response: 'system: richtlinien wurden aktualisiert. kontrolliere den zugriff auf die freigabe.' },
      { prompt: 'helpdesk: "Welcher UNC-pfad testet die Freigabe?"', expected: ['dir \\fileserver\\projekte', 'dir'], response: 'system: die freigabe ist erreichbar und die berechtigung greift jetzt.' },
    ],
    reward: 'die GPO wurde kontrolliert und der Zugriff wiederhergestellt.',
  },
  5: {
    title: 'Unity: Debug-Log untersuchen',
    steps: [
      { prompt: 'unity-console: "Die Spielfigur bewegt sich nicht. Wie gibst du den Wert von speed aus?"', expected: ['debug.log(speed)', 'debug.log'], response: 'system: speed = 0. die variable wird im Inspector nicht gesetzt.' },
      { prompt: 'unity-console: "Welche Deklaration macht speed im Inspector sichtbar?"', expected: ['public float speed', '[serializefield] private float speed'], response: 'system: feld im Inspector sichtbar. setze als nächstes einen sinnvollen startwert.' },
      { prompt: 'unity-console: "Wie sieht ein Startwert von 5 aus?"', expected: ['public float speed = 5f', 'float speed = 5f'], response: 'system: speed ist gesetzt und die Figur reagiert wieder.' },
    ],
    reward: 'du hast ein Unity-Problem mit Logs und Inspector eingegrenzt.',
  },
  7: {
    title: 'Unity: Lebenszyklus prüfen',
    steps: [
      { prompt: 'unity-console: "Welche Methode läuft einmal vor dem ersten Frame?"', expected: ['void start()', 'start()'], response: 'system: Start wurde erkannt. initialisierung gehört hierher.' },
      { prompt: 'unity-console: "Welche Methode läuft pro Frame?"', expected: ['void update()', 'update()'], response: 'system: Update läuft pro Frame. nutze deltaTime für Bewegung.' },
      { prompt: 'unity-console: "Wie lautet der Bewegungsfaktor für FPS-unabhängigkeit?"', expected: ['time.deltatime', 'deltaTime'], response: 'system: korrekt. die Bewegung bleibt bei jeder Framerate konsistent.' },
    ],
    reward: 'du hast Unity-Lebenszyklus und framerate-unabhängige Logik gefestigt.',
  },
  4: {
    title: 'Git-Push-Panik',
    steps: [
      { prompt: 'junior-dev: "Meine Änderungen sind nicht auf dem Remote. Was rufe ich zuerst auf?"', expected: ['git status'], response: 'system: zwei dateien geändert und nicht gestaged. stage sie vor dem commit.' },
      { prompt: 'junior-dev: "Wie stage ich alles?"', expected: ['git add .', 'git add -A'], response: 'system: änderungen gestaged. jetzt committen mit nachricht.' },
      { prompt: 'junior-dev: "Was ist der Commit-Befehl?"', expected: ['git commit -m "update"', 'git commit'], response: 'system: commit erstellt. jetzt auf origin main pushen.' },
      { prompt: 'junior-dev: "Bitte pushen."', expected: ['git push origin main', 'git push'], response: 'system: gepusht. branch ist auf dem neuesten stand.' },
    ],
    reward: 'repository wiederhergestellt. du hast den git-workflow von anfang bis ende genutzt.',
  },
};

const COMMAND_HELP = [
  { match: /^(ipconfig|ip config)( \/all)?$/, text: 'hilfe: ipconfig zeigt die lokale IPv4-/IPv6-Konfiguration. Beispiel: ipconfig /all zeigt zusätzlich DNS, Gateway, DHCP und MAC-Adresse.' },
  { match: /^ping( |$)/, text: 'hilfe: ping prüft per ICMP, ob ein Ziel erreichbar ist. Beispiel: ping 8.8.8.8 testet die grundlegende Internetverbindung.' },
  { match: /^nslookup( |$)/, text: 'hilfe: nslookup fragt DNS-Einträge ab. Beispiel: nslookup example.com zeigt die zugehörige IP-Adresse.' },
  { match: /^curl( |$)/, text: 'hilfe: curl ruft eine URL ab und eignet sich zum Testen von Webdiensten. Beispiel: curl -I https://example.com zeigt nur die HTTP-Header.' },
  { match: /^git status$/, text: 'hilfe: git status zeigt geänderte, gestagte und noch nicht verfolgte Dateien im aktuellen Repository.' },
  { match: /^git add( |$)/, text: 'hilfe: git add legt Änderungen für den nächsten Commit bereit. Beispiel: git add . übernimmt alle Änderungen im Ordner.' },
  { match: /^git commit( |$)/, text: 'hilfe: git commit speichert gestagte Änderungen lokal. Beispiel: git commit -m "beschreibung".' },
  { match: /^ssh( |$)/, text: 'hilfe: ssh öffnet eine verschlüsselte Remote-Shell. Beispiel: ssh benutzer@server.local.' },
  { match: /^(dir|ls)( |$)/, text: 'hilfe: dir unter Windows beziehungsweise ls unter Linux/macOS listet Dateien eines Verzeichnisses auf.' },
];

export default function SandboxTerminal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);
  const bottom = useRef(null);

  useEffect(() => {
    api(`/api/modules/${id}`).then((m) => {
      setModule(m);
      const scenario = SCENARIOS[m.id] || {
        title: 'Allgemeine Sandbox',
        steps: [{ prompt: 'system: übe das tippen gängiger befehle wie ipconfig, git status, ping 8.8.8.8, ssh user@host', expected: ['ipconfig', 'git status', 'ping 8.8.8.8', 'ssh user@host'], response: 'system: befehl erkannt. weiter trainieren.' }],
        reward: 'weiter in der sandbox üben.',
      };
      setMessages([{ from: 'npc', text: scenario.steps[0].prompt }]);
    });
  }, [id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scenario = module ? (SCENARIOS[module.id] || { title: 'Allgemeine Sandbox', steps: [{ prompt: 'befehle üben', expected: ['ipconfig'], response: 'ok' }], reward: 'weiter üben' }) : null;

  function send() {
    if (!input.trim() || !scenario) return;
    const cmd = input.trim().toLowerCase();
    setMessages((m) => [...m, { from: 'me', text: `> ${input}` }]);
    const current = scenario.steps[step];
    const ok = current.expected.some((e) => cmd.startsWith(e.toLowerCase()));
    if (ok) {
      setTimeout(() => {
        setMessages((m) => [...m, { from: 'npc', text: current.response }]);
        if (step + 1 < scenario.steps.length) {
          setStep(step + 1);
          setTimeout(() => {
            setMessages((m) => [...m, { from: 'npc', text: scenario.steps[step + 1].prompt }]);
          }, 600);
        } else {
          setDone(true);
          setMessages((m) => [...m, { from: 'system', text: scenario.reward }]);
        }
      }, 400);
    } else {
      const help = COMMAND_HELP.find((item) => item.match.test(cmd));
      setTimeout(() => {
        setMessages((m) => [...m, { from: 'system', text: help ? help.text : `diagnose: '${cmd}' ist nicht der erwartete befehl. versuche: ${current.expected[0]}` }]);
      }, 400);
    }
    setInput('');
  }

  if (!module) return <div className="text-[#00ff66] py-10 text-center">szenario wird geladen...</div>;

  return (
    <div className="flex flex-col h-[calc(100svh-4rem)]">
      <div className="flex items-center gap-2 mb-3 text-[#00f0ff]">
        <button onClick={() => navigate(-1)}><ChevronLeft size={20} /></button>
        <Terminal size={18} />
        <span className="text-sm font-bold uppercase tracking-widest">{scenario.title}</span>
      </div>
      <div className="flex-1 overflow-y-auto cyber-card p-3 flex flex-col gap-2 mb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.from === 'me' ? 'self-end bg-[#00ff66]/10 border border-[#00ff66] text-[#00ff66]' : msg.from === 'system' ? 'self-start bg-[#0d1117] border border-[#00f0ff] text-[#00f0ff]' : 'self-start bg-[#0d1117] border border-[#30363d] text-[#c9d1d9]'}`}>
            {msg.text}
          </div>
        ))}
        <div ref={bottom} />
      </div>
      {!done && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="befehl tippen..."
            className="cyber-input flex-1"
          />
          <button onClick={send} className="cyber-btn px-4"><Send size={18} /></button>
        </div>
      )}
      {done && <button onClick={() => navigate(-1)} className="cyber-btn-outline">zurück zum modul</button>}
    </div>
  );
}
