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

  const decisionTreeSvg = `<svg viewBox="0 0 360 260" class="w-full h-auto max-h-72" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Datenschutz-Entscheidungsbaum</text><rect x="110" y="35" width="140" height="28" rx="6" fill="#1f6feb" fill-opacity="0.35" stroke="#58a6ff"/><text x="180" y="54" text-anchor="middle" fill="#c9d1d9" font-size="11">INFORMATION</text><line x1="180" y1="63" x2="180" y2="78" stroke="#8b949e"/><rect x="95" y="78" width="170" height="28" rx="6" fill="#1f6feb" fill-opacity="0.35" stroke="#58a6ff"/><text x="180" y="97" text-anchor="middle" fill="#c9d1d9" font-size="11">PERSONENBEZOGEN?</text><line x1="140" y1="106" x2="80" y2="130" stroke="#8b949e"/><line x1="220" y1="106" x2="280" y2="130" stroke="#8b949e"/><rect x="20" y="130" width="120" height="28" rx="6" fill="#00f0ff" fill-opacity="0.15" stroke="#00f0ff"/><text x="80" y="149" text-anchor="middle" fill="#c9d1d9" font-size="10">NEIN → andere Ebene</text><rect x="220" y="130" width="120" height="28" rx="6" fill="#1f6feb" fill-opacity="0.35" stroke="#58a6ff"/><text x="280" y="149" text-anchor="middle" fill="#c9d1d9" font-size="10">JA → weiter</text><line x1="280" y1="158" x2="280" y2="175" stroke="#8b949e"/><rect x="195" y="175" width="170" height="28" rx="6" fill="#1f6feb" fill-opacity="0.35" stroke="#58a6ff"/><text x="280" y="194" text-anchor="middle" fill="#c9d1d9" font-size="11">BESONDERE KATEGORIE?</text><line x1="235" y1="203" x2="190" y2="225" stroke="#8b949e"/><line x1="325" y1="203" x2="370" y2="225" stroke="#8b949e"/><rect x="125" y="225" width="130" height="28" rx="6" fill="#00f0ff" fill-opacity="0.15" stroke="#00f0ff"/><text x="190" y="244" text-anchor="middle" fill="#c9d1d9" font-size="10">NEIN → APersDat</text><rect x="315" y="225" width="120" height="28" rx="6" fill="#f85149" fill-opacity="0.2" stroke="#f85149"/><text x="375" y="244" text-anchor="middle" fill="#c9d1d9" font-size="10">JA → BPersDat</text></svg>`;

  const protectionAreasSvg = `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Schutzbereiche personenbezogener Daten</text><polygon points="180,45 60,195 300,195" fill="#f85149" fill-opacity="0.2" stroke="#f85149"/><text x="180" y="100" text-anchor="middle" fill="#c9d1d9" font-size="12" font-weight="bold">SB 3</text><text x="180" y="120" text-anchor="middle" fill="#c9d1d9" font-size="10">sehr hoher Schutzbedarf</text><text x="180" y="135" text-anchor="middle" fill="#8b949e" font-size="9">BPersDat + besonders sensible allg. Daten</text><polygon points="180,80 90,185 270,185" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="180" y="140" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">SB 2</text><text x="180" y="155" text-anchor="middle" fill="#c9d1d9" font-size="9">hoher Schutzbedarf</text><polygon points="180,115 120,175 240,175" fill="#3fb950" fill-opacity="0.2" stroke="#3fb950"/><text x="180" y="160" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">SB 1</text><text x="180" y="172" text-anchor="middle" fill="#c9d1d9" font-size="9">normaler Schutzbedarf</text><text x="180" y="205" text-anchor="middle" fill="#8b949e" font-size="10">Gemischte Sammlung → höchster Schutzbereich gilt</text></svg>`;

  const infoCategoriesSvg = `<svg viewBox="0 0 360 230" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Informationskategorien</text><rect x="80" y="35" width="200" height="26" rx="5" fill="#3fb950" fill-opacity="0.25" stroke="#3fb950"/><text x="180" y="53" text-anchor="middle" fill="#c9d1d9" font-size="10">ÖFFENTLICH – offiziell veröffentlicht</text><rect x="80" y="68" width="200" height="26" rx="5" fill="#58a6ff" fill-opacity="0.25" stroke="#58a6ff"/><text x="180" y="86" text-anchor="middle" fill="#c9d1d9" font-size="10">OFFEN – intern, nicht öffentlich, nicht VS</text><rect x="80" y="101" width="200" height="26" rx="5" fill="#f0883e" fill-opacity="0.25" stroke="#f0883e"/><text x="180" y="119" text-anchor="middle" fill="#c9d1d9" font-size="10">VS-NfD – nur für den Dienstgebrauch</text><rect x="80" y="134" width="200" height="26" rx="5" fill="#f0883e" fill-opacity="0.35" stroke="#f0883e"/><text x="180" y="152" text-anchor="middle" fill="#c9d1d9" font-size="10">VS-VERTRAULICH</text><rect x="80" y="167" width="200" height="26" rx="5" fill="#f85149" fill-opacity="0.25" stroke="#f85149"/><text x="180" y="185" text-anchor="middle" fill="#c9d1d9" font-size="10">GEHEIM</text><rect x="80" y="200" width="200" height="26" rx="5" fill="#f85149" fill-opacity="0.4" stroke="#f85149"/><text x="180" y="218" text-anchor="middle" fill="#c9d1d9" font-size="10">STRENG GEHEIM</text></svg>`;

  const levelsSvg = `<svg viewBox="0 0 360 180" class="w-full h-auto max-h-56" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Drei Ebenen – nicht vermischen</text><rect x="30" y="40" width="95" height="95" rx="8" fill="#1f6feb" fill-opacity="0.25" stroke="#58a6ff"/><text x="77" y="70" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Datenschutz</text><text x="77" y="90" text-anchor="middle" fill="#8b949e" font-size="9">personen-</text><text x="77" y="102" text-anchor="middle" fill="#8b949e" font-size="9">bezogen?</text><text x="77" y="122" text-anchor="middle" fill="#c9d1d9" font-size="10">APersDat / BPersDat</text><rect x="132" y="40" width="95" height="95" rx="8" fill="#00f0ff" fill-opacity="0.15" stroke="#00f0ff"/><text x="180" y="70" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Schutzbereich</text><text x="180" y="90" text-anchor="middle" fill="#8b949e" font-size="9">Schutzbedarf</text><text x="180" y="102" text-anchor="middle" fill="#8b949e" font-size="9">personen-</text><text x="180" y="114" text-anchor="middle" fill="#8b949e" font-size="9">bez. Daten</text><text x="180" y="134" text-anchor="middle" fill="#c9d1d9" font-size="10">SB1 / SB2 / SB3</text><rect x="235" y="40" width="95" height="95" rx="8" fill="#f85149" fill-opacity="0.15" stroke="#f85149"/><text x="282" y="70" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Geheim-</text><text x="282" y="85" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">haltung</text><text x="282" y="105" text-anchor="middle" fill="#8b949e" font-size="9">Information</text><text x="282" y="117" text-anchor="middle" fill="#8b949e" font-size="9">öffentlich /</text><text x="282" y="129" text-anchor="middle" fill="#8b949e" font-size="9">offen / VS</text><text x="282" y="149" text-anchor="middle" fill="#c9d1d9" font-size="10">Öffentlich / VS-Stufen</text><text x="180" y="165" text-anchor="middle" fill="#c9d1d9" font-size="10">Eine Information kann mehreren Ebenen zugeordnet sein.</text></svg>`;

  const explanations = [
    explanation('b2-einstieg', 'Drei Ebenen trennen', 'classic', [
      { type: 'text', content: 'Datenschutz, Schutzbereiche personenbezogener Daten und Geheimhaltung/Informationskategorien sind verwandt, aber nicht identisch. Jede Ebene beantwortet eine eigene Frage.' },
      { type: 'diagram', content: levelsSvg },
      { type: 'table', headers: ['Ebene', 'Frage', 'Beispiel-Antworten'], rows: [
        ['Datenschutz', 'Ist die Information personenbezogen?', 'Ja / Nein; ggf. APersDat oder BPersDat'],
        ['Schutzbereiche', 'Wie hoch ist der Schutzbedarf personenbezogener Daten?', 'SB1 normal, SB2 hoch, SB3 sehr hoch'],
        ['Geheimhaltung', 'Wie ist die Information insgesamt einzustufen?', 'Öffentlich, Offen, VS-NfD, VS-V, GEHEIM, STRENG GEHEIM'],
      ] },
      { type: 'text', content: 'Eine Information kann gleichzeitig personenbezogen sein UND einer Geheimhaltungsstufe zugeordnet sein. Die Ebenen werden bewusst getrennt betrachtet.' },
      { type: 'question', question: 'Welche Frage beantwortet der Datenschutz?', options: ['Welche Geheimhaltungsstufe gilt?', 'Ist die Information personenbezogen?', 'Welcher Schutzbereich gilt?', 'Darf ich die Information öffentlich teilen?'], correct: 1, explanation: 'Der Datenschutz fragt primär, ob Informationen eine natürliche Person betreffen. Geheimhaltung und Schutzbereiche stellen weitere Fragen.' },
    ]),

    explanation('b2-personenbezogen', 'Was sind personenbezogene Daten?', 'classic', [
      { type: 'text', content: 'Personenbezogene Daten sind Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen. Entscheidend ist, ob eine Zuordnung zur Person möglich ist – nicht ob ein Name direkt sichtbar ist. Man unterscheidet direkte und indirekte Identifizierbarkeit.' },
      { type: 'diagram', content: decisionTreeSvg },
      { type: 'table', headers: ['Direkt identifizierbar', 'Indirekt identifizierbar'], rows: [
        ['Name und Geburtsdatum zusammen', 'Personalnummer, Kennnummer, eindeutige ID'],
        ['Eindeutige Kombination mehrerer Angaben', 'IP-Adresse im konkreten Kontext, Standortdaten'],
        ['', 'Online-Kennung mit Zuordnungstabelle'],
      ] },
      { type: 'text', content: 'Nicht jede Nummer allein ist automatisch personenbezogen. Wenn sie aber einer Person zugeordnet werden kann, ist sie es. Vollständig anonymisierte Statistiken sind dagegen nicht personenbezogen.' },
      { type: 'question', question: 'Wann ist eine Information personenbezogen?', options: ['Nur wenn der Name direkt enthalten ist', 'Wenn sie sich auf eine identifizierte oder identifizierbare natürliche Person bezieht', 'Nur wenn ein Geburtsdatum enthalten ist', 'Nur bei Daten in einem Personalsystem'], correct: 1, explanation: 'Personenbezogenheit hängt davon ab, ob eine Zuordnung zu einer Person möglich ist – direkt oder indirekt.' },
    ]),

    explanation('b2-warum-datenschutz', 'Warum Datenschutz?', 'classic', [
      { type: 'text', content: 'Datenschutz schützt nicht Daten um ihrer selbst willen, sondern die Rechte und Freiheiten von Menschen. Missbräuchliche Verarbeitung kann zu Diskriminierung, Erpressung, unerwünschter Profilbildung, Einflussnahme und Kontrollverlust führen.' },
      { type: 'text', content: 'Das Recht auf informationelle Selbstbestimmung ist eine zentrale deutsche Grundrechtsidee: Jeder soll grundsätzlich selbst entscheiden können, wer was über ihn erfährt.' },
      { type: 'question', question: 'Wem oder was dient der Datenschutz primär?', options: ['Schutz natürlicher Personen', 'Schutz von Softwarelizenzen', 'Schutz von Servern vor Ausfall', 'Schutz militärischer Geheimnisse'], correct: 0, explanation: 'Datenschutz schützt natürliche Personen bei der Verarbeitung ihrer Daten.' },
    ]),

    explanation('b2-rechtsgrundlage', 'Rechtsgrundlage oder Einwilligung', 'classic', [
      { type: 'text', content: 'Datenverarbeitung darf erfolgen, wenn eine Rechtsgrundlage besteht oder die betroffene Person wirksam eingewilligt hat. Im hier behandelten Grundmodell begegnen dir vor allem diese beiden Wege.' },
      { type: 'text', content: 'Eine Einwilligung ist keine allgemeine Freikarte. Sie muss freiwillig, informiert und situationsbezogen sein. Eine Verarbeitung, die für einen Vertrag nötig ist, rechtfertigt sich durch die Vertragsabwicklung – das ist keine stillschweigende „Zustimmung zu allem".' },
      { type: 'question', question: 'Ein Online-Shop benötigt die Lieferadresse. Auf welcher Basis darf er sie verarbeiten?', options: ['Weil jede Verarbeitung automatisch eine Einwilligung ist', 'Weil sie für die Abwicklung des Vertrags notwendig ist', 'Weil öffentliche Daten keine Regeln haben', 'Weil Datenschutz nur für sensible Daten gilt'], correct: 1, explanation: 'Notwendige Verarbeitungen für Vertragsabwicklung beruhen auf einer Rechtsgrundlage, nicht auf einer pauschalen Zustimmung.' },
    ]),

    explanation('b2-art9', 'Besondere Kategorien nach Art. 9 DSGVO', 'classic', [
      { type: 'text', content: 'Art. 9 DSGVO listet besondere Kategorien personenbezogener Daten auf. Ihre Verarbeitung birgt besondere Risiken für die Betroffenen.' },
      { type: 'list', title: 'Besondere Kategorien', items: [
        'Rassische oder ethnische Herkunft',
        'Politische Meinungen',
        'Religiöse oder weltanschauliche Überzeugungen',
        'Gewerkschaftszugehörigkeit',
        'Genetische Daten',
        'Biometrische Daten zur eindeutigen Identifizierung',
        'Gesundheitsdaten',
        'Sexualleben',
        'Sexuelle Orientierung',
      ] },
      { type: 'text', content: 'Hinweis: Nicht jedes biometrische Merkmal ist automatisch Art. 9. Relevant ist die biometrische Verarbeitung zur eindeutigen Identifizierung.' },
      { type: 'question', question: 'Welche Daten gehören zu den besonderen Kategorien nach Art. 9 DSGVO?', options: ['Name und Adresse', 'Kontonummer', 'Gesundheitsdaten und politische Meinungen', 'Öffentliche Webseite'], correct: 2, explanation: 'Art. 9 DSGVO nennt unter anderem Gesundheitsdaten, politische Meinungen und religiöse Überzeugungen als besondere Kategorien.' },
    ]),

    explanation('b2-apersdat-bpersdat', 'APersDat und BPersDat', 'classic', [
      { type: 'text', content: 'Im verwendeten Bundeswehr-/Kursmodell werden personenbezogene Daten unterschieden in allgemeine personenbezogene Daten (APersDat) und besondere personenbezogene Daten (BPersDat).' },
      { type: 'table', headers: ['Kategorie', 'Bedeutung', 'Beispiel'], rows: [
        ['APersDat', 'Allgemeine personenbezogene Daten', 'Name, Dienstgrad, dienstliche E-Mail, private Adresse, Kontonummer'],
        ['BPersDat', 'Besondere personenbezogene Daten', 'Gesundheitsdaten, politische Meinung, religiöse Überzeugung, Gewerkschaftszugehörigkeit'],
      ] },
      { type: 'text', content: 'BPersDat orientieren sich an Art. 9 DSGVO, sind aber ein kurseigenes Kürzel. Diese Begriffe werden im Kursmodell verwendet, nicht als offizielle DSGVO-Terminologie dargestellt.' },
      { type: 'question', question: 'Was ist ein typisches Beispiel für BPersDat?', options: ['Name und Dienstgrad', 'Gesundheitsdiagnose', 'Dienstliche E-Mail-Adresse', 'Gebäude- und Raumnummer'], correct: 1, explanation: 'Gesundheitsdaten sind besondere personenbezogene Daten und damit BPersDat. Name und Dienstgrad sind APersDat.' },
    ]),

    explanation('b2-sb1', 'Schutzbereich 1', 'classic', [
      { type: 'text', content: 'Schutzbereich 1 deckt personenbezogene Daten mit normalem Schutzbedarf ab. Dazu gehören typischerweise Funktionsträgerdaten.' },
      { type: 'list', title: 'Typische SB1-Inhalte', items: [
        'Name, Dienstgrad oder Amtsbezeichnung',
        'Einheit / Organisationseinheit',
        'Dienstliche Adresse und dienstliche Erreichbarkeit',
        'Funktion / Tätigkeitsbereich',
        'Personalnummer und bestimmte Teile der Personenkennziffer',
      ] },
      { type: 'text', content: 'SB1 ist nicht „ungeschützt“. Der Schutzbedarf ist nur gegenüber SB2 und SB3 niedriger.' },
    ]),

    explanation('b2-sb2', 'Schutzbereich 2', 'classic', [
      { type: 'text', content: 'Schutzbereich 2 deckt personenbezogene Daten mit hohem Schutzbedarf ab. Im Kursmodell gilt: Was weder SB1 noch SB3 ist, fällt hierunter.' },
      { type: 'list', title: 'Typische SB2-Inhalte', items: [
        'Private Adresse',
        'Private Telefonnummer oder E-Mail',
        'Kontodaten',
        'Steuerdaten',
        'Familienstand, Kinderzahl, Geburtsdatum',
      ] },
      { type: 'text', content: 'SB2 enthält sensible private Daten und ist deutlich höher zu schützen als SB1.' },
    ]),

    explanation('b2-sb3', 'Schutzbereich 3', 'classic', [
      { type: 'text', content: 'Schutzbereich 3 deckt personenbezogene Daten mit sehr hohem Schutzbedarf ab. Hierzu gehören alle BPersDat sowie besonders sensible allgemeine Daten.' },
      { type: 'list', title: 'Typische SB3-Inhalte', items: [
        'Alle BPersDat',
        'Beurteilungen',
        'Sicherheitsakte',
        'Disziplinarakte',
        'Verurteilungen / BZR-Auszüge',
      ] },
      { type: 'diagram', content: protectionAreasSvg },
      { type: 'text', content: 'Alle BPersDat fallen mindestens in SB3. Aber: Nicht jedes SB3-Datum ist automatisch BPersDat. Beispiel: Eine Disziplinarakte kann SB3 sein, ohne Art. 9-Daten zu enthalten.' },
    ]),

    explanation('b2-hoechstprinzip', 'Höchstprinzip bei gemischten Daten', 'classic', [
      { type: 'text', content: 'Enthält eine Datei, Liste oder Sammlung Daten aus mehreren Schutzbereichen, gilt für das gesamte Objekt der höchste enthaltene Schutzbereich.' },
      { type: 'table', headers: ['Inhalt', 'Höchster Schutzbereich', 'Folge'], rows: [
        ['Nur Name und Dienstgrad', 'SB1', 'Objekt wie SB1 behandeln'],
        ['Name, private Adresse', 'SB2', 'Objekt wie SB2 behandeln'],
        ['Name, private Adresse, Gesundheitsdatum', 'SB3', 'Objekt wie SB3 behandeln'],
        ['Funktionsträgerdaten + Sicherheitsakte', 'SB3', 'Gesamte Sammlung sehr hoch schützen'],
      ] },
      { type: 'question', question: 'Eine Excel-Liste enthält Name, private Adresse und eine Gesundheitsangabe. Welcher Schutzbereich gilt für die gesamte Datei?', options: ['SB1', 'SB2', 'SB3', 'Der niedrigste, damit der Umgang einfacher bleibt'], correct: 2, explanation: 'Bei gemischten Daten gilt der höchste enthaltene Schutzbereich. Hier ist das Gesundheitsdatum BPersDat und damit SB3.' },
    ]),

    explanation('b2-informationskategorien', 'Öffentlich, offen, Verschlusssachen', 'classic', [
      { type: 'text', content: 'Informationen lassen sich auch nach ihrer allgemeinen Einstufung einordnen. Wichtig: Öffentlich und offen sind keine Synonyme.' },
      { type: 'table', headers: ['Kategorie', 'Bedeutung'], rows: [
        ['Öffentliche Informationen', 'Offiziell von zuständiger Stelle veröffentlicht oder aus öffentlicher Quelle'],
        ['Offene Informationen', 'Nicht öffentlich, nicht als Verschlusssache eingestuft, aber dienstlich schutzbedürftig'],
        ['Verschlusssachen', 'Unterliegen Geheimhaltungsvorschriften'],
      ] },
      { type: 'text', content: 'Ein Dokument, das unerlaubt ins Internet hochgeladen wurde, wird dadurch nicht automatisch öffentlich. „Offen“ heißt lediglich, dass keine VS-Einstufung vorliegt.' },
      { type: 'question', question: 'Was bedeuten „offene Informationen"?', options: ['Informationen, die jeder sehen darf', 'Interne Informationen ohne Verschlusssachen-Einstufung', 'Streng geheime Informationen', 'Informationen ohne Urheber'], correct: 1, explanation: 'Offen heißt nicht klassifiziert, muss aber nicht öffentlich sein.' },
    ]),

    explanation('b2-vs-stufen', 'Geheimhaltungsgrade', 'classic', [
      { type: 'diagram', content: infoCategoriesSvg },
      { type: 'text', content: 'Verschlusssachen sind in vier Geheimhaltungsgrade eingeteilt. Die mögliche Schadenswirkung bei Kenntnisnahme durch Unbefugte steigt von oben nach unten.' },
      { type: 'table', headers: ['Stufe', 'vereinfachte Konsequenz'], rows: [
        ['VS-NUR FÜR DEN DIENSTGEBRAUCH (VS-NfD)', 'nachteilig'],
        ['VS-VERTRAULICH', 'schädlich'],
        ['GEHEIM', 'Sicherheit gefährden / schwerer Schaden'],
        ['STRENG GEHEIM', 'Bestand oder lebenswichtige Interessen gefährdet'],
      ] },
      { type: 'question', question: 'Welche Reihenfolge der VS-Stufen ist korrekt?', options: ['VS-NfD → VS-V → GEHEIM → STRENG GEHEIM', 'STRENG GEHEIM → GEHEIM → VS-V → VS-NfD', 'VS-V → VS-NfD → GEHEIM → STRENG GEHEIM', 'GEHEIM → STRENG GEHEIM → VS-V → VS-NfD'], correct: 0, explanation: 'Die Reihenfolge lautet VS-NfD, VS-VERTRAULICH, GEHEIM, STRENG GEHEIM.' },
    ]),

    explanation('b2-needtoknow', 'Need-to-know', 'classic', [
      { type: 'text', content: 'Need-to-know bedeutet: Auch wer grundsätzlich für eine Geheimhaltungsstufe freigeschaltet ist, darf eine konkrete Information nur erfahren, wenn es für die jeweilige Aufgabe dienstlich notwendig ist.' },
      { type: 'text', content: 'Freigabe für eine Stufe ersetzt keine Berechtigung für jede einzelne Information dieser Stufe.' },
      { type: 'question', question: 'Ein Mitarbeiter ist für VS-VERTRAULICH freigegeben, arbeitet aber nicht an einem bestimmten Vorgang. Darf er die zugehörige VS-V-Datei lesen?', options: ['Ja, weil die Stufe passt', 'Nein, es fehlt die dienstliche Notwendigkeit', 'Ja, wenn er sie im selben Gebäude öffnet', 'Nur außerhalb der Dienstzeit'], correct: 1, explanation: 'Need-to-know verlangt eine dienstliche Notwendigkeit für die konkrete Information, nicht nur die allgemeine Freigabe.' },
    ]),

    explanation('b2-systemfreigabe', 'Systemfreigabe und Dateieinstufung', 'classic', [
      { type: 'text', content: 'Ein IT-System hat eine zugelassene maximale Einstufung. Höher eingestufte Daten dürfen nicht in einem dafür nicht zugelassenen System verarbeitet werden.' },
      { type: 'text', content: 'Aber: Eine Datei in einem höher eingestuften System wird dadurch nicht automatisch selbst höher eingestuft. Eine VS-NfD-Datei in einem GEHEIM-System bleibt VS-NfD, wenn sie entsprechend gekennzeichnet ist.' },
      { type: 'question', question: 'Ein System ist maximal für OFFEN zugelassen. Was gilt für eine VS-NfD-Datei?', options: ['Sie darf dort gespeichert werden, weil VS-NfD niedrig ist', 'Sie darf dort nicht gespeichert werden, weil sie die maximale Systemeinstufung übersteigt', 'Sie wird automatisch OFFEN', 'Systemfreigaben gelten nur für Personen, nicht für Daten'], correct: 1, explanation: 'Das System ist nur für OFFEN zugelassen. VS-NfD übersteigt diese Einstufung und darf dort nicht verarbeitet werden.' },
    ]),

    explanation('b2-zusammenfassung', 'Zusammenfassung und Transfer', 'classic', [
      { type: 'text', content: 'Beim Umgang mit Informationen folgst du einem Entscheidungsweg: Personenbezug erkennen, ggf. besondere Kategorie (BPersDat) prüfen, Schutzbereich bestimmen, bei gemischten Daten das Höchstprinzip anwenden, Geheimhaltungsstufe prüfen und Need-to-know sowie zulässiges System beachten.' },
      { type: 'list', title: 'Wichtige Fehlannahmen', items: [
        '„Nur Name und Geburtsdatum sind personenbezogen." → falsch',
        '„Alle privaten Daten sind BPersDat." → falsch',
        '„SB2 bedeutet niedriger Schutzbedarf." → falsch',
        '„OFFEN bedeutet öffentlich." → falsch',
        '„Internetfundstelle = öffentlich." → falsch',
        '„Systemfreigabe für GEHEIM berechtigt zu jeder GEHEIM-Information." → falsch',
      ] },
    ]),
  ];

  const exercises = [
    {
      id: 'b2-personal-data-classify',
      type: 'matching',
      question: 'Ordne die Daten der richtigen Kategorie zu: personenbezogen, APersDat oder BPersDat.',
      pairs: [
        { left: 'Name', right: 'APersDat' },
        { left: 'Personalnummer', right: 'APersDat' },
        { left: 'IP-Adresse mit Nutzerzuordnung', right: 'APersDat' },
        { left: 'Gesundheitsdiagnose', right: 'BPersDat' },
        { left: 'Politische Meinung', right: 'BPersDat' },
        { left: 'Vollständig anonymisierte Statistik', right: 'nicht personenbezogen' },
      ],
      explanation: 'Entscheidend ist die Zuordnung zu einer Person. Anonymisierte Statistiken sind nicht personenbezogen. Gesundheitsdaten und politische Meinung sind BPersDat.',
    },
    {
      id: 'b2-protection-area-match',
      type: 'matching',
      question: 'Ordne die Daten dem passenden Schutzbereich zu.',
      pairs: [
        { left: 'Dienstgrad und dienstliche E-Mail', right: 'SB1' },
        { left: 'Private Adresse', right: 'SB2' },
        { left: 'Kontodaten', right: 'SB2' },
        { left: 'Gesundheitsdaten', right: 'SB3' },
        { left: 'Sicherheitsakte', right: 'SB3' },
      ],
      explanation: 'Funktionsträgerdaten sind SB1, private sensible Daten SB2, BPersDat und besonders sensible allgemeine Daten SB3.',
    },
    {
      id: 'b2-highest-wins',
      type: 'select-best',
      question: 'Eine Datei enthält: Name (SB1), private Adresse (SB2), Gesundheitsdatum (SB3). Welcher Schutzbereich gilt für die gesamte Datei?',
      options: ['SB1', 'SB2', 'SB3', 'Der Durchschnitt: SB2'],
      correct: 2,
      explanation: 'Bei gemischten Daten gilt der höchste enthaltene Schutzbereich. Das Gesundheitsdatum ist BPersDat und damit SB3.',
    },
    {
      id: 'b2-public-vs-open',
      type: 'select-best',
      question: 'Ein dienstliches Dokument ist auf einem internen Portal als OFFEN verfügbar. Ein Mitarbeiter lädt es auf Social Media hoch. Was ist richtig?',
      options: ['Es wird dadurch öffentlich.', 'Es bleibt intern/dienstlich; die private Veröffentlichung war nicht erlaubt.', 'OFFEN bedeutet, dass jeder es veröffentlichen darf.', 'Es wird automatisch VS-NfD.'],
      correct: 1,
      explanation: 'OFFEN bedeutet keine VS-Einstufung, aber nicht „öffentlich“. Eine private Veröffentlichung ist eine eigenmächtige Handlung, keine offizielle Freigabe.',
    },
    {
      id: 'b2-vs-order',
      type: 'ordering',
      question: 'Bringe die VS-Stufen in die richtige Reihenfolge – von der niedrigsten zur höchsten Stufe.',
      items: [
        { id: 'vs-nfd', label: 'VS-NfD' },
        { id: 'vs-v', label: 'VS-VERTRAULICH' },
        { id: 'vs-g', label: 'GEHEIM' },
        { id: 'vs-sg', label: 'STRENG GEHEIM' },
      ],
      explanation: 'Die Reihenfolge lautet VS-NfD, VS-VERTRAULICH, GEHEIM, STRENG GEHEIM.',
    },
    {
      id: 'b2-needtoknow-system',
      type: 'select-best',
      question: 'Ein GEHEIM-freigeschalteter Mitarbeiter hat keine Aufgabe an einem bestimmten GEHEIM-Vorgang. Darf er die zugehörige Datei lesen?',
      options: ['Ja, die Freigabe reicht.', 'Nein, es fehlt Need-to-know.', 'Ja, wenn er sie auf seinem privaten Laptop öffnet.', 'Ja, solange er sie nicht ausdruckt.'],
      correct: 1,
      explanation: 'Need-to-know verlangt eine dienstliche Notwendigkeit für die konkrete Information.' },
  ];

  const quiz = [
    { facet: 'datenschutz', question: 'Wem oder was dient der Datenschutz primär?', options: ['Schutz natürlicher Personen', 'Schutz von Softwarelizenzen', 'Schutz von Servern vor Ausfall', 'Schutz militärischer Geheimnisse'], correct: 0, explanation: 'Datenschutz schützt natürliche Personen bei der Verarbeitung ihrer Daten.' },
    { facet: 'identifiability', question: 'Wann ist eine Information personenbezogen?', options: ['Nur wenn der Name direkt enthalten ist', 'Wenn sie sich auf eine identifizierte oder identifizierbare natürliche Person bezieht', 'Nur bei Daten in einem Personalsystem', 'Nur bei Angaben mit Geburtsdatum'], correct: 1, explanation: 'Personenbezogenheit hängt davon ab, ob eine Zuordnung zu einer Person möglich ist.' },
    { facet: 'art9', question: 'Welche Daten gehören zu den besonderen Kategorien nach Art. 9 DSGVO?', options: ['Name und Adresse', 'Kontonummer', 'Gesundheitsdaten und politische Meinungen', 'Öffentliche Webseite'], correct: 2, explanation: 'Art. 9 DSGVO nennt Gesundheitsdaten, politische Meinungen und weitere Kategorien als besondere Kategorien.' },
    { facet: 'apersdat', question: 'Was ist ein typisches Beispiel für BPersDat?', options: ['Name und Dienstgrad', 'Gesundheitsdiagnose', 'Dienstliche E-Mail-Adresse', 'Personalnummer'], correct: 1, explanation: 'Gesundheitsdaten sind besondere personenbezogene Daten und damit BPersDat.' },
    { facet: 'schutzbereich', question: 'Eine Excel-Liste enthält Name, private Adresse und eine Gesundheitsangabe. Welcher Schutzbereich gilt für die gesamte Datei?', options: ['SB1', 'SB2', 'SB3', 'Der niedrigste enthaltene Bereich'], correct: 2, explanation: 'Bei gemischten Daten gilt der höchste enthaltene Schutzbereich. Das Gesundheitsdatum ist BPersDat und damit SB3.' },
    { facet: 'open', question: 'Was bedeuten „offene Informationen"?', options: ['Informationen, die jeder sehen darf', 'Interne Informationen ohne Verschlusssachen-Einstufung', 'Streng geheime Informationen', 'Informationen ohne Urheber'], correct: 1, explanation: 'Offen heißt nicht klassifiziert, muss aber nicht öffentlich sein.' },
    { facet: 'vs-order', question: 'Welche Reihenfolge der VS-Stufen ist korrekt?', options: ['VS-NfD → VS-V → GEHEIM → STRENG GEHEIM', 'STRENG GEHEIM → GEHEIM → VS-V → VS-NfD', 'VS-V → VS-NfD → GEHEIM → STRENG GEHEIM', 'GEHEIM → STRENG GEHEIM → VS-V → VS-NfD'], correct: 0, explanation: 'Die Reihenfolge lautet VS-NfD, VS-VERTRAULICH, GEHEIM, STRENG GEHEIM.' },
    { facet: 'needtoknow', question: 'Ein Mitarbeiter ist für VS-VERTRAULICH freigegeben, arbeitet aber nicht an einem bestimmten Vorgang. Darf er die zugehörige VS-V-Datei lesen?', options: ['Ja, weil die Stufe passt', 'Nein, es fehlt die dienstliche Notwendigkeit', 'Ja, wenn er sie im selben Gebäude öffnet', 'Nur außerhalb der Dienstzeit'], correct: 1, explanation: 'Need-to-know verlangt eine dienstliche Notwendigkeit für die konkrete Information.' },
  ];

  const summary = [
    'Datenschutz, Schutzbereiche und Geheimhaltung/Informationskategorien sind drei getrennte Ebenen.',
    'Personenbezogene Daten betreffen eine identifizierte oder identifizierbare natürliche Person – direkt oder indirekt.',
    'BPersDat orientieren sich an Art. 9 DSGVO; APersDat sind allgemeine personenbezogene Daten.',
    'SB1 = normaler Schutzbedarf, SB2 = hoher Schutzbedarf, SB3 = sehr hoher Schutzbedarf.',
    'Bei gemischten Daten gilt der höchste enthaltene Schutzbereich.',
    'Öffentlich, offen und Verschlusssache sind unterschiedliche Informationskategorien.',
    'Die vier VS-Stufen sind VS-NfD, VS-VERTRAULICH, GEHEIM, STRENG GEHEIM.',
    'Need-to-know und Systemfreigabe begrenzen, was womit verarbeitet werden darf.',
  ];

  return { title, explanations, exercises, quiz, summary };
}

export function buildInformationSecurityIncidentsLesson() {
  const title = 'Block 3: Informationssicherheitslücken, -verstöße, -vorkommnisse & Meldewesen';

  const gapIncidentSvg = `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-60" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Lücke und Verstoß können jeweils ein Vorkommnis begründen</text><rect x="20" y="50" width="140" height="60" rx="8" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="90" y="80" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">LÜCKE</text><text x="90" y="98" text-anchor="middle" fill="#8b949e" font-size="9">Gefährdung</text><rect x="200" y="50" width="140" height="60" rx="8" fill="#f85149" fill-opacity="0.2" stroke="#f85149"/><text x="270" y="80" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">VERSTOSS</text><text x="270" y="98" text-anchor="middle" fill="#8b949e" font-size="9">Regelwidrige Handlung</text><line x1="90" y1="110" x2="180" y2="160" stroke="#8b949e" marker-end="url(#arrow)"/><line x1="270" y1="110" x2="180" y2="160" stroke="#8b949e" marker-end="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 L0,0" fill="#8b949e"/></marker></defs><rect x="100" y="150" width="160" height="50" rx="8" fill="#1f6feb" fill-opacity="0.25" stroke="#58a6ff"/><text x="180" y="175" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">VORKOMMNIS</text><text x="180" y="190" text-anchor="middle" fill="#8b949e" font-size="9">Sicherheit gefährdet</text><text x="180" y="210" text-anchor="middle" fill="#8b949e" font-size="8">optional: auch Kryptosicherheitsvorkommnis → Vorkommnis</text></svg>`;

  const reportingPathSvg = `<svg viewBox="0 0 360 180" class="w-full h-auto max-h-52" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Meldeweg</text><rect x="110" y="35" width="140" height="26" rx="5" fill="#3fb950" fill-opacity="0.25" stroke="#3fb950"/><text x="180" y="53" text-anchor="middle" fill="#c9d1d9" font-size="10">Nutzer / Admin</text><rect x="110" y="72" width="140" height="26" rx="5" fill="#58a6ff" fill-opacity="0.25" stroke="#58a6ff"/><text x="180" y="90" text-anchor="middle" fill="#c9d1d9" font-size="10">ISB</text><rect x="110" y="109" width="140" height="26" rx="5" fill="#f0883e" fill-opacity="0.25" stroke="#f0883e"/><text x="180" y="127" text-anchor="middle" fill="#c9d1d9" font-size="10">CSOCBw</text><rect x="80" y="146" width="200" height="26" rx="5" fill="#f85149" fill-opacity="0.2" stroke="#f85149"/><text x="180" y="164" text-anchor="middle" fill="#c9d1d9" font-size="10">Bei Bedarf: CERT / Forensik / BAMAD</text><line x1="180" y1="61" x2="180" y2="72" stroke="#8b949e"/><line x1="180" y1="98" x2="180" y2="109" stroke="#8b949e"/><line x1="180" y1="135" x2="180" y2="146" stroke="#8b949e"/></svg>`;

  const rolesSvg = `<svg viewBox="0 0 360 250" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Rollen</text><text x="85" y="40" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Dezentral</text><text x="275" y="40" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Zentral</text><rect x="20" y="50" width="130" height="28" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="85" y="69" text-anchor="middle" fill="#c9d1d9" font-size="10">ISB</text><rect x="20" y="84" width="130" height="28" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="85" y="103" text-anchor="middle" fill="#c9d1d9" font-size="10">ADSB</text><rect x="20" y="118" width="130" height="28" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="85" y="137" text-anchor="middle" fill="#c9d1d9" font-size="10">SiBe</text><rect x="20" y="152" width="130" height="28" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="85" y="171" text-anchor="middle" fill="#c9d1d9" font-size="10">KryVw</text><rect x="210" y="50" width="130" height="28" rx="5" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="275" y="69" text-anchor="middle" fill="#c9d1d9" font-size="10">CSOCBw</text><rect x="210" y="84" width="130" height="28" rx="5" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="275" y="103" text-anchor="middle" fill="#c9d1d9" font-size="10">CERTBw</text><rect x="210" y="118" width="130" height="28" rx="5" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="275" y="137" text-anchor="middle" fill="#c9d1d9" font-size="10">IT-Forensik</text><rect x="210" y="152" width="130" height="28" rx="5" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="275" y="171" text-anchor="middle" fill="#c9d1d9" font-size="10">BAMAD</text><line x1="150" y1="95" x2="210" y2="95" stroke="#8b949e"/><line x1="180" y1="124" x2="180" y2="220" stroke="#8b949e" stroke-dasharray="3"/><text x="180" y="235" text-anchor="middle" fill="#8b949e" font-size="9">Gesamtverantwortung: Dienststellenleiter / Kommandeur</text></svg>`;

  const correlationSvg = `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-60" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Einzelmeldung → Lagebild</text><rect x="20" y="40" width="70" height="30" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="55" y="60" text-anchor="middle" fill="#c9d1d9" font-size="9">Nutzer A</text><rect x="20" y="80" width="70" height="30" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="55" y="100" text-anchor="middle" fill="#c9d1d9" font-size="9">Nutzer B</text><rect x="20" y="120" width="70" height="30" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="55" y="140" text-anchor="middle" fill="#c9d1d9" font-size="9">Nutzer C</text><rect x="20" y="160" width="70" height="30" rx="5" fill="#58a6ff" fill-opacity="0.2" stroke="#58a6ff"/><text x="55" y="180" text-anchor="middle" fill="#c9d1d9" font-size="9">Sensoren</text><line x1="90" y1="55" x2="130" y2="105" stroke="#8b949e"/><line x1="90" y1="95" x2="130" y2="115" stroke="#8b949e"/><line x1="90" y1="135" x2="130" y2="125" stroke="#8b949e"/><line x1="90" y1="175" x2="130" y2="135" stroke="#8b949e"/><rect x="130" y="90" width="50" height="60" rx="5" fill="#f0883e" fill-opacity="0.2" stroke="#f0883e"/><text x="155" y="118" text-anchor="middle" fill="#c9d1d9" font-size="9">ISBs</text><line x1="180" y1="120" x2="230" y2="120" stroke="#8b949e"/><rect x="230" y="90" width="100" height="60" rx="5" fill="#f85149" fill-opacity="0.2" stroke="#f85149"/><text x="280" y="118" text-anchor="middle" fill="#c9d1d9" font-size="9">CSOCBw</text><line x1="280" y1="150" x2="280" y2="180" stroke="#8b949e"/><text x="280" y="198" text-anchor="middle" fill="#8b949e" font-size="9">Gesamtlagebild</text></svg>`;

  const incidentFlowSvg = `<svg viewBox="0 0 360 250" class="w-full h-auto max-h-64" xmlns="http://www.w3.org/2000/svg"><text x="180" y="20" text-anchor="middle" fill="#c9d1d9" font-size="13" font-weight="bold">Incident-Grundablauf</text><rect x="120" y="35" width="120" height="28" rx="6" fill="#3fb950" fill-opacity="0.25" stroke="#3fb950"/><text x="180" y="54" text-anchor="middle" fill="#c9d1d9" font-size="10">Auffälligkeit</text><line x1="180" y1="63" x2="180" y2="78" stroke="#8b949e"/><rect x="120" y="78" width="120" height="28" rx="6" fill="#3fb950" fill-opacity="0.25" stroke="#3fb950"/><text x="180" y="97" text-anchor="middle" fill="#c9d1d9" font-size="10">Erkennen</text><line x1="180" y1="106" x2="180" y2="121" stroke="#8b949e"/><rect x="120" y="121" width="120" height="28" rx="6" fill="#58a6ff" fill-opacity="0.25" stroke="#58a6ff"/><text x="180" y="140" text-anchor="middle" fill="#c9d1d9" font-size="10">Einordnen + Melden</text><line x1="180" y1="149" x2="180" y2="164" stroke="#8b949e"/><rect x="120" y="164" width="120" height="28" rx="6" fill="#f0883e" fill-opacity="0.25" stroke="#f0883e"/><text x="180" y="183" text-anchor="middle" fill="#c9d1d9" font-size="10">Sofortmaßnahmen</text><line x1="180" y1="192" x2="180" y2="207" stroke="#8b949e"/><rect x="105" y="207" width="150" height="28" rx="6" fill="#f85149" fill-opacity="0.2" stroke="#f85149"/><text x="180" y="226" text-anchor="middle" fill="#c9d1d9" font-size="10">Zentrale Bewertung + Weisung</text></svg>`;

  const explanations = [
    explanation('b3-belehrungen', 'Warum Regeln und Belehrungen?', 'classic', [
      { type: 'text', content: 'Regeln und Belehrungen sind keine reine Formalität. Sie sollen Handlungssicherheit geben: Was ist erlaubt? Was ist verboten? Wann muss ich reagieren? Wann muss ich melden? Wen informiere ich?' },
      { type: 'text', content: 'Wer die Regeln kennt, erkennt schneller, wenn etwas nicht passt, und weiß, welche Schritte folgen.' },
      { type: 'question', question: 'Welchen Zweck erfüllen Belehrungen zur Informationssicherheit primär?', options: ['Sie ersetzen jede technische Maßnahme', 'Sie schaffen Handlungssicherheit', 'Sie dienen nur der Bürokratie', 'Sie sind optionaler Zusatzstoff'], correct: 1, explanation: 'Belehrungen zeigen, was erlaubt ist, wann reagiert und wann gemeldet werden muss.' },
    ]),

    explanation('b3-verantwortung', 'Verantwortung', 'classic', [
      { type: 'text', content: 'Die Gesamtverantwortung für Informationssicherheit liegt beim Dienststellenleiter beziehungsweise Kommandeur. Er trägt die Verantwortung, den Betrieb so zu organisieren, dass Informationssicherheit gewährleistet werden kann.' },
      { type: 'text', content: 'Das bedeutet nicht, dass jeder Einzelne keine Verantwortung hat. Jeder, der mit Informationen umgeht, muss die Regeln einhalten und Vorfälle melden. Die organisatorische Gesamtverantwortung liegt aber bei der Leitung.' },
      { type: 'question', question: 'Wer trägt laut Kursmodell die Gesamtverantwortung für Informationssicherheit?', options: ['Jeder einzelne Mitarbeiter allein', 'Der ISB', 'Der Dienststellenleiter / Kommandeur', 'Das CERTBw'], correct: 2, explanation: 'Die organisatorische Gesamtverantwortung liegt bei der Dienststellenleitung.' },
    ]),

    explanation('b3-rollen-dezentral', 'Dezentrale InfoSichh-Rollen', 'classic', [
      { type: 'text', content: 'Vor Ort gibt es spezialisierte Rollen, die bei Fragen und Vorfällen helfen. Sie kennen die örtlichen Gegebenheiten und sind die ersten Ansprechpartner.' },
      { type: 'table', headers: ['Rolle', 'Kernaufgabe'], rows: [
        ['ISB', 'Informationssicherheitsbeauftragter: berät, dokumentiert, belehrt, kontrolliert, unterstützt bei Freigaben; zentrale lokale Rolle im Meldewesen'],
        ['ADSB', 'Administrativer Datenschutzbeauftragter: Datenschutzfragen, Beratung, Prüfung, Datenschutzverstöße'],
        ['SiBe', 'Sicherheitsbeauftragter: militärische Sicherheit, Zutritt, Sicherheitsüberprüfung, Kasernen-/Sperrzonen'],
        ['KryVw', 'Kryptoverwalter: Kryptomittel, Ausgabe, Nachweis, ordnungsgemäße Handhabung'],
      ] },
      { type: 'text', content: 'Der ISB ist im Meldewesen die zentrale lokale Rolle. Das heißt, Vorfälle werden typischerweise zunächst an den ISB gemeldet, der sie bewertet und weiterleitet.' },
      { type: 'question', question: 'Wer ist im lokalen Meldewesen die zentrale Anlaufstelle?', options: ['CERTBw', 'ISB', 'CSOCBw', 'BAMAD'], correct: 1, explanation: 'Der ISB ist vor Ort die zentrale Rolle im Meldewesen und bewertet Vorfälle zunächst.' },
    ]),

    explanation('b3-rollen-zentral', 'Zentrale InfoSichh-Organisation', 'classic', [
      { type: 'text', content: 'Über die einzelne Dienststelle hinaus gibt es zentrale Spezialstellen. Sie werden eingeschaltet, wenn ein Vorfall größere technische, forensische oder sicherheitliche Dimensionen hat.' },
      { type: 'table', headers: ['Stelle', 'Kernaufgabe'], rows: [
        ['CSOCBw', 'Zentrale 24/7-Meldungs-, Lage- und Überwachungsstelle; sammelt Meldungen und erzeugt ein Gesamtlagebild'],
        ['CERTBw', 'Computer Emergency Response Team: technische Notfallreaktion, Unterstützung bei Wiederinbetriebnahme'],
        ['IT-Forensik', 'Ursachenermittlung und gerichtsfeste Beweissicherung'],
        ['BAMAD', 'Bei extremistischen oder nachrichtendienstlichen Bezügen'],
        ['ZCSBw', 'Zentrale Schutz-/Cybersicherheitsorganisation, übergeordneter Blick'],
      ] },
      { type: 'question', question: 'Welche Stelle erzeugt aus vielen Einzelmeldungen ein zentrales Lagebild?', options: ['CERTBw', 'CSOCBw', 'IT-Forensik', 'ADSB'], correct: 1, explanation: 'Das CSOCBw sammelt Meldungen und bewertet die Gesamtlage.' },
    ]),

    explanation('b3-luecke', 'Informationssicherheitslücke', 'classic', [
      { type: 'text', content: 'Eine Informationssicherheitslücke liegt vor, wenn bestehende Vorgaben oder Maßnahmen nicht oder nur unzureichend umgesetzt wurden und dadurch mindestens ein Grundwert gefährdet werden kann.' },
      { type: 'text', content: 'Wichtig: Bei einer Lücke muss noch kein Schaden eingetreten sein. Es reicht, dass ein Grundwert gefährdet werden könnte. Ebenso kann eine neu bekannt gewordene Gefährdung eine Lücke darstellen, wenn nicht zeitnah angemessen reagiert werden kann.' },
      { type: 'list', title: 'Beispiele für Lücken', items: [
        'Ein nicht benötigter USB-Port ist freigeschaltet.',
        'Eine Passwortliste liegt unter der Tastatur.',
        'Nutzer können beliebige Software installieren.',
        'Eine neue kritische Software-Schwachstelle wird bekannt.',
        'Falsch gesetzte Rechte ermöglichen theoretisch unerlaubten Zugriff.',
      ] },
      { type: 'question', question: 'Muss bei einer Informationssicherheitslücke bereits ein Schaden eingetreten sein?', options: ['Ja, sonst ist es keine Lücke', 'Nein, eine Gefährdung reicht aus', 'Nur bei Verstoß, nicht bei Lücke', 'Nur bei Vorkommnis'], correct: 1, explanation: 'Eine Lücke liegt vor, wenn ein Grundwert gefährdet werden könnte. Ein tatsächlicher Schaden ist nicht erforderlich.' },
    ]),

    explanation('b3-verstoss', 'Informationssicherheitsverstoß', 'classic', [
      { type: 'text', content: 'Ein Informationssicherheitsverstoß liegt vor, wenn ein Grundwert verletzt wurde beziehungsweise der Verdacht darauf besteht. Typischerweise handelt es sich dabei um eine regelwidrige Handlung.' },
      { type: 'list', title: 'Beispiele für Verstöße', items: [
        'Passwort weitergegeben',
        'Privater USB-Stick an Dienst-PC angeschlossen',
        'Nicht genehmigte Software heruntergeladen oder ausgeführt',
        'Dienstliche Informationen an Unberechtigte weitergegeben',
      ] },
      { type: 'question', question: 'Was kennzeichnet einen Informationssicherheitsverstoß?', options: ['Ein technischer Defekt', 'Eine regelwidrige Handlung oder Grundwertverletzung', 'Ein erfolgreicher Hackerangriff', 'Ein geplantes Wartungsfenster'], correct: 1, explanation: 'Ein Verstoß liegt vor, wenn Regeln missachtet wurden oder ein Grundwert verletzt wurde.' },
    ]),

    explanation('b3-vorkommnis', 'Informationssicherheitsvorkommnis', 'classic', [
      { type: 'text', content: 'Ein Informationssicherheitsvorkommnis liegt vor, wenn die Informationssicherheit durch eine Informationssicherheitslücke, einen Informationssicherheitsverstoß oder ein Kryptosicherheitsvorkommnis gefährdet oder beeinträchtigt wird.' },
      { type: 'text', content: 'Lücke und Verstoß sind zwei unabhängige Auslöser. Eine Lücke muss nicht zuerst zu einem Verstoß werden; sie kann bereits für sich genommen ein meldepflichtiges Vorkommnis begründen. Umgekehrt kann ein Verstoß auch ohne zuvor erkannte Lücke auftreten. Nicht jeder Verstoß führt automatisch zu einem größeren Schaden.' },
      { type: 'question', question: 'Wann liegt ein Informationssicherheitsvorkommnis vor?', options: ['Nur bei erfolgreichem Angriff', 'Wenn die Sicherheit durch Lücke, Verstoß oder Kryptovorkommnis gefährdet oder beeinträchtigt wird', 'Nur bei Straftaten', 'Nur bei Datenschutzverstößen'], correct: 1, explanation: 'Ein Vorkommnis ist das übergeordnete Ereignis, bei dem die Sicherheit gefährdet oder beeinträchtigt ist.' },
    ]),

    explanation('b3-unterschied', 'Lücke vs. Verstoß vs. Vorkommnis', 'classic', [
      { type: 'diagram', content: gapIncidentSvg },
      { type: 'table', headers: ['Begriff', 'Kern', 'Beispiel'], rows: [
        ['Lücke', 'Gefährdung durch unzureichende Maßnahmen; Schaden noch nicht eingetreten', 'USB-Port unnötig freigeschaltet'],
        ['Verstoß', 'Regelwidrige Handlung / Grundwertverletzung oder Verdacht', 'Privaten USB-Stick eingesteckt'],
        ['Vorkommnis', 'Sicherheit wurde gefährdet oder beeinträchtigt', 'Schadsoftware auf Dienstsystem gefunden'],
      ] },
      { type: 'text', content: 'Eine Lücke kann bestehen, ohne dass danach zwingend ein Verstoß passiert. Ein Verstoß kann auch ohne zuvor erkannte Lücke auftreten. Beide sind unterschiedliche Arten von Sachverhalten, keine zeitlichen Stufen, und beide können jeweils ein Vorkommnis begründen.' },
      { type: 'question', question: 'Ein ungesperrter USB-Port ist an mehreren Dienst-PCs freigeschaltet. Noch wurde kein Stick eingesteckt. Was liegt vor?', options: ['Verstoß', 'Lücke', 'Vorkommnis', 'Keins davon'], correct: 1, explanation: 'Ein unnötig freigeschalteter USB-Port ist eine Gefährdung und damit eine Lücke. Ein Verstoß wäre das tatsächliche Anschließen.' },
    ]),

    explanation('b3-phishing', 'Phishing-Fall', 'classic', [
      { type: 'text', content: 'Phishing eignet sich besonders gut, um zu zeigen, wie sich ein Vorfall verändert. Derselbe Vorgang kann je nach Handlung unterschiedlich bewertet werden.' },
      { type: 'table', headers: ['Phase', 'Was passiert?', 'Bewertung'], rows: [
        ['Phase 1', 'Verdächtige Mail trifft ein', 'mögliche Gefährdung; ggf. Lücke / Vorkommnis'],
        ['Phase 2', 'Nutzer klickt auf den Link', 'Verdacht auf Verstoß; Grundwertverletzung wird wahrscheinlicher'],
        ['Phase 3', 'Nutzer gibt Daten ein', 'Verstoß; Vertraulichkeit verletzt; Vorkommnis'],
      ] },
      { type: 'text', content: 'Frühzeitiges Melden in Phase 1 verhindert, dass es überhaupt zu Phase 2 oder 3 kommt. Selbst wenn bereits Daten eingegeben wurden, ist schnelles Melden entscheidend, um Folgeschäden zu begrenzen.' },
      { type: 'question', question: 'Eine Phishingmail ist angekommen, aber noch nicht geöffnet. Warum trotzdem melden?', options: ['Damit andere gewarnt und der Vorfall früh gestoppt werden kann', 'Weil die Mail automatisch ein Verstoß ist', 'Weil sonst die Mailbox gelöscht wird', 'Weil jede Mail gemeldet werden muss'], correct: 0, explanation: 'Schon eine ungeöffnete Phishingmail ist eine Gefährdung; frühes Melden schützt andere.' },
    ]),

    explanation('b3-software', 'Schadsoftware- / Softwareverstoß-Fall', 'classic', [
      { type: 'text', content: 'Ein Nutzer lädt nicht genehmigte Software herunter. Der Virenschutz erkennt die Datei und entfernt sie. Ist damit alles in Ordnung?' },
      { type: 'text', content: 'Nein. Die technische Schutzmaßnahme kann funktioniert haben, aber die Regelverletzung – das Herunterladen nicht genehmigter Software – bleibt bestehen. Das ist ein Informationssicherheitsverstoß und kann meldepflichtig sein.' },
      { type: 'text', content: 'Wichtige Fehlannahme: „Der Virenschutz hat es blockiert, also liegt kein Problem vor." Technische Abwehr und Regelverstoß sind zwei getrennte Ebenen.' },
      { type: 'question', question: 'Der Virenschutz hat eine nicht genehmigte Datei blockiert. Was folgt daraus?', options: ['Es liegt kein Verstoß vor, weil kein Schaden entstanden ist', 'Es liegt trotzdem ein Regelverstoß vor, der gemeldet werden kann', 'Die Datei war automatisch erlaubt', 'Der Nutzer muss die Software jetzt auf einem anderen Weg installieren'], correct: 1, explanation: 'Technische Abwehr schützt vor Schaden, macht die Regelverletzung aber nicht ungeschehen.' },
    ]),

    explanation('b3-klein-meldung', 'Warum auch kleine Vorfälle gemeldet werden', 'classic', [
      { type: 'diagram', content: correlationSvg },
      { type: 'text', content: 'Der einzelne Mitarbeiter sieht vielleicht nur „eine verdächtige Mail". Die zentrale Stelle kann aber tausende identische Meldungen aus mehreren Dienststellen zusammenführen und so ein koordinierter Angriff oder ein größeres Muster erkennen.' },
      { type: 'text', content: 'Deshalb gilt: Auch scheinbar kleine Vorfälle sind meldewürdig. „Kein großer Schaden sichtbar" bedeutet nicht „irrelevant".' },
      { type: 'question', question: 'Warum soll eine einzelne verdächtige Mail gemeldet werden, auch wenn niemand geklickt hat?', options: ['Weil die zentrale Stelle viele Einzelmeldungen zu einem Gesamtlagebild verknüpfen kann', 'Weil jede Mail automatisch ein Vorkommnis ist', 'Damit der Absender verhaftet wird', 'Weil Melden Pflicht für jede E-Mail ist'], correct: 0, explanation: 'Einzelmeldungen ermöglichen zentrale Korrelation und Mustererkennung.' },
    ]),

    explanation('b3-meldeweg', 'Meldeweg', 'classic', [
      { type: 'diagram', content: reportingPathSvg },
      { type: 'text', content: 'Der klassische Meldeweg beginnt beim Nutzer oder Administrator, der einen Vorfall bemerkt. Er meldet an den ISB, der die Erstbewertung vornimmt. Bei Bedarf leitet der ISB an das CSOCBw weiter, das die zentrale Lage betrachtet. Von dort werden bei Bedarf Spezialstellen wie CERTBw, IT-Forensik oder BAMAD eingebunden.' },
      { type: 'text', content: 'Der ISB ist also nicht der Endpunkt, sondern die zentrale lokale Drehscheibe. Das CSOCBw ist die übergeordnete 24/7-Stelle für das Lagebild.' },
      { type: 'question', question: 'Wohin wird ein Vorfall typischerweise zuerst gemeldet?', options: ['Direkt an CERTBw', 'An den lokalen ISB', 'An BAMAD', 'An IT-Forensik'], correct: 1, explanation: 'Der ISB ist die zentrale lokale Rolle im Meldewesen und nimmt die Erstbewertung vor.' },
    ]),

    explanation('b3-erstbewertung', 'Erstbewertung', 'classic', [
      { type: 'text', content: 'Für eine sinnvolle Erstbewertung werden bestimmte Informationen gebraucht. Je genauer die Meldung, desto schneller kann die zentrale Stelle eingreifen.' },
      { type: 'list', title: 'Wichtige Erstinformationen', items: [
        'Gibt es weitere Meldungen?',
        'Haben Nutzer bereits gehandelt?',
        'Welche Systeme sind betroffen?',
        'Welche Informationskategorien sind betroffen?',
        'Sind personenbezogene Daten betroffen?',
        'Gibt es Hinweise auf Verschlusssachen?',
        'Gibt es Hinweise auf Extremismus?',
        'Gibt es Hinweise auf nachrichtendienstliche Aktivität?',
        'Gibt es Hinweise auf Straftaten oder Dienstvergehen?',
        'Sind andere Rollenträger notwendig?',
        'Welche Sofortmaßnahmen wurden bereits getroffen?',
      ] },
      { type: 'text', content: 'Es geht nicht darum, ein spezifisches Formular auswendig zu lernen, sondern zu verstehen, welche Angaben für die Bewertung relevant sind.' },
      { type: 'question', question: 'Welche Information ist für eine Erstbewertung am relevantesten?', options: ['Der Lieblingsbrowser des Mitarbeiters', 'Betroffene Systeme und Informationskategorien', 'Private Hobbyinformationen', 'Die Schuhgröße des Absenders'], correct: 1, explanation: 'Systeme, betroffene Datenkategorien und Nutzerhandlungen sind zentral für die Bewertung.' },
    ]),

    explanation('b3-sofortmassnahmen', 'Sofortmaßnahmen', 'classic', [
      { type: 'text', content: 'Parallel zur Meldung kann es nötig sein, weiteren Schaden zu begrenzen. Sofortmaßnahmen verhindern nicht die Meldung, sondern ergänzen sie.' },
      { type: 'list', title: 'Mögliche Sofortmaßnahmen', items: [
        'Nutzer warnen, die verdächtige Mail nicht zu öffnen',
        'Verdächtige Mail löschen oder nicht weiterbearbeiten',
        'Kompromittierte Daten oder Konten sichern',
        'Betroffene Systeme isolieren, wenn das fachlich angemessen ist',
        'Weitere Nutzung stoppen',
        'Beweise nicht unnötig zerstören',
        'Anweisungen spezialisierter Stellen befolgen',
      ] },
      { type: 'text', content: 'Wichtig: Vorschnelles „selbst reparieren" kann mehr schaden als nützen. Wenn eine Fachstelle übernimmt, sollten deren Anweisungen befolgt werden.' },
      { type: 'question', question: 'Was ist eine sinnvolle Sofortmaßnahme bei einer verdächtigen Mail?', options: ['Ignorieren, weil ja noch nichts passiert ist', 'Beweise löschen, damit niemand mehr reinguckt', 'Meldung absetzen und Nutzer warnen, nicht zu klicken', 'Alle Server sofort komplett abschalten'], correct: 2, explanation: 'Meldung plus gezielte Warnung verhindert Folgeschäden, ohne Beweise zu zerstören oder überzutreiben.' },
    ]),

    explanation('b3-stabsstruktur', 'Stabsstruktur', 'classic', [
      { type: 'text', content: 'Die Stabsstruktur S1 bis S6 ist kein Kern des Informationssicherheitskurses. Für das Verständnis der Rollen reicht ein kurzer Hinweis:' },
      { type: 'table', headers: ['Stab', 'häufig zugeordnet'], rows: [
        ['S1', 'Personal; ADSB ist hier oft angesiedelt'],
        ['S2', 'militärische Sicherheit; SiBe ist hier oft angesiedelt'],
        ['S6', 'IT/Kommunikation; ISB/IT-Rollen sind hier oft angesiedelt'],
      ] },
      { type: 'text', content: 'Kein Abschlussquiz zu S1–S6. Das Thema wird hier nur als Kontextbox erwähnt.' },
      { type: 'question', question: 'Wie wird die Stabsstruktur im Informationssicherheitskurs behandelt?', options: ['Als Kernquizthema', 'Nur als kurzer Kontext, kein Kernlernziel', 'Gar nicht', 'Als eigene Lesson'], correct: 1, explanation: 'S1–S6 gehören nicht zum Kern des Informationssicherheitskurses.' },
    ]),

    explanation('b3-zusammenfassung', 'Zusammenfassung und Transfer', 'classic', [
      { type: 'diagram', content: incidentFlowSvg },
      { type: 'text', content: 'Der Spieler soll am Ende dieses Blocks folgenden Denkweg sicher anwenden:' },
      { type: 'list', title: 'Kernfragen bei jedem Vorfall', items: [
        'Was ist passiert?',
        'Lücke oder Verstoß?',
        'Liegt ein Vorkommnis vor?',
        'Welcher Grundwert ist betroffen?',
        'Welche Informationskategorie / welche personenbezogenen Daten sind betroffen?',
        'Welche Sofortmaßnahme ist sinnvoll?',
        'Wen muss ich informieren?',
        'Welche Informationen braucht die Meldung?',
        'Welche zentrale Spezialstelle könnte später gebraucht werden?',
      ] },
      { type: 'text', content: 'Informationssicherheit lebt davon, dass Vorfälle früh erkannt, richtig eingeordnet und gemeldet werden. Jede Einzelmeldung ist ein Puzzleteil für das zentrale Lagebild.' },
    ]),
  ].map((entry) => ({ ...entry, sectionId: entry.id }));

  const exercises = [
    {
      id: 'b3-begriffe-matchen',
      type: 'matching',
      question: 'Ordne die Begriffe ihrer Bedeutung zu.',
      pairs: [
        { left: 'Informationssicherheitslücke', right: 'Gefährdung durch unzureichende Maßnahmen' },
        { left: 'Informationssicherheitsverstoß', right: 'Regelwidrige Handlung / Grundwertverletzung' },
        { left: 'Informationssicherheitsvorkommnis', right: 'Sicherheit wurde gefährdet oder beeinträchtigt' },
      ],
      explanation: 'Lücke = mögliche Gefährdung; Verstoß = Regelbruch; Vorkommnis = übergeordnetes Ereignis mit Sicherheitsbeeinträchtigung.',
    },
    {
      id: 'b3-rollen-matchen',
      type: 'matching',
      question: 'Ordne die Rollen ihrem zentralen Aufgabenbereich zu.',
      pairs: [
        { left: 'ISB', right: 'Lokale InfoSichh / Meldewesen' },
        { left: 'ADSB', right: 'Datenschutz' },
        { left: 'SiBe', right: 'Militärische Sicherheit' },
        { left: 'KryVw', right: 'Kryptomittel' },
        { left: 'CSOCBw', right: 'Zentrale Lage / Meldungen' },
        { left: 'CERTBw', right: 'Technische Notfallreaktion' },
        { left: 'IT-Forensik', right: 'Ursachen / Beweise' },
        { left: 'BAMAD', right: 'Extremismus / Nachrichtendienst' },
      ],
      explanation: 'Der ISB ist vor Ort zentral. CSOCBw, CERTBw, Forensik und BAMAD sind Spezialstellen, die bei Bedarf eingeschaltet werden.',
    },
    {
      id: 'b3-luecke-oder-verstoss',
      type: 'select-best',
      question: 'Ein nicht benötigter USB-Port ist an mehreren Dienst-PCs freigeschaltet. Noch wurde kein Stick eingesteckt. Was liegt vor?',
      options: ['Informationssicherheitsverstoß', 'Informationssicherheitslücke', 'Informationssicherheitsvorkommnis', 'Keins davon'],
      correct: 1,
      explanation: 'Ein unnötig freigeschalteter USB-Port ist eine Gefährdung und damit eine Lücke. Ein Verstoß wäre das tatsächliche Anschließen.',
    },
    {
      id: 'b3-passwort-verstoss',
      type: 'select-best',
      question: 'Ein Mitarbeiter gibt sein Passwort an einen Kollegen weiter. Was liegt vor?',
      options: ['Lücke', 'Verstoß', 'Vorkommnis', 'Nur ein Versehen'],
      correct: 1,
      explanation: 'Das Weitergeben des Passworts ist eine regelwidrige Handlung und damit ein Verstoß.',
    },
    {
      id: 'b3-phishing-progression',
      type: 'select-best',
      question: 'Eine Phishingmail ist angekommen, aber noch nicht geöffnet. Wie bewertest du den Fall am besten?',
      options: ['Es liegt bereits ein Verstoß vor', 'Es liegt eine mögliche Gefährdung vor; Melden ist sinnvoll', 'Es ist erst relevant, wenn Daten gestohlen wurden', 'Die Mail kann ignoriert werden, solange keiner geklickt hat'],
      correct: 1,
      explanation: 'Schon eine ungeöffnete Phishingmail ist eine Gefährdung. Frühes Melden verhindert Folgeschäden.',
    },
    {
      id: 'b3-antivirus-regelverstoss',
      type: 'select-best',
      question: 'Ein Nutzer lädt nicht genehmigte Software herunter. Der Virenschutz blockiert die Datei. Was folgt daraus?',
      options: ['Es liegt kein Verstoß vor, weil die Datei blockiert wurde', 'Der Regelverstoß bleibt bestehen; Meldung kann nötig sein', 'Die Software ist jetzt erlaubt', 'Der Virenschutz ersetzt die Meldung'],
      correct: 1,
      explanation: 'Technische Abwehr verhindert Schaden, macht die Regelverletzung aber nicht ungeschehen.',
    },
    {
      id: 'b3-erstbewertung-info',
      type: 'select-best',
      question: 'Welche Information ist für eine Erstbewertung besonders relevant?',
      options: ['Lieblingsfarbe des Absenders', 'Betroffene Systeme, Informationskategorien und Nutzerhandlungen', 'Welches E-Mail-Programm optisch schöner ist', 'Private Telefonnummer des Mitarbeiters'],
      correct: 1,
      explanation: 'Für die Bewertung braucht man Informationen zum Vorfall, nicht irrelevante persönliche Details.',
    },
    {
      id: 'b3-sofortmassnahme',
      type: 'select-best',
      question: 'Bei einer verdächtigen Mail mit vielen potenziell betroffenen Nutzern ist die beste Sofortmaßnahme:',
      options: ['Ignorieren, bis ein Schaden sichtbar ist', 'Alle Server sofort und ohne Absprache abschalten', 'Meldung an ISB und Warnung der Nutzer, nicht zu klicken', 'Alle betroffenen Mails sofort unwiderruflich löschen'],
      correct: 2,
      explanation: 'Meldung und gezielte Warnung schützen vor Folgeschäden, ohne Beweise zu zerstören oder überzutreiben.',
    },
  ];

  const quiz = [
    { facet: 'luecke', question: 'Was ist eine Informationssicherheitslücke?', options: ['Ein erfolgreicher Angriff', 'Eine Gefährdung durch unzureichende Maßnahmen', 'Ein Regelverstoß', 'Ein genehmigtes Update'], correct: 1, explanation: 'Eine Lücke liegt vor, wenn Vorgaben oder Maßnahmen unzureichend umgesetzt sind und ein Grundwert gefährdet werden könnte.' },
    { facet: 'verstoss', question: 'Was kennzeichnet einen Informationssicherheitsverstoß?', options: ['Ein technischer Defekt', 'Eine regelwidrige Handlung oder Verdacht auf Grundwertverletzung', 'Eine fehlende Schulung', 'Ein geplantes Wartungsfenster'], correct: 1, explanation: 'Ein Verstoß ist eine Regelverletzung oder der Verdacht auf eine Grundwertverletzung.' },
    { facet: 'vorkommnis', question: 'Wann liegt ein Informationssicherheitsvorkommnis vor?', options: ['Nur bei einem Hackerangriff', 'Wenn Sicherheit durch Lücke, Verstoß oder Kryptovorkommnis gefährdet oder beeinträchtigt wird', 'Nur bei Datenschutzverstößen', 'Nur wenn personenbezogene Daten betroffen sind'], correct: 1, explanation: 'Ein Vorkommnis ist das übergeordnete Ereignis, bei dem die Informationssicherheit gefährdet oder beeinträchtigt ist.' },
    { facet: 'rollen', question: 'Wer ist im lokalen Meldewesen die zentrale Rolle?', options: ['CERTBw', 'ISB', 'CSOCBw', 'BAMAD'], correct: 1, explanation: 'Der ISB nimmt vor Ort die Erstbewertung vor und leitet bei Bedarf weiter.' },
    { facet: 'csoc', question: 'Welche Aufgabe hat das CSOCBw?', options: ['Technische Wiederinbetriebnahme', 'Zentrale 24/7-Lage- und Meldungsführung', 'Gerichtsfeste Beweissicherung', 'Kryptomittel-Ausgabe'], correct: 1, explanation: 'Das CSOCBw sammelt Meldungen und erzeugt ein zentrales Lagebild.' },
    { facet: 'phishing', question: 'Eine Phishingmail ist angekommen, aber noch nicht geöffnet. Was ist richtig?', options: ['Es liegt bereits ein Verstoß vor', 'Es ist eine Gefährdung; Melden ist sinnvoll', 'Es ist irrelevant, solange niemand geklickt hat', 'Nur geöffnete Mails müssen gemeldet werden'], correct: 1, explanation: 'Schon eine ungeöffnete Phishingmail ist eine Gefährdung; frühes Melden schützt andere.' },
    { facet: 'antivirus', question: 'Der Virenschutz blockiert nicht genehmigte Software. Was bleibt bestehen?', options: ['Kein Verstoß, weil kein Schaden entstand', 'Der Regelverstoß', 'Die Genehmigung der Software', 'Die Notwendigkeit einer forensischen Untersuchung'], correct: 1, explanation: 'Technische Abwehr schützt vor Schaden, hebt die Regelverletzung aber nicht auf.' },
    { facet: 'correlation', question: 'Warum soll auch ein kleiner Vorfall gemeldet werden?', options: ['Weil die zentrale Stelle viele Meldungen zu einem Muster verknüpfen kann', 'Weil jeder Vorfall automatisch ein großer Angriff ist', 'Weil sonst die Mailbox gesperrt wird', 'Weil Melden jede Straftat verhindert'], correct: 0, explanation: 'Einzelmeldungen ermöglichen zentrale Korrelation und Mustererkennung.' },
  ];

  const summary = [
    'Regeln und Belehrungen schaffen Handlungssicherheit.',
    'Die Gesamtverantwortung liegt beim Dienststellenleiter / Kommandeur.',
    'Der ISB ist vor Ort die zentrale Rolle im Meldewesen.',
    'CSOCBw, CERTBw, IT-Forensik und BAMAD sind zentrale Spezialstellen.',
    'Eine Lücke ist eine Gefährdung; ein Verstoß ist eine Regelverletzung; ein Vorkommnis ist das übergeordnete Ereignis.',
    'Lücke und Verstoß können jeweils ein Vorkommnis begründen.',
    'Auch scheinbar kleine Vorfälle sind meldewürdig, weil sie zentrale Mustererkennung ermöglichen.',
    'Sofortmaßnahmen ergänzen die Meldung, ersetzen sie aber nicht.',
    'Transfer: Bei jedem Vorfall Grundwerte, Informationskategorien und personenbezogene Daten prüfen.',
  ];

  return { title, explanations, exercises, quiz, summary };
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
