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
  const ciaSvg = `<svg viewBox="0 0 360 245" class="w-full h-auto max-h-72" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Informationssicherheit im geforderten Maß</text><path d="M180 45 L55 185 L305 185 Z" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff" stroke-width="2"/><rect x="120" y="40" width="120" height="34" rx="7" fill="#00f0ff"/><text x="180" y="62" text-anchor="middle" fill="#06111f" font-size="11" font-weight="bold">VERTRAULICHKEIT</text><rect x="16" y="170" width="112" height="34" rx="7" fill="#00f0ff"/><text x="72" y="192" text-anchor="middle" fill="#06111f" font-size="11" font-weight="bold">INTEGRITÄT</text><rect x="232" y="170" width="112" height="34" rx="7" fill="#00f0ff"/><text x="288" y="192" text-anchor="middle" fill="#06111f" font-size="11" font-weight="bold">VERFÜGBARKEIT</text><rect x="97" y="211" width="166" height="25" rx="6" fill="#1f6feb" fill-opacity="0.35" stroke="#58a6ff"/><text x="180" y="228" text-anchor="middle" fill="#c9d1d9" font-size="10">Authentizität → Aspekt der Integrität</text></svg>`;
  const pimoSvg = `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">PIMO: Was gehört zum System?</text><rect x="115" y="85" width="130" height="50" rx="8" fill="#00f0ff"/><text x="180" y="107" text-anchor="middle" fill="#06111f" font-size="11" font-weight="bold">IT-GESAMTSYSTEM</text><text x="180" y="124" text-anchor="middle" fill="#06111f" font-size="9">Menschen + Umfeld + Technik + Prozesse</text><g fill="#1f6feb" fill-opacity="0.35" stroke="#58a6ff"><rect x="15" y="40" width="105" height="38" rx="6"/><rect x="240" y="40" width="105" height="38" rx="6"/><rect x="15" y="150" width="105" height="38" rx="6"/><rect x="240" y="150" width="105" height="38" rx="6"/></g><g fill="#c9d1d9" font-size="10" text-anchor="middle"><text x="67" y="56">P – Personell</text><text x="67" y="70">Menschen</text><text x="292" y="56">I – Infrastrukturell</text><text x="292" y="70">Umgebung</text><text x="67" y="166">M – Materiell</text><text x="67" y="180">Hard- &amp; Software</text><text x="292" y="166">O – Organisatorisch</text><text x="292" y="180">Prozesse</text></g><g stroke="#00f0ff"><line x1="120" y1="70" x2="145" y2="85"/><line x1="240" y1="70" x2="215" y2="85"/><line x1="120" y1="160" x2="145" y2="135"/><line x1="240" y1="160" x2="215" y2="135"/></g></svg>`;
  const optiSvg = `<svg viewBox="0 0 360 165" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">OPTI: Welche Maßnahmen nutzen wir?</text><g fill="#00f0ff" fill-opacity="0.2" stroke="#00f0ff"><rect x="10" y="48" width="80" height="72" rx="7"/><rect x="97" y="48" width="80" height="72" rx="7"/><rect x="184" y="48" width="80" height="72" rx="7"/><rect x="271" y="48" width="80" height="72" rx="7"/></g><g fill="#c9d1d9" text-anchor="middle"><text x="50" y="70" font-size="18" font-weight="bold">O</text><text x="50" y="90" font-size="9">Organisation</text><text x="50" y="105" font-size="8">Regeln, Wege</text><text x="137" y="70" font-size="18" font-weight="bold">P</text><text x="137" y="90" font-size="9">Personal</text><text x="137" y="105" font-size="8">Schulung</text><text x="224" y="70" font-size="18" font-weight="bold">T</text><text x="224" y="90" font-size="9">Technik</text><text x="224" y="105" font-size="8">Konfiguration</text><text x="311" y="70" font-size="18" font-weight="bold">I</text><text x="311" y="90" font-size="9">Infrastruktur</text><text x="311" y="105" font-size="8">Strom, Räume</text><text x="180" y="145" font-size="10">Keine „materiellen Maßnahmen“: materiell gehört zu PIMO.</text></g></svg>`;
  const pimoOptiSvg = `<svg viewBox="0 0 360 180" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="35" width="150" height="105" rx="8" fill="#1f6feb" fill-opacity="0.25" stroke="#58a6ff"/><rect x="200" y="35" width="150" height="105" rx="8" fill="#00f0ff" fill-opacity="0.15" stroke="#00f0ff"/><text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="20" font-weight="bold">PIMO</text><text x="85" y="84" text-anchor="middle" fill="#c9d1d9" font-size="11">WAS betrachten wir?</text><text x="85" y="106" text-anchor="middle" fill="#8b949e" font-size="9">Elemente des Gesamtsystems</text><text x="275" y="62" text-anchor="middle" fill="#c9d1d9" font-size="20" font-weight="bold">OPTI</text><text x="275" y="84" text-anchor="middle" fill="#c9d1d9" font-size="11">WIE schützen wir?</text><text x="275" y="106" text-anchor="middle" fill="#8b949e" font-size="9">Arten von Maßnahmen</text><path d="M168 86 H192" stroke="#00f0ff" stroke-width="2"/><text x="180" y="165" text-anchor="middle" fill="#c9d1d9" font-size="10">Element erkennen → passende Maßnahmenart wählen</text></svg>`;
  const pdcaSvg = `<svg viewBox="0 0 360 230" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Sicherheit ist ein Prozess</text><g fill="#00f0ff" fill-opacity="0.2" stroke="#00f0ff"><rect x="130" y="38" width="100" height="38" rx="8"/><rect x="245" y="96" width="100" height="38" rx="8"/><rect x="130" y="154" width="100" height="38" rx="8"/><rect x="15" y="96" width="100" height="38" rx="8"/></g><g fill="#c9d1d9" font-size="11" font-weight="bold" text-anchor="middle"><text x="180" y="62">PLAN</text><text x="295" y="120">DO</text><text x="180" y="178">CHECK</text><text x="65" y="120">ACT</text></g><path d="M230 57 Q290 62 294 91 M295 134 Q286 168 235 173 M125 173 Q73 168 66 139 M65 96 Q72 62 125 57" fill="none" stroke="#58a6ff" stroke-width="3"/><text x="180" y="218" text-anchor="middle" fill="#8b949e" font-size="10">ACT führt mit Verbesserungen zurück zu PLAN.</text></svg>`;

  const explanations = [
    explanation('b1-was-ist', 'Warum Informationssicherheit?', 'classic', [
      { type: 'text', content: 'Informationen und IT-Systeme tragen praktisch alle modernen Abläufe. Daraus entstehen Abhängigkeiten, Angriffsflächen, Fehlermöglichkeiten, Manipulationsmöglichkeiten und Ausfallrisiken.' },
      { type: 'text', content: 'Informationssicherheit bedeutet deshalb nicht nur, Hacker draußen zu halten. Sie schützt Informationen in jeder Form – digital, auf Papier, mündlich und in Arbeitsabläufen – ebenso vor Fehlbedienung, unberechtigtem Zugriff, versehentlichem Überschreiben, technischen Ausfällen sowie Schwächen bei Strom, Klima, Personal, Berechtigungen und Prozessen.' },
      { type: 'question', question: 'Ein Dienst fällt aus, weil die Klimatisierung des Serverraums versagt. Ist das ein Thema der Informationssicherheit?', options: ['Nein, nur Cyberangriffe gehören dazu', 'Ja, weil auch Infrastruktur und technische Ausfälle die sichere Nutzbarkeit von Informationen und Diensten beeinträchtigen', 'Nur wenn gleichzeitig Daten gestohlen werden', 'Nein, das betrifft ausschließlich Gebäudetechnik'], correct: 1, explanation: 'Informationssicherheit betrachtet das Gesamtsystem. Auch Strom, Klima, Personal und Organisation können die Grundwerte beeinträchtigen.' },
    ]),
    explanation('b1-bundeswehr', 'A-960/1 und ISMS Bw als Rahmen', 'classic', [
      { type: 'text', content: 'Im verwendeten Bundeswehr-Kontext bildet die A-960/1 eine grundlegende Regelung für Informationssicherheit. Sie beschreibt Grundsätze zur Herstellung, Überwachung, Gewährleistung und Wiederherstellung der Informationssicherheit.' },
      { type: 'text', content: 'Das Informationssicherheits-Managementsystem der Bundeswehr (ISMS Bw) organisiert Informationssicherheit systematisch und ganzheitlich: technische Informationssicherheit, sicheres IT-Umfeld, Menschen, Organisation und kontinuierliche Verbesserung werden gemeinsam betrachtet. Entscheidend ist das Modell, nicht das Auswendiglernen einzelner Absatznummern.' },
    ]),
    explanation('b1-grundwerte', 'Was bedeutet „Informationen sind sicher“?', 'classic', [
      { type: 'text', content: 'Informationssicherheit liegt vor, wenn Vertraulichkeit, Integrität und Verfügbarkeit im geforderten Maß gewährleistet werden. Grundwerte plus gefordertes Maß bilden die zentrale Denklogik.' },
      { type: 'diagram', content: ciaSvg },
      { type: 'text', content: 'Fällt einer der für das System erforderlichen Grundwerte unter das geforderte Maß, ist die Informationssicherheit dieses Systems beeinträchtigt.' },
    ]),
    explanation('b1-vertraulichkeit', 'Vertraulichkeit', 'classic', [
      { type: 'text', content: 'Vertraulichkeit schützt vor unbefugter Informationsgewinnung oder -beschaffung. Betroffen sind etwa Gesundheitsdaten, Zugangsdaten, Kryptoschlüssel, Personalinformationen oder vertrauliche Dateien.' },
      { type: 'list', title: 'Mögliche Maßnahmen', items: ['Verschlüsselte Protokolle und sichere Aufbewahrung', 'Zugangs- und Zutrittskontrolle', 'Rechteverwaltung und individuelle Benutzerkonten', 'Sichtschutz und organisatorische Regeln'] },
      { type: 'question', question: 'Ein Mitarbeiter kann einen Personalordner lesen, den er nicht sehen dürfte. Welcher Grundwert ist primär betroffen?', options: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Nur Authentizität'], correct: 0, explanation: 'Der unberechtigte Informationszugriff verletzt primär die Vertraulichkeit. Verschlüsselung ist nur eine von mehreren möglichen Maßnahmen.' },
    ]),
    explanation('b1-integritaet', 'Integrität', 'classic', [
      { type: 'text', content: 'Integrität schützt Informationen und Systeme vor unbefugten oder unzulässigen Veränderungen. Veränderungen müssen außerdem erkennbar und nachvollziehbar sein. Auch versehentliches Überschreiben kann die Integrität verletzen.' },
      { type: 'list', title: 'Mögliche Maßnahmen', items: ['Berechtigungen und individuelle Accounts', 'Prüfsummen und Signaturen', 'Logging und Nachvollziehbarkeit', 'Versionierung sowie geeignete Backups'] },
      { type: 'question', question: 'Eine Kontonummer in einer Abrechnung wird unbefugt geändert. Welcher Grundwert ist primär betroffen?', options: ['Verfügbarkeit', 'Integrität', 'Vertraulichkeit', 'Nur Infrastruktur'], correct: 1, explanation: 'Die Information wurde unzulässig verändert. Das ist eine Verletzung der Integrität.' },
    ]),
    explanation('b1-authentizitaet', 'Authentizität als Aspekt der Integrität', 'classic', [
      { type: 'text', content: 'Authentizität beantwortet: Von wem stammt eine Information, und wer hat gehandelt? Im hier verwendeten Kursmodell wird sie im Zusammenhang mit der Integrität behandelt, nicht als vierter unabhängiger, gleichrangiger Grundwert.' },
      { type: 'list', title: 'Beispiele', items: ['Individuelle Benutzerkonten statt Accountsharing', 'Eindeutig zuordenbare oder signierte Kommunikation', 'Nachweis, welcher Nutzer eine Änderung durchgeführt hat'] },
      { type: 'question', question: 'Warum ist Accountsharing auch ein Problem der Authentizität?', options: ['Weil nicht mehr eindeutig nachweisbar ist, wer gehandelt hat', 'Weil geteilte Konten immer den Server abschalten', 'Weil Authentizität ausschließlich Verschlüsselung bedeutet', 'Weil dadurch automatisch alle Dateien öffentlich werden'], correct: 0, explanation: 'Authentizität betrifft Echtheit und Zuordenbarkeit. Ein geteilter Account verhindert die eindeutige Zuordnung einer Handlung.' },
    ]),
    explanation('b1-verfuegbarkeit', 'Verfügbarkeit', 'classic', [
      { type: 'text', content: 'Verfügbarkeit bedeutet, dass Informationen, IT-Dienste und Funktionen zum erforderlichen oder zugesicherten Zeitpunkt nutzbar sind. Es reicht nicht, dass nur der Server läuft: Strom, Kühlung, Leitungen, Zugänge, Schlüssel, Personal und Betriebsorganisation können Teil der Dienstkette sein.' },
      { type: 'list', title: 'Mögliche Maßnahmen', items: ['USV, Notstrom und geeignete Kühlung', 'Redundante Systeme oder Verbindungen', 'RAID, Backup und getestete Wiederherstellung', 'Ersatzsysteme sowie passende Support- und Betriebsorganisation'] },
      { type: 'question', question: 'Der Server läuft, aber die einzige Netzleitung ist ausgefallen. Ist der Dienst verfügbar?', options: ['Ja, weil nur der Server zählt', 'Nein, weil die gesamte Kette bis zur erforderlichen Nutzung verfügbar sein muss', 'Nur für Administratoren', 'Immer, solange ein Backup existiert'], correct: 1, explanation: 'Verfügbarkeit betrifft die zugesicherte Nutzbarkeit des Dienstes. Eine ausgefallene Verbindung kann den Dienst trotz laufendem Server unerreichbar machen.' },
    ]),
    explanation('b1-wechselwirkung', 'Grundwerte und Maßnahmen ganzheitlich betrachten', 'classic', [
      { type: 'text', content: 'Ein Vorfall gehört nicht automatisch zu genau einem Grundwert. Ebenso kann eine Maßnahme mehrere Grundwerte unterstützen. Entscheidend ist, was im konkreten Szenario tatsächlich geschieht.' },
      { type: 'table', headers: ['Fall', 'Betroffene Grundwerte'], rows: [['Kryptoschlüssel werden gestohlen und anschließend gelöscht', 'Vertraulichkeit, Integrität und Verfügbarkeit'], ['Geteilter Account wird zur Dateimanipulation genutzt', 'Integrität und Authentizität; je nach Zugriff auch Vertraulichkeit'], ['Zugriffskontrolle', 'primär Vertraulichkeit, zusätzlich Integrität'], ['Zweite Internetanbindung', 'primär Verfügbarkeit']] },
      { type: 'question', question: 'Ein Backupmedium mit vertraulichen Daten wird gestohlen und steht für eine Wiederherstellung nicht mehr zur Verfügung. Was ist betroffen?', options: ['Nur Verfügbarkeit', 'Nur Vertraulichkeit', 'Vertraulichkeit und Verfügbarkeit', 'Nur Integrität'], correct: 2, explanation: 'Unbefugte können die Daten erlangen (Vertraulichkeit), und das Medium fehlt für die Wiederherstellung (Verfügbarkeit).' },
    ]),
    explanation('b1-pimo', 'PIMO: Elemente des IT-Gesamtsystems', 'classic', [
      { type: 'text', content: 'PIMO beschreibt, WAS zum betrachteten IT-Gesamtsystem gehört. Das System ist mehr als einzelne Geräte.' },
      { type: 'diagram', content: pimoSvg },
      { type: 'table', headers: ['PIMO', 'Elemente'], rows: [['P – personell', 'Nutzer, Administratoren, Ausbilder, Supportpersonal, Qualifikation'], ['I – infrastrukturell', 'Strom, Klima, Gebäude, Zutritt, physische Umgebung, Netzanbindung'], ['M – materiell', 'PC, Server, Switch, Router, Software, Anwendungen'], ['O – organisatorisch', 'Zuständigkeiten, Antragswege, Rollen, Servicedesk, Prozesse']] },
    ]),
    explanation('b1-opti', 'OPTI: Arten von Maßnahmen', 'classic', [
      { type: 'text', content: 'OPTI beschreibt, WELCHE ARTEN von Informationssicherheitsmaßnahmen angewendet werden.' },
      { type: 'diagram', content: optiSvg },
      { type: 'table', headers: ['OPTI', 'Maßnahmen'], rows: [['O – organisatorisch', 'Vorschriften, Meldewege, Rollen, Regeln, Prozesse'], ['P – personell', 'Ausbildung, Schulung, qualifiziertes Personal, ausreichende Besetzung'], ['T – technisch', 'Sichere Konfiguration, ACLs, Firewalls, Patches, technische Zugriffskontrolle'], ['I – infrastrukturell', 'Strom, Kühlung, Gebäudeschutz, Türen, Schlösser, Betriebsräume']] },
    ]),
    explanation('b1-pimo-vs-opti', 'PIMO vs. OPTI', 'classic', [
      { type: 'diagram', content: pimoOptiSvg },
      { type: 'text', content: 'PIMO fragt: Was betrachten wir? OPTI fragt: Mit welcher Maßnahmenart schützen wir es? Materiell ist ausschließlich eine PIMO-Kategorie; in OPTI gibt es keine „materiellen Maßnahmen“.' },
      { type: 'table', headers: ['Problem', 'PIMO', 'OPTI'], rows: [['Serverraum überhitzt', 'infrastrukturelles Element', 'infrastrukturelle Maßnahme: geeignete Kühlung'], ['Administrator macht Ausbildungsfehler', 'personelles Element', 'personelle Maßnahme: Ausbildung'], ['Switch ist falsch konfiguriert', 'materielles Element', 'technische Maßnahme: sichere Konfiguration']] },
      { type: 'question', question: 'Ein Switch ist falsch konfiguriert. Wie ordnest du das korrekt ein?', options: ['PIMO technisch, OPTI materiell', 'PIMO materiell, OPTI technisch', 'PIMO organisatorisch, OPTI materiell', 'PIMO personell, OPTI infrastrukturell'], correct: 1, explanation: 'Der Switch samt Software ist ein materielles Element in PIMO. Die sichere Konfiguration ist eine technische Maßnahme in OPTI.' },
    ]),
    explanation('b1-isms-pdca', 'ISMS Bw und PDCA', 'classic', [
      { type: 'text', content: 'Ein ISMS organisiert Informationssicherheit systematisch. Es betrachtet technische Informationssicherheit, ein sicheres IT-Umfeld und das Gesamtsystem und entwickelt die Maßnahmen kontinuierlich weiter.' },
      { type: 'diagram', content: pdcaSvg },
      { type: 'table', headers: ['Phase', 'Leitfrage'], rows: [['PLAN', 'Was brauchen wir? Ziele, Schutzbedarf und Maßnahmen planen'], ['DO', 'Maßnahmen umsetzen und betreiben'], ['CHECK', 'Funktioniert es und ist es ausreichend?'], ['ACT', 'Nachsteuern, verbessern und erneut planen']] },
      { type: 'question', question: 'Ein Audit zeigt, dass eine bestehende Maßnahme nicht mehr ausreicht. Welche Phase führt zum Nachsteuern?', options: ['PLAN', 'DO', 'CHECK', 'ACT'], correct: 3, explanation: 'CHECK stellt die Abweichung fest. In ACT werden Verbesserungen eingeleitet; danach beginnt der Kreislauf erneut mit PLAN.' },
    ]),
    explanation('b1-gefordertes-mass', 'Das geforderte Maß', 'classic', [
      { type: 'text', content: 'Informationssicherheit bedeutet nicht maximale Sicherheit um jeden Preis. Vertraulichkeit, Integrität und Verfügbarkeit müssen in dem Maß gewährleistet werden, das Schutzbedarf, Risiko und Aufgabe des konkreten Systems erfordern.' },
      { type: 'table', headers: ['System', 'Beispielhafte Anforderung'], rows: [['Interne Lernplattform', 'Verfügbarkeit etwa zu vereinbarten Nutzungszeiten; Ausfälle sind zeitweise verkraftbar'], ['24/7 einsatzkritisches System', 'Sehr hohe Verfügbarkeit, Redundanz, Bereitschaft und schnelle Wiederherstellung']] },
      { type: 'text', content: 'Höhere Anforderungen benötigen regelmäßig mehr Geld, Personal, Hardware, Redundanz, Infrastruktur und Organisation. 100 % Sicherheit ist kein realistischer Standardzustand: Schutzbedarf → gefordertes Maß → passende Maßnahmen.' },
      { type: 'question', question: 'Warum braucht eine Lernplattform nicht zwingend dieselbe Verfügbarkeit wie ein 24/7 einsatzkritisches System?', options: ['Weil Lernplattformen keine Informationen verarbeiten', 'Weil das geforderte Maß vom Schutzbedarf und der Aufgabe des konkreten Systems abhängt', 'Weil nur militärische Systeme verfügbar sein müssen', 'Weil maximale Sicherheit kostenlos ist'], correct: 1, explanation: 'Beide Systeme brauchen Verfügbarkeit, aber nicht zwingend auf demselben Niveau. Das geforderte Maß ist systemabhängig.' },
    ]),
    explanation('b1-adminrolle', 'Administratorrolle und Transfer', 'classic', [
      { type: 'text', content: 'Administratoren wirken besonders in der DO-Phase: Andere Rollen bestimmen Schutzbedarf und planen Maßnahmen; Administratoren setzen viele technische Maßnahmen praktisch um und liefern Betriebsinformationen für CHECK und ACT.' },
      { type: 'table', headers: ['PDCA', 'Beispiel'], rows: [['PLAN', 'Sicherheitsanforderung und Schutzbedarf festlegen'], ['DO', 'ACL konfigurieren, System härten, Backup einrichten'], ['CHECK', 'Kontrolle, Audit und Wiederherstellungstest'], ['ACT', 'Schwachstelle beheben und Maßnahmen anpassen']] },
      { type: 'question', question: 'Welche Rolle übernimmt ein Administrator in diesem Modell besonders häufig?', options: ['Ausschließlich PLAN', 'Vor allem technische Maßnahmen in DO umsetzen und Erkenntnisse für CHECK/ACT liefern', 'Nur Vorschriften schreiben', 'Allein das geforderte Maß festlegen'], correct: 1, explanation: 'Administratoren setzen viele geplante technische Maßnahmen um. Planung, Prüfung und Verbesserung bleiben dennoch ein Zusammenspiel mehrerer Rollen.' },
    ]),
    explanation('b1-zusammenfassung', 'Zusammenfassung', 'classic', [
      { type: 'list', title: 'Denkweg für reale Situationen', items: ['Welche Information oder welcher Dienst ist betroffen?', 'Welche Grundwerte sind betroffen und besonders wichtig?', 'Welche Elemente des Systems sind betroffen (PIMO)?', 'Welche Art von Maßnahme wird gebraucht (OPTI)?', 'Wie hoch muss das Schutzniveau sein?', 'Maßnahme umsetzen, Wirksamkeit prüfen und im PDCA-Zyklus weiterentwickeln.'] },
    ]),
  ].map((entry) => ({ ...entry, sectionId: entry.id }));

  const exercises = [
    { id: 'b1-grundwerte-matching', type: 'matching', question: 'Ordne die Begriffe ihrer Bedeutung zu.', pairs: [{ left: 'Vertraulichkeit', right: 'Schutz vor unbefugter Informationsgewinnung' }, { left: 'Integrität', right: 'Schutz vor unzulässiger Veränderung und deren Erkennbarkeit' }, { left: 'Verfügbarkeit', right: 'Erforderliche oder zugesicherte Nutzbarkeit' }, { left: 'Authentizität', right: 'Echtheit und eindeutige Zuordenbarkeit einer Handlung' }], explanation: 'Authentizität wird hier als Aspekt der Integrität betrachtet; die drei Grundwerte bleiben Vertraulichkeit, Integrität und Verfügbarkeit.' },
    { id: 'b1-szenarien-matching', type: 'matching', question: 'Ordne jedes Szenario dem primär betroffenen Grundwert zu.', pairs: [{ left: 'Unberechtigter liest eine Personalakte', right: 'Vertraulichkeit' }, { left: 'Kontonummer wird manipuliert', right: 'Integrität' }, { left: 'Server ist wegen Stromausfall nicht erreichbar', right: 'Verfügbarkeit' }, { left: 'Accountsharing verhindert eindeutige Zuordnung', right: 'Authentizität (im Zusammenhang mit Integrität)' }], explanation: 'In realen Vorfällen können zusätzlich weitere Grundwerte betroffen sein; hier ist jeweils der primäre Fokus gefragt.' },
    { id: 'b1-mehrere-grundwerte', type: 'select-best', question: 'Ein gestohlener Kryptoschlüssel wird anschließend gelöscht. Welche Grundwerte sind betroffen?', options: ['Nur Vertraulichkeit', 'Vertraulichkeit und Verfügbarkeit', 'Vertraulichkeit, Integrität und Verfügbarkeit', 'Nur Authentizität'], correct: 2, explanation: 'Der Schlüssel wurde unbefugt erlangt (Vertraulichkeit), verändert beziehungsweise gelöscht (Integrität) und steht nicht mehr zur Nutzung bereit (Verfügbarkeit).' },
    { id: 'b1-pimo-matching', type: 'matching', question: 'Ordne die Elemente den PIMO-Kategorien zu.', pairs: [{ left: 'Administrator', right: 'personell' }, { left: 'Klimaanlage', right: 'infrastrukturell' }, { left: 'Router', right: 'materiell' }, { left: 'Freigabeprozess', right: 'organisatorisch' }], explanation: 'PIMO klassifiziert Bestandteile des betrachteten IT-Gesamtsystems.' },
    { id: 'b1-opti-matching', type: 'matching', question: 'Ordne die Maßnahmen den OPTI-Kategorien zu.', pairs: [{ left: 'Meldeweg', right: 'organisatorisch' }, { left: 'Schulung', right: 'personell' }, { left: 'Firewall-Regel', right: 'technisch' }, { left: 'USV', right: 'infrastrukturell' }], explanation: 'OPTI klassifiziert Maßnahmenarten. Eine materielle Maßnahmenkategorie gibt es dort nicht.' },
    { id: 'b1-pimo-opti-transfer', type: 'select-best', question: 'Ein Serverraum ist unzureichend gekühlt. Welche Doppelzuordnung stimmt?', options: ['PIMO materiell / OPTI technisch', 'PIMO infrastrukturell / OPTI infrastrukturell', 'PIMO organisatorisch / OPTI materiell', 'PIMO personell / OPTI technisch'], correct: 1, explanation: 'Der Raum und seine Kühlung gehören zur Infrastruktur des Systems; geeignete Kühlung ist eine infrastrukturelle Maßnahme.' },
    { id: 'b1-pdca-ordering', type: 'ordering', question: 'Bringe den PDCA-Zyklus in die richtige Reihenfolge.', items: [{ id: 'plan', label: 'PLAN – planen' }, { id: 'do', label: 'DO – umsetzen' }, { id: 'check', label: 'CHECK – Wirksamkeit prüfen' }, { id: 'act', label: 'ACT – verbessern' }], correctOrder: ['plan', 'do', 'check', 'act'], explanation: 'Nach ACT beginnt der Kreislauf wieder bei PLAN. Sicherheit ist kein einmal erreichter Endzustand.' },
    { id: 'b1-required-level', type: 'select-best', question: 'Welches System benötigt typischerweise höhere Verfügbarkeit, Redundanz und Bereitschaft?', options: ['Ein internes Testsystem für Werktage', 'Ein 24/7 einsatzkritisches System', 'Beide immer exakt gleich', 'Keines, weil 100 % Sicherheit unmöglich ist'], correct: 1, explanation: 'Das geforderte Maß richtet sich nach Schutzbedarf und Aufgabe. Das bedeutet nicht, das weniger kritische System ungeschützt zu lassen.' },
  ];

  const quiz = [
    { question: 'Wann liegt Informationssicherheit im Kern vor?', options: ['Wenn keine Hacker existieren', 'Wenn Vertraulichkeit, Integrität und Verfügbarkeit im geforderten Maß gewährleistet sind', 'Wenn jedes System 24/7 läuft', 'Wenn alle Daten verschlüsselt sind'], correct: 1, explanation: 'Die drei Grundwerte plus das systemabhängige geforderte Maß bilden die zentrale Denklogik.' },
    { question: 'Welche Aussage zu Authentizität ist in diesem Kursmodell richtig?', options: ['Sie ist ein vierter, völlig unabhängiger Grundwert', 'Sie wird im Zusammenhang mit Integrität betrachtet und betrifft Echtheit und Zuordenbarkeit', 'Sie bedeutet ausschließlich Verfügbarkeit', 'Sie ersetzt Vertraulichkeit'], correct: 1, explanation: 'Authentizität beantwortet, von wem etwas stammt oder wer gehandelt hat, und wird hier der Integrität zugeordnet.' },
    { question: 'Kann ein Vorfall mehrere Grundwerte gleichzeitig betreffen?', options: ['Nein, jeder Fall gehört genau zu einem Wert', 'Ja, je nach Wirkung können mehrere Grundwerte betroffen sein', 'Nur bei Malware', 'Nur bei Ausfällen'], correct: 1, explanation: 'Eine Manipulation kann etwa zusätzlich einen Ausfall verursachen; die Wirkungen werden einzeln bewertet.' },
    { question: 'Welche Aussage über Maßnahmen stimmt?', options: ['Jede Maßnahme schützt genau einen Grundwert', 'Eine Maßnahme kann mehrere Grundwerte unterstützen', 'Nur Technik ist eine Sicherheitsmaßnahme', 'Redundanz verbessert Vertraulichkeit immer direkt'], correct: 1, explanation: 'Zugriffskontrolle kann beispielsweise Vertraulichkeit und Integrität unterstützen; eine zweite Leitung dient im beschriebenen Fall primär der Verfügbarkeit.' },
    { question: 'Was beschreibt PIMO?', options: ['Arten von Schutzmaßnahmen', 'Elemente des betrachteten IT-Gesamtsystems', 'Nur Hardware', 'Die vier PDCA-Phasen'], correct: 1, explanation: 'PIMO betrachtet personelle, infrastrukturelle, materielle und organisatorische Elemente.' },
    { question: 'Welche Kategorie gibt es in OPTI nicht?', options: ['organisatorisch', 'personell', 'technisch', 'materiell'], correct: 3, explanation: 'Materiell gehört zu PIMO. OPTI umfasst organisatorische, personelle, technische und infrastrukturelle Maßnahmen.' },
    { question: 'Welche Reihenfolge beschreibt PDCA?', options: ['PLAN – DO – CHECK – ACT', 'DO – PLAN – ACT – CHECK', 'CHECK – DO – PLAN – ACT', 'PLAN – ACT – DO – CHECK'], correct: 0, explanation: 'Nach ACT beginnt der kontinuierliche Kreislauf erneut bei PLAN.' },
    { question: 'Ein Audit stellt eine unzureichende Maßnahme fest. Was folgt im PDCA-Modell?', options: ['Der Prozess endet', 'In ACT wird nachgesteuert und anschließend neu geplant', 'Nur DO wird wiederholt', 'Die Feststellung wird ignoriert'], correct: 1, explanation: 'CHECK erkennt die Abweichung, ACT verbessert. Danach beginnt der nächste Planungszyklus.' },
    { question: 'Was bedeutet „gefordertes Maß“?', options: ['Immer maximale Sicherheit um jeden Preis', 'Ein dem Schutzbedarf, Risiko und Zweck angemessenes Sicherheitsniveau', 'Nur gesetzliche Mindestanforderungen', 'Für alle Systeme dasselbe Niveau'], correct: 1, explanation: 'Unterschiedliche Systeme haben unterschiedliche Schutzanforderungen und benötigen entsprechend passende Ressourcen.' },
    { question: 'Kann genügend Technik ein System dauerhaft zu 100 % sicher machen?', options: ['Ja, wenn alles verschlüsselt ist', 'Nein, Risiken, Umfeld und Anforderungen verändern sich; Sicherheit muss fortlaufend weiterentwickelt werden', 'Ja, mit zwei Firewalls', 'Nur bei Offline-Systemen'], correct: 1, explanation: '100 % Sicherheit ist kein realistischer Standardzustand. Informationssicherheit ist ein fortlaufender, risikobasierter Prozess.' },
    { question: 'Welche Aufgabe passt besonders zur DO-Phase eines Administrators?', options: ['Schutzbedarf allein verbindlich festlegen', 'System härten und ein geplantes Backup einrichten', 'Ein Audit unabhängig durchführen', 'Die gesamte Organisation neu strukturieren'], correct: 1, explanation: 'Administratoren setzen viele geplante technische Maßnahmen praktisch um.' },
    { question: 'Was macht die A-960/1 in diesem Kontext?', options: ['Sie legt Grundsätze zur Herstellung, Überwachung, Gewährleistung und Wiederherstellung der Informationssicherheit fest', 'Sie ist eine Liste aller Passwörter', 'Sie ersetzt das ISMS', 'Sie definiert nur Firewall-Regeln'], correct: 0, explanation: 'Die A-960/1 bildet den grundlegenden Regelungsrahmen; Absatznummern sind hier nicht das Lernziel.' },
  ];

  const summary = [
    'Informationssicherheit schützt Informationen und Dienste ganzheitlich – nicht nur vor Hackern.',
    'Vertraulichkeit, Integrität und Verfügbarkeit müssen im geforderten Maß gewährleistet sein; Authentizität wird hier im Zusammenhang mit Integrität betrachtet.',
    'Vorfälle und Maßnahmen können mehrere Grundwerte gleichzeitig betreffen.',
    'PIMO beschreibt Elemente des IT-Gesamtsystems; OPTI beschreibt Arten von Maßnahmen.',
    'Ein ISMS verbessert Sicherheit fortlaufend über PLAN, DO, CHECK und ACT.',
    'Das geforderte Maß hängt von Schutzbedarf, Risiko und Aufgabe des Systems ab; 100 % Sicherheit ist kein realistischer Standardzustand.',
    'Administratoren setzen besonders in der DO-Phase technische Maßnahmen praktisch um.',
  ];

  return { title, explanations, exercises, quiz, summary };
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
