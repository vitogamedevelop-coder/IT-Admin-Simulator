import { topicKey } from '../academyTopics.js';

export const SECURITY_FUNDAMENTALS_TOPIC_KEY = topicKey('information-security', 'security-fundamentals');
export const SECURITY_LEGAL_DATA_TOPIC_KEY = topicKey('information-security', 'security-legal-data');
export const SECURITY_INCIDENTS_TOPIC_KEY = topicKey('information-security', 'security-incidents');
export const SECURITY_THREATS_MALWARE_TOPIC_KEY = topicKey('information-security', 'security-threats-malware');
export const SECURITY_TECHNICAL_MEASURES_TOPIC_KEY = topicKey('information-security', 'security-technical-measures');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

export function buildInformationSecurityFundamentalsLesson() {
  const title = 'Block 1: Grundlagen der Informationssicherheit';

  const explanations = [
    explanation('b1-was-ist', 'Was ist Informationssicherheit?', 'classic', [
      { type: 'text', content: 'Informationssicherheit schützt Informationen in jeder Form: digital, auf Papier, mündlich oder in Arbeitsabläufen. Es geht darum, alle Informationen angemessen zu schützen, unabhängig vom Trägermedium.' },
      { type: 'question', question: 'Welche Informationen umfasst Informationssicherheit?', options: ['nur digitale Daten', 'nur Papierakten', 'nur mündliche Gespräche', 'alle Formen von Informationen'], correct: 3, explanation: 'Informationssicherheit gilt für jede Form von Information, nicht nur für digitale Daten.' },
    ]),

    explanation('b1-bundeswehr', 'Informationssicherheit in der Bundeswehr', 'classic', [
      { type: 'text', content: 'Im Cyber- und Informationsraum (CIR) der Bundeswehr bildet das IT-System Bundeswehr (IT-SysBw) den fachlichen Rahmen. Die A-960/1 ist eine öffentlich verfügbare Regelung für Informationssicherheit. Der Ansatz ist ganzheitlich und betrachtet Technik, Organisation und Menschen gemeinsam. Hier werden keine operativen Geheimnisse oder Einsatzdetails dargestellt.' },
    ]),

    explanation('b1-grundwerte', 'Die drei Grundwerte', 'classic', [
      { type: 'text', content: 'Vertraulichkeit, Integrität und Verfügbarkeit sind die klassischen Schutzziele der Informationssicherheit.' },
      { type: 'table', headers: ['Grundwert', 'Bedeutung', 'Beispiel'], rows: [
        ['Vertraulichkeit', 'Zugriff nur für autorisierte Personen', 'Personalakte, dienstgeheime Nachricht'],
        ['Integrität', 'Keine unbefugte oder unbemerkte Änderung, auch nicht durch Fehler oder Unfälle', 'Checksumme, Versionskontrolle, Manipulationsschutz'],
        ['Verfügbarkeit', 'Nutzer können Daten und Dienste bei Bedarf erreichen', 'Serverfarm, Notstrom, Wartungsfenster, aber nicht "immer 24/7"'],
      ] },
    ]),

    explanation('b1-wechselwirkung', 'Wechselwirkung der Grundwerte', 'classic', [
      { type: 'text', content: 'Sicherheitsmaßnahmen können mehrere Schutzziele gleichzeitig beeinflussen. Eine einzige Maßnahme ist deshalb nicht immer nur einer Kategorie zuzuordnen.' },
      { type: 'table', headers: ['Maßnahme oder Szenario', 'Betroffene Grundwerte'], rows: [
        ['Redundanz', 'Verfügbarkeit'],
        ['Berechtigungssystem', 'Vertraulichkeit, Integrität'],
        ['Server-Manipulation', 'zuerst Integrität, dann Verfügbarkeit'],
        ['Verschlüsselung', 'Vertraulichkeit'],
      ] },
      { type: 'question', question: 'Ein Server wurde verändert und startet nun nicht mehr. Welche Grundwerte sind betroffen?', options: ['nur Vertraulichkeit', 'nur Integrität', 'Integrität und Verfügbarkeit', 'nur Verfügbarkeit'], correct: 2, explanation: 'Die unbefugte Änderung betrifft die Integrität. Der Ausfall beeinträchtigt die Verfügbarkeit.' },
    ]),

    explanation('b1-pimo', 'PIMO', 'classic', [
      { type: 'text', content: 'PIMO beschreibt die Elemente, aus denen ein IT-System besteht. Es ist ein großes O, also keine Null.' },
      { type: 'list', title: 'PIMO', items: [
        'P = personell (zum Beispiel Administratoren, Benutzer, Ausbilder)',
        'I = infrastrukturell (zum Beispiel Serverraum, Klima, Gebäude, Schränke)',
        'M = materiell (zum Beispiel Server, Notebooks, Drucker, Netzwerkgeräte)',
        'O = organisatorisch (zum Beispiel Regelungen, Abläufe, Verantwortlichkeiten)',
      ] },
      { type: 'text', content: 'PIMO fragt danach, aus welchen Elementen das IT-System besteht. Es ist keine Liste einzelner Schutzmaßnahmen.' },
    ]),

    explanation('b1-opti', 'OPTI', 'classic', [
      { type: 'text', content: 'OPTI ordnet Schutzmaßnahmen nach Handlungsfeldern. Eine einzelne Maßnahme kann mehrere Bereiche berühren.' },
      { type: 'list', title: 'OPTI', items: [
        'O = organisatorisch (zum Beispiel Richtlinien, Prozesse, Meldewege)',
        'P = personell (zum Beispiel Schulung, Hintergrundüberprüfung, Sensibilisierung)',
        'T = technisch (zum Beispiel Verschlüsselung, Patchmanagement, Logging)',
        'I = infrastrukturell (zum Beispiel Zutrittskontrolle, Brandmelder, Trennwände)',
      ] },
    ]),

    explanation('b1-pimo-vs-opti', 'PIMO vs OPTI', 'classic', [
      { type: 'text', content: 'PIMO beschreibt, was zum IT-System gehört. OPTI beschreibt, wie es geschützt wird.' },
      { type: 'table', headers: ['Beispiel', 'PIMO', 'OPTI'], rows: [
        ['Serverraum', 'infrastrukturell', '-'],
        ['Zugangsregelung', '-', 'organisatorisch'],
        ['Administrator', 'personell', '-'],
        ['Sicherheitsschulung', '-', 'personell'],
      ] },
    ]),

    explanation('b1-isms-pdca', 'ISMS & PDCA', 'classic', [
      { type: 'text', content: 'Ein Informationssicherheits-Managementsystem (ISMS) ist kein fertiges Produkt, sondern ein laufender Prozess zur Planung, Umsetzung, Überprüfung und Verbesserung.' },
      { type: 'table', headers: ['Phase', 'Bedeutung'], rows: [
        ['PLAN', 'Sicherheitsziele und Maßnahmen planen'],
        ['DO', 'Geplante Maßnahmen umsetzen'],
        ['CHECK', 'Wirksamkeit prüfen und überwachen'],
        ['ACT', 'Verbesserungen einleiten und anpassen'],
      ] },
    ]),

    explanation('b1-gefordertes-mass', 'Gefordertes Maß', 'classic', [
      { type: 'text', content: 'Sicherheit muss zum Schutzbedarf und zum Risiko passen. Es geht nicht darum, maximale Sicherheit um jeden Preis zu erreichen, sondern angemessene und wirtschaftlich vertretbare Maßnahmen zu wählen.' },
    ]),
  ];

  const quiz = [
    { question: 'Unbemerkte Dateiänderung beeinträchtigt primär welches Schutzziel?', options: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität'], correct: 1, explanation: 'Integrität schützt vor unbemerkter Veränderung.' },
    { question: 'Eine redundante Serverfarm erhöht primär welches Schutzziel?', options: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität'], correct: 2, explanation: 'Redundanz sichert die Verfügbarkeit, wenn ein System ausfällt.' },
    { question: 'Ein Serverraum als Objekt gehört in PIMO zu?', options: ['personell', 'infrastrukturell', 'materiell', 'organisatorisch'], correct: 1, explanation: 'Räumliche und bauliche Gegebenheiten sind infrastrukturelle Elemente.' },
    { question: 'Eine Sicherheitsschulung ist in OPTI eine?', options: ['organisatorische', 'personelle', 'technische', 'infrastrukturelle'], correct: 1, explanation: 'Schulung und Sensibilisierung zählen zu den personellen Maßnahmen.' },
    { question: 'Welche Reihenfolge beschreibt den PDCA-Zyklus korrekt?', options: ['PLAN DO CHECK ACT', 'DO CHECK ACT PLAN', 'CHECK ACT PLAN DO', 'ACT PLAN DO CHECK'], correct: 0, explanation: 'Der Zyklus beginnt mit PLAN, gefolgt von DO, CHECK und ACT.' },
  ];

  const summary = [
    'Informationssicherheit schützt Informationen in jeder Form, nicht nur digitale Daten.',
    'Vertraulichkeit, Integrität und Verfügbarkeit sind die zentralen Schutzziele.',
    'PIMO beschreibt die Elemente eines IT-Systems, OPTI beschreibt die Art der Schutzmaßnahmen.',
    'Ein ISMS ist ein laufender PDCA-Prozess, kein fertiges Produkt.',
    'Sicherheit muss zum Schutzbedarf und Risiko passen, nicht maximal sein.',
    'Maßnahmen können mehrere Grundwerte gleichzeitig beeinflussen.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}

export function buildInformationSecurityLegalDataLesson() {
  const title = 'Block 2: Rechtliche Grundlagen, Datenschutz & Informationskategorien';

  const explanations = [
    explanation('b2-begriffe-trennen', 'Begriffe trennen', 'classic', [
      { type: 'text', content: 'Datenschutz, Informationssicherheit und Geheimschutz verwandte Themen, aber nicht identisch. Datenschutz schützt natürliche Personen bei der Datenverarbeitung. Informationssicherheit schützt die Ziele Vertraulichkeit, Integrität und Verfügbarkeit von Informationen. Geheimschutz hat eine eigene rechtliche Dimension.' },
      { type: 'question', question: 'Wem oder was dient der Datenschutz primär?', options: ['Schutz von Softwarelizenzen', 'Schutz natürlicher Personen', 'Schutz von Servern vor Ausfall', 'Schutz militärischer Geheimnisse'], correct: 1, explanation: 'Datenschutz schützt naturpersonen, nicht Sachen oder Geheimnisse.' },
    ]),

    explanation('b2-schutzbereiche', 'Schutzbereiche personenbezogener Daten', 'classic', [
      { type: 'text', content: 'Behörden und Organisationen mit Sicherheitsaufgaben nutzen interne Schutzbereiche, um personenbezogene Daten nach ihrem Schutzbedarf einzuordnen.' },
      { type: 'table', headers: ['Schutzbereich', 'Beschreibung', 'Beispiel'], rows: [
        ['Schutzbereich 1', 'Besonders sensible Daten mit hohem Schutzbedarf', 'Gesundheitsdaten, politische Meinungen'],
        ['Schutzbereich 2', 'Sensible personenbezogene Daten', 'Religion, Gewerkschaftszugehörigkeit, Strafregisterdaten'],
        ['Schutzbereich 3', 'Weitere besondere Daten nach interner Einstufung', 'Biometrische oder genetische Daten, sofern zugeordnet'],
      ] },
      { type: 'text', content: 'Schutzbereich 3 ist nicht identisch mit Art. 9 DSGVO. Die konkrete Ausgestaltung muss an der Lehrgangsquelle verifiziert werden.' },
    ]),

    explanation('b2-art9', 'Art. 9 DSGVO', 'classic', [
      { type: 'text', content: 'Art. 9 DSGVO listet besondere Kategorien personenbezogener Daten auf. Diese genießen einen besonderen Schutz, weil ihre missbräuchliche Verarbeitung besondere Risiken birgt.' },
      { type: 'list', title: 'Besondere Kategorien nach Art. 9 DSGVO', items: [
        'Rasse oder ethnische Herkunft',
        'Politische Meinungen',
        'Religiöse oder weltanschauliche Überzeugungen',
        'Gewerkschaftszugehörigkeit',
        'Genetische Daten',
        'Biometrische Daten zur eindeutigen Identifizierung',
        'Gesundheitsdaten',
        'Sexualleben',
        'Sexuelle Orientierung',
      ] },
      { type: 'question', question: 'Welche Daten gehören nach Art. 9 DSGVO zu den besonderen Kategorien?', options: ['Name und Adresse', 'IP-Adresse', 'Gesundheitsdaten und politische Meinungen', 'Öffentliche Webseite'], correct: 2, explanation: 'Art. 9 DSGVO nennt unter anderem Gesundheitsdaten und politische Meinungen als besondere Kategorien.' },
    ]),

    explanation('b2-informationskategorien', 'Informationskategorien', 'classic', [
      { type: 'text', content: 'Informationen lassen sich nach ihrem Schutzbedarf einordnen. Wichtig: Öffentlich und offen sind keine Synonyme.' },
      { type: 'table', headers: ['Kategorie', 'Bedeutung', 'Beispiel'], rows: [
        ['Öffentliche Informationen', 'Darf öffentlich zugänglich sein', 'Pressemitteilungen, Webseite'],
        ['Offene Informationen', 'Nicht öffentlich, aber nicht als Verschlusssache eingestuft', 'Dienstanweisungen, interne Protokolle'],
        ['Verschlusssachen', 'Staatlich oder behördlich klassifiziert', 'VS-Verschlusssache, Geheimnisse'],
      ] },
      { type: 'text', content: '"Offen" bedeutet lediglich, dass keine Verschlusssachen-Einstufung vorliegt. Das ist nicht dasselbe wie öffentlich zugänglich.' },
    ]),
  ];

  const quiz = [
    { question: 'Was ist der Unterschied zwischen Datenschutz und Informationssicherheit?', options: ['Keiner', 'Datenschutz schützt Personen, Informationssicherheit schützt Informationen', 'Informationssicherheit schützt Personen, Datenschutz schützt Daten', 'Beide schützen nur Geheimnisse'], correct: 1, explanation: 'Datenschutz zielt auf Personen, Informationssicherheit auf die Sicherheit der Information selbst.' },
    { question: 'Welche Daten fallen unter Art. 9 DSGVO?', options: ['Nur Namen', 'Besondere Kategorien wie Gesundheit und Weltanschauung', 'Nur E-Mail-Adressen', 'Nur öffentliche Informationen'], correct: 1, explanation: 'Art. 9 DSGVO listet besondere Kategorien wie Gesundheitsdaten und religiöse Überzeugungen.' },
    { question: 'Was bedeuten "offene Informationen"?', options: ['Informationen, die der Öffentlichkeit zugänglich sind', 'Interne Informationen ohne Verschlusssachen-Einstufung', 'Streng geheime Informationen', 'Informationen ohne Urheber'], correct: 1, explanation: 'Offen heißt nicht klassifiziert, muss aber nicht öffentlich sein.' },
  ];

  const summary = [
    'Datenschutz, Informationssicherheit und Geheimschutz sind getrennte Begriffe.',
    'Interne Schutzbereiche personenbezogener Daten sind nicht deckungsgleich mit Art. 9 DSGVO.',
    'Art. 9 DSGVO listet besondere Kategorien wie Gesundheitsdaten und politische Meinungen.',
    'Öffentliche und offene Informationen sind nicht dasselbe: Offen heißt nicht klassifiziert, nicht unbedingt öffentlich.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}

export function buildInformationSecurityIncidentsLesson() {
  const title = 'Block 3: Verstöße, Vorkommnisse & Meldewesen';

  const explanations = [
    explanation('b3-verstoss-vorkommnis', 'Verstoß vs Vorkommnis', 'classic', [
      { type: 'text', content: 'Ein Informationssicherheitsverstoß ist ein Verstoß gegen geltende Sicherheitsvorschriften oder -anforderungen. Ein Sicherheitsvorkommnis ist ein Ereignis, das die Informationssicherheit negativ beeinflusst. Ein Verstoß kann ein Vorkommnis auslösen, muss es aber nicht.' },
      { type: 'table', headers: ['Begriff', 'Beispiel'], rows: [
        ['Verstoß', 'USB-Stick trotz Verbot an einen Dienst-PC angeschlossen'],
        ['Vorkommnis', 'Server fällt nach Stromausfall aus und Daten sind kurzzeitig nicht erreichbar'],
      ] },
      { type: 'text', content: 'Die exakten Bundeswehr-Definitionen müssen an der Lehrgangsquelle verifiziert werden.' },
    ]),

    explanation('b3-meldewesen', 'Meldewesen', 'classic', [
      { type: 'text', content: 'Frühzeitiges Melden hilft, Schaden zu begrenzen und das ISMS zu verbessern. Melden ist kein Angriff, sondern Schadensprävention.' },
      { type: 'list', title: 'Wann sollte gemeldet werden?', items: [
        'Verdächtiger Login oder Zugang',
        'Verdächtige E-Mail oder Phishing',
        'Verlorenes oder gestohlenes Speichermedium',
        'Unbekannter USB-Stick',
        'Jede Verletzung von Sicherheitsvorschriften',
      ] },
    ]),

    explanation('b3-szenarien', 'Natürliche Szenarien', 'classic', [
      { type: 'text', content: 'Mara sieht einen ungewöhnlichen Login-Dialog und meldet ihn. David findet einen unbekannten USB-Stick und meldet ihn. In beiden Fällen kann ein Verstoß oder ein Vorkommnis vorliegen. Frühzeitiges Melden verbindet die Szenarien und hilft, Folgeschäden zu vermeiden.' },
    ]),
  ];

  const quiz = [
    { question: 'Was ist ein Informationssicherheitsverstoß?', options: ['Ein technischer Defekt', 'Ein Verstoß gegen Sicherheitsvorschriften', 'Ein erfolgreicher Hackerangriff', 'Ein geplantes Wartungsfenster'], correct: 1, explanation: 'Ein Verstoß liegt vor, wenn Vorschriften oder Anforderungen nicht eingehalten werden.' },
    { question: 'Was ist ein Sicherheitsvorkommnis?', options: ['Ein Ereignis, das die Sicherheit negativ beeinflusst', 'Eine abgeschlossene Schulung', 'Ein genehmigtes Update', 'Ein Feiertag im Dienstbetrieb'], correct: 0, explanation: 'Ein Sicherheitsvorkommnis ist ein Ereignis, das die Informationssicherheit beeinträchtigt.' },
    { question: 'Warum sollten Vorfälle möglichst früh gemeldet werden?', options: ['Um Kollegen zu beschuldigen', 'Um Schäden früh zu erkennen und zu begrenzen', 'Weil es in der Mittagspause Pflicht ist', 'Damit das Protokoll länger wird'], correct: 1, explanation: 'Frühzeitiges Melden ermöglicht schnelle Reaktion und Schadensbegrenzung.' },
  ];

  const summary = [
    'Ein Verstoß verletzt Regeln; ein Vorkommnis beeinträchtigt die Sicherheit.',
    'Meldungen sollen Schaden verhindern, nicht dem Suchen nach Schuld dienen.',
    'Verdächtige Logins, Phishing, verlorene Medien und fremde USB-Sticks sollten gemeldet werden.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}

export function buildInformationSecurityThreatsMalwareLesson() {
  const title = 'Block 4: Gefährdungen, Angriffsmethoden & Schadsoftware';

  const explanations = [
    explanation('b4-angriffsmethoden', 'Angriffsmethoden', 'classic', [
      { type: 'text', content: 'Angreifer nutzen unterschiedliche Methoden, um Schutzziele zu gefährden. Die Schutzziele helfen, Angriffe einzuordnen.' },
      { type: 'table', headers: ['Methode', 'Beschreibung', 'Betroffenes Grundziel'], rows: [
        ['DoS / DDoS', 'Überlastung eines Dienstes', 'Verfügbarkeit'],
        ['Identitätsdiebstahl', 'Missbrauch von Zugangsdaten', 'Vertraulichkeit, Integrität'],
        ['Social Engineering', 'Mensch manipulieren, um Zugang zu erhalten', 'Vertraulichkeit'],
        ['Phishing', 'Gefälschte Nachricht mit bösartigem Link', 'Vertraulichkeit'],
      ] },
      { type: 'question', question: 'Welches Schutzziel trifft primär auf einen DoS-Angriff zu?', options: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität'], correct: 2, explanation: 'DoS-Angriffe machen Dienste unerreichbar und greifen die Verfügbarkeit an.' },
    ]),

    explanation('b4-malware', 'Malware ist der Oberbegriff', 'classic', [
      { type: 'text', content: 'Malware ist ein Oberbegriff für Schadsoftware. Schadsoftware kann Eigenschaften mehrerer Kategorien gleichzeitig haben.' },
      { type: 'table', headers: ['Art', 'Kennzeichen'], rows: [
        ['Virus', 'Benötigt Wirtsprogramm, verbreitet sich an Dateien anhängend'],
        ['Wurm', 'Verbreitet sich selbstständig über Netzwerke'],
        ['Trojaner', 'Tarnt sich als nützliche Software und öffnet eine Hintertür'],
        ['Spyware', 'Beobachtet Aktivitäten und stiehlt Daten'],
        ['Keylogger', 'Zeichnet Tastatureingaben auf'],
        ['Ransomware', 'Verschlüsselt Daten und fordert Lösegeld'],
        ['Rootkit', 'Versteckt sich tief im System und ist schwer erkennbar'],
        ['Backdoor', 'Bietet einen geheimen Zugang für Angreifer'],
      ] },
    ]),

    explanation('b4-payload', 'Payload richtig einordnen', 'classic', [
      { type: 'text', content: 'Die Payload ist die eigentlich schädliche Funktion einer Malware. Ein Wurm kann sich beispielsweise selbst verbreiten und dabei Dateien verschlüsseln. Dann handelt es sich um einen Wurm mit einer Ransomware-Payload.' },
      { type: 'question', question: 'Was ist eine Payload?', options: ['Das Netzwerkprotokoll', 'Der eigentlich schädliche Code', 'Ein Antiviren-Tool', 'Ein Sicherheitsupdate'], correct: 1, explanation: 'Die Payload ist der eigentlich schädliche Teil, der nach dem Eindringen aktiv wird.' },
    ]),

    explanation('b4-praevention', 'Prävention', 'classic', [
      { type: 'text', content: 'Defense in Depth setzt mehrere Verteidigungslinien hintereinander. Technische und menschliche Maßnahmen ergänzen sich.' },
      { type: 'list', title: 'Präventionsmaßnahmen', items: [
        'Regelmäßige Updates und Patches',
        'Vorsicht bei Anhängen und Links',
        'Application Control',
        'Malware-Schutzsoftware',
        'Least Privilege',
        'Backups',
        'Netzwerksegmentierung',
        'Awareness-Schulung',
      ] },
    ]),
  ];

  const quiz = [
    { question: 'Malware ist...', options: ['ein spezieller Computervirus', 'ein Oberbegriff für Schadsoftware', 'ein Antivirenprogramm', 'ein Passwortmanager'], correct: 1, explanation: 'Malware umfasst Viren, Würmer, Trojaner und weitere Schadsoftware.' },
    { question: 'Was unterscheidet einen Wurm von einem Virus?', options: ['Viren benötigen einen Wirt, Würmer verbreiten sich selbst', 'Würmer sind harmlos', 'Viren verbreiten sich immer selbst', 'Es gibt keinen Unterschied'], correct: 0, explanation: 'Viren benötigen ein Wirtsprogramm, Würmer verbreiten sich eigenständig.' },
    { question: 'Was ist ein Trojaner?', options: ['Offizielle Sicherheitssoftware', 'Schadsoftware in harmloser Tarnung', 'Eine Art Firewall', 'Ein Backup-Verfahren'], correct: 1, explanation: 'Ein Trojaner tarnt sich als nützliche Software und schafft Hintertüren.' },
    { question: 'Was ist eine Payload?', options: ['Netzwerklast', 'Eigentliche Schadfunktion', 'Sicherheitslücke', 'Verschlüsselungsmethode'], correct: 1, explanation: 'Die Payload ist die eigentliche bösartige Funktion der Malware.' },
    { question: 'Was bedeutet Defense in Depth?', options: ['Nur eine Firewall', 'Eine Verteidigungslinie', 'Mehrere Sicherheitsmaßnahmen hintereinander', 'Ein einmaliges Training'], correct: 2, explanation: 'Defense in Depth kombiniert mehrere Schutzmaßnahmen in mehreren Ebenen.' },
  ];

  const summary = [
    'Angriffsarten wie DoS, Phishing und Social Engineering zielen auf unterschiedliche Schutzziele.',
    'Malware ist ein Oberbegriff für Viren, Würmer, Trojaner, Spyware und mehr.',
    'Die Payload ist die eigentliche Schadfunktion hinter einer Malware.',
    'Defense in Depth kombiniert viele Schutzmaßnahmen.',
    'Technische und menschliche Maßnahmen zusammen erhöhen die Widerstandsfähigkeit.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}

export function buildInformationSecurityTechnicalMeasuresLesson() {
  const title = 'Block 5: Technische Schutzmaßnahmen';

  const explanations = [
    explanation('b5-allowlist-denylist', 'Allowlist & Denylist', 'classic', [
      { type: 'text', content: 'Allowlists und Denylists regeln, welche Objekte oder Aktionen erlaubt oder verboten sind. Manche Kurse nutzen die Begriffe Whitelist und Blacklist statt Allowlist und Denylist.' },
      { type: 'table', headers: ['Liste', 'Bedeutung', 'Strenge'], rows: [
        ['Allowlist (Whitelist)', 'Nur explizit erlaubte Objekte sind zugelassen', 'strenger'],
        ['Denylist (Blacklist)', 'Bekannte unerwünschte Objekte werden blockiert', 'weniger streng'],
      ] },
    ]),

    explanation('b5-firewall', 'Firewall-Grundlagen', 'classic', [
      { type: 'text', content: 'Firewalls kontrollieren Netzwerkverkehr anhand unterschiedlicher Verfahren.' },
      { type: 'table', headers: ['Typ', 'Funktion'], rows: [
        ['Paketfilter', 'Entscheidet anhand von Regeln pro Paket: Quelle, Ziel, Port, Protokoll'],
        ['Stateful Inspection', 'Betrachtet den Zustand einer Verbindung, nicht nur einzelne Pakete'],
        ['Application Layer Gateway (ALG)', 'Prüft Anwendungsprotokolle und Inhalte'],
      ] },
      { type: 'question', question: 'Was unterscheidet Stateful Inspection von einem einfachen Paketfilter?', options: ['Nur die MAC-Adresse', 'Der Verbindungszustand wird berücksichtigt', 'Es werden keine Ports geprüft', 'Es arbeitet nur auf der Bitübertragungsschicht'], correct: 1, explanation: 'Stateful Inspection merkt sich den Zustand bestehender Verbindungen und prüft nicht nur einzelne Pakete.' },
    ]),

    explanation('b5-dmz', 'DMZ', 'classic', [
      { type: 'text', content: 'Eine Demilitarisierte Zone (DMZ) ist ein abgetrenntes Netzwerksegment zwischen vertrauenswürdigem internem Netz und nicht vertrauenswürdigem Netz. Sie ermöglicht den kontrollierten Zugriff auf öffentliche Dienste. Eine DMZ ist jedoch nicht automatisch sicher; die genaue Topologie muss an der Quelle verifiziert werden.' },
    ]),

    explanation('b5-ids-ips', 'IDS vs IPS', 'classic', [
      { type: 'text', content: 'Intrusion Detection und Intrusion Prevention unterscheiden sich in der Reaktion auf erkannte Angriffe.' },
      { type: 'table', headers: ['System', 'Funktion'], rows: [
        ['IDS (Intrusion Detection System)', 'Erkennt Angriffe und meldet sie'],
        ['IPS (Intrusion Prevention System)', 'Erkennt und blockiert Angriffe aktiv'],
      ] },
      { type: 'question', question: 'Was ist der wesentliche Unterschied zwischen IDS und IPS?', options: ['IDS ist schneller', 'IPS blockiert aktiv, IDS meldet nur', 'IDS ist keine echte Technik', 'IPS benötigt keine Regeln'], correct: 1, explanation: 'Ein IDS erkennt und meldet; ein IPS greift aktiv ein und verhindert den Angriff.' },
    ]),

    explanation('b5-mapping', 'Technische Maßnahmen & Schutzziele', 'classic', [
      { type: 'text', content: 'Jede technische Maßnahme fördert bestimmte Schutzziele oder Sicherheitsfunktionen.' },
      { type: 'table', headers: ['Maßnahme', 'Schutzziel oder Funktion'], rows: [
        ['Verschlüsselung', 'Vertraulichkeit'],
        ['Redundanz', 'Verfügbarkeit'],
        ['Hash / Signatur', 'Integrität'],
        ['Firewall', 'Kontrolle'],
        ['IDS', 'Erkennung'],
        ['IPS', 'Erkennung und Prävention'],
      ] },
    ]),
  ];

  const quiz = [
    { question: 'Welche Liste ist in der Regel strenger?', options: ['Allowlist', 'Denylist', 'Blacklist', 'Keine'], correct: 0, explanation: 'Eine Allowlist erlaubt nur explizit aufgeführte Objekte und ist damit strenger.' },
    { question: 'Auf welcher Schicht arbeitet ein Application Layer Gateway (ALG) typischerweise?', options: ['Anwendungsschicht', 'Bitübertragungsschicht', 'Netzzugangsschicht', 'Transportschicht'], correct: 0, explanation: 'Ein ALG prüft Anwendungsprotokolle und arbeitet daher auf der Anwendungsebene.' },
    { question: 'Welchen Zweck hat eine DMZ?', options: ['Automatische Verschlüsselung aller Daten', 'Getrenntes Segment zwischen Vertrauenszonen', 'Viren auslöschen', 'Ersatz für Backups'], correct: 1, explanation: 'Eine DMZ trennt Netzbereiche mit unterschiedlichem Vertrauensniveau.' },
    { question: 'Was ist der Hauptunterschied zwischen IPS und IDS?', options: ['IPS erkennt nur', 'IDS blockiert aktiv', 'IPS erkennt und verhindert', 'IDS ist kein Sicherheitssystem'], correct: 2, explanation: 'IPS erkennt und verhindert Angriffe aktiv, IDS erkennt nur.' },
    { question: 'Welches Schutzziel erreicht Verschlüsselung primär?', options: ['Verfügbarkeit', 'Integrität', 'Vertraulichkeit', 'Authentizität'], correct: 2, explanation: 'Verschlüsselung schützt vor unbefugtem Lesen und sichert so die Vertraulichkeit.' },
  ];

  const summary = [
    'Allowlists sind strenger als Denylists, weil nur Erlaubtes zugelassen wird.',
    'Firewalls filtern Verkehr; Stateful Inspection betrachtet den Verbindungszustand.',
    'Eine DMZ ist ein abgetrenntes Segment zwischen internem und externem Netz.',
    'IDS erkennt Angriffe, IPS erkennt und verhindert sie aktiv.',
    'Jede technische Maßnahme fördert bestimmte Schutzziele wie Vertraulichkeit, Verfügbarkeit oder Integrität.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}
