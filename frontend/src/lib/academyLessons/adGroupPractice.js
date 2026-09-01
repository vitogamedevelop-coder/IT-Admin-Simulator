import { topicKey } from '../academyTopics.js';

export const AD_GROUP_PRACTICE_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-group-practice');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

export function buildAdGroupPracticeLesson() {
  const title = 'Gruppen praktisch anlegen & verschachteln';

  const explanations = [
    explanation('adg-recap', 'Kurze Wiederholung', 'classic', [
      { type: 'text', content: 'Bevor wir Gruppen in Active Directory anlegen, wiederholen wir die Rollen: Eine Funktionsgruppe sammelt Benutzer nach Aufgabe, eine Berechtigungsgruppe wird an einer Ressource berechtigt. Sicherheitsgruppen werden für Berechtigungen genutzt, Verteilergruppen nicht.' },
      { type: 'question', question: 'Welche Gruppenart wird für Ressourcenberechtigungen verwendet?', options: ['Verteilergruppe', 'Sicherheitsgruppe', 'Kontaktgruppe', 'Mail-Gruppe'], correct: 1, explanation: 'Sicherheitsgruppen können für Berechtigungen und Ressourcenzugriff verwendet werden.' },
    ]),

    explanation('adg-functional-vs-permission', 'Funktionsgruppe vs. Berechtigungsgruppe', 'classic', [
      { type: 'text', content: 'Funktionsgruppen beschreiben die Rolle eines Benutzers im Unternehmen, zum Beispiel G_Stab. Berechtigungsgruppen repräsentieren das Recht auf einer Ressource, zum Beispiel DL_Befehle_L für Lesen oder DL_Befehle_AE für Ändern.' },
      { type: 'question', question: 'Was beschreibt eine Funktionsgruppe?', options: ['Das Recht auf einer Ressource', 'Die Rolle oder Aufgabe eines Benutzers', 'Den Computernamen', 'Den Domänennamen'], correct: 1, explanation: 'Funktionsgruppen sammeln Benutzer nach ihrer Rolle.' },
    ]),

    explanation('adg-scope-recap', 'Gruppenbereiche: Global und Domänenlokal', 'classic', [
      { type: 'text', content: 'Globale Gruppen eignen sich für Funktionen innerhalb einer Domäne. Domänenlokale Gruppen eignen sich, um Berechtigungen auf Ressourcen derselben Domäne zu vergeben. Wir verschachteln: Benutzer landen in der globalen Funktionsgruppe; die globale Funktionsgruppe wird Mitglied der domänenlokalen Berechtigungsgruppe.' },
      { type: 'question', question: 'Welchem Zweck dient typischerweise eine domänenlokale Gruppe?', options: ['Funktionszusammenfassung von Benutzern', 'Berechtigungen auf Ressourcen einer Domäne', 'E-Mail-Verteilung', 'Computer-Organisation'], correct: 1, explanation: 'Domänenlokale Gruppen werden als Berechtigungsgruppen für Ressourcen einer Domäne verwendet.' },
    ]),

    explanation('adg-aduc-recap', 'ADUC für Gruppen', 'classic', [
      { type: 'text', content: 'Active Directory Users and Computers (ADUC) ist das Verwaltungswerkzeug, in dem du Gruppen anlegst, Benutzer zu Gruppen hinzufügst und Gruppen verschachtelst. Wichtige Tabs sind: General, Members und Member Of.' },
      { type: 'question', question: 'In welchem Tab fügst du Benutzer zu einer Gruppe hinzu?', options: ['General', 'Members', 'Member Of', 'Scope'], correct: 1, explanation: 'Der Tab Members zeigt und verwaltet Mitglieder der Gruppe.' },
    ]),
  ];

  const exercises = [
    {
      id: 'adg-guided-create-global',
      type: 'guided-ui',
      title: 'Globale Funktionsgruppe erstellen',
      question: 'Erstelle im ADUC die globale Sicherheitsgruppe G_Stab.',
      explanation: 'ADUC öffnen → OU wählen → New → Group → Name G_Stab → Gruppenbereich Global → Sicherheitsgruppe.',
      intro: 'Eine Funktionsgruppe sammelt alle Stabsmitarbeiter. Der Gruppenbereich ist Global, weil es um Benutzer derselben Domäne geht.',
      steps: [
        {
          id: 'adg-create-global-start',
          kind: 'navigation',
          screen: { title: 'ADUC', subtitle: 'Neue Gruppe anlegen' },
          instruction: 'Wie beginnst du das Anlegen einer neuen Gruppe?',
          targets: [
            { id: 'new', label: 'New', description: 'Neues Objekt anlegen' },
            { id: 'delete', label: 'Delete', description: 'Objekt löschen' },
            { id: 'properties', label: 'Properties', description: 'Eigenschaften öffnen' },
          ],
          correctTarget: 'new',
          feedbackWrong: 'New startet das Anlegen eines neuen AD-Objekts.',
          feedbackCorrect: 'Richtig: New.',
        },
        {
          id: 'adg-create-global-type',
          kind: 'navigation',
          screen: { title: 'New', subtitle: 'Objekttyp wählen' },
          instruction: 'Welchen Objekttyp willst du anlegen?',
          targets: [
            { id: 'user', label: 'User', description: 'Neuer Benutzer' },
            { id: 'group', label: 'Group', description: 'Neue Gruppe' },
            { id: 'computer', label: 'Computer', description: 'Neuer Computer' },
          ],
          correctTarget: 'group',
          feedbackWrong: 'Du benötigst eine Gruppe, keinen Benutzer oder Computer.',
          feedbackCorrect: 'Richtig: Group.',
        },
        {
          id: 'adg-create-global-name',
          kind: 'decision',
          screen: { title: 'New Object - Group', subtitle: 'Gruppenname' },
          instruction: 'Welcher Name passt für eine globale Funktionsgruppe des Stabs?',
          targets: [
            { id: 'dl_befehle', label: 'DL_Befehle_AE', description: 'Das ist eine Berechtigungsgruppe' },
            { id: 'g_stab', label: 'G_Stab', description: 'Funktionsgruppe Stab' },
            { id: 'g_befehle', label: 'G_Befehle', description: 'Kein passendes Funktionspräfix' },
          ],
          correctTarget: 'g_stab',
          feedbackWrong: 'Funktionsgruppen werden nach ihrer Aufgabe benannt; G_Stab passt hier.',
          feedbackCorrect: 'Richtig: G_Stab.',
        },
        {
          id: 'adg-create-global-scope',
          kind: 'decision',
          screen: { title: 'New Object - Group', subtitle: 'Gruppenbereich' },
          instruction: 'Welchen Gruppenbereich wählst du für die Funktionsgruppe?',
          targets: [
            { id: 'domain_local', label: 'Domain local', description: 'Für Berechtigungsgruppen' },
            { id: 'global', label: 'Global', description: 'Für Funktionsgruppen' },
            { id: 'universal', label: 'Universal', description: 'Domänenübergreifend' },
          ],
          correctTarget: 'global',
          feedbackWrong: 'Eine globale Funktionsgruppe erhält den Bereich Global.',
          feedbackCorrect: 'Richtig: Global.',
        },
      ],
    },

    {
      id: 'adg-guided-create-dl',
      type: 'guided-ui',
      title: 'Domänenlokale Berechtigungsgruppe erstellen',
      question: 'Erstelle die domänenlokale Berechtigungsgruppe DL_Befehle_AE.',
      explanation: 'ADUC → OU wählen → New → Group → Name DL_Befehle_AE → Gruppenbereich Domain local → Sicherheitsgruppe.',
      intro: 'DL_Befehle_AE repräsentiert das Recht Ändern auf dem Ordner Befehle. Der Bereich ist Domain local, weil die Ressource in derselben Domäne liegt.',
      steps: [
        {
          id: 'adg-create-dl-new',
          kind: 'navigation',
          screen: { title: 'ADUC', subtitle: 'Neues Objekt' },
          instruction: 'Wie legst du ein neues Objekt an?',
          targets: [
            { id: 'new', label: 'New' },
            { id: 'refresh', label: 'Refresh' },
            { id: 'find', label: 'Find' },
          ],
          correctTarget: 'new',
          feedbackWrong: 'New öffnet die Auswahl des neuen Objekts.',
          feedbackCorrect: 'Richtig: New.',
        },
        {
          id: 'adg-create-dl-type',
          kind: 'navigation',
          screen: { title: 'New', subtitle: 'Objekttyp' },
          instruction: 'Welchen Objekttyp wählst du?',
          targets: [
            { id: 'user', label: 'User' },
            { id: 'group', label: 'Group' },
            { id: 'ou', label: 'Organizational Unit' },
          ],
          correctTarget: 'group',
          feedbackWrong: 'Du benötigst eine Gruppe.',
          feedbackCorrect: 'Richtig: Group.',
        },
        {
          id: 'adg-create-dl-name',
          kind: 'decision',
          screen: { title: 'New Object - Group', subtitle: 'Gruppenname' },
          instruction: 'Welcher Name passt für eine Berechtigungsgruppe mit Ändern-Recht auf Befehle?',
          targets: [
            { id: 'g_stab', label: 'G_Stab', description: 'Funktionsgruppe' },
            { id: 'dl_befehle_ae', label: 'DL_Befehle_AE', description: 'Domänenlokal, Ressource Befehle, Recht Ändern' },
            { id: 'dl_befehle_l', label: 'DL_Befehle_L', description: 'Lesen, nicht Ändern' },
          ],
          correctTarget: 'dl_befehle_ae',
          feedbackWrong: 'DL_Befehle_AE steht für Domain local, Befehle, Ändern.',
          feedbackCorrect: 'Richtig: DL_Befehle_AE.',
        },
        {
          id: 'adg-create-dl-scope',
          kind: 'decision',
          screen: { title: 'New Object - Group', subtitle: 'Gruppenbereich' },
          instruction: 'Welchen Gruppenbereich wählst du für die Berechtigungsgruppe?',
          targets: [
            { id: 'global', label: 'Global', description: 'Funktionsgruppe' },
            { id: 'domain_local', label: 'Domain local', description: 'Berechtigungsgruppe' },
            { id: 'universal', label: 'Universal', description: 'Multi-Domain' },
          ],
          correctTarget: 'domain_local',
          feedbackWrong: 'Berechtigungsgruppen für Ressourcen einer Domäne erhalten Domain local.',
          feedbackCorrect: 'Richtig: Domain local.',
        },
      ],
    },

    {
      id: 'adg-guided-add-member',
      type: 'guided-ui',
      title: 'Benutzer zur globalen Gruppe hinzufügen',
      question: 'Füge S1Offz als Mitglied zu G_Stab hinzu.',
      explanation: 'G_Stab → Eigenschaften → Tab Members → Add → S1Offz eingeben → Check Names → OK.',
      intro: 'Benutzer werden nicht direkt in die Berechtigungsgruppe, sondern in die Funktionsgruppe aufgenommen.',
      steps: [
        {
          id: 'adg-add-member-open',
          kind: 'navigation',
          screen: { title: 'ADUC', subtitle: 'Gruppe öffnen' },
          instruction: 'Wie öffnest du die Eigenschaften der Gruppe G_Stab?',
          targets: [
            { id: 'double_click', label: 'Doppelklick', description: 'Gruppe öffnen' },
            { id: 'right_click', label: 'Rechtsklick → Properties', description: 'Kontextmenü' },
            { id: 'delete', label: 'Delete', description: 'Löschen' },
          ],
          correctTarget: 'right_click',
          feedbackWrong: 'Properties öffnet die Eigenschaften der Gruppe.',
          feedbackCorrect: 'Richtig: Rechtsklick → Properties.',
        },
        {
          id: 'adg-add-member-tab',
          kind: 'navigation',
          screen: { title: 'G_Stab Properties', subtitle: 'Tab wählen' },
          instruction: 'In welchem Tab verwaltest du Mitglieder der Gruppe?',
          targets: [
            { id: 'general', label: 'General' },
            { id: 'members', label: 'Members', description: 'Mitglieder der Gruppe' },
            { id: 'member_of', label: 'Member Of', description: 'Gruppenmitgliedschaften der Gruppe' },
          ],
          correctTarget: 'members',
          feedbackWrong: 'Members zeigt und verwaltet die Mitglieder der Gruppe.',
          feedbackCorrect: 'Richtig: Members.',
        },
        {
          id: 'adg-add-member-action',
          kind: 'navigation',
          screen: { title: 'G_Stab - Members', subtitle: 'Mitglied hinzufügen' },
          instruction: 'Wie fügst du ein neues Mitglied hinzu?',
          targets: [
            { id: 'add', label: 'Add', description: 'Mitglied hinzufügen' },
            { id: 'remove', label: 'Remove', description: 'Mitglied entfernen' },
            { id: 'properties', label: 'Properties', description: 'Eigenschaften' },
          ],
          correctTarget: 'add',
          feedbackWrong: 'Add öffnet die Auswahl des neuen Mitglieds.',
          feedbackCorrect: 'Richtig: Add.',
        },
        {
          id: 'adg-add-member-user',
          kind: 'decision',
          screen: { title: 'Select Users, Contacts, Computers or Groups', subtitle: 'Benutzer auswählen' },
          instruction: 'Wen fügst du der Gruppe hinzu?',
          targets: [
            { id: 'dl_befehle', label: 'DL_Befehle_AE', description: 'Berechtigungsgruppe' },
            { id: 's1offz', label: 'S1Offz', description: 'Benutzer' },
            { id: 'g_stab', label: 'G_Stab', description: 'Die Gruppe selbst' },
          ],
          correctTarget: 's1offz',
          feedbackWrong: 'S1Offz ist der Benutzer, der der Funktionsgruppe zugeordnet werden soll.',
          feedbackCorrect: 'Richtig: S1Offz.',
        },
      ],
    },

    {
      id: 'adg-guided-nest',
      type: 'guided-ui',
      title: 'Globale Gruppe in DL-Gruppe verschachteln',
      question: 'Füge G_Stab als Mitglied in DL_Befehle_AE ein.',
      explanation: 'DL_Befehle_AE → Properties → Tab Members → Add → G_Stab eingeben → Check Names → OK. Damit erhält jeder Stab-Mitarbeiter indirekt das Ändern-Recht auf Befehle.',
      intro: 'Verschachtelung: G_Stab wird Mitglied von DL_Befehle_AE. Dadurch erben alle Stabsmitarbeiter die Berechtigung.',
      steps: [
        {
          id: 'adg-nest-target',
          kind: 'decision',
          screen: { title: 'ADUC', subtitle: 'Zielgruppe wählen' },
          instruction: 'In welcher Gruppe fügst du G_Stab als Mitglied hinzu?',
          targets: [
            { id: 'g_stab', label: 'G_Stab', description: 'Funktionsgruppe' },
            { id: 'dl_befehle_ae', label: 'DL_Befehle_AE', description: 'Berechtigungsgruppe' },
            { id: 's1offz', label: 'S1Offz', description: 'Benutzer' },
          ],
          correctTarget: 'dl_befehle_ae',
          feedbackWrong: 'G_Stab soll in die Berechtigungsgruppe DL_Befehle_AE eingefügt werden.',
          feedbackCorrect: 'Richtig: DL_Befehle_AE.',
        },
        {
          id: 'adg-nest-tab',
          kind: 'navigation',
          screen: { title: 'DL_Befehle_AE Properties', subtitle: 'Tab wählen' },
          instruction: 'In welchem Tab fügst du Mitglieder zur Gruppe hinzu?',
          targets: [
            { id: 'general', label: 'General' },
            { id: 'member_of', label: 'Member Of', description: 'Übergeordnete Gruppen' },
            { id: 'members', label: 'Members', description: 'Mitglieder der Gruppe' },
          ],
          correctTarget: 'members',
          feedbackWrong: 'Members fügt Mitglieder zur Gruppe hinzu; Member Of würde die Gruppe selbst in eine andere Gruppe einfügen.',
          feedbackCorrect: 'Richtig: Members.',
        },
        {
          id: 'adg-nest-add',
          kind: 'navigation',
          screen: { title: 'DL_Befehle_AE - Members', subtitle: 'Hinzufügen' },
          instruction: 'Wie fügst du ein neues Mitglied hinzu?',
          targets: [
            { id: 'remove', label: 'Remove' },
            { id: 'add', label: 'Add' },
            { id: 'ok', label: 'OK' },
          ],
          correctTarget: 'add',
          feedbackWrong: 'Add öffnet den Dialog zur Auswahl eines neuen Mitglieds.',
          feedbackCorrect: 'Richtig: Add.',
        },
        {
          id: 'adg-nest-member',
          kind: 'decision',
          screen: { title: 'Select Users, Contacts, Computers or Groups', subtitle: 'Gruppe auswählen' },
          instruction: 'Welches Objekt fügst du als Mitglied hinzu?',
          targets: [
            { id: 's1offz', label: 'S1Offz', description: 'Benutzer' },
            { id: 'g_stab', label: 'G_Stab', description: 'Funktionsgruppe' },
            { id: 'dl_befehle_ae', label: 'DL_Befehle_AE', description: 'Die Gruppe selbst' },
          ],
          correctTarget: 'g_stab',
          feedbackWrong: 'G_Stab ist die Funktionsgruppe, die in DL_Befehle_AE verschachtelt werden soll.',
          feedbackCorrect: 'Richtig: G_Stab.',
        },
      ],
    },

    {
      id: 'adg-admin-challenge',
      type: 'guided-ui',
      title: 'AGDLP-Admin-Challenge',
      question: 'Der Stab soll Leserecht auf den Ordner Befehle erhalten. Erstelle die passende Gruppenstruktur und verknüpfe alles.',
      explanation: 'AGDLP: S1Offz → G_Stab → DL_Befehle_L → Lesen auf Befehle. Dazu anlegen: G_Stab (Global), DL_Befehle_L (Domain local), S1Offz in G_Stab, G_Stab in DL_Befehle_L.',
      intro: 'In dieser Challenge legst du alle benötigten Gruppen an, fügst den Benutzer hinzu und verschachtelst. Keine panische Einzelberechtigungen.',
      steps: [
        {
          id: 'adg-challenge-step1',
          kind: 'decision',
          screen: { title: 'Schritt 1', subtitle: 'Funktionsgruppe anlegen' },
          instruction: 'Welche Gruppe legst du zuerst an, um Benutzer nach Funktion zu sammeln?',
          targets: [
            { id: 'dl_befehle_l', label: 'DL_Befehle_L', description: 'Berechtigungsgruppe' },
            { id: 'g_stab', label: 'G_Stab', description: 'Funktionsgruppe' },
            { id: 's1offz', label: 'S1Offz', description: 'Benutzer' },
          ],
          correctTarget: 'g_stab',
          feedbackWrong: 'Zuerst brauchst du eine Funktionsgruppe für die Stabsmitarbeiter.',
          feedbackCorrect: 'Richtig: G_Stab.',
        },
        {
          id: 'adg-challenge-step2',
          kind: 'decision',
          screen: { title: 'Schritt 2', subtitle: 'Berechtigungsgruppe anlegen' },
          instruction: 'Welche Gruppe repräsentiert das Lesen-Recht auf Befehle?',
          targets: [
            { id: 'g_stab', label: 'G_Stab' },
            { id: 'dl_befehle_l', label: 'DL_Befehle_L' },
            { id: 'dl_befehle_ae', label: 'DL_Befehle_AE' },
          ],
          correctTarget: 'dl_befehle_l',
          feedbackWrong: 'L steht für Lesen; die Gruppe muss domänenlokal sein.',
          feedbackCorrect: 'Richtig: DL_Befehle_L.',
        },
        {
          id: 'adg-challenge-step3',
          kind: 'decision',
          screen: { title: 'Schritt 3', subtitle: 'Mitgliedschaft' },
          instruction: 'Wen fügst du in G_Stab ein?',
          targets: [
            { id: 'dl_befehle_l', label: 'DL_Befehle_L' },
            { id: 's1offz', label: 'S1Offz' },
            { id: 'g_stab', label: 'G_Stab' },
          ],
          correctTarget: 's1offz',
          feedbackWrong: 'S1Offz ist der Benutzer, der der Funktionsgruppe zugeordnet wird.',
          feedbackCorrect: 'Richtig: S1Offz.',
        },
        {
          id: 'adg-challenge-step4',
          kind: 'decision',
          screen: { title: 'Schritt 4', subtitle: 'Verschachtelung' },
          instruction: 'Wo fügst du G_Stab als Mitglied ein, damit alle Stabsmitarbeiter lesen dürfen?',
          targets: [
            { id: 's1offz', label: 'S1Offz' },
            { id: 'dl_befehle_l', label: 'DL_Befehle_L' },
            { id: 'g_stab', label: 'G_Stab' },
          ],
          correctTarget: 'dl_befehle_l',
          feedbackWrong: 'G_Stab muss Mitglied der Berechtigungsgruppe DL_Befehle_L werden.',
          feedbackCorrect: 'Richtig: DL_Befehle_L.',
        },
        {
          id: 'adg-challenge-step5',
          kind: 'decision',
          screen: { title: 'Schritt 5', subtitle: 'Berechtigung vergeben' },
          instruction: 'Welches Recht erhält DL_Befehle_L auf dem Ordner Befehle?',
          targets: [
            { id: 'vollzugriff', label: 'Vollzugriff' },
            { id: 'aendern', label: 'Ändern' },
            { id: 'lesen', label: 'Lesen' },
          ],
          correctTarget: 'lesen',
          feedbackWrong: 'Die Aufgabe verlangt Leserecht, nicht Ändern oder Vollzugriff.',
          feedbackCorrect: 'Richtig: Lesen.',
        },
      ],
    },

    {
      id: 'adg-trouble-scope',
      type: 'select-best',
      question: 'Ein Administrator legt G_Stab als Domain local an. Was ist der wahrscheinlichste Nachteil für den AGDLP-Fluss?',
      options: ['Funktionsgruppen sollten in der Regel Global sein, damit sie Benutzer klar nach Funktion organisieren', 'Domain local funktioniert nie', 'Benutzer können keine Domain local-Gruppen verwenden', 'Globale Gruppen sind schneller'],
      correct: 0,
      explanation: 'Der Gruppenbereich sollte zur Rolle passen: Funktionsgruppen typischerweise Global, Berechtigungsgruppen Domain local.',
    },
    {
      id: 'adg-trouble-ou',
      type: 'select-best',
      question: 'Eine Gruppe wird versehentlich in einer falschen OU angelegt. Was ist das konkrete Problem?',
      options: ['Die Gruppe funktioniert technisch trotzdem, ist aber schlecht auffindbar und wird vergessen', 'Die Gruppe verliert sofort alle Mitglieder', 'Die Gruppe ist automatisch universal', 'Active Directory verweigert den Zugriff'],
      correct: 0,
      explanation: 'Eine falsche OU führt nicht zwingend zu Fehlfunktionen, macht die Verwaltung aber unübersichtlich.',
    },
    {
      id: 'adg-trouble-direct-dl',
      type: 'select-best',
      question: 'Ein Administrator fügt S1Offz direkt in DL_Befehle_AE ein, statt über G_Stab. Was folgt?',
      options: ['Es funktioniert technisch, skaliert aber schlecht und durchbricht das AGDLP-Modell', 'Active Directory verbietet das', 'S1Offz erhält kein Recht', 'Die Gruppe G_Stab wird gelöscht'],
      correct: 0,
      explanation: 'Direkte Benutzer in Berechtigungsgruppen sind möglich, aber schlecht wartbar und nicht im AGDLP-Sinne.',
    },
    {
      id: 'adg-trouble-members-vs-memberof',
      type: 'select-best',
      question: 'Wo siehst du, WELCHE BENUTZER und GRUPPEN in der aktuellen Gruppe enthalten sind?',
      options: ['Im Tab General', 'Im Tab Members', 'Im Tab Member Of', 'Im Tab Scope'],
      correct: 1,
      explanation: 'Members zeigt Mitglieder der Gruppe; Member Of zeigt, in welchen Gruppen die aktuelle Gruppe selbst Mitglied ist.',
    },
    {
      id: 'adg-trouble-wrong-permission-group',
      type: 'select-best',
      question: 'G_Stab soll Leserecht auf Befehle bekommen, wird aber versehentlich Mitglied von DL_Befehle_AE. Was passiert?',
      options: ['Alle Stabsmitarbeiter dürfen nur Lesen', 'Alle Stabsmitarbeiter dürfen Ändern', 'Sie dürfen nichts', 'Es gibt eine Fehlermeldung'],
      correct: 1,
      explanation: 'DL_Befehle_AE steht für Ändern. Fälschlicherweise erhalten die Stabsmitarbeiter dadurch zu viele Rechte.',
    },
  ];

  const quiz = [
    { question: 'Welche Gruppenart wird für Ressourcenberechtigungen genutzt?', options: ['Verteilergruppe', 'Sicherheitsgruppe', 'E-Mail-Gruppe', 'Warteschlangengruppe'], correct: 1, explanation: 'Sicherheitsgruppen können für Berechtigungen verwendet werden.' },
    { question: 'Welchen Gruppenbereich wählt man typischerweise für eine Funktionsgruppe?', options: ['Global', 'Domain local', 'Universal', 'Verteiler'], correct: 0, explanation: 'Funktionsgruppen mit Benutzern derselben Domäne erhalten typischerweise Global.' },
    { question: 'Welchen Gruppenbereich wählt man typischerweise für eine Berechtigungsgruppe?', options: ['Global', 'Domain local', 'Universal', 'Verteiler'], correct: 1, explanation: 'Domänenlokale Gruppen werden für Berechtigungen auf Ressourcen einer Domäne genutzt.' },
    { question: 'In welchem Tab fügst du Benutzer zur aktuellen Gruppe hinzu?', options: ['General', 'Members', 'Member Of', 'Scope'], correct: 1, explanation: 'Members zeigt Mitglieder der Gruppe.' },
    { question: 'Wozu dient der Tab Member Of?', options: ['Mitglieder der Gruppe anzeigen', 'Zeigen, in welchen Gruppen die aktuelle Gruppe Mitglied ist', 'E-Mail-Verteiler einstellen', 'Rechte setzen'], correct: 1, explanation: 'Member Of zeigt, in welchen anderen Gruppen die aktuelle Gruppe Mitglied ist.' },
    { question: 'Was passiert, wenn G_Stab Mitglied von DL_Befehle_AE wird?', options: ['Alle Stabsmitarbeiter erhalten das Recht, das DL_Befehle_AE zugewiesen wurde', 'Nur der Gruppenname ändert sich', 'Active Directory wird gelöscht', 'Die Gruppe ist universell'], correct: 0, explanation: 'Durch Gruppenverschachtelung erhalten alle Mitglieder der G_Stab indirekt die Berechtigungen der DL-Berechtigungsgruppe.' },
  ];

  const summary = [
    'Funktionsgruppen sammeln Benutzer nach Rolle, Berechtigungsgruppen repräsentieren Rechte auf Ressourcen.',
    'Funktionsgruppen werden typischerweise Global, Berechtigungsgruppen Domain local.',
    'Benutzer werden in die Funktionsgruppe aufgenommen (Tab Members).',
    'Die Funktionsgruppe wird Mitglied der Berechtigungsgruppe (Tab Members der DL-Gruppe).',
    'Falsche OU, falscher Gruppenbereich oder direkte Benutzer in DL-Gruppen verursachen typische Fehler.',
  ];

  return { title, explanations, exercises, quiz, summary };
}
