import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – FSMO-Rollen anzeigen & verschieben
// Thema 21
// =============================================================================

export const AD_FSMO_TRANSFER_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-fsmo-transfer');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const toolMapSvg = `<svg viewBox="0 0 320 260" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="10" width="280" height="60" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">AD-Benutzer und -Computer</text>
  <text x="160" y="48" text-anchor="middle" fill="#c9d1d9" font-size="9">RID Master · PDC Emulator · Infrastructure Master</text>
  <text x="160" y="62" text-anchor="middle" fill="#8b949e" font-size="8">Domänenweite Rollen</text>

  <rect x="20" y="85" width="280" height="50" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="103" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">AD-Domänen und -Vertrauensstellungen</text>
  <text x="160" y="118" text-anchor="middle" fill="#c9d1d9" font-size="9">Domain Naming Master</text>
  <text x="160" y="130" text-anchor="middle" fill="#8b949e" font-size="8">Forestweite Rolle</text>

  <rect x="20" y="150" width="280" height="60" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="2"/>
  <text x="160" y="170" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">MMC + Active Directory-Schema Snap-In</text>
  <text x="160" y="188" text-anchor="middle" fill="#c9d1d9" font-size="9">Schema Master</text>
  <text x="160" y="202" text-anchor="middle" fill="#8b949e" font-size="8">Forestweite Rolle · Snap-In ggf. vorher registrieren</text>

  <text x="160" y="245" text-anchor="middle" fill="#c9d1d9" font-size="10">Jede FSMO-Rolle hat ihr passendes Verwaltungstool.</text>
</svg>`;

export function buildAdFsmoTransferLesson() {
  const explanations = [
    explanation('fsmo-transfer-intro-classic', 'Ausgangslage: DC01 soll gewartet werden', 'classic', [
      { type: 'text', content: 'In der Domäne its.bw gibt es zwei Domain Controller: DC01.its.bw und DC02.its.bw. DC01 hält mehrere FSMO-Rollen. Damit DC01 gewartet werden kann, sollen bestimmte Rollen kontrolliert auf DC02 übertragen werden. Dafür braucht es mindestens einen zweiten DC.' },
      { type: 'text', content: 'Diese Lektion setzt voraus, dass du die fünf FSMO-Rollen und ihre Scopes bereits kennst (Thema 20). Hier geht es ausschließlich um den praktischen Ablauf: anzeigen, auswählen, übertragen, verifizieren.' },
      { type: 'question', question: 'Warum ist ein zweiter DC wichtig, bevor FSMO-Rollen verschoben werden?', options: ['Damit die Rollen auf ein anderes System übergehen können', 'Damit DNS automatisch installiert wird', 'Damit das Schema geändert werden kann', 'Damit alle Benutzer neu angelegt werden'], correct: 0, explanation: 'Ein Transfer braucht einen erreichbaren Ziel-DC, auf den die Rolle übertragen werden kann.' },
    ]),
    explanation('fsmo-transfer-vs-seize-classic', 'Transfer vs. Seize', 'classic', [
      { type: 'text', content: 'Ein Transfer ist die geplante Rollenübertragung zwischen erreichbaren DCs. Beide DCs sind online und antworten. Ein Seize würde dagegen eine Rolle erzwingen, wenn der bisherige Inhaber nicht mehr verfügbar ist – das ist ein Notfallszenario.' },
      { type: 'text', content: 'In dieser Lektion lernst du nur den Transfer. Seize bleibt einem späteren Katastrophenfall-Schritt vorbehalten.' },
      { type: 'question', question: 'Wann verwendet man einen normalen Transfer?', options: ['Wenn der alte Rolleninhaber nicht mehr erreichbar ist', 'Wenn beide DCs erreichbar sind und die Rolle geplant übergeben wird', 'Wenn das Schema beschädigt ist', 'Wenn ein Client keine Anmeldung schafft'], correct: 1, explanation: 'Transfer setzt einen erreichbaren alten und neuen Rolleninhaber voraus.' },
    ]),
    explanation('fsmo-transfer-identify-classic', 'Rolleninhaber ermitteln', 'classic', [
      { type: 'text', content: 'Bevor du rollst, musst du wissen, wer aktuell welche Rolle hält. Dazu gibt es zwei gangbare Wege: die grafische Konsole oder das Kommando netdom query fsmo.' },
      { type: 'text', content: 'Der Befehl netdom query fsmo zeigt auf einen Blick alle fünf Rollen und ihre aktuellen Inhaber an. Das ist besonders nützlich, um nach einem Transfer schnell zu verifizieren.' },
      { type: 'question', question: 'Welcher Befehl zeigt die aktuellen FSMO-Rolleninhaber an?', options: ['netdom query fsmo', 'dcdiag /test:fsmo', 'nltest /dsgetdc', 'repadmin /showrepl'], correct: 0, explanation: 'netdom query fsmo listet die aktuellen Inhaber aller fünf FSMO-Rollen auf.' },
    ]),
    explanation('fsmo-transfer-netdom-output-intuitive', 'FSMO-Übersicht wie ein Briefkopf', 'intuitive', [
      { type: 'text', content: 'Stell dir netdom query fsmo wie einen Briefkopf vor: Er zeigt dir für jede wichtige Position den aktuellen Zuständigen. Wenn du einen Posten wechselst, prüfst du danach, ob der Briefkopf wirklich den neuen Namen trägt.' },
      { type: 'text', content: 'Genau so funktioniert die Verifikation nach einem Transfer: Die Ausgabe sollte für die betreffende Rolle jetzt DC02.its.bw zeigen.' },
    ]),
    explanation('fsmo-transfer-domain-roles-classic', 'Domänenweite Rollen in ADUC', 'classic', [
      { type: 'text', content: 'Die domänenweiten Rollen RID Master, PDC Emulator und Infrastructure Master werden in Active Directory-Benutzer und -Computer verwaltet. Man öffnet dazu die Domäne, wählt mit der rechten Maustaste die Domäne aus und öffnet die Betriebsmaster.' },
      { type: 'text', content: 'Die einzelnen Tabs zeigen RID, PDC und Infrastruktur sowie den aktuellen Rolleninhaber. Diese Ansicht ist der Ausgangspunkt für einen Transfer.' },
      { type: 'question', question: 'Welches Tool verwendest du für RID Master, PDC Emulator und Infrastructure Master?', options: ['Active Directory-Domänen und -Vertrauensstellungen', 'Active Directory-Benutzer und -Computer', 'DNS-Manager', 'Active Directory-Schema Snap-In'], correct: 1, explanation: 'Die drei domänenweiten Rollen verwaltet man in ADUC unter Betriebsmaster.' },
    ]),
    explanation('fsmo-transfer-target-dc-classic', 'Ziel-DC auswählen', 'classic', [
      { type: 'text', content: 'Bevor eine Rolle übertragen werden kann, muss feststehen, mit welchem DC die Verwaltungskonsole arbeiten soll. Das passiert über „Domänencontroller ändern“.' },
      { type: 'text', content: 'In unserem Szenario wählst du DC02.its.bw als Ziel. Erst danach kann die Rolle auf DC02 übertragen werden.' },
      { type: 'question', question: 'Was muss vor dem eigentlichen Transfer festgelegt werden?', options: ['Der Ziel-DC', 'Der neue Domänenname', 'Das neue Schema', 'Die Trust-Richtung'], correct: 0, explanation: 'Der Verwaltungskontext muss auf den Ziel-DC zeigen, damit die Rolle dorthin übertragen werden kann.' },
    ]),
    explanation('fsmo-transfer-domain-role-transfer-classic', 'Rolle übertragen', 'classic', [
      { type: 'text', content: 'Nachdem DC02 als Verwaltungsziel ausgewählt ist, öffnest du erneut die Betriebsmaster-Einstellungen. Im entsprechenden Tab klickst du auf „Ändern“ und bestätigst den Transfer.' },
      { type: 'text', content: 'Anschließend sollte der Dialog DC02 als neuen Rolleninhaber anzeigen. Das ist aber kein Grund, nicht noch einmal mit netdom query fsmo nachzuprüfen.' },
      { type: 'question', question: 'Wie startest du die Übertragung im Betriebsmaster-Dialog?', options: ['Mit „Domänencontroller ändern"', 'Mit „Ändern"', 'Mit „Neue Rolle"', 'Mit „Schema aktualisieren"'], correct: 1, explanation: 'Im Betriebsmaster-Dialog überträgst du die Rolle mit „Ändern".' },
    ]),
    explanation('fsmo-transfer-verification-classic', 'Ergebnis verifizieren', 'classic', [
      { type: 'text', content: 'Ein Transfer gilt erst dann als sicher abgeschlossen, wenn du das Ergebnis verifiziert hast. Prüfe sowohl die grafische Ansicht als auch die Ausgabe von netdom query fsmo.' },
      { type: 'text', content: 'Wenn beide Quellen DC02 für die übertragene Rolle zeigen, kannst du davon ausgehen, dass der Transfer erfolgreich war.' },
      { type: 'question', question: 'Warum solltest du nach dem Transfer noch netdom query fsmo ausführen?', options: ['Um das Ergebnis unabhängig zu verifizieren', 'Um den alten DC zu löschen', 'Um das Schema zu erweitern', 'Um Trusts zu prüfen'], correct: 0, explanation: 'netdom query fsmo gibt eine schnelle, unabhängige Bestätigung über den neuen Rolleninhaber.' },
    ]),
    explanation('fsmo-transfer-domain-naming-classic', 'Domain Naming Master', 'classic', [
      { type: 'text', content: 'Der Domain Naming Master ist eine forestweite Rolle. Er wird nicht in ADUC verwaltet, sondern in Active Directory-Domänen und -Vertrauensstellungen.' },
      { type: 'text', content: 'Auch hier wird zuerst der Ziel-DC ausgewählt, dann die Operations-Master-/Betriebsmaster-Ansicht geöffnet und die Rolle auf DC02 übertragen.' },
      { type: 'question', question: 'Welches Tool verwendest du für den Domain Naming Master?', options: ['ADUC', 'Active Directory-Domänen und -Vertrauensstellungen', 'DNS-Manager', 'Server-Manager'], correct: 1, explanation: 'Domain Naming Master ist forestweit und wird in AD-Domänen und -Vertrauensstellungen verwaltet.' },
    ]),
    explanation('fsmo-transfer-schema-classic', 'Schema Master – besondere Vorgehensweise', 'classic', [
      { type: 'text', content: 'Der Schema Master wird über ein eigenes Snap-In in der MMC verwaltet. Im Laborszenario muss dieses Snap-In zunächst mit regsvr32 schmmgmt.dll verfügbar gemacht werden.' },
      { type: 'text', content: 'Danach öffnest du die MMC, fügst das Active Directory-Schema Snap-In hinzu und kannst dort den Schema Master einsehen und auf einen anderen DC übertragen.' },
      { type: 'question', question: 'Wie heißt der Befehl, der das Active Directory-Schema-Snap-In im Laborszenario registriert?', options: ['regsvr32 schmmgmt.dll', 'regsvr32 adsiedit.dll', 'netdom query schema', 'mmc /schema'], correct: 0, explanation: 'regsvr32 schmmgmt.dll registriert das Schema-Management-Snap-In für die MMC.' },
    ]),
    explanation('fsmo-transfer-source-caution-classic', 'Source Caution: Schmmgmt', 'classic', [
      { type: 'text', content: 'In manchen modernen Windows-Versionen ist das Schema-Snap-In bereits verfügbar. Die Quelle verwendet regsvr32 schmmgmt.dll, daher behandeln wir ihn als laborspezifischen Schritt, nicht als universelle Gesetzmäßigkeit.' },
      { type: 'text', content: 'Wichtig ist das Prinzip: Schema Master braucht das passende Verwaltungstool und ist nicht in ADUC zu finden.' },
      { type: 'question', question: 'Wie sollte regsvr32 schmmgmt.dll vermittelt werden?', options: ['Als universelle Voraussetzung auf jedem Server', 'Als laborspezifischer Schritt gemäß Quelle', 'Als unbedeutender Befehl', 'Als Ersatz für netdom query fsmo'], correct: 1, explanation: 'Der Befehl wird im Quell-Laborszenario verwendet, ist aber nicht zwingend auf jedem modernen System nötig.' },
    ]),
    explanation('fsmo-transfer-tool-map-classic', 'Tool-Mapping für alle FSMO-Rollen', 'classic', [
      { type: 'text', content: 'Die zentrale Fähigkeit in diesem Thema ist das richtige Tool für die richtige Rolle zu wählen.' },
      { type: 'diagram', content: toolMapSvg },
      { type: 'list', title: 'Zusammenfassung', items: [
        'RID/PDC/Infrastructure → Active Directory-Benutzer und -Computer',
        'Domain Naming Master → Active Directory-Domänen und -Vertrauensstellungen',
        'Schema Master → MMC + Active Directory-Schema Snap-In',
      ] },
      { type: 'question', question: 'Wo verwaltet man den Schema Master?', options: ['In ADUC', 'In Active Directory-Domänen und -Vertrauensstellungen', 'In der MMC mit dem Active Directory-Schema Snap-In', 'Im DNS-Manager'], correct: 2, explanation: 'Schema Master erfordert das Active Directory-Schema Snap-In in der MMC.' },
    ]),
    explanation('fsmo-transfer-troubleshooting-classic', 'Typische Fehler', 'classic', [
      { type: 'text', content: 'Häufige Fehler: Man klickt in ADUC auf „Ändern", ohne vorher den Ziel-DC ausgewählt zu haben. Man sucht Domain Naming Master oder Schema Master im falschen Tool. Oder man vergisst nach dem Transfer zu verifizieren.' },
      { type: 'text', content: 'Ein weiterer Fehler: Ein ausgefallener DC wird mit dem normalen Transfer behandelt. Wenn der alte DC nicht erreichbar ist, ist kein normaler Transfer mehr möglich – dann wäre Seize das richtige Thema, aber nicht Gegenstand dieser Lektion.' },
      { type: 'question', question: 'Du willst eine Rolle verschieben, aber der alte DC ist offline. Was ist korrekt?', options: ['Normalen Transfer trotzdem versuchen', 'Seize wäre nötig, aber nicht Teil dieses Szenarios', 'Schema erweitern', 'Den neuen DC neu installieren'], correct: 1, explanation: 'Ohne erreichbaren alten Rolleninhaber ist kein normaler Transfer möglich; Seize ist ein anderes Szenario.' },
    ]),
  ];

  const exercises = [
    {
      id: 'fsmo-transfer-role-to-tool-matching',
      type: 'matching',
      question: 'Ordne jede FSMO-Rolle dem passenden Verwaltungstool zu.',
      pairs: [
        { left: 'RID Master', right: 'Active Directory-Benutzer und -Computer' },
        { left: 'PDC Emulator', right: 'Active Directory-Benutzer und -Computer' },
        { left: 'Infrastructure Master', right: 'Active Directory-Benutzer und -Computer' },
        { left: 'Domain Naming Master', right: 'Active Directory-Domänen und -Vertrauensstellungen' },
        { left: 'Schema Master', right: 'MMC + Active Directory-Schema Snap-In' },
      ],
      explanation: 'Domänenweite Rollen in ADUC, Domain Naming Master in AD-Domänen und -Vertrauensstellungen, Schema Master im Schema Snap-In.',
    },
    {
      id: 'fsmo-transfer-steps-ordering',
      type: 'ordering',
      question: 'Ordne die Schritte für einen geplanten FSMO-Transfer.',
      items: ['Rolleninhaber ermitteln', 'Ziel-DC auswählen', 'Rolle übertragen', 'Ergebnis prüfen'],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Zuerst wissen, wo die Rolle liegt; dann den Ziel-DC wählen; danach übertragen; zuletzt verifizieren.',
    },
    {
      id: 'fsmo-transfer-netdom-goal',
      type: 'select-best',
      question: 'Welcher Befehl zeigt die aktuellen FSMO-Rolleninhaber an?',
      options: ['netdom query fsmo', 'dcdiag /test:fsmo', 'repadmin /showrepl', 'nltest /dsgetdc'],
      correct: 0,
      explanation: 'netdom query fsmo listet alle fünf Rolleninhaber übersichtlich auf.',
    },
    {
      id: 'fsmo-transfer-netdom-effect',
      type: 'select-best',
      question: 'Was liefert netdom query fsmo typischerweise?',
      options: ['Eine Liste aller aktuellen FSMO-Rolleninhaber', 'Eine Liste aller Gruppenrichtlinien', 'Eine Liste aller DNS-Zoneinträge', 'Eine Liste aller installierten Snap-Ins'],
      correct: 0,
      explanation: 'Der Befehl zeigt für jede FSMO-Rolle den aktuellen Inhaber an.',
    },
    {
      id: 'fsmo-transfer-schmmgmt-goal',
      type: 'select-best',
      question: 'Welcher Befehl macht im Laborszenario das Active Directory-Schema-Snap-In verfügbar?',
      options: ['regsvr32 schmmgmt.dll', 'regsvr32 adsiedit.dll', 'netdom query schema', 'mmc /schema'],
      correct: 0,
      explanation: 'regsvr32 schmmgmt.dll registriert das Schema-Management-Snap-In.',
    },
    {
      id: 'fsmo-transfer-schmmgmt-effect',
      type: 'select-best',
      question: 'Was bewirkt regsvr32 schmmgmt.dll im Laborszenario?',
      options: ['Das Active Directory-Schema Snap-In wird für die MMC registriert', 'Alle FSMO-Rollen werden auf DC02 verschoben', 'Das Schema wird verändert', 'Der Domain Naming Master wird angezeigt'],
      correct: 0,
      explanation: 'Der Befehl registriert das Snap-In, damit es in der MMC hinzugefügt werden kann.',
    },
    {
      id: 'fsmo-transfer-transfer-vs-seize',
      type: 'select-best',
      question: 'Wann verwendet man einen normalen Transfer?',
      options: ['Wenn der alte Rolleninhaber nicht mehr erreichbar ist', 'Wenn beide DCs erreichbar sind', 'Wenn das Schema beschädigt ist', 'Wenn ein Client sich nicht anmelden kann'],
      correct: 1,
      explanation: 'Transfer ist die geplante Übergabe bei erreichbarem alten und neuem DC.',
    },
    {
      id: 'fsmo-transfer-misconception-seize',
      type: 'select-best',
      question: '„Transfer und Seize sind dasselbe." Stimmt das?',
      options: ['Ja, beides verschiebt Rollen', 'Nein, Transfer ist geplant bei erreichbarem DC, Seize erzwingt bei Ausfall', 'Nein, Seize ist nur ein Synonym für Transfer', 'Ja, beides erfordert netdom query fsmo'],
      correct: 1,
      explanation: 'Transfer setzt einen erreichbaren alten DC voraus; Seize ist ein erzwungener Eingriff bei Ausfall.',
    },
    {
      id: 'fsmo-transfer-target-before-change',
      type: 'select-best',
      question: 'Was muss vor dem Klick auf „Ändern" im Betriebsmaster-Dialog passieren?',
      options: ['Der Ziel-DC muss als Verwaltungsziel ausgewählt sein', 'Das Schema muss erweitert werden', 'Ein Trust muss eingerichtet werden', 'DNS muss neu gestartet werden'],
      correct: 0,
      explanation: 'Ohne Ziel-DC-Auswahl wird die Rolle nicht auf das gewünschte System übertragen.',
    },
    {
      id: 'fsmo-transfer-domain-naming-tool',
      type: 'select-best',
      question: 'In welchem Tool findest du den Domain Naming Master?',
      options: ['ADUC', 'Active Directory-Domänen und -Vertrauensstellungen', 'DNS-Manager', 'Active Directory-Schema Snap-In'],
      correct: 1,
      explanation: 'Domain Naming Master wird in Active Directory-Domänen und -Vertrauensstellungen verwaltet.',
    },
    {
      id: 'fsmo-transfer-schema-tool',
      type: 'select-best',
      question: 'Ein Kollege sucht den Schema Master in ADUC. Was sagst du?',
      options: ['Das ist richtig so', 'Schema Master ist im Schema Snap-In der MMC, nicht in ADUC', 'Schema Master findet man in DNS', 'Schema Master existiert nicht'],
      correct: 1,
      explanation: 'Schema Master erfordert das Active Directory-Schema Snap-In in der MMC.',
    },
    {
      id: 'fsmo-transfer-verify-after',
      type: 'select-best',
      question: 'Warum führst du nach dem Transfer netdom query fsmo aus?',
      options: ['Um das Ergebnis unabhängig zu verifizieren', 'Um den alten DC zu entfernen', 'Um ein neues Schema zu laden', 'Um Trusts zu erstellen'],
      correct: 0,
      explanation: 'netdom query fsmo bestätigt, dass die Rolle wirklich auf dem Ziel-DC liegt.',
    },
    {
      id: 'fsmo-transfer-troubleshooting-wrong-tool',
      type: 'select-best',
      question: 'Ein Admin sucht den Domain Naming Master im Betriebsmaster-Dialog von ADUC. Was fehlt?',
      options: ['Er muss AD-Domänen und -Vertrauensstellungen verwenden', 'Er muss das Schema erweitern', 'Er muss einen neuen DC installieren', 'Er muss DNS neu starten'],
      correct: 0,
      explanation: 'Domain Naming Master ist forestweit und liegt nicht im ADUC-Betriebsmaster.',
    },
    {
      id: 'fsmo-transfer-admin-challenge',
      type: 'select-best',
      question: 'DC01 soll gewartet werden. Du sollst RID Master und PDC Emulator auf DC02 übertragen. Welches Vorgehen ist korrekt?',
      options: [
        'ADUC öffnen → Ziel-DC DC02 auswählen → Betriebsmaster → RID/PDC nacheinander übertragen → netdom query fsmo prüfen',
        'AD-Domänen und -Vertrauensstellungen öffnen → Schema Snap-In hinzufügen → Rollen ändern',
        'netdom query fsmo ausführen → DC01 löschen → Rollen automatisch auf DC02',
        'regsvr32 schmmgmt.dll → ADUC öffnen → alle Rollen verschieben',
      ],
      correct: 0,
      explanation: 'Domänenweite Rollen werden in ADUC mit Ziel-DC-Auswahl und anschließender Verifikation übertragen.',
    },
    {
      id: 'fsmo-transfer-schema-admin-challenge',
      type: 'select-best',
      question: 'Der Schema Master soll auf DC02 übertragen werden. Welches Vorgehen ist korrekt?',
      options: [
        'MMC öffnen → Active Directory-Schema Snap-In hinzufügen → Ziel-DC auswählen → Schema Master übertragen → Verifizieren',
        'ADUC öffnen → Betriebsmaster → Schema Master ändern',
        'DNS-Manager öffnen → Schema-Zone bearbeiten',
        'DC01 herunterfahren und DC02 neu starten',
      ],
      correct: 0,
      explanation: 'Schema Master erfordert das Schema Snap-In in der MMC, nicht ADUC oder DNS.',
    },
    {
      id: 'fsmo-transfer-view-domain-roles-guided-ui',
      type: 'guided-ui',
      title: 'Domänenweite Rolleninhaber anzeigen',
      question: 'Zeige die aktuellen Inhaber der domänenweiten FSMO-Rollen in ADUC an.',
      explanation: 'ADUC öffnen → Domäne its.bw → Rechtsklick → Betriebsmaster → Tabs RID, PDC, Infrastruktur prüfen.',
      intro: 'Du möchtest wissen, auf welchem DC aktuell RID, PDC und Infrastructure Master liegen.',
      steps: [
        {
          id: 'fsmo-view-tool',
          kind: 'decision',
          screen: { title: 'Verwaltungstool', subtitle: 'Domänenweite Rollen anzeigen' },
          instruction: 'Welches Tool öffnest du, um die domänenweiten FSMO-Rollen zu sehen?',
          targets: [
            { id: 'adtd', label: 'AD-Domänen und -Vertrauensstellungen', description: 'Für Trusts und Domain Naming Master' },
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer', description: 'Richtiges Tool für domänenweite Rollen' },
            { id: 'dns', label: 'DNS-Manager', description: 'Nicht für FSMO-Rollen' },
          ],
          correctTarget: 'aduc',
          feedbackWrong: 'Domänenweite FSMO-Rollen verwaltet man in ADUC.',
          feedbackCorrect: 'Richtig: ADUC ist der richtige Startpunkt.',
        },
        {
          id: 'fsmo-view-context',
          kind: 'navigation',
          screen: { title: 'Domäne its.bw', subtitle: 'Betriebsmaster öffnen' },
          instruction: 'Wie öffnest du den Betriebsmaster-Dialog?',
          targets: [
            { id: 'left', label: 'Linksklick auf Domäne' },
            { id: 'right', label: 'Rechtsklick auf Domäne → Betriebsmaster' },
            { id: 'dbl', label: 'Doppelklick auf Benutzer-Container' },
          ],
          correctTarget: 'right',
          feedbackWrong: 'Rechtsklick auf die Domäne → Betriebsmaster öffnet den Dialog.',
          feedbackCorrect: 'Richtig: Rechtsklick auf die Domäne → Betriebsmaster.',
        },
        {
          id: 'fsmo-view-tab',
          kind: 'decision',
          screen: { title: 'Betriebsmaster', subtitle: 'Tab wählen' },
          instruction: 'Welchen Tab prüfst du, um den RID Master zu sehen?',
          targets: [
            { id: 'rid', label: 'RID', description: 'RID Master' },
            { id: 'pdc', label: 'PDC', description: 'PDC Emulator' },
            { id: 'infra', label: 'Infrastruktur', description: 'Infrastructure Master' },
          ],
          correctTarget: 'rid',
          feedbackWrong: 'Der RID-Tab zeigt den RID Master an.',
          feedbackCorrect: 'Richtig: RID-Tab.',
        },
      ],
    },
    {
      id: 'fsmo-transfer-select-target-dc-guided-ui',
      type: 'guided-ui',
      title: 'Ziel-DC auswählen',
      question: 'Wähle DC02 als Verwaltungsziel, bevor du FSMO-Rollen überträgst.',
      explanation: 'In ADUC über „Domänencontroller ändern" DC02.its.bw auswählen, damit die Verwaltung und spätere Übertragung auf DC02 ausgerichtet sind.',
      intro: 'Damit eine Rolle auf DC02 übertragen wird, muss ADUC zuerst wissen, dass DC02 das Ziel ist.',
      steps: [
        {
          id: 'fsmo-target-menu',
          kind: 'navigation',
          screen: { title: 'ADUC', subtitle: 'Verwaltungsziel wechseln' },
          instruction: 'Welcher Menüeintrag öffnet die Auswahl des Ziel-DCs?',
          targets: [
            { id: 'change', label: 'Domänencontroller ändern', description: 'Ziel-DC wählen' },
            { id: 'properties', label: 'Eigenschaften', description: 'Domäneneigenschaften' },
            { id: 'refresh', label: 'Aktualisieren', description: 'Ansicht neu laden' },
          ],
          correctTarget: 'change',
          feedbackWrong: '„Domänencontroller ändern" legt den Verwaltungsziel-DC fest.',
          feedbackCorrect: 'Richtig: Domänencontroller ändern.',
        },
        {
          id: 'fsmo-target-dc',
          kind: 'decision',
          screen: { title: 'Ziel-DC wählen', subtitle: 'DCs in its.bw' },
          instruction: 'Welchen DC wählst du als Ziel für den Transfer?',
          targets: [
            { id: 'dc01', label: 'DC01.its.bw', description: 'Aktueller Rolleninhaber' },
            { id: 'dc02', label: 'DC02.its.bw', description: 'Ziel-DC für die Übertragung' },
            { id: 'dc03', label: 'DC03.its.bw', description: 'Existiert nicht im Szenario' },
          ],
          correctTarget: 'dc02',
          feedbackWrong: 'Als Ziel für den Transfer wählst du DC02.its.bw.',
          feedbackCorrect: 'Richtig: DC02.its.bw.',
        },
      ],
    },
    {
      id: 'fsmo-transfer-domain-role-transfer-guided-ui',
      type: 'guided-ui',
      title: 'Domänenweite Rolle übertragen',
      question: 'Übertrage den RID Master von DC01 auf DC02.',
      explanation: 'Ziel-DC DC02 ausgewählt → Betriebsmaster öffnen → RID-Tab → „Ändern" → Transfer bestätigen → DC02 als neuen Inhaber prüfen.',
      intro: 'Der RID Master liegt noch auf DC01. Übertrage ihn kontrolliert auf DC02.',
      steps: [
        {
          id: 'fsmo-domain-transfer-tab',
          kind: 'navigation',
          screen: { title: 'Betriebsmaster', subtitle: 'Zu übertragende Rolle' },
          instruction: 'In welchem Tab findest du den RID Master?',
          targets: [
            { id: 'rid', label: 'RID' },
            { id: 'pdc', label: 'PDC' },
            { id: 'infra', label: 'Infrastruktur' },
          ],
          correctTarget: 'rid',
          feedbackWrong: 'Der RID Master ist im RID-Tab zu finden.',
          feedbackCorrect: 'Richtig: RID-Tab.',
        },
        {
          id: 'fsmo-domain-transfer-action',
          kind: 'navigation',
          screen: { title: 'RID-Tab', subtitle: 'Rollenübertragung' },
          instruction: 'Wie überträgst du die Rolle auf DC02?',
          targets: [
            { id: 'change', label: 'Ändern', description: 'Transfer starten' },
            { id: 'close', label: 'Schließen', description: 'Dialog verlassen' },
            { id: 'refresh', label: 'Aktualisieren', description: 'Ansicht neu laden' },
          ],
          correctTarget: 'change',
          feedbackWrong: 'Mit „Ändern" startest du die Übertragung.',
          feedbackCorrect: 'Richtig: Ändern.',
        },
        {
          id: 'fsmo-domain-transfer-verify',
          kind: 'decision',
          screen: { title: 'Verifikation', subtitle: 'Nach dem Transfer' },
          instruction: 'Wie prüfst du am besten, ob der Transfer erfolgreich war?',
          targets: [
            { id: 'trust', label: 'Ich schließe den Dialog und vertraue darauf', description: 'Nicht empfohlen' },
            { id: 'netdom', label: 'netdom query fsmo', description: 'Unabhängige Verifikation' },
            { id: 'dns', label: 'DNS-Manager öffnen', description: 'Nicht passend' },
          ],
          correctTarget: 'netdom',
          feedbackWrong: 'netdom query fsmo zeigt dir den neuen Rolleninhaber an.',
          feedbackCorrect: 'Richtig: netdom query fsmo zur Verifikation.',
        },
      ],
    },
    {
      id: 'fsmo-transfer-domain-naming-transfer-guided-ui',
      type: 'guided-ui',
      title: 'Domain Naming Master übertragen',
      question: 'Übertrage den Domain Naming Master auf DC02.',
      explanation: 'Active Directory-Domänen und -Vertrauensstellungen öffnen → passenden Verwaltungsbereich auswählen → Operations Master / Betriebsmaster → Ziel-DC DC02 → Rolle übertragen → Ergebnis prüfen.',
      intro: 'Domain Naming Master ist forestweit und wird nicht in ADUC verwaltet.',
      steps: [
        {
          id: 'fsmo-dn-tool',
          kind: 'decision',
          screen: { title: 'Verwaltungstool', subtitle: 'Domain Naming Master' },
          instruction: 'Welches Tool verwendest du?',
          targets: [
            { id: 'aduc', label: 'ADUC', description: 'Für domänenweite Rollen' },
            { id: 'adtd', label: 'Active Directory-Domänen und -Vertrauensstellungen', description: 'Richtig für Domain Naming Master' },
            { id: 'dns', label: 'DNS-Manager', description: 'Nicht für FSMO' },
          ],
          correctTarget: 'adtd',
          feedbackWrong: 'Domain Naming Master wird in AD-Domänen und -Vertrauensstellungen verwaltet.',
          feedbackCorrect: 'Richtig: AD-Domänen und -Vertrauensstellungen.',
        },
        {
          id: 'fsmo-dn-target',
          kind: 'decision',
          screen: { title: 'Ziel-DC', subtitle: 'Verwaltungsziel' },
          instruction: 'Welchen DC wählst du als Ziel?',
          targets: [
            { id: 'dc01', label: 'DC01.its.bw' },
            { id: 'dc02', label: 'DC02.its.bw', description: 'Ziel-DC' },
            { id: 'dc03', label: 'DC03.its.bw', description: 'Existiert nicht' },
          ],
          correctTarget: 'dc02',
          feedbackWrong: 'Als Ziel wählst du DC02.its.bw.',
          feedbackCorrect: 'Richtig: DC02.its.bw.',
        },
        {
          id: 'fsmo-dn-verify',
          kind: 'navigation',
          screen: { title: 'Verifikation', subtitle: 'Nach dem Transfer' },
          instruction: 'Welcher Befehl bestätigt den neuen Inhaber des Domain Naming Master?',
          targets: [
            { id: 'netdom', label: 'netdom query fsmo' },
            { id: 'dcdiag', label: 'dcdiag /test:dns' },
            { id: 'ipconfig', label: 'ipconfig /all' },
          ],
          correctTarget: 'netdom',
          feedbackWrong: 'netdom query fsmo zeigt alle FSMO-Rolleninhaber.',
          feedbackCorrect: 'Richtig: netdom query fsmo.',
        },
      ],
    },
    {
      id: 'fsmo-transfer-schema-snapin-guided-ui',
      type: 'guided-ui',
      title: 'Schema Snap-In verfügbar machen',
      question: 'Registriere und öffne das Active Directory-Schema Snap-In in der MMC.',
      explanation: 'regsvr32 schmmgmt.dll ausführen → MMC öffnen → Datei → Snap-In hinzufügen/entfernen → Active Directory-Schema auswählen → hinzufügen → OK.',
      intro: 'Im Laborszenario ist das Schema Snap-In zunächst nicht in der MMC sichtbar.',
      steps: [
        {
          id: 'fsmo-schema-register',
          kind: 'decision',
          screen: { title: 'Registrierung', subtitle: 'Schema Snap-In' },
          instruction: 'Welcher Befehl registriert das Active Directory-Schema Snap-In im Laborszenario?',
          targets: [
            { id: 'schm', label: 'regsvr32 schmmgmt.dll', description: 'Registriert das Schema Snap-In' },
            { id: 'adsi', label: 'regsvr32 adsiedit.dll', description: 'ADSI-Editor' },
            { id: 'net', label: 'netdom query schema', description: 'Nicht gültig' },
          ],
          correctTarget: 'schm',
          feedbackWrong: 'regsvr32 schmmgmt.dll registriert das Schema Snap-In.',
          feedbackCorrect: 'Richtig: regsvr32 schmmgmt.dll.',
        },
        {
          id: 'fsmo-schema-mmc',
          kind: 'navigation',
          screen: { title: 'MMC', subtitle: 'Snap-In hinzufügen' },
          instruction: 'Wie fügst du das Snap-In in der MMC hinzu?',
          targets: [
            { id: 'file', label: 'Datei → Snap-In hinzufügen/entfernen', description: 'Richtiger Weg' },
            { id: 'view', label: 'Ansicht → Snap-In laden', description: 'Nicht standardmäßig' },
            { id: 'tools', label: 'Extras → Optionen', description: 'Nicht hier' },
          ],
          correctTarget: 'file',
          feedbackWrong: 'In der MMC wählst du Datei → Snap-In hinzufügen/entfernen.',
          feedbackCorrect: 'Richtig: Datei → Snap-In hinzufügen/entfernen.',
        },
        {
          id: 'fsmo-schema-select',
          kind: 'decision',
          screen: { title: 'Snap-In Auswahl', subtitle: 'Welches Snap-In?' },
          instruction: 'Welches Snap-In wählst du aus?',
          targets: [
            { id: 'schema', label: 'Active Directory-Schema', description: 'Richtig' },
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer', description: 'Falsches Snap-In' },
            { id: 'dns', label: 'DNS', description: 'Falsches Snap-In' },
          ],
          correctTarget: 'schema',
          feedbackWrong: 'Für den Schema Master wählst du Active Directory-Schema.',
          feedbackCorrect: 'Richtig: Active Directory-Schema.',
        },
      ],
    },
    {
      id: 'fsmo-transfer-schema-master-transfer-guided-ui',
      type: 'guided-ui',
      title: 'Schema Master übertragen',
      question: 'Übertrage den Schema Master auf DC02.',
      explanation: 'Active Directory-Schema Snap-In öffnen → Ziel-DC auswählen / Schema DC ändern → Schema Master / Operations Master öffnen → aktuellen Owner prüfen → Rolle übertragen → neuen Owner verifizieren.',
      intro: 'Schema Master ist forestweit und erfordert das Schema Snap-In.',
      steps: [
        {
          id: 'fsmo-schema-tool',
          kind: 'decision',
          screen: { title: 'Verwaltungstool', subtitle: 'Schema Master' },
          instruction: 'Welches Tool verwendest du für den Schema Master?',
          targets: [
            { id: 'aduc', label: 'ADUC' },
            { id: 'schema', label: 'MMC + Active Directory-Schema Snap-In', description: 'Richtig' },
            { id: 'adtd', label: 'AD-Domänen und -Vertrauensstellungen', description: 'Für Domain Naming Master' },
          ],
          correctTarget: 'schema',
          feedbackWrong: 'Schema Master braucht das Active Directory-Schema Snap-In in der MMC.',
          feedbackCorrect: 'Richtig: MMC + Active Directory-Schema Snap-In.',
        },
        {
          id: 'fsmo-schema-target',
          kind: 'decision',
          screen: { title: 'Ziel-DC', subtitle: 'Schema DC' },
          instruction: 'Welchen DC wählst du als neuen Schema DC?',
          targets: [
            { id: 'dc01', label: 'DC01.its.bw' },
            { id: 'dc02', label: 'DC02.its.bw', description: 'Ziel-DC' },
            { id: 'dc03', label: 'DC03.its.bw', description: 'Existiert nicht' },
          ],
          correctTarget: 'dc02',
          feedbackWrong: 'Als Ziel wählst du DC02.its.bw.',
          feedbackCorrect: 'Richtig: DC02.its.bw.',
        },
        {
          id: 'fsmo-schema-verify',
          kind: 'navigation',
          screen: { title: 'Verifikation', subtitle: 'Nach dem Transfer' },
          instruction: 'Welcher Befehl verifiziert den neuen Schema-Master-Inhaber?',
          targets: [
            { id: 'netdom', label: 'netdom query fsmo' },
            { id: 'dcdiag', label: 'dcdiag /test:schema', description: 'Nicht der bewusste FSMO-Check' },
            { id: 'gpupdate', label: 'gpupdate /force', description: 'Gruppenrichtlinien' },
          ],
          correctTarget: 'netdom',
          feedbackWrong: 'netdom query fsmo zeigt den aktuellen Inhaber des Schema Masters an.',
          feedbackCorrect: 'Richtig: netdom query fsmo.',
        },
      ],
    },
  ];

  const quiz = [
    { question: 'Welcher Befehl zeigt die aktuellen FSMO-Rolleninhaber an?', options: ['netdom query fsmo', 'dcdiag /test:fsmo', 'repadmin /showrepl', 'nltest /dsgetdc'], correct: 0, explanation: 'netdom query fsmo listet alle aktuellen Inhaber auf.' },
    { question: 'Welches Tool verwendest du für RID Master, PDC Emulator und Infrastructure Master?', options: ['AD-Domänen und -Vertrauensstellungen', 'ADUC', 'DNS-Manager', 'MMC + Schema Snap-In'], correct: 1, explanation: 'Die drei domänenweiten Rollen verwaltet man in ADUC.' },
    { question: 'Wo findest du den Domain Naming Master?', options: ['In ADUC', 'In AD-Domänen und -Vertrauensstellungen', 'Im DNS-Manager', 'Im Schema Snap-In'], correct: 1, explanation: 'Domain Naming Master ist forestweit und liegt in AD-Domänen und -Vertrauensstellungen.' },
    { question: 'Welcher Befehl registriert das Schema Snap-In im Laborszenario?', options: ['regsvr32 schmmgmt.dll', 'regsvr32 adsiedit.dll', 'netdom query schema', 'mmc /schema'], correct: 0, explanation: 'regsvr32 schmmgmt.dll registriert das Active Directory-Schema Snap-In.' },
    { question: 'Was muss vor dem eigentlichen Transfer im Dialog festgelegt werden?', options: ['Der Ziel-DC', 'Ein neuer Domänenname', 'Eine Schemaerweiterung', 'Ein externer Trust'], correct: 0, explanation: 'Der Verwaltungskontext muss auf den Ziel-DC zeigen.' },
    { question: 'Was ist der Unterschied zwischen Transfer und Seize?', options: ['Keiner', 'Transfer ist geplant bei erreichbarem DC, Seize erzwingt bei Ausfall', 'Seize ist nur ein anderes Wort für Transfer', 'Transfer funktioniert nur für Schema Master'], correct: 1, explanation: 'Transfer setzt einen erreichbaren alten DC voraus; Seize ist ein Notfall-Eingriff.' },
    { question: 'Wie verifizierst du am besten einen erfolgreichen Transfer?', options: ['Nur den Dialog schließen', 'netdom query fsmo', 'DNS-Manager öffnen', 'DC neu starten'], correct: 1, explanation: 'netdom query fsmo zeigt unabhängig den neuen Rolleninhaber.' },
    { question: 'Ein Admin sucht den Schema Master in ADUC. Was sagst du?', options: ['Das ist korrekt', 'Schema Master ist im Schema Snap-In, nicht in ADUC', 'Schema Master findet man im DNS', 'Schema Master gibt es nicht'], correct: 1, explanation: 'Schema Master erfordert das Active Directory-Schema Snap-In in der MMC.' },
  ];

  const summary = [
    'Vor dem Transfer müssen die aktuellen FSMO-Rolleninhaber bekannt sein; netdom query fsmo hilft dabei.',
    'Transfer ist die geplante Übergabe bei erreichbarem altem und neuem DC; Seize ist ein Notfallszenario.',
    'Domänenweite Rollen (RID, PDC, Infrastructure) werden in ADUC verwaltet.',
    'Vor der Übertragung muss der Ziel-DC als Verwaltungsziel ausgewählt werden.',
    'Domain Naming Master wird in Active Directory-Domänen und -Vertrauensstellungen übertragen.',
    'Schema Master erfordert die MMC mit dem Active Directory-Schema Snap-In; im Laborszenario wird es mit regsvr32 schmmgmt.dll registriert.',
    'Nach jedem Transfer sollte das Ergebnis geprüft werden – idealerweise mit netdom query fsmo.',
  ];

  return { title: 'FSMO-Rollen anzeigen & verschieben', explanations, exercises, quiz, summary };
}
