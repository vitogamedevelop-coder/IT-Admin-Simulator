import { topicKey } from '../academyTopics.js';

export const AD_PERMISSIONS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-permissions');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

export function buildAdPermissionsLesson() {
  const title = 'Gruppen & Berechtigungsverwaltung';

  const explanations = [
    explanation('adp-problem', 'Das Ausgangsproblem', 'classic', [
      { type: 'text', content: 'Benutzer sollen gemeinsam auf zentrale Daten zugreifen. Im Beispiel des Lehrgangs existiert die Freigabe Befehle. S1Offz hat Vollzugriff, S2Offz nur Lesen. Wenn Personen wechseln, müsste bei direkter Berechtigungsvergabe jede Ressource einzeln angepasst werden.' },
      { type: 'text', content: 'Das direkte Verrechten einzelner Benutzer skaliert schlecht. Gruppen lösen das Problem, indem Berechtigungen an Funktionen statt an Personen geknüpft werden.' },
      { type: 'question', question: 'Warum skalieren direkte Benutzerberechtigungen schlecht?', options: ['sie sind zu schnell', 'bei Personalwechsel muss jede Ressource einzeln angepasst werden', 'sie funktionieren nicht auf Freigaben', 'sie können nicht gelöscht werden'], correct: 1, explanation: 'Direkte Zuweisungen erfordern bei jeder Änderung viele manuelle Eingriffe.' },
    ]),

    explanation('adp-least-privilege', 'Least Privilege', 'classic', [
      { type: 'text', content: 'Least Privilege bedeutet, dass Benutzer, Computer und Dienste nur die Rechte erhalten, die sie für ihre Aufgabe benötigen. Dieser Grundsatz ist zentral, um unnötigen Zugriff zu vermeiden.' },
      { type: 'question', question: 'Was bedeutet Least Privilege?', options: ['maximale Rechte für alle', 'nur die Rechte, die tatsächlich benötigt werden', 'keine Rechte für Administratoren', 'automatischer Vollzugriff'], correct: 1, explanation: 'Least Privilege gibt nur die tatsächlich benötigten Rechte.' },
    ]),

    explanation('adp-gruppentypen', 'Gruppentypen', 'classic', [
      { type: 'text', content: 'Active Directory unterscheidet zwischen Sicherheitsgruppen und Verteilergruppen. Sicherheitsgruppen werden für Berechtigungen und Ressourcenzugriff verwendet. Verteilergruppen dienen der Verteilung, typischerweise für E-Mail, und sind nicht für Zugriffsberechtigungen vorgesehen.' },
      { type: 'question', question: 'Welcher Gruppentyp darf für Berechtigungen verwendet werden?', options: ['Sicherheitsgruppe', 'Verteilergruppe', 'E-Mail-Gruppe', 'Postfachgruppe'], correct: 0, explanation: 'Sicherheitsgruppen können für Berechtigungen und Zugriff genutzt werden.' },
    ]),

    explanation('adp-bereiche', 'Gruppenbereiche', 'classic', [
      { type: 'text', content: 'Der Lehrgang unterscheidet drei Gruppenbereiche: Global, Domänenlokal und Universal. Der Gruppenbereich bestimmt, wo die Gruppe für Berechtigungen verwendet werden kann und welche Objekte/Gruppen Mitglied sein dürfen. Eine Gruppe greift nicht eigenständig auf Ressourcen zu; Berechtigungen müssen explizit vergeben werden.' },
      { type: 'table', headers: ['Bereich', 'Hauptverwendung im Lehrgang'], rows: [
        ['Global', 'Funktionsgruppe für Benutzer/Computer derselben Domäne'],
        ['Domänenlokal', 'Berechtigungsgruppe für Ressourcen einer Domäne'],
        ['Universal', 'übergreifende Gruppenstrukturen in mehreren Domänen'],
      ] },
      { type: 'question', question: 'Welche Gruppe dient typischerweise als Berechtigungsgruppe für Ressourcen?', options: ['Global', 'Domänenlokal', 'Universal', 'Verteiler'], correct: 1, explanation: 'Domänenlokale Gruppen werden für Berechtigungen auf Ressourcen einer Domäne verwendet.' },
    ]),

    explanation('adp-verschachtelung', 'Gruppenverschachtelung', 'classic', [
      { type: 'text', content: 'Eine Gruppe kann Mitglied einer anderen Gruppe sein. Dadurch erhalten die Mitglieder indirekt die Berechtigungen, die der übergeordneten Gruppe zugewiesen wurden. Der Zugriff entsteht über die Gruppenmitgliedschaft des Sicherheitsprinzipals und die Berechtigungszuweisung auf der Ressource.' },
      { type: 'question', question: 'Wie entsteht ein indirekter Zugriff über Gruppen?', options: ['durch automatische Rechtevererbung', 'durch Gruppenmitgliedschaft und zugewiesene Berechtigung', 'durch magische Gruppen', 'durch den Computernamen'], correct: 1, explanation: 'Mitgliedschaft + Berechtigungszuweisung = effektiver Zugriff.' },
    ]),

    explanation('adp-agdlp', 'A-G-DL-P', 'classic', [
      { type: 'text', content: 'A-G-DL-P ist eine Gruppenstrategie: Account → globale Funktionsgruppe → domänenlokale Berechtigungsgruppe → Permission. NTFS-Rechte werden der domänenlokalen Berechtigungsgruppe zugewiesen.' },
      { type: 'table', headers: ['Buchstabe', 'Bedeutung', 'Lehrgangsbeispiel'], rows: [
        ['A', 'Account', 'S1Offz'],
        ['G', 'globale Gruppe', 'G_Stab'],
        ['DL', 'domänenlokale Gruppe', 'DL_Befehle_VZ'],
        ['P', 'Permission', 'Vollzugriff auf Befehle'],
      ] },
      { type: 'text', content: 'Lehrgangsregel: In G-Gruppen befinden sich Benutzer. In DL-Berechtigungsgruppen befinden sich G-Gruppen. NTFS-Rechte werden den DL-Gruppen zugeordnet.' },
      { type: 'text', content: 'Technisch gilt: AD erlaubt weitere Mitgliedschaftskombinationen, aber für den Lehrgangsfluss und die Prüfung wird diese Designregel verwendet.' },
      { type: 'question', question: 'Welche Gruppe erhält im A-G-DL-P-Modell die NTFS-Berechtigung?', options: ['G_Stab', 'DL_Befehle_VZ', 'S1Offz', 'G_Befehle_VZ'], correct: 1, explanation: 'Die domänenlokale Gruppe erhält die Berechtigung auf der Ressource.' },
    ]),

    explanation('adp-aggp', 'A-G-G-P', 'classic', [
      { type: 'text', content: 'A-G-G-P ist eine alternative Strategie: Account → globale Funktionsgruppe → globale Berechtigungsgruppe → Permission. NTFS-Rechte werden hier der globalen Berechtigungsgruppe zugewiesen.' },
      { type: 'table', headers: ['Buchstabe', 'Bedeutung', 'Lehrgangsbeispiel'], rows: [
        ['A', 'Account', 'S1Offz'],
        ['G', 'globale Funktionsgruppe', 'G_F_Stab'],
        ['G', 'globale Berechtigungsgruppe', 'G_P_Befehle_VZ'],
        ['P', 'Permission', 'Vollzugriff auf Befehle'],
      ] },
      { type: 'text', content: 'Der Lehrgang begründet A-G-G-P unter anderem mit einem Gruppen-Overhead-Vergleich. Diese Begründung wird hier nicht als allgemeingültige Microsoft-Regel dargestellt, sondern als Lehrgangshinweis behandelt. Technisch handelt es sich um ein anderes Verschachtelungsmodell.' },
      { type: 'question', question: 'Wofür steht das letzte G in A-G-G-P?', options: ['Globale Funktionsgruppe', 'Globale Berechtigungsgruppe', 'Globale Verteilergruppe', 'Globale Domäne'], correct: 1, explanation: 'Das zweite G ist die globale Berechtigungsgruppe (Permission-Gruppe).' },
    ]),

    explanation('adp-transfer', 'Praxistransfer', 'classic', [
      { type: 'text', content: 'Stelle dir vor, S1Fw kommt neu zum Stab. Im A-G-DL-P-Modell muss der Administrator nur S1Fw in G_Stab aufnehmen. Die Ressource Befehle muss nicht neu verrechtet werden.' },
      { type: 'question', question: 'Was muss geändert werden, wenn ein neuer Mitarbeiter derselben Funktion beitritt?', options: ['jeden ACL-Eintrag', 'nur die Gruppenmitgliedschaft', 'den Computernamen', 'den UNC-Pfad'], correct: 1, explanation: 'Nur die Mitgliedschaft in der Funktionsgruppe muss ergänzt werden.' },
    ]),
  ];

  const quiz = [
    { question: 'Was ist der Grundsatz von Least Privilege?', options: ['maximale Rechte', 'nur notwendige Rechte', 'keine Rechte', 'automatische Vollzugriffe'], correct: 1, explanation: 'Jeder erhält nur die für die Aufgabe benötigten Rechte.' },
    { question: 'Welche Gruppe dient der E-Mail-Verteilung und nicht der Berechtigungsvergabe?', options: ['Sicherheitsgruppe', 'Verteilergruppe', 'Domänenlokale Gruppe', 'Globale Gruppe'], correct: 1, explanation: 'Verteilergruppen sind für Verteilung, nicht für Zugriff.' },
    { question: 'Wofür steht DL in A-G-DL-P?', options: ['Distribution Link', 'Domänenlokale Gruppe', 'Dynamic List', 'Domain Leader'], correct: 1, explanation: 'DL steht für domänenlokale Gruppe.' },
    { question: 'Welche Gruppe erhält im A-G-DL-P-Modell die NTFS-Berechtigung?', options: ['Account', 'globale Gruppe', 'domänenlokale Gruppe', 'Verteilergruppe'], correct: 2, explanation: 'Die domänenlokale Gruppe bekommt die Berechtigung auf der Ressource.' },
    { question: 'Wofür steht das zweite G in A-G-G-P?', options: ['Funktionsgruppe', 'Berechtigungsgruppe', 'Verteilergruppe', 'Domänenlokale Gruppe'], correct: 1, explanation: 'Das zweite G ist die globale Berechtigungsgruppe.' },
    { question: 'Was passiert bei Personalwechsel im Gruppenmodell?', options: ['jede Ressource neu verrechten', 'nur Gruppenmitgliedschaft anpassen', 'Computer neu aufsetzen', 'Domäne neu erstellen'], correct: 1, explanation: 'Im Gruppenmodell ändert man hauptsächlich die Gruppenmitgliedschaft.' },
  ];

function buildExercises() {
  return [
    {
      id: 'adp-ex-direct-vs-group',
      type: 'select-best',
      question: '20 Mitarbeiter derselben Abteilung benötigen Leserechte auf dieselben 8 Ordner. Was ist der sinnvollste administrative Ansatz?',
      options: ['Jeden Mitarbeiter einzeln auf jedem Ordner berechtigen', 'Mitarbeiter in eine Funktionsgruppe organisieren und Berechtigungen über Gruppenstruktur vergeben', 'Allen automatisch Vollzugriff geben', 'Jeden Ordner auf einem einzelnen PC speichern'],
      correct: 1,
      explanation: 'Gruppenmodelle reduzieren den Verwaltungsaufwand erheblich: Mitgliedschaften ändern sich, Ressourcenberechtigungen bleiben.',
    },
    {
      id: 'adp-ex-group-type',
      type: 'select-best',
      question: 'Eine Gruppe soll Zugriff auf einen SMB-Ordner erhalten. Welche Gruppenart ist dafür vorgesehen?',
      options: ['Verteilergruppe', 'Sicherheitsgruppe', 'Universelle Gruppe', 'Globale Gruppe'],
      correct: 1,
      explanation: 'Sicherheitsgruppen werden für Berechtigungen und Ressourcenzugriff verwendet. Verteilergruppen dienen der Adressierung.',
    },
    {
      id: 'adp-ex-least-privilege',
      type: 'select-best',
      question: 'Ein Sachbearbeiter muss in einem Ordner Dateien lesen und ändern, aber nicht löschen. Was wäre im Sinne von Least Privilege passend?',
      options: ['Vollzugriff', 'Ändern', 'Lesen', 'Verweigern'],
      correct: 1,
      explanation: 'Least Privilege bedeutet: nur die Rechte vergeben, die tatsächlich benötigt werden. Ändern reicht, wenn Löschen nicht nötig ist.',
    },
    {
      id: 'adp-ex-global-role',
      type: 'select-best',
      question: 'Alle Mitarbeiter des Stabs sollen unabhängig von konkreter Ressource als organisatorische Rolle zusammengefasst werden. Beste Wahl?',
      options: ['Domänenlokale Gruppe', 'Globale Gruppe', 'Universelle Gruppe', 'Verteilergruppe'],
      correct: 1,
      explanation: 'Globale Gruppen eignen sich besonders, um Benutzer mit gleicher Funktion innerhalb einer Domäne zu organisieren.',
    },
    {
      id: 'adp-ex-domain-local-role',
      type: 'select-best',
      question: 'Für den Ordner "Befehle" wird eine Gruppe benötigt, die das Recht "Ändern" repräsentiert. Klassische AGDLP-Antwort?',
      options: ['G_Stab', 'DL_Befehle_AE', 'Universal_Befehle_L', 'G_Befehle_AE'],
      correct: 1,
      explanation: 'Domänenlokale Gruppen dienen im AGDLP-Modell als Berechtigungsgruppen für Ressourcen.',
    },
    {
      id: 'adp-ex-scope-misconception',
      type: 'select-best',
      question: '"Eine globale Gruppe hat automatisch Zugriff auf alle Ressourcen der Gesamtstruktur." Stimmt das?',
      options: ['Ja, weil sie global ist', 'Nein, der Bereich allein gibt keine Berechtigung', 'Nur, wenn sie universell ist', 'Ja, aber nur für Domänen-Admins'],
      correct: 1,
      explanation: 'Gruppenbereich bestimmt nicht automatisch einen Zugriffsrecht. Zugriff entsteht erst durch Berechtigungszuweisung auf der Ressource.',
    },
    {
      id: 'adp-ex-agdlp-ordering',
      type: 'ordering',
      question: 'Bringe die A-G-DL-P-Kette in die korrekte Reihenfolge.',
      items: [
        { id: 'a', label: 'Account' },
        { id: 'g', label: 'Globale Gruppe' },
        { id: 'dl', label: 'Domänenlokale Gruppe' },
        { id: 'p', label: 'Permission' },
      ],
      correctOrder: ['a', 'g', 'dl', 'p'],
      explanation: 'A-G-DL-P: Account → globale Funktionsgruppe → domänenlokale Berechtigungsgruppe → Permission.',
    },
    {
      id: 'adp-ex-aggp-chain',
      type: 'select-best',
      question: 'A-G-G-P unterscheidet sich von A-G-DL-P vor allem dadurch, dass ...',
      options: ['zwei globale Gruppenebenen verwendet werden', 'nur domänenlokale Gruppen erlaubt sind', 'Berechtigungen an Accounts direkt vergeben werden', 'Verteilergruppen eingesetzt werden'],
      correct: 0,
      explanation: 'A-G-G-P nutzt eine globale Funktionsgruppe und eine globale Berechtigungsgruppe; A-G-DL-P setzt auf domänenlokale Berechtigungsgruppen.',
    },
    {
      id: 'adp-ex-nesting',
      type: 'select-best',
      question: 'Wie entsteht ein indirekter Zugriff durch Gruppenverschachtelung?',
      options: ['Automatisch, sobald eine Gruppe existiert', 'Wenn Gruppe A Mitglied von Gruppe B ist und Gruppe B an einer Ressource berechtigt wurde', 'Durch den Computernamen', 'Nur für Universalgruppen'],
      correct: 1,
      explanation: 'Verschachtelte Gruppen geben effektive Berechtigungen weiter, wenn die übergeordnete Gruppe tatsächlich an einer Ressource berechtigt wurde.',
    },
    {
      id: 'adp-ex-personnel-change',
      type: 'select-best',
      question: 'Lisa verlässt den Stab, Tom übernimmt. Was muss im AGDLP-Modell geändert werden?',
      options: ['Jeder Ordner muss neu verrechtet werden', 'Lisa aus G_Stab entfernen und Tom in G_Stab aufnehmen', 'Neue DL-Gruppen anlegen', 'Domäne migrieren'],
      correct: 1,
      explanation: 'Der Vorteil des Gruppenmodells: Funktionswechsel = Mitgliedschaftswechsel. Ressourcenberechtigungen bleiben unverändert.',
    },
    {
      id: 'adp-ex-naming',
      type: 'select-best',
      question: 'Welche Gruppe folgt dem Lehrgangsnamensschema für eine domänenlokale Berechtigungsgruppe mit Leserecht auf den Ordner "Befehle"?',
      options: ['G_Stab', 'DL_Befehle_L', 'G_F_Befehle', 'DL_Stab_VZ'],
      correct: 1,
      explanation: 'DL_Befehle_L entspricht dem Muster DL_<Freigabe>_<Recht>; L steht für Lesen.',
    },
    {
      id: 'adp-ex-universal',
      type: 'select-best',
      question: 'Wann sind universelle Gruppen besonders relevant?',
      options: ['Nur für E-Mail-Verteiler', 'Bei domänenübergreifenden Strukturen innerhalb einer Gesamtstruktur', 'Wenn eine Gruppe automatisch alle Ressourcen erhält', 'Nur für lokale Arbeitsplatzfreigaben'],
      correct: 1,
      explanation: 'Universelle Gruppen sind sinnvoll, wenn Mitglieder oder Gruppen aus verschiedenen Domänen derselben Gesamtstruktur zusammengefasst werden müssen.',
    },
    {
      id: 'adp-ex-aggp-build',
      type: 'select-best',
      question: 'Lisa → G_F_Stab → G_P_Befehle_L → Lesen. Welches Modell zeigt diese Kette?',
      options: ['A-G-DL-P', 'A-G-G-P', 'A-G-U-DL-P', 'Direktberechtigung'],
      correct: 1,
      explanation: 'A-G-G-P verwendet eine globale Funktionsgruppe (G_F_) und eine globale Berechtigungsgruppe (G_P_).',
    },
    {
      id: 'adp-ex-naming-function',
      type: 'matching',
      question: 'Ordne die Gruppenbenennung ihrer Rolle im Modell zu.',
      pairs: [
        { left: 'G_Stab', right: 'Globale Funktionsgruppe' },
        { left: 'DL_Befehle_VZ', right: 'Domänenlokale Berechtigungsgruppe' },
        { left: 'G_P_Befehle_AE', right: 'Globale Berechtigungsgruppe (A-G-G-P)' },
      ],
      explanation: 'G_ markiert Funktionsgruppen; DL_ domänenlokale Berechtigungsgruppen; G_P_ globale Berechtigungsgruppen im A-G-G-P-Modell.',
    },
  ];
}

  const summary = [
    'Direkte Benutzerberechtigungen skalieren schlecht; Gruppen lösen das Problem.',
    'Least Privilege gibt nur die tatsächlich benötigten Rechte.',
    'Sicherheitsgruppen dienen der Berechtigungsvergabe, Verteilergruppen nicht.',
    'Gruppenbereiche: Global (Funktion), Domänenlokal (Ressource), Universal (übergreifend).',
    'A-G-DL-P: Account → G → DL → Permission.',
    'A-G-G-P: Account → G_F → G_P → Permission.',
    'Gruppenverschachtelung ermöglicht indirekte Berechtigungen.',
  ];

  const exercises = buildExercises();
  return { title, explanations, exercises, quiz, summary };
}
