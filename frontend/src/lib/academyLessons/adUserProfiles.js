import { topicKey } from '../academyTopics.js';

export const AD_USER_PROFILES_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-user-profiles');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const kontoVsProfilSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="45" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Benutzerkonto</text>
  <text x="85" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Wer bist du?</text>
  <text x="85" y="81" text-anchor="middle" fill="#c9d1d9" font-size="10">Identität</text>
  <text x="85" y="97" text-anchor="middle" fill="#8b949e" font-size="9">Anmeldung, Gruppen, Rechte</text>
  <text x="85" y="113" text-anchor="middle" fill="#8b949e" font-size="9">Lisa in AD</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="45" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Benutzerprofil</text>
  <text x="235" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Wie sieht deine</text>
  <text x="235" y="81" text-anchor="middle" fill="#c9d1d9" font-size="10">Umgebung aus?</text>
  <text x="235" y="97" text-anchor="middle" fill="#8b949e" font-size="9">Desktop, Einstellungen, Daten</text>
  <text x="235" y="113" text-anchor="middle" fill="#8b949e" font-size="9">C:\\Users\\Lisa</text>
</svg>`;

const localVsRoamingSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="110" height="120" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="65" y="42" text-anchor="middle" fill="#8b949e" font-size="11" font-weight="bold">LOKAL</text>
  <text x="65" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Profil auf CLIENT01</text>
  <text x="65" y="80" text-anchor="middle" fill="#c9d1d9" font-size="10">schnell verfügbar</text>
  <text x="65" y="98" text-anchor="middle" fill="#c9d1d9" font-size="10">nur auf diesem PC</text>
  <text x="65" y="116" text-anchor="middle" fill="#8b949e" font-size="9">keine Synchronisation</text>

  <rect x="125" y="20" width="80" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="165" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">FILE01</text>
  <text x="165" y="65" text-anchor="middle" fill="#8b949e" font-size="9">zentraler Profil-</text>
  <text x="165" y="80" text-anchor="middle" fill="#8b949e" font-size="9">speicher</text>

  <rect x="220" y="20" width="90" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="265" y="42" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">ROAMING</text>
  <text x="265" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Profil auf Server</text>
  <text x="265" y="80" text-anchor="middle" fill="#c9d1d9" font-size="10">mehrere Clients</text>
  <text x="265" y="98" text-anchor="middle" fill="#c9d1d9" font-size="10">abhängig von Netz</text>
  <text x="265" y="116" text-anchor="middle" fill="#8b949e" font-size="9">Netzwerk + Größe</text>
</svg>`;

const folderRedirectionSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="80" y="45" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Profil</text>
  <text x="80" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Lisa-Profil</text>
  <text x="80" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">Einstellungen</text>

  <rect x="180" y="20" width="120" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="240" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Dokumente</text>
  <text x="240" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">umgeleitet</text>
  <text x="240" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">zentral auf FILE01</text>

  <line x1="140" y1="80" x2="180" y2="80" stroke="#c9d1d9" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="160" y="70" text-anchor="middle" fill="#8b949e" font-size="9">Ordnerumleitung</text>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#c9d1d9"/></marker></defs>
</svg>`;

const privilegeSeparationSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="80" height="120" rx="6" fill="#0d1117" stroke="#ff3355" stroke-width="2"/>
  <text x="60" y="45" text-anchor="middle" fill="#ff3355" font-size="11" font-weight="bold">Tier 0</text>
  <text x="60" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">DC / Domäne</text>
  <text x="60" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">Domain Admin</text>

  <rect x="120" y="20" width="80" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="45" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Tier 1</text>
  <text x="160" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Server</text>
  <text x="160" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">Server Admin</text>

  <rect x="220" y="20" width="80" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="260" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Tier 2</text>
  <text x="260" y="65" text-anchor="middle" fill="#c9d1d9" font-size="10">Client</text>
  <text x="260" y="83" text-anchor="middle" fill="#c9d1d9" font-size="10">Helpdesk</text>
</svg>`;

const userPathsSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="140" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Lisa Berger</text>
  <text x="80" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9">Profile:</text>
  <text x="80" y="88" text-anchor="middle" fill="#c9d1d9" font-size="9">\\FILE01\\Profile$</text>
  <text x="80" y="106" text-anchor="middle" fill="#c9d1d9" font-size="9">\\lisa.berger</text>
  <text x="80" y="130" text-anchor="middle" fill="#c9d1d9" font-size="9">Home: H:</text>
  <text x="80" y="148" text-anchor="middle" fill="#c9d1d9" font-size="9">\\FILE01\\Home$</text>

  <rect x="180" y="20" width="120" height="140" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="45" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">FILE01</text>
  <text x="240" y="70" text-anchor="middle" fill="#c9d1d9" font-size="9">Profile$</text>
  <text x="240" y="88" text-anchor="middle" fill="#c9d1d9" font-size="9">Home$</text>
  <text x="240" y="118" text-anchor="middle" fill="#8b949e" font-size="9">AD speichert</text>
  <text x="240" y="136" text-anchor="middle" fill="#8b949e" font-size="9">die Verweise.</text>
  <text x="240" y="154" text-anchor="middle" fill="#8b949e" font-size="9">Dateien liegen</text>
</svg>`;

const uncDecompositionSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="30" text-anchor="middle" fill="#c9d1d9" font-size="14" font-family="monospace">\\FILE01\\u0024\\lisa.berger</text>
  <line x1="160" y1="45" x2="160" y2="65" stroke="#8b949e" stroke-width="1"/>
  <rect x="20" y="70" width="80" height="70" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="60" y="95" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Server</text>
  <text x="60" y="115" text-anchor="middle" fill="#c9d1d9" font-size="10">FILE01</text>

  <rect x="120" y="70" width="80" height="70" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="95" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Freigabe</text>
  <text x="160" y="115" text-anchor="middle" fill="#c9d1d9" font-size="10">Home$</text>

  <rect x="220" y="70" width="80" height="70" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="260" y="95" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Ordner</text>
  <text x="260" y="115" text-anchor="middle" fill="#c9d1d9" font-size="10">lisa.berger</text>
</svg>`;

const localVsUncSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="85" y="45" text-anchor="middle" fill="#8b949e" font-size="11" font-weight="bold">Lokal</text>
  <text x="85" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">C:\\Users\\Lisa</text>
  <text x="85" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">Diese Festplatte</text>
  <text x="85" y="110" text-anchor="middle" fill="#c9d1d9" font-size="10">oder lokale SSD</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="235" y="45" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Netzwerk (UNC)</text>
  <text x="235" y="70" text-anchor="middle" fill="#c9d1d9" font-size="10">\\FILE01\\Home$\\Lisa</text>
  <text x="235" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">Zentraler Server</text>
  <text x="235" y="110" text-anchor="middle" fill="#c9d1d9" font-size="10">über Netzwerk</text>
</svg>`;

export function buildAdUserProfilesLesson() {
  const title = 'Benutzerkonten und Benutzerprofile';

  const explanations = [
    explanation('adup-einstieg', 'Lisa wechselt den Client', 'classic', [
      { type: 'text', content: 'Lisa arbeitet normalerweise an CLIENT01. Heute meldet sie sich an CLIENT07 an. Der Login mit ihrem Domänenkonto funktioniert, aber Desktop-Hintergrund und persönliche Einstellungen fehlen.' },
      { type: 'text', content: 'Sam fragt: „Wenn Active Directory Lisa doch kennt – warum sieht ihre Arbeitsumgebung hier anders aus?“' },
      { type: 'question', question: 'Woran liegt es, dass Lisa an CLIENT07 eine andere Umgebung sieht, obwohl ihr Konto funktioniert?', options: ['Das Domänenkonto ist nicht richtig.', 'Das Benutzerprofil ist auf dem neuen Client noch nicht vorhanden bzw. anders.', 'Active Directory hat keinen FSMO-Rollen-Inhaber.'], correct: 1, explanation: 'Konto und Profil sind getrennt. Das Konto authentifiziert; das Profil bestimmt die Benutzerumgebung.' },
    ]),

    explanation('adup-konto-vs-profil', 'Benutzerkonto ≠ Benutzerprofil', 'classic', [
      { type: 'text', content: 'Ein Benutzerkonto ist die Identität in Active Directory. Es sagt: „Wer bist du?“ und ermöglicht Anmeldung, Gruppen und Rechte.' },
      { type: 'text', content: 'Ein Benutzerprofil ist die persönliche Benutzerumgebung auf einem Computer. Es sagt: „Wie sieht deine Umgebung aus?“ und enthält Desktop, Einstellungen und profilbezogene Daten.' },
      { type: 'diagram', content: kontoVsProfilSvg },
      { type: 'question', question: 'Was beschreibt ein Benutzerkonto?', options: ['Die Farbe des Desktops', 'Die Identität und Anmeldung', 'Den Speicherort der Programmdateien'], correct: 1, explanation: 'Das Benutzerkonto ist die Identität; das Profil enthält Umgebungsdaten.' },
    ]),

    explanation('adup-kontoarten', 'Arten von AD-Konten', 'classic', [
      { type: 'text', content: 'Das AD-Objekt selbst ist immer logisch. Es kann aber eine reale Person, einen realen Computer oder eine rein technische Funktion repräsentieren.' },
      { type: 'list', title: 'Kontoarten', items: [
        'Benutzerkonto – repräsentiert eine reale Person.',
        'Computerkonto – repräsentiert ein Gerät in der Domäne.',
        'Dienstkonto – für Dienste und Hintergrundprozesse.',
        'Anwendungskonto – für bestimmte Anwendungen.',
        'Administratorkonto – für administrative Aufgaben.',
      ] },
      { type: 'question', question: 'Welches AD-Objekt repräsentiert einen Computer in der Domäne?', options: ['Benutzerkonto', 'Computerkonto', 'Sicherheitsgruppe'], correct: 1, explanation: 'Ein Computerkonto repräsentiert den Computer in Active Directory.' },
    ]),

    explanation('adup-profil-lokal', 'Lokales Benutzerprofil', 'classic', [
      { type: 'text', content: 'Ein lokales Benutzerprofil wird auf dem jeweiligen Computer gespeichert, zum Beispiel unter C:\\Users\\Lisa auf CLIENT01. Änderungen bleiben auf diesem Client.' },
      { type: 'list', title: 'Lokales Profil', items: [
        'Speicherort: der Client',
        'Vorteil: schnell verfügbar, weil Daten lokal liegen',
        'Nachteil: keine automatische Übertragung auf andere Clients',
      ] },
      { type: 'question', question: 'Lisa ändert den Desktop-Hintergrund auf CLIENT01. Am nächsten Tag sieht sie an CLIENT07 einen anderen Hintergrund. Warum?', options: ['Ihr Konto wurde gelöscht.', 'CLIENT07 hat sein eigenes lokales Profil.', 'Active Directory synchronisiert keine Hintergründe.'], correct: 1, explanation: 'Lokale Profile sind clientgebunden; Änderungen gelten nur auf dem jeweiligen Rechner.' },
    ]),

    explanation('adup-profil-roaming', 'Servergespeichertes Profil', 'classic', [
      { type: 'text', content: 'Ein servergespeichertes Profil liegt auf einer zentralen Netzwerkfreigabe, beispielsweise auf FILE01. Beim Anmelden wird es auf den Client geladen, beim Abmelden werden Änderungen zurückgeschrieben.' },
      { type: 'list', title: 'Servergespeichertes Profil', items: [
        'Speicherort: zentraler Server',
        'Vorteil: gleiche Benutzerumgebung an mehreren Clients',
        'Nachteil: Netzwerk, Profilgröße und Anmeldezeit beeinflussen das Erlebnis',
      ] },
      { type: 'diagram', content: localVsRoamingSvg },
      { type: 'text', content: 'Wichtig: Auch servergespeicherte Profile sind keine vollständige Datensicherung. Backup und Profilverwaltung sind unterschiedliche Konzepte.' },
      { type: 'question', question: 'Was ist ein Vorteil eines servergespeicherten Profils?', options: ['schnellere lokale Anmeldung', 'gleiche Umgebung an mehreren Clients', 'keine Netzwerkabhängigkeit'], correct: 1, explanation: 'Das zentrale Profil ermöglicht die gleiche Benutzerumgebung an verschiedenen Clients.' },
    ]),

    explanation('adup-profil-performance', 'Login-Last und Performance', 'classic', [
      { type: 'text', content: 'Servergespeicherte Profile können die Anmeldung verlangsamen, besonders wenn viele Mitarbeiter gleichzeitig starten, das Profil sehr groß ist oder das Netzwerk langsam ist.' },
      { type: 'list', title: 'Performance-Faktoren', items: [
        'Profilgröße: große Profile benötigen mehr Ladezeit',
        'Netzwerk: langsame Verbindungen verzögern den Download',
        'Gleichzeitigkeit: viele gleichzeitige Anmeldungen belasten Server und Netz',
      ] },
      { type: 'text', content: 'Das bedeutet nicht, dass servergespeicherte Profile immer langsam sind. Die Performance hängt von Profilgröße, Netzwerk, Serverleistung und gleichzeitigen Zugriffen ab.' },
      { type: 'question', question: 'Montag 08:00 Uhr melden sich viele Mitarbeiter gleichzeitig an. Die Profile sind sehr groß. Was kann passieren?', options: ['längere Anmeldezeiten / mehr Netz- und Serverbelastung', 'schnellere Anmeldung als sonst', 'keine Anmeldung mehr möglich'], correct: 0, explanation: 'Große Profile und viele gleichzeitige Anmeldungen können Ladezeiten und Netzwerklast erhöhen.' },
    ]),

    explanation('adup-ordnerumleitung', 'Ordnerumleitung', 'classic', [
      { type: 'text', content: 'Manche persönliche Ordner sollen zentral liegen, ohne bei jeder Anmeldung als großer Profilbestandteil vollständig übertragen zu werden. Hier hilft die Ordnerumleitung.' },
      { type: 'diagram', content: folderRedirectionSvg },
      { type: 'text', content: 'Die Ordnerumleitung zeigt bestimmte Ordner auf einen zentralen Netzwerkpfad. Profil-Einstellungen und einzelne umgeleitete Ordner sind technisch unterschiedliche Mechanismen.' },
      { type: 'question', question: 'Was ist das Ziel der Ordnerumleitung?', options: ['Benutzerprofil komplett abschaffen', 'bestimmte Ordner zentral auslagern', 'Offline-Anmeldung verhindern'], correct: 1, explanation: 'Ordnerumleitung legt bestimmte Benutzerordner auf einem zentralen Speicher ab.' },
    ]),

    explanation('adup-ordnerumleitung-vs-roaming', 'Ordnerumleitung ≠ servergespeichertes Profil', 'classic', [
      { type: 'text', content: 'Ordnerumleitung und servergespeicherte Profile sind nicht dasselbe. Ein servergespeichertes Profil lagert das gesamte Profil zentral und synchronisiert es. Ordnerumleitung betrifft nur bestimmte Ordner, zum Beispiel Dokumente.' },
      { type: 'table', headers: ['Merkmal', 'Servergespeichertes Profil', 'Ordnerumleitung'], rows: [
        ['Umfang', 'ganzes Profil', 'bestimmte Ordner'],
        ['Schnittstelle', 'Profilpfad', 'Gruppenrichtlinie / Richtlinie'],
        ['Zweck', 'gleiche Umgebung an mehreren Clients', 'zentrale Datenspeicherung bestimmter Ordner'],
      ] },
      { type: 'question', question: 'Dokumente sollen zentral auf FILE01 liegen, aber nicht bei jeder Anmeldung als großer Profilbestandteil übertragen werden. Was passt?', options: ['lokales Profil', 'Ordnerumleitung', 'E-Mail-Weiterleitung'], correct: 1, explanation: 'Ordnerumleitung lagert bestimmte Ordner wie Dokumente zentral ab, ohne das ganze Profil zu transportieren.' },
    ]),

    explanation('adup-offline-nuance', 'Offline-Verhalten', 'classic', [
      { type: 'text', content: 'Eine fehlende Netzwerkverbindung kann dazu führen, dass umgeleitete Netzwerkordner oder servergespeicherte Profilkomponenten nicht wie gewohnt verfügbar sind. Das tatsächliche Offline-Verhalten hängt von weiteren Windows-Konfigurationen wie lokalen Profilkopien oder Offline-Dateien ab.' },
      { type: 'text', content: 'Eine Ordnerumleitung macht nicht pauschal jede Anmeldung ohne Netzwerk unmöglich. Anmeldung und Erreichbarkeit umgeleiteter Ressourcen sind unterschiedliche Mechanismen.' },
      { type: 'question', question: 'Ein umgeleiteter Ordner ist gerade nicht erreichbar. Bedeutet das automatisch, dass jede Anmeldung unmöglich ist?', options: ['Ja', 'Nein', 'Nur bei lokalen Profilen'], correct: 1, explanation: 'Anmeldung und Erreichbarkeit umgeleiteter Ressourcen sind getrennte Mechanismen. Das konkrete Verhalten hängt von weiteren Einstellungen ab.' },
    ]),

    explanation('adup-pfad-einstieg', 'Zentrale Pfade für Lisa', 'classic', [
      { type: 'text', content: 'Lisa Berger hat bereits ein AD-Konto. Nun soll sie einen persönlichen Netzwerkspeicher erhalten und ihre zentrale Benutzerumgebung nutzen können. Active Directory muss wissen, wo Lisas zentrale Daten liegen.' },
      { type: 'text', content: 'Dazu werden im Benutzerkonto ein Profilpfad und ein Homeordner hinterlegt. AD speichert die Verweise; die eigentlichen Daten liegen auf einem zentralen Server.' },
      { type: 'diagram', content: userPathsSvg },
      { type: 'question', question: 'Wo liegen die eigentlichen Daten, wenn ein Benutzerkonto einen Homeordner auf \\FILE01\\Home$\\lisa.berger verweist?', options: ['Im Active Directory', 'Auf dem Client', 'Auf FILE01'], correct: 2, explanation: 'AD speichert den Verweis; die eigentlichen Daten liegen auf der Netzwerkressource, also FILE01.' },
    ]),

    explanation('adup-profilpfad', 'Profilpfad', 'classic', [
      { type: 'text', content: 'Der Profilpfad verweist auf den zentralen Speicherort des servergespeicherten Benutzerprofils. Beispiel: \\FILE01\\Profile$\\lisa.berger.' },
      { type: 'text', content: 'Dies setzt das Konzept des servergespeicherten Profils in einen konkreten Netzwerkpfad um. Der Pfad muss erreichbar sein; die Profildaten entstehen bzw. werden beim Anmeldevorgang genutzt.' },
      { type: 'question', question: 'Wozu dient ein Profilpfad?', options: ['Persönliche Arbeitsdateien speichern', 'Zentralen Speicherort für das Benutzerprofil festlegen', 'E-Mail weiterleiten'], correct: 1, explanation: 'Der Profilpfad legt fest, wo das servergespeicherte Benutzerprofil liegt.' },
    ]),

    explanation('adup-homeordner', 'Homeordner / Basisordner', 'classic', [
      { type: 'text', content: 'Der Homeordner ist der persönliche Speicherbereich eines Benutzers, typischerweise für persönliche Arbeitsdateien. Beispiel: \\FILE01\\Home$\\lisa.berger. Er kann als Laufwerksbuchstabe wie H: verbunden werden.' },
      { type: 'text', content: 'Wichtig: H: ist nur die lokale Darstellung. Die Daten liegen auf der zentralen Netzwerkfreigabe, nicht auf einem lokalen Laufwerk H.' },
      { type: 'question', question: 'Was beschreibt ein Homeordner?', options: ['Speicherort für die Benutzerumgebung', 'Persönlichen Netzwerkspeicher für Dateien', 'Liste der Computereinschränkungen'], correct: 1, explanation: 'Der Homeordner ist für persönliche Dateien gedacht, nicht für die Benutzerumgebung.' },
    ]),

    explanation('adup-home-vs-profil', 'Homeordner ≠ Profilpfad', 'classic', [
      { type: 'text', content: 'Homeordner und Profilpfad sind nicht dasselbe. Der Profilpfad speichert die Benutzerumgebung. Der Homeordner speichert persönliche Dateien. Beide können auf denselben oder unterschiedliche Server verweisen, sind aber semantisch getrennt.' },
      { type: 'table', headers: ['Aspekt', 'Profilpfad', 'Homeordner'], rows: [
        ['Inhalt', 'Einstellungen, Profildaten', 'persönliche Arbeitsdateien'],
        ['Beispiel', '\\\\FILE01\\\\Profile$\\\\lisa.berger', '\\\\FILE01\\\\Home$\\\\lisa.berger'],
        ['Darstellung', 'Hinter dem Profil', 'z. B. H: als Netzlaufwerk'],
      ] },
      { type: 'question', question: 'Was gehört in den Profilpfad?', options: ['Desktop-Hintergrund und Programmeinstellungen', 'Persönliche Dokumente', 'E-Mail-Postfach'], correct: 0, explanation: 'Der Profilpfad enthält die Benutzerumgebung, der Homeordner persönliche Dateien.' },
    ]),

    explanation('adup-unc', 'UNC-Pfade', 'classic', [
      { type: 'text', content: 'UNC ist die Universal Naming Convention. Ihre Grundform ist \\SERVER\\FREIGABE. Ein erweiterter UNC-Pfad kann Unterordner enthalten, zum Beispiel \\FILE01\\Home$\\lisa.berger.' },
      { type: 'diagram', content: uncDecompositionSvg },
      { type: 'text', content: 'Ein UNC-Pfad beschreibt, wie eine Ressource über das Netzwerk erreichbar ist. Er ist kein lokaler Pfad wie C:\\Users\\Lisa.' },
      { type: 'question', question: 'Welche Komponenten hat ein UNC-Pfad?', options: ['Laufwerksbuchstabe und lokaler Ordner', 'Server, Freigabe und optional Unterordner', 'Nur Benutzername'], correct: 1, explanation: 'UNC besteht aus Server, Freigabe und optional weiteren Unterordnern.' },
    ]),

    explanation('adup-lokal-vs-unc', 'Lokal vs. Netzwerk', 'classic', [
      { type: 'text', content: 'Ein lokaler Pfad wie C:\\Users\\Lisa zeigt auf die lokale Festplatte. Ein UNC-Pfad wie \\FILE01\\Home$\\Lisa zeigt über das Netzwerk auf eine Freigabe auf einem Server.' },
      { type: 'diagram', content: localVsUncSvg },
      { type: 'question', question: 'Welcher Pfad ist ein Netzwerkpfad?', options: ['C:\\Users\\Lisa', '\\\\FILE01\\Home$\\Lisa', 'H:\\Lisa'], correct: 1, explanation: 'Der UNC-Pfad \\FILE01\\Home$\\Lisa beschreibt eine Netzwerkressource.' },
    ]),

    explanation('adup-username-variable', '%username% als Variable', 'classic', [
      { type: 'text', content: 'Anstatt für jeden Benutzer einen eigenen Pfad manuell einzutragen, kann %username% als Platzhalter verwendet werden. Für Lisa löst sich \\FILE01\\Home$\\%username% sinngemäß in \\FILE01\\Home$\\lisa.berger auf.' },
      { type: 'text', content: 'Diese Variable ermöglicht ein gemeinsames Muster für viele Konten und bereitet die spätere Arbeit mit Vorlagenbenutzern vor.' },
      { type: 'question', question: 'Warum wird %username% in Benutzerpfaden verwendet?', options: ['Um den Pfad länger zu machen', 'Um ein gemeinsames Muster für viele Benutzer zu nutzen', 'Um die Freigabe zu verstecken'], correct: 1, explanation: '%username% wird pro Benutzer aufgelöst; so braucht man nicht jeden Pfad manuell anzupassen.' },
    ]),

    explanation('adup-pfad-abhaengigkeit', 'Pfadabhängigkeiten', 'classic', [
      { type: 'text', content: 'Ein korrekt eingetragener UNC-Pad kann keine nicht existierende Ressource erzeugen. Beispiel: \\FILE99\\MissingShare ist formal denkbar, aber nicht erreichbar, wenn der Server oder die Freigabe nicht existiert.' },
      { type: 'text', content: 'Voraussetzung ist, dass die Freigabe existiert und erreichbar ist. Der Homeordner kann bei passender Konfiguration das Benutzerverzeichnis erzeugen, abhängig von Freigabe, Rechten und gültigem Pfad. Das ist kein selbsttätiger Automatismus.' },
      { type: 'question', question: 'Lisa hat \\FILE99\\Home$\\Lisa eingetragen, FILE99 ist aber nicht bekannt. Was sollte man zuerst prüfen?', options: ['Den Benutzer löschen', 'Ob der Server/Freigabename stimmt und die Ressource existiert', 'Das Kennwort zurücksetzen'], correct: 1, explanation: 'Der eingetragene Verweis muss zu einer tatsächlich erreichbaren Ressource passen.' },
    ]),

    explanation('adup-dollar-nuance', 'Freigabename mit $', 'classic', [
      { type: 'text', content: 'Freigabenamen mit $ werden typischerweise nicht normal aufgelistet. Das $ ist aber kein Sicherheitsmechanismus: es versteckt die Freigabe in Standardlisten, schützt aber nicht vor unberechtigtem Zugriff. Berechtigungen bestimmen den echten Schutz.' },
      { type: 'question', question: 'Schützt ein $ am Ende eines Freigabenamens vor unberechtigtem Zugriff?', options: ['Ja, vollständig', 'Nein, es versteckt die Freigabe nur in Standardlisten', 'Nur lokal'], correct: 1, explanation: '$ verhindert nicht, dass jemand mit dem richtigen UNC-Pfad oder Berechtigungen zugreift. Berechtigungen sind entscheidend.' },
    ]),

    explanation('adup-admin-tier', 'Privilegientrennung', 'classic', [
      { type: 'text', content: 'Das klassische Admin-Tier-Modell trennt hochprivilegierte Konten nach Schutzbedürfnis. Kernprinzip ist Privilege Separation: ein Domain Admin sollte nicht für normale Arbeiten auf einem Client verwendet werden, weil Anmeldeinformationen auf weniger geschützten Systemen kompromittiert werden können.' },
      { type: 'diagram', content: privilegeSeparationSvg },
      { type: 'list', title: 'Reduziertes Modell', items: [
        'Tier 0 – Domäneninfrastruktur / Domain Controller',
        'Tier 1 – Serveradministration',
        'Tier 2 – Clientadministration / Helpdesk',
      ] },
      { type: 'text', content: 'Pass-the-Hash ist ein defensives Motiv dafür: zwischengespeicherte Authentifizierungsinformationen können missbraucht werden. Das Tier-Modell ist keineswegs das einzig moderne Sicherheitskonzept, aber das Kernprinzip der Privilegientrennung bleibt gültig.' },
      { type: 'question', question: 'Warum sollte ein Domain Admin nicht für normale Arbeiten auf einem Client benutzt werden?', options: ['Weil Clients keine Domänen sind', 'Weil Anmeldeinformationen auf Clients leichter kompromittiert werden können', 'Weil Clients keine Konten unterstützen'], correct: 1, explanation: 'Hochprivilegierte Konten sollten nicht auf weniger geschützten Clients verwendet werden, um Pass-the-Hash-Risiken zu reduzieren.' },
    ]),
  ];

  const exercises = [
    {
      id: 'adup-konto-vs-profil-matching',
      type: 'matching',
      title: 'Konto oder Profil?',
      question: 'Ordne jedem Begriff dem richtigen Konzept zu.',
      pairs: [
        { left: 'Benutzerkonto', right: 'Identität und Anmeldung' },
        { left: 'Benutzerprofil', right: 'Benutzerumgebung und Einstellungen' },
        { left: 'Computerkonto', right: 'Repräsentiert ein Gerät in der Domäne' },
        { left: 'Dienstkonto', right: 'Rein technische Funktion' },
      ],
      explanation: 'Konto und Profil sind getrennt; Konten können reale oder technische Identitäten repräsentieren.',
    },
    {
      id: 'adup-lokal-szenario',
      type: 'select-best',
      title: 'Lokales Profil Szenario',
      question: 'Max meldet sich erstmals auf CLIENT05 an. Seine Einstellungen von CLIENT01 fehlen. Was ist der wahrscheinlichste Grund?',
      options: [
        'Sein Domänenkonto wurde gelöscht.',
        'Sein Profil auf CLIENT05 ist neu bzw. noch leer; das lokale Profil auf CLIENT01 ist nicht automatisch auf CLIENT05 vorhanden.',
        'Active Directory ist nicht erreichbar.',
      ],
      correct: 1,
      explanation: 'Lokale Profile sind clientgebunden und werden nicht automatisch auf andere Clients übertragen.',
    },
    {
      id: 'adup-roaming-szenario',
      type: 'select-best',
      title: 'Roaming Profil Szenario',
      question: 'NEXUS will, dass Lisa dieselbe Benutzerumgebung an CLIENT01 und CLIENT07 hat. Was ist eine passende Lösung?',
      options: [
        'lokales Profil auf beiden Clients synchron pflegen',
        'servergespeichertes Profil',
        'E-Mail-Weiterleitung',
      ],
      correct: 1,
      explanation: 'Servergespeicherte Profile ermöglichen die gleiche Benutzerumgebung an mehreren Clients.',
    },
    {
      id: 'adup-ordnerumleitung-szenario',
      type: 'select-best',
      title: 'Ordnerumleitung Szenario',
      question: 'Dokumente sollen zentral auf FILE01 liegen, ohne bei jeder Anmeldung als großer Profilbestandteil vollständig übertragen zu werden.',
      options: [
        'Ordnerumleitung',
        'lokales Profil abschalten',
        'Benutzerkonto kopieren',
      ],
      correct: 0,
      explanation: 'Ordnerumleitung lagert bestimmte Ordner zentral ab, ohne das ganze Profil zu transportieren.',
    },
    {
      id: 'adup-lokal-vs-roaming-select',
      type: 'select-best',
      title: 'Lokal oder servergespeichert?',
      question: 'Welche Eigenschaft passt zu einem lokalen Benutzerprofil?',
      options: [
        'gleiche Umgebung an mehreren Clients',
        'Daten bleiben auf dem jeweiligen Client',
        'zentral auf FILE01 gespeichert',
      ],
      correct: 1,
      explanation: 'Ein lokales Profil liegt und bleibt auf dem jeweiligen Computer.',
    },
    {
      id: 'adup-umleitung-vs-roaming-select',
      type: 'select-best',
      title: 'Ordnerumleitung vs Roaming',
      question: 'Was unterscheidet Ordnerumleitung von einem servergespeicherten Profil?',
      options: [
        'Beide bezeichnen dasselbe.',
        'Ordnerumleitung betrifft bestimmte Ordner; servergespeichertes Profil betrifft das ganze Profil.',
        'Ordnerumleitung ist eine Backuplösung.',
      ],
      correct: 1,
      explanation: 'Ordnerumleitung gilt bestimmten Ordnern, servergespeicherte Profile dem gesamten Profil.',
    },

    {
      id: 'ad-user-profile-home-path-guided-ui',
      type: 'guided-ui',
      title: 'Profil- und Homepfad für Lisa konfigurieren',
      question: 'Konfiguriere für Lisa den Profil- und Homepfad im Benutzerkonto.',
      explanation: 'Im Profile-Reiter werden Profilpfad und Homeordner hinterlegt. Beide verwenden UNC-Pfade auf FILE01.',
      intro: 'Lisa hat ein Konto in der OU Vertrieb. Öffne ihre Eigenschaften und hinterlege Profil- und Homepfad.',
      steps: [
        {
          id: 'adup-path-open',
          kind: 'navigation',
          screen: { title: 'OU Vertrieb', subtitle: 'Lisa Berger' },
          instruction: 'Wie öffnest du die Eigenschaften, um Profil- und Homepfad zu setzen?',
          targets: [
            { id: 'delete', label: 'Delete', description: 'Konto entfernen' },
            { id: 'move', label: 'Move', description: 'Konto verschieben' },
            { id: 'properties', label: 'Properties', description: 'Eigenschaften öffnen' },
            { id: 'refresh', label: 'Refresh', description: 'Ansicht aktualisieren' },
          ],
          correctTarget: 'properties',
          feedbackWrong: 'Delete, Move und Refresh führen nicht zu den Kontoeigenschaften.',
          feedbackCorrect: 'Richtig: Properties öffnet die Einstellungen.',
        },
        {
          id: 'adup-path-tab',
          kind: 'navigation',
          screen: { title: 'Eigenschaften', subtitle: 'Reiter für Pfade' },
          instruction: 'In welchem Reiter werden Profil- und Homepfad eingetragen?',
          targets: [
            { id: 'general', label: 'General' },
            { id: 'account', label: 'Account', description: 'Anmeldezeiten und Workstations' },
            { id: 'profile', label: 'Profile', description: 'Profil- und Homepfad' },
            { id: 'member-of', label: 'Member Of', description: 'Gruppenmitgliedschaften' },
          ],
          correctTarget: 'profile',
          feedbackWrong: 'Profilepfad und Homeordner finden sich im Profile-Reiter.',
          feedbackCorrect: 'Richtig: Im Profile-Reiter werden Profil- und Homepfad konfiguriert.',
        },
        {
          id: 'adup-path-profile',
          kind: 'decision',
          screen: { title: 'Profile', subtitle: 'Profilpfad setzen' },
          instruction: 'Setze den Profilpfad auf den zentralen Profilbereich von FILE01.',
          targets: [
            { id: 'unc-profile', label: '\\\\FILE01\\\\Profile$\\\\%username%', description: 'UNC-Pfad auf FILE01 mit Variable' },
            { id: 'local', label: 'C:\\\\Users\\\\Lisa', description: 'Lokaler Client-Pfad' },
            { id: 'dns', label: '\\\\DC01\\\\DNS', description: 'Falscher Server/Freigabe' },
            { id: 'h', label: 'H:\\\\Lisa', description: 'Laufwerksbuchstabe, kein UNC' },
          ],
          correctTarget: 'unc-profile',
          feedbackWrong: 'Für einen zentralen Profilpfad braucht man einen UNC-Pfad auf die Profilfreigabe. C: ist lokal, H: ist ein Laufwerksbuchstabe.',
          feedbackCorrect: 'Richtig: Der Profilpfad zeigt auf die versteckte Profilfreigabe von FILE01.',
        },
        {
          id: 'adup-path-home',
          kind: 'decision',
          screen: { title: 'Profile', subtitle: 'Home Folder verbinden' },
          instruction: 'Verbinde den Homeordner als Laufwerk H: mit der Home-Freigabe auf FILE01.',
          targets: [
            { id: 'h-unc', label: 'Connect H: → \\\\FILE01\\\\Home$\\\\%username%', description: 'Laufwerk H: mit UNC-Homepfad' },
            { id: 'h-local', label: 'Connect H: → C:\\\\Home\\\\Lisa', description: 'Lokal, nicht zentral' },
            { id: 'profile-only', label: 'Kein Homeordner, nur Profilpfad', description: 'Homeordner fehlt' },
            { id: 'c-drive', label: 'Connect C: → \\\\FILE01\\\\Home$\\\\%username%', description: 'C: ist kein typischer Home-Buchstabe' },
          ],
          correctTarget: 'h-unc',
          feedbackWrong: 'Der Homeordner soll als H: mit dem UNC-Pfad auf FILE01 verbunden werden. Lokal oder kein Homeordner wäre falsch.',
          feedbackCorrect: 'Richtig: Homefolder H: zeigt auf \\FILE01\\Home$\\%username%.',
        },
      ],
    },

    {
      id: 'adup-unc-zuordnung',
      type: 'matching',
      title: 'UNC auflösen',
      question: 'Ordne den Teilen von \\FILE01\\Home$\\Lisa ihre Bedeutung zu.',
      pairs: [
        { left: 'FILE01', right: 'Server' },
        { left: 'Home$', right: 'Freigabe' },
        { left: 'Lisa', right: 'Unterordner' },
        { left: '\\', right: 'UNC-Präfix' },
      ],
      explanation: 'Ein UNC-Pfad beginnt mit \\, gefolgt von Server, Freigabe und optional einem Unterordner.',
    },

    {
      id: 'adup-home-vs-profil-select',
      type: 'select-best',
      title: 'Home oder Profil?',
      question: 'Persönliche Dokumente sollen zentral auf FILE01 abgelegt werden, nicht die Benutzerumgebung. Was ist richtig?',
      options: [
        'Profilpfad',
        'Homeordner',
        'Anmeldezeiten',
      ],
      correct: 1,
      explanation: 'Der Homeordner ist für persönliche Dateien; der Profilpfad für die Benutzerumgebung.',
    },

    {
      id: 'adup-local-vs-unc-select',
      type: 'select-best',
      title: 'Lokal oder UNC?',
      question: 'Welcher Pfad zeigt auf eine Netzwerkressource?',
      options: [
        'C:\\Users\\Lisa',
        '\\\\FILE01\\Home$\\Lisa',
        'H:\\Lisa',
      ],
      correct: 1,
      explanation: 'Der UNC-Pfad \\FILE01\\Home$\\Lisa beschreibt eine Netzwerkfreigabe. C: ist lokal, H: ist ein verbundenes Laufwerk.',
    },

    {
      id: 'adup-broken-path',
      type: 'select-best',
      title: 'Nicht erreichbarer Pfad',
      question: 'Lisas Home H: ist nicht verfügbar. Der AD-Eintrag lautet \\FILE99\\Home$\\Lisa, der bekannte Fileserver heißt FILE01. Was prüfst du zuerst?',
      options: [
        'Server- und Pfadangabe im Benutzerkonto',
        'Lisa in eine andere OU verschieben',
        'Den Client neu starten',
      ],
      correct: 0,
      explanation: 'Der eingetragene Verweis muss zu einer erreichbaren Ressource passen. FILE99 ist im Beispiel nicht der richtige Server.',
    },
  ];

  const quiz = [
    { question: 'Was ist die Hauptaufgabe eines Benutzerkontos?', options: ['Desktop-Hintergrund speichern', 'Identität und Anmeldung', 'Programme installieren'], correct: 1, explanation: 'Das Benutzerkonto ist die Identität; das Profil enthält die Umgebung.' },
    { question: 'Wo wird ein lokales Benutzerprofil gespeichert?', options: ['auf dem jeweiligen Client', 'zentral auf einem Server', 'im Active Directory'], correct: 0, explanation: 'Ein lokales Profil liegt auf dem Client, an dem der Benutzer sich anmeldet.' },
    { question: 'Was ist ein Vorteil eines servergespeicherten Profils?', options: ['schnellere lokale Anmeldung', 'gleiche Umgebung an mehreren Clients', 'keine Netzwerkabhängigkeit'], correct: 1, explanation: 'Servergespeicherte Profile ermöglichen die gleiche Benutzerumgebung an verschiedenen Clients.' },
    { question: 'Welcher Faktor kann die Anmeldung mit servergespeichertem Profil verlangsamen?', options: ['große Profilgröße und viele gleichzeitige Anmeldungen', 'zu kleine lokale Festplatte', 'fehlende Netzwerkkarte'], correct: 0, explanation: 'Profilgröße, Netzwerk und Anmeldelast beeinflussen die Performance.' },
    { question: 'Was ist das Ziel der Ordnerumleitung?', options: ['bestimmte Ordner zentral speichern', 'Benutzerkonten anlegen', 'Servergespeicherte Profile abschalten'], correct: 0, explanation: 'Ordnerumleitung legt bestimmte Benutzerordner zentral ab.' },
    { question: 'Ordnerumleitung und servergespeichertes Profil sind …', options: ['dasselbe', 'unterschiedliche Mechanismen', 'nur für lokale Profile relevant'], correct: 1, explanation: 'Ordnerumleitung betrifft bestimmte Ordner; Roaming-Profile das gesamte Profil.' },
    { question: 'Warum sollte ein Domain Admin nicht für normale Arbeiten auf einem Client verwendet werden?', options: ['Weil Clients keine Domänen sind', 'Weil Anmeldeinformationen auf Clients leichter kompromittiert werden können', 'Weil Clients keine Konten unterstützen'], correct: 1, explanation: 'Hochprivilegierte Konten sollten nicht auf weniger geschützten Clients verwendet werden.' },
    { question: 'Was ist der wesentliche Unterschied zwischen Homeordner und Profilpfad?', options: ['Keiner', 'Homeordner ist für persönliche Dateien; Profilpfad für die Benutzerumgebung', 'Beide sind lokale Pfade'], correct: 1, explanation: 'Homeordner = persönliche Dateien; Profilpfad = Benutzerumgebung/Einstellungen.' },
  ];

  const summary = [
    'Ein Benutzerkonto ist die Identität in Active Directory; ein Benutzerprofil ist die getrennte Benutzerumgebung.',
    'Lokale Profile bleiben auf dem jeweiligen Client und sind schnell verfügbar.',
    'Servergespeicherte Profile liegen zentral und ermöglichen die gleiche Umgebung an mehreren Clients, hängen aber von Netzwerk, Profilgröße und Last ab.',
    'Ordnerumleitung lagert bestimmte Ordner zentral und ist nicht gleichbedeutend mit einem servergespeicherten Profil.',
    'Offline-Verhalten hängt von zusätzlichen Konfigurationen ab; Anmeldung und Erreichbarkeit umgeleiteter Ressourcen sind unterschiedlich.',
    'Profilpfad und Homeordner verweisen aus dem Benutzerkonto auf zentrale Netzwerkressourcen; die eigentlichen Daten liegen auf dem Server.',
    'UNC-Pfade adressieren Netzwerkressourcen über Server und Freigabe.',
    'Homeordner und Profilpfad haben unterschiedliche Zwecke: persönliche Dateien vs. Benutzerumgebung.',
    'Privilege Separation empfiehlt, hochprivilegierte Konten nicht auf normalen Clients zu nutzen.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
