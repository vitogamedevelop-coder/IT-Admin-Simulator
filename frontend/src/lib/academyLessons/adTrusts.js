import { topicKey } from '../academyTopics.js';

export const AD_TRUSTS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-trusts');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const trustVsPermissionSvg = `<svg viewBox="0 0 360 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="180" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Trust ermöglicht Identität – Permission ermöglicht Zugriff</text>

  <rect x="20" y="55" width="120" height="55" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="80" y="78" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">Domäne B</text>
  <text x="80" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9">Benutzer Lisa</text>

  <path d="M140 82 L200 82" stroke="#8b949e" stroke-width="2" marker-end="url(#arrowTrust)"/>
  <text x="170" y="75" text-anchor="middle" fill="#8b949e" font-size="9">Trust</text>
  <text x="170" y="105" text-anchor="middle" fill="#8b949e" font-size="8">Identität akzeptiert</text>

  <rect x="220" y="55" width="120" height="55" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="280" y="78" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domäne A</text>
  <text x="280" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9">Ressource Share01</text>

  <path d="M280 110 L280 150" stroke="#ffcc00" stroke-width="2" stroke-dasharray="4,2" marker-end="url(#arrowPerm)"/>
  <text x="280" y="168" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Permission erforderlich</text>
  <text x="280" y="185" text-anchor="middle" fill="#8b949e" font-size="8">ACL / Gruppenmitgliedschaft</text>

  <defs>
    <marker id="arrowTrust" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
    <marker id="arrowPerm" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#ffcc00"/>
    </marker>
  </defs>
</svg>`;

const directionSvg = `<svg viewBox="0 0 360 260" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="180" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">A trusts B</text>

  <rect x="30" y="55" width="120" height="80" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="90" y="78" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domäne A</text>
  <text x="90" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9">TRUSTING</text>
  <text x="90" y="110" text-anchor="middle" fill="#c9d1d9" font-size="9">vertrauende Domäne</text>
  <text x="90" y="128" text-anchor="middle" fill="#f78166" font-size="9">OUTGOING Trust</text>

  <path d="M150 95 L210 95" stroke="#8b949e" stroke-width="2" marker-end="url(#arrowDir)"/>
  <text x="180" y="88" text-anchor="middle" fill="#8b949e" font-size="9">vertraut</text>

  <rect x="220" y="55" width="120" height="80" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="280" y="78" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">Domäne B</text>
  <text x="280" y="95" text-anchor="middle" fill="#c9d1d9" font-size="9">TRUSTED</text>
  <text x="280" y="110" text-anchor="middle" fill="#c9d1d9" font-size="9">vertraute Domäne</text>
  <text x="280" y="128" text-anchor="middle" fill="#2ea043" font-size="9">INCOMING Trust</text>

  <path d="M280 135 L280 175" stroke="#ffcc00" stroke-width="2" stroke-dasharray="4,2" marker-end="url(#arrowAccess)"/>
  <text x="280" y="192" text-anchor="middle" fill="#ffcc00" font-size="9">B-Benutzer können für A-Ressourcen</text>
  <text x="280" y="208" text-anchor="middle" fill="#ffcc00" font-size="9">berechtigt werden (mit Permission)</text>

  <defs>
    <marker id="arrowDir" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
    <marker id="arrowAccess" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#ffcc00"/>
    </marker>
  </defs>
</svg>`;

const twoWaySvg = `<svg viewBox="0 0 360 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="180" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Bidirektionaler Trust</text>

  <rect x="30" y="75" width="120" height="80" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="90" y="98" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domäne A</text>
  <text x="90" y="115" text-anchor="middle" fill="#c9d1d9" font-size="9">outgoing + incoming</text>
  <text x="90" y="133" text-anchor="middle" fill="#c9d1d9" font-size="9">trusting & trusted</text>

  <path d="M150 95 L210 95" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow2)"/>
  <path d="M210 135 L150 135" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="180" y="88" text-anchor="middle" fill="#8b949e" font-size="9">A vertraut B</text>
  <text x="180" y="155" text-anchor="middle" fill="#8b949e" font-size="9">B vertraut A</text>

  <rect x="220" y="75" width="120" height="80" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="280" y="98" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">Domäne B</text>
  <text x="280" y="115" text-anchor="middle" fill="#c9d1d9" font-size="9">outgoing + incoming</text>
  <text x="280" y="133" text-anchor="middle" fill="#c9d1d9" font-size="9">trusting & trusted</text>

  <text x="180" y="185" text-anchor="middle" fill="#ffcc00" font-size="9">ACLs/Berechtigungen bleiben trotzdem separat nötig.</text>

  <defs>
    <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

const transitiveSvg = `<svg viewBox="0 0 420 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="210" y="22" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">Transitive Trust-Kette</text>

  <rect x="30" y="60" width="100" height="55" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="80" y="85" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domäne A</text>
  <text x="80" y="103" text-anchor="middle" fill="#c9d1d9" font-size="9">vertraut B</text>

  <path d="M130 87 L190 87" stroke="#8b949e" stroke-width="2" marker-end="url(#arrowTrans)"/>
  <text x="160" y="80" text-anchor="middle" fill="#8b949e" font-size="9">Trust</text>

  <rect x="200" y="60" width="100" height="55" rx="4" fill="#0d1117" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="250" y="85" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">Domäne B</text>
  <text x="250" y="103" text-anchor="middle" fill="#c9d1d9" font-size="9">vertraut C</text>

  <path d="M300 87 L360 87" stroke="#8b949e" stroke-width="2" marker-end="url(#arrowTrans)"/>
  <text x="330" y="80" text-anchor="middle" fill="#8b949e" font-size="9">Trust</text>

  <rect x="370" y="60" width="80" height="55" rx="4" fill="#0d1117" stroke="#2ea043" stroke-width="1.5"/>
  <text x="410" y="85" text-anchor="middle" fill="#2ea043" font-size="10" font-weight="bold">Domäne C</text>
  <text x="410" y="103" text-anchor="middle" fill="#c9d1d9" font-size="9">vertraut</text>

  <text x="210" y="160" text-anchor="middle" fill="#ffcc00" font-size="9">Vertrauenspfad kann über B fortgesetzt werden.</text>
  <text x="210" y="178" text-anchor="middle" fill="#8b949e" font-size="8">Berechtigungen auf Ressourcen müssen dennoch separat gesetzt werden.</text>

  <defs>
    <marker id="arrowTrans" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#8b949e"/>
    </marker>
  </defs>
</svg>`;

export function buildAdTrustsLesson() {
  const title = 'Vertrauensstellungen';

  const explanations = [
    explanation('ad-trusts-intro', 'Warum Vertrauensstellungen?', 'classic', [
      { type: 'text', content: 'Wenn mehrere Active Directory-Domänen existieren, müssen Benutzer aus einer Domäne sich auch gegenüber einer anderen Domäne authentifizieren können. Eine Vertrauensstellung schafft diese Möglichkeit: Sie erlaubt einer Domäne, die Identitäten einer anderen Domäne anzunehmen.' },
      { type: 'question', question: 'Wozu dienen Vertrauensstellungen in AD?', options: ['Sie kopieren Benutzerkonten zwischen Domänen.', 'Sie ermöglichen das Akzeptieren von Identitäten einer anderen Domäne.', 'Sie erteilen automatisch Administratorrechte.', 'Sie ersetzen DNS-Zonen.'], correct: 1, explanation: 'Ein Trust ermöglicht das gegenseitige Akzeptieren von Identitäten, keine automatische Rechtevergabe.' },
    ]),

    explanation('ad-trusts-trust-vs-permission', 'Trust ≠ Berechtigung', 'classic', [
      { type: 'text', content: 'Eine Vertrauensstellung bedeutet nicht automatisch, dass Benutzer der anderen Domäne alle Ressourcen verwenden dürfen. Ein Trust sagt nur: „Ich akzeptiere deine Identität.“ Ob die Identität auf eine Ressource zugreifen darf, entscheidet anschließend eine separate Berechtigung, zum Beispiel eine Gruppenmitgliedschaft oder ACL.' },
      { type: 'diagram', content: trustVsPermissionSvg },
      { type: 'question', question: 'Ein Trust zwischen Domäne A und Domäne B besteht. Bekommen Benutzer aus B automatisch Zugriff auf alle Ressourcen in A?', options: ['Ja, ein Trust erlaubt generellen Zugriff.', 'Nein, der Benutzer braucht weiterhin passende Berechtigungen.', 'Nur wenn beide Domänen denselben Namen haben.', 'Ja, aber nur temporär.'], correct: 1, explanation: 'Ein Trust ermöglicht das Akzeptieren von Identitäten; konkrete Zugriffe erfordern zusätzliche Berechtigungen.' },
    ]),

    explanation('ad-trusts-one-way', 'Unidirektionaler Trust', 'classic', [
      { type: 'text', content: 'Ein unidirektionaler Trust verläuft in eine Richtung: Domäne A vertraut Domäne B. Dadurch können Benutzer aus B für Ressourcen in A berechtigt werden. Umgekehrt gilt das nicht automatisch.' },
      { type: 'question', question: 'A trusts B gilt einseitig. Was folgt daraus?', options: ['Benutzer aus A erhalten automatisch Zugriff auf B.', 'Benutzer aus B können für Ressourcen in A berechtigt werden.', 'Beide Domänen teilen ihr Schema.', 'Alle Ressourcen sind freigegeben.'], correct: 1, explanation: 'Bei A trusts B akzeptiert A Identitäten aus B; A kann B-Benutzern Berechtigungen auf Ressourcen geben.' },
    ]),

    explanation('ad-trusts-trusting-trusted', 'Trusting und Trusted', 'classic', [
      { type: 'text', content: 'Wenn A B vertraut, ist A die trusting Domain – die vertrauende Domäne. B ist die trusted Domain – die vertraute Domäne. Die trusting Domäne stellt ggf. Ressourcen bereit, die trusted Domäne stellt die Benutzer/Identitäten bereit. Damit können B-Benutzer für Ressourcen in A berechtigt werden, wenn A ihnen die passenden Berechtigungen gibt.' },
      { type: 'diagram', content: directionSvg },
      { type: 'question', question: 'A trusts B. Welche Domäne ist trusted?', options: ['A', 'B'], correct: 1, explanation: 'Der Name trusted bezeichnet die Domäne, der vertraut wird – hier B.' },
    ]),

    explanation('ad-trusts-outgoing', 'Ausgehende Vertrauensstellung', 'classic', [
      { type: 'text', content: 'Die Begriffe outgoing und incoming beziehen sich immer auf die Sicht der aktuell betrachteten Domäne. Aus Sicht von A ist „A trusts B“ ein outgoing trust to B, weil A selbst die Vertrauensstellung herausgibt.' },
      { type: 'question', question: 'Aus Sicht A: A trusts B. Welche Richtung zeigt A?', options: ['Incoming trust from B', 'Outgoing trust to B', 'Bidirektionaler Trust', 'Kein Trust'], correct: 1, explanation: 'A vertraut B; aus Sicht von A ist das ein ausgehender Trust.' },
    ]),

    explanation('ad-trusts-incoming', 'Eingehende Vertrauensstellung', 'classic', [
      { type: 'text', content: 'Aus Sicht von B ist dieselbe Beziehung „A trusts B“ ein incoming trust from A. B sieht, dass A ihr vertraut. Deshalb ist B aus Sicht von B die trusted Domain und A die trusting Domain.' },
      { type: 'question', question: 'Aus Sicht B: A trusts B. Welche Richtung sieht B?', options: ['Outgoing trust to A', 'Incoming trust from A', 'Bidirektionaler Trust', 'Kein Trust'], correct: 1, explanation: 'B sieht, dass A ihr vertraut – das ist ein eingehender Trust aus Sicht von B.' },
    ]),

    explanation('ad-trusts-perspective', 'Perspektive ist entscheidend', 'classic', [
      { type: 'text', content: 'Ein und dieselbe unidirektionale Beziehung sieht von beiden Domänen unterschiedlich aus. Bei A trusts B hat A einen outgoing trust und B einen incoming trust. Diese Perspektive ist der klassische Stolperstein.' },
      { type: 'question', question: 'A trusts B. Welche Aussagen stimmen?', options: ['A: incoming, B: outgoing', 'A: outgoing, B: incoming', 'Beide: incoming', 'Beide: outgoing'], correct: 1, explanation: 'A gibt den Trust aus (outgoing), B empfängt ihn (incoming).' },
    ]),

    explanation('ad-trusts-two-way', 'Bidirektionaler Trust', 'classic', [
      { type: 'text', content: 'Ein bidirektionaler Trust besteht aus zwei Richtungen: A vertraut B und B vertraut A. Aus Sicht einer Domäne existieren dann sowohl ein outgoing als auch ein incoming Trust. Trotzdem benötigt jede Ressource weiterhin eigene Berechtigungen.' },
      { type: 'diagram', content: twoWaySvg },
      { type: 'question', question: 'Was bedeutet ein bidirektionaler Trust zwischen A und B?', options: ['Beide Domänen vertrauen sich gegenseitig.', 'Alle Ressourcen sind automatisch freigegeben.', 'A vertraut B, aber B nicht A.', 'Es gibt nur einen incoming Trust.'], correct: 0, explanation: 'Bidirektional = A vertraut B und B vertraut A; Berechtigungen bleiben dennoch separat.' },
    ]),

    explanation('ad-trusts-transitive', 'Transitive Vertrauensstellung', 'classic', [
      { type: 'text', content: 'Transitivität bedeutet, dass ein Vertrauenspfad über weitere Domänen hinweg wirken kann. Wenn A B vertraut und B C vertraut, kann A in einer transitiven Struktur auch Identitäten aus C akzeptieren. Transitivität betrifft den Vertrauenspfad, nicht die Vererbung von Berechtigungen.' },
      { type: 'diagram', content: transitiveSvg },
      { type: 'question', question: 'Was beschreibt Transitivität bei Trusts?', options: ['Berechtigungen werden automatisch an andere Domänen vererbt.', 'Vertrauensbeziehungen können über verbundene Domänen hinweg gelten.', 'Jeder Benutzer darf überall zugreifen.', 'Trusts funktionieren nur in einer Richtung.'], correct: 1, explanation: 'Transitivität erweitert den Vertrauenspfad, nicht die Berechtigungen auf Ressourcen.' },
    ]),

    explanation('ad-trusts-parent-child', 'Automatischer Parent-/Child-Trust', 'classic', [
      { type: 'text', content: 'Wenn eine Child Domain in einem AD Forest erstellt wird, richtet Active Directory automatisch eine Vertrauensstellung zwischen Parent und Child ein. Diese ist typischerweise bidirektional und transitiv. Sie muss beim normalen Aufbau nicht manuell erzeugt werden.' },
      { type: 'question', question: 'Welche Trust-Beziehung entsteht typischerweise automatisch zwischen Parent- und Child-Domäne?', options: ['Ein manuell eingerichteter unidirektionaler Trust', 'Ein bidirektionaler, transitiver Trust', 'Ein zusätzlicher Verbund-Trust', 'Keiner'], correct: 1, explanation: 'Parent-/Child-Trusts im selben Forest entstehen automatisch und sind bidirektional/transitiv.' },
    ]),

    explanation('ad-trusts-display', 'Vertrauensstellungen anzeigen', 'classic', [
      { type: 'text', content: 'Vorhandene Vertrauensstellungen zeigt man über das Snap-In „Active Directory-Domänen und -Vertrauensstellungen“ an. Dort wählt man die Domäne, öffnet Eigenschaften und wechselt auf die Registerkarte „Vertrauensstellungen“. Dort sind eingehende und ausgehende Trusts aufgelistet.' },
      { type: 'question', question: 'Wo werden AD-Vertrauensstellungen einer Domäne angezeigt?', options: ['Im DNS-Manager', 'In Active Directory-Domänen und -Vertrauensstellungen → Domäne → Eigenschaften → Trusts', 'Im Geräte-Manager', 'In der MMC-Option Autorenmodus'], correct: 1, explanation: 'Das Snap-In zeigt Trusts auf der Registerkarte Vertrauensstellellen der Domäneneigenschaften an.' },
    ]),

    explanation('ad-trusts-troubleshooting', 'Troubleshooting und Transfer', 'classic', [
      { type: 'text', content: 'Wenn ein Trust funktioniert, ein Benutzer aber dennoch keinen Share nutzen darf, liegt das meist nicht am Trust, sondern an fehlenden Berechtigungen. Prüfe Gruppenmitgliedschaften und ACLs auf der Ressource. Umgekehrt: Wenn Benutzer aus A auf B-Ressourcen zugreifen sollen, reicht ein A-trusts-B nicht; B muss A ebenfalls vertrauen oder die Richtung muss passen.' },
      { type: 'question', question: 'Ein Trust besteht, aber ein Benutzer bekommt „Zugriff verweigert“ auf einen Share. Was prüfst du zuerst?', options: ['Sofort den Trust neu erstellen', 'Berechtigungen auf der Ressource / Gruppenmitgliedschaften', 'Den Server ausschalten', 'Den Benutzer in die Root-Domäne verschieben'], correct: 1, explanation: 'Trust ermöglicht Identitätsakzeptanz; Ressourcenzugriff erfordert separate Berechtigungen.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-trusts-trust-vs-access',
      type: 'select-best',
      question: 'Zwischen Domäne A und Domäne B besteht ein Trust. Kann Lisa aus B automatisch auf Share01 in A zugreifen?',
      options: ['Ja, der Trust erlaubt den Zugriff.', 'Nein, sie benötigt weiterhin passende Berechtigungen.', 'Nur wenn beide Domänen denselben DNS-Namen haben.', 'Nur während der Arbeitszeit.'],
      correct: 1,
      explanation: 'Ein Trust ermöglicht das Akzeptieren von Identitäten; Ressourcenzugriff braucht zusätzliche Berechtigungen.',
    },
    {
      id: 'ad-trusts-one-way-direction',
      type: 'select-best',
      question: 'A trusts B gilt einseitig. Welche Benutzer können für Ressourcen in A berechtigt werden?',
      options: ['Benutzer aus A', 'Benutzer aus B', 'Nur Administratoren aus A', 'Keine'],
      correct: 1,
      explanation: 'A vertraut B, deshalb akzeptiert A Identitäten aus B und kann ihnen Berechtigungen geben.',
    },
    {
      id: 'ad-trusts-trusting-trusted-match',
      type: 'matching',
      question: 'Ordne die Begriffe bei A trusts B zu.',
      pairs: [
        { left: 'Domäne A', right: 'trusting / vertrauende Domäne' },
        { left: 'Domäne B', right: 'trusted / vertraute Domäne' },
        { left: 'Ressourcen-Seite', right: 'Domäne A' },
        { left: 'Identitäten-Seite', right: 'Domäne B' },
      ],
      explanation: 'Die vertrauende Domäne kann Ressourcen bereitstellen; der vertrauten Domäne entstammen die akzeptierten Identitäten.',
    },
    {
      id: 'ad-trusts-outgoing-incoming',
      type: 'select-best',
      question: 'Aus Sicht von A gilt: A trusts B. Wie lautet die Trust-Richtung aus Sicht A?',
      options: ['Incoming trust from B', 'Outgoing trust to B', 'Two-way trust', 'No trust'],
      correct: 1,
      explanation: 'A vertraut B; aus Sicht von A ist das ein ausgehender Trust.',
    },
    {
      id: 'ad-trusts-perspective',
      type: 'select-best',
      question: 'its.bw trusts ausbildung.its.bw. Aus Sicht ausbildung.its.bw handelt es sich um ...?',
      options: ['Outgoing trust to its.bw', 'Incoming trust from its.bw', 'Bidirektionalen Trust', 'Keinen Trust'],
      correct: 1,
      explanation: 'Die vertraute Domäne sieht die Beziehung als eingehenden Trust.',
    },
    {
      id: 'ad-trusts-two-way',
      type: 'select-best',
      question: 'Ein bidirektionaler Trust zwischen A und B bedeutet:',
      options: ['Alle Ressourcen sind automatisch freigegeben.', 'A vertraut B und B vertraut A.', 'Nur A vertraut B.', 'Berechtigungen werden automatisch synchronisiert.'],
      correct: 1,
      explanation: 'Bidirektional = beide Richtungen existieren; Berechtigungen bleiben dennoch separat.',
    },
    {
      id: 'ad-trusts-transitive',
      type: 'select-best',
      question: 'A, B und C befinden sich in einer transitiven Trust-Struktur. Was beschreibt Transitivität?',
      options: ['Berechtigungen werden automatisch vererbt.', 'Vertrauensbeziehungen können über verbundene Domänen hinweg gelten.', 'Jeder Benutzer erhält Admin-Rechte.', 'Trusts werden täglich neu erzeugt.'],
      correct: 1,
      explanation: 'Transitivität erweitert den Vertrauenspfad, nicht die Berechtigungen.',
    },
    {
      id: 'ad-trusts-parent-child',
      type: 'select-best',
      question: 'its.bw und ausbildung.its.bw sind Parent und Child. Welcher Trust entsteht beim normalen AD-Aufbau automatisch?',
      options: ['Ein unidirektionaler manueller Trust', 'Ein bidirektionaler, transitiver Trust', 'Ein externer Trust', 'Keiner'],
      correct: 1,
      explanation: 'Parent-/Child-Trusts im selben Forest entstehen automatisch und sind bidirektional/transitiv.',
    },
    {
      id: 'ad-trusts-misconception-access',
      type: 'select-best',
      question: '„Ein Trust bedeutet, dass Benutzer der anderen Domäne alle Ressourcen benutzen dürfen." Stimmt das?',
      options: ['Ja', 'Nein'],
      correct: 1,
      explanation: 'Ein Trust ermöglicht nur das Akzeptieren von Identitäten; Berechtigungen bleiben erforderlich.',
    },
    {
      id: 'ad-trusts-misconception-transitive-permission',
      type: 'select-best',
      question: '„Transitiv bedeutet, dass Ressourcenzugriffsrechte automatisch an weitere Domänen weitergegeben werden." Stimmt das?',
      options: ['Ja', 'Nein'],
      correct: 1,
      explanation: 'Transitivität betrifft den Vertrauenspfad, nicht die Berechtigungsvererbung auf Ressourcen.',
    },
    {
      id: 'ad-trusts-misconception-trusted-definition',
      type: 'select-best',
      question: '„Trusted Domain ist die Domäne, die der anderen vertraut." Stimmt das?',
      options: ['Ja', 'Nein'],
      correct: 1,
      explanation: 'Trusted Domain ist diejenige, der vertraut wird. Trusting Domain ist die vertrauende Seite.',
    },
    {
      id: 'ad-trusts-transfer',
      type: 'select-best',
      question: 'Mitarbeiter aus training.nexus.local sollen auf eine Ressource in nexus.local zugreifen. Was ist nötig?',
      options: ['Nur ein Trust', 'Nur eine Berechtigung auf der Ressource', 'Trust/Forest-Beziehung und separate Berechtigung', 'Automatisch funktioniert es'],
      correct: 2,
      explanation: 'Trust ermöglicht Identitätsakzeptanz; die Ressource braucht trotzdem eine Berechtigung.',
    },
    {
      id: 'ad-trusts-troubleshooting',
      type: 'select-best',
      question: 'Ein Benutzer kann sich authentifizieren, bekommt aber auf einen Share „Zugriff verweigert“. Der Trust scheint zu funktionieren. Was prüfst du zuerst?',
      options: ['Sofort den Trust neu erstellen', 'Berechtigungen auf der Ressource / Gruppenmitgliedschaften', 'DNS-Einstellungen der Domäne', 'Den Domain Controller austauschen'],
      correct: 1,
      explanation: 'Ein Trust ermöglicht die Authentifizierung. Für den eigentlichen Zugriff auf eine Ressource müssen Berechtigungen, Gruppenmitgliedschaften oder ACLs passen.',
    },
    {
      id: 'ad-trusts-view-guided-ui',
      type: 'guided-ui',
      title: 'Vertrauensstellungen anzeigen',
      question: 'Zeige die Vertrauensstellungen von its.bw an und identifiziere die Beziehung zu ausbildung.its.bw.',
      explanation: 'Active Directory-Domänen und -Vertrauensstellungen öffnen → its.bw auswählen → Eigenschaften → Registerkarte Vertrauensstellungen.',
      intro: 'Du möchtest prüfen, welche Trusts für its.bw konfiguriert sind.',
      steps: [
        {
          id: 'ad-trusts-view-step-tool',
          kind: 'decision',
          screen: { title: 'Verwaltungstool', subtitle: 'Trusts anzeigen' },
          instruction: 'Welches Tool öffnest du, um Vertrauensstellungen zu verwalten?',
          targets: [
            { id: 'dns', label: 'DNS-Manager' },
            { id: 'aduc', label: 'Active Directory-Benutzer und -Computer' },
            { id: 'adtd', label: 'Active Directory-Domänen und -Vertrauensstellungen', description: 'Verwaltet Domänen und Trusts' },
          ],
          correctTarget: 'adtd',
          feedbackWrong: 'Active Directory-Domänen und -Vertrauensstellungen ist das passende Snap-In.',
          feedbackCorrect: 'Richtig: Active Directory-Domänen und -Vertrauensstellungen.',
        },
        {
          id: 'ad-trusts-view-step-properties',
          kind: 'navigation',
          screen: { title: 'Domäne its.bw', subtitle: 'Eigenschaften öffnen' },
          instruction: 'Wie öffnest du die Eigenschaften der Domäne its.bw?',
          targets: [
            { id: 'leftclick', label: 'Einfacher Linksklick' },
            { id: 'rightclick', label: 'Rechtsklick → Eigenschaften', description: 'Öffnet den Eigenschaftsdialog' },
            { id: 'delete', label: 'Entf-Taste' },
          ],
          correctTarget: 'rightclick',
          feedbackWrong: 'Rechtsklick auf die Domäne → Eigenschaften öffnet den Dialog.',
          feedbackCorrect: 'Richtig: Rechtsklick → Eigenschaften.',
        },
        {
          id: 'ad-trusts-view-step-tab',
          kind: 'navigation',
          screen: { title: 'Eigenschaften von its.bw', subtitle: 'Registerkarte wählen' },
          instruction: 'Auf welcher Registerkarte werden Trusts angezeigt?',
          targets: [
            { id: 'general', label: 'Allgemein' },
            { id: 'trusts', label: 'Vertrauensstellungen', description: 'Zeigt incoming/outgoing Trusts' },
            { id: 'security', label: 'Sicherheit' },
          ],
          correctTarget: 'trusts',
          feedbackWrong: 'Trusts werden auf der Registerkarte „Vertrauensstellungen“ aufgelistet.',
          feedbackCorrect: 'Richtig: Vertrauensstellungen.',
        },
      ],
    },

    {
      id: 'ad-trusts-direction-guided-ui',
      type: 'guided-ui',
      title: 'Trust-Richtung interpretieren',
      question: 'Auf der Registerkarte Vertrauensstellungen von its.bw siehst du: Ausgehende Vertrauensstellungen: ausbildung.its.bw. Was folgert daraus?',
      explanation: 'its.bw vertraut ausbildung.its.bw. its.bw ist trusting/outgoing; ausbildung.its.bw ist trusted/incoming. Benutzer aus ausbildung.its.bw können für Ressourcen in its.bw berechtigt werden.',
      intro: 'Interpretiere eine ausgehende Vertrauensstellung richtig.',
      steps: [
        {
          id: 'ad-trusts-dir-step-who-trusts',
          kind: 'decision',
          screen: { title: 'Ausgehende Trusts', subtitle: 'Wem vertraut its.bw?' },
          instruction: 'its.bw hat einen ausgehenden Trust zu ausbildung.its.bw. Wem vertraut its.bw?',
          targets: [
            { id: 'nobody', label: 'Niemandem' },
            { id: 'itself', label: 'Sich selbst' },
            { id: 'ausbildung', label: 'ausbildung.its.bw', description: 'Ausgehend = vertraut auf die Zieldomäne' },
          ],
          correctTarget: 'ausbildung',
          feedbackWrong: 'Ein ausgehender Trust bedeutet: its.bw vertraut ausbildung.its.bw.',
          feedbackCorrect: 'Richtig: its.bw vertraut ausbildung.its.bw.',
        },
        {
          id: 'ad-trusts-dir-step-role',
          kind: 'decision',
          screen: { title: 'Rolle', subtitle: 'Trusting vs. Trusted' },
          instruction: 'Welche Rolle hat its.bw in dieser Beziehung?',
          targets: [
            { id: 'trusted', label: 'Trusted / vertraute Domäne' },
            { id: 'trusting', label: 'Trusting / vertrauende Domäne', description: 'Ausgehend = vertrauend' },
          ],
          correctTarget: 'trusting',
          feedbackWrong: 'Wer ausgehend vertraut, ist die trusting Domain.',
          feedbackCorrect: 'Richtig: its.bw ist trusting.',
        },
        {
          id: 'ad-trusts-dir-step-resource-direction',
          kind: 'decision',
          screen: { title: 'Ressourcenzugriff', subtitle: 'Mögliche Richtung' },
          instruction: 'Von welcher Domäne können Benutzer für Ressourcen in its.bw berechtigt werden?',
          targets: [
            { id: 'its', label: 'its.bw selbst' },
            { id: 'ausbildung', label: 'ausbildung.its.bw', description: 'Trusted Domain stellt Identitäten bereit' },
            { id: 'both', label: 'Beide automatisch' },
          ],
          correctTarget: 'ausbildung',
          feedbackWrong: 'Die trusted Domain liefert Identitäten, die die trusting Domain für ihre Ressourcen berechtigen kann.',
          feedbackCorrect: 'Richtig: Benutzer aus ausbildung.its.bw können für Ressourcen in its.bw berechtigt werden.',
        },
      ],
    },
  ];

  const quiz = [
    { question: 'Was ermöglicht eine Vertrauensstellung in AD?', options: ['Automatischen Vollzugriff', 'Das Akzeptieren von Identitäten einer anderen Domäne', 'Das Kopieren von Benutzerkonten', 'Das Löschen von Domänen'], correct: 1, explanation: 'Ein Trust ermöglicht Identitätsakzeptanz, nicht automatischen Zugriff.' },
    { question: 'A trusts B. Welche Domäne ist trusted?', options: ['A', 'B'], correct: 1, explanation: 'B ist die Domäne, der vertraut wird.' },
    { question: 'Aus Sicht von A: A trusts B. Welche Richtung zeigt A?', options: ['Incoming', 'Outgoing', 'Two-way', 'None'], correct: 1, explanation: 'A vertraut ausgehend B.' },
    { question: 'Was bedeutet ein bidirektionaler Trust?', options: ['Nur A vertraut B.', 'A und B vertrauen sich gegenseitig.', 'Alle Ressourcen sind freigegeben.', 'Es ist automatisch transitiv und erfordert keine Berechtigungen.'], correct: 1, explanation: 'Beide Richtungen existieren; Berechtigungen bleiben separat.' },
    { question: 'Was ist Transitivität bei Trusts?', options: ['Berechtigungen werden vererbt.', 'Vertrauenspfade können über Domänen hinweg gelten.', 'Trusts werden automatisch gelöscht.', 'Jeder Benutzer wird Administrator.'], correct: 1, explanation: 'Transitivität betrifft den Vertrauenspfad, nicht Berechtigungen.' },
    { question: 'Wie entsteht ein Parent-/Child-Trust typischerweise?', options: ['Manuell über den Assistenten', 'Automatisch beim Erstellen der Child Domain', 'Über DNS konfiguriert', 'Gar nicht'], correct: 1, explanation: 'AD richtet Parent-/Child-Trusts automatisch ein.' },
  ];

  const summary = [
    'Eine Vertrauensstellung ermöglicht das Akzeptieren von Identitäten aus einer anderen Domäne.',
    'Trust ≠ Berechtigung: Für Ressourcenzugriff braucht es zusätzliche Berechtigungen.',
    'A trusts B: A ist trusting, B ist trusted.',
    'Aus Sicht der vertrauenden Domäne ist der Trust outgoing; aus Sicht der vertrauten Domäne incoming.',
    'Bidirektional bedeutet: beide Domänen vertrauen sich gegenseitig.',
    'Transitivität erweitert den Vertrauenspfad, nicht die Berechtigungen auf Ressourcen.',
    'Parent-/Child-Trusts entstehen in einem Forest automatisch und sind bidirektional/transitiv.',
    'Trusts zeigt man in Active Directory-Domänen und -Vertrauensstellungen auf der Registerkarte Vertrauensstellungen an.',
    'Bei „Zugriff verweigert“ trotz funktionierendem Trust zuerst Berechtigungen prüfen.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
