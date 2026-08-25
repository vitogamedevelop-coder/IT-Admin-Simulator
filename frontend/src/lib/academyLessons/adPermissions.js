import { topicKey } from '../academyTopics.js';

export const AD_PERMISSIONS_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-permissions');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

export function buildAdPermissionsLesson() {
  const title = 'Berechtigungsverwaltung';

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

  const summary = [
    'Direkte Benutzerberechtigungen skalieren schlecht; Gruppen lösen das Problem.',
    'Least Privilege gibt nur die tatsächlich benötigten Rechte.',
    'Sicherheitsgruppen dienen der Berechtigungsvergabe, Verteilergruppen nicht.',
    'Gruppenbereiche: Global (Funktion), Domänenlokal (Ressource), Universal (übergreifend).',
    'A-G-DL-P: Account → G → DL → Permission.',
    'A-G-G-P: Account → G_F → G_P → Permission.',
    'Gruppenverschachtelung ermöglicht indirekte Berechtigungen.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}
