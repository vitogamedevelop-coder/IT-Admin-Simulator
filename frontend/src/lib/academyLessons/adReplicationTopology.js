import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – KCC, Replikationstopologie & Site Links
// Thema 24
// =============================================================================

export const AD_REPLICATION_TOPOLOGY_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-replication-topology');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const nexusProblemSvg = `<svg viewBox="0 0 320 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="18" text-anchor="middle" fill="#c9d1d9" font-size="11">Jeder DC mit jedem DC direkt?</text>
  <circle cx="60" cy="65" r="12" fill="#00f0ff"/>
  <text x="60" y="68" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC1</text>
  <circle cx="160" cy="65" r="12" fill="#00f0ff"/>
  <text x="160" y="68" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC2</text>
  <circle cx="260" cy="65" r="12" fill="#00f0ff"/>
  <text x="260" y="68" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC3</text>
  <circle cx="110" cy="140" r="12" fill="#ffcc00"/>
  <text x="110" y="143" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC4</text>
  <circle cx="210" cy="140" r="12" fill="#ffcc00"/>
  <text x="210" y="143" text-anchor="middle" fill="#0d1117" font-size="8" font-weight="bold">DC5</text>

  <line x1="72" y1="65" x2="148" y2="65" stroke="#8b949e" stroke-width="1"/>
  <line x1="172" y1="65" x2="248" y2="65" stroke="#8b949e" stroke-width="1"/>
  <line x1="67" y1="75" x2="103" y2="129" stroke="#8b949e" stroke-width="1"/>
  <line x1="250" y1="75" x2="222" y2="129" stroke="#8b949e" stroke-width="1"/>
  <line x1="122" y1="140" x2="198" y2="140" stroke="#8b949e" stroke-width="1"/>
  <line x1="70" y1="75" x2="200" y2="132" stroke="#8b949e" stroke-width="1" opacity="0.5"/>
  <line x1="250" y1="75" x2="120" y2="132" stroke="#8b949e" stroke-width="1" opacity="0.5"/>
  <line x1="160" y1="77" x2="210" y2="128" stroke="#8b949e" stroke-width="1" opacity="0.5"/>

  <text x="160" y="185" text-anchor="middle" fill="#8b949e" font-size="9">Schnell unübersichtlich bei vielen DCs</text>
</svg>`;

const kccFlowSvg = `<svg viewBox="0 0 320 200" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="260" height="36" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="36" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Admin konfiguriert Rahmenbedingungen</text>
  <text x="160" y="48" text-anchor="middle" fill="#c9d1d9" font-size="8">Sites, Subnetze, Site Links, Costs, Schedules</text>

  <line x1="160" y1="56" x2="160" y2="78" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="90" y="80" width="140" height="34" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="96" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">KCC</text>
  <text x="160" y="108" text-anchor="middle" fill="#c9d1d9" font-size="8">berechnet &amp; pflegt Topologie</text>

  <line x1="160" y1="114" x2="160" y2="136" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="50" y="140" width="220" height="34" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="160" y="156" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Connection Objects</text>
  <text x="160" y="168" text-anchor="middle" fill="#c9d1d9" font-size="8">konkrete DC-Replikationsverbindungen</text>

  <text x="160" y="190" text-anchor="middle" fill="#8b949e" font-size="9">KCC erzeugt Verbindungen, die DCs nutzen sie für die Replikation</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const siteLinkVsConnectionSvg = `<svg viewBox="0 0 320 230" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="120" height="90" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="80" y="40" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Site A</text>
  <circle cx="55" cy="70" r="10" fill="#c9d1d9"/>
  <text x="55" y="73" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC1</text>
  <circle cx="105" cy="70" r="10" fill="#c9d1d9"/>
  <text x="105" y="73" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC2</text>
  <text x="80" y="95" text-anchor="middle" fill="#8b949e" font-size="8">Connection Objects</text>

  <rect x="180" y="20" width="120" height="90" rx="8" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="240" y="40" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">Site B</text>
  <circle cx="215" cy="70" r="10" fill="#c9d1d9"/>
  <text x="215" y="73" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC3</text>
  <circle cx="265" cy="70" r="10" fill="#c9d1d9"/>
  <text x="265" y="73" text-anchor="middle" fill="#0d1117" font-size="7" font-weight="bold">DC4</text>
  <text x="240" y="95" text-anchor="middle" fill="#8b949e" font-size="8">Connection Objects</text>

  <line x1="140" y1="55" x2="180" y2="55" stroke="#ffcc00" stroke-width="3" stroke-dasharray="6,3"/>
  <text x="160" y="48" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Site Link</text>

  <text x="160" y="130" text-anchor="middle" fill="#c9d1d9" font-size="10">Site Link = logische Site-zu-Site-Verbindung</text>
  <text x="160" y="148" text-anchor="middle" fill="#c9d1d9" font-size="10">Connection Object = konkrete DC-zu-DC-Verbindung</text>

  <rect x="60" y="165" width="200" height="50" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="160" y="183" text-anchor="middle" fill="#c9d1d9" font-size="9">DC1 und DC3 tauschen Daten über das Connection Object aus,</text>
  <text x="160" y="198" text-anchor="middle" fill="#c9d1d9" font-size="9">das auf dem Site Link zwischen Site A und Site B basiert.</text>
</svg>`;

const costPathSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="16" fill="#00f0ff"/>
  <text x="60" y="64" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">A</text>
  <circle cx="160" cy="60" r="16" fill="#ffcc00"/>
  <text x="160" y="64" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">B</text>
  <circle cx="260" cy="60" r="16" fill="#00f0ff"/>
  <text x="260" y="64" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">C</text>

  <line x1="76" y1="60" x2="144" y2="60" stroke="#00f0ff" stroke-width="3"/>
  <text x="110" y="52" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">10</text>
  <line x1="176" y1="60" x2="244" y2="60" stroke="#00f0ff" stroke-width="3"/>
  <text x="210" y="52" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">10</text>

  <path d="M72 72 Q 160 180 248 72" fill="none" stroke="#8b949e" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="160" y="150" text-anchor="middle" fill="#8b949e" font-size="9">direkt: Cost 50</text>

  <text x="160" y="195" text-anchor="middle" fill="#c9d1d9" font-size="10">A → B → C: 10 + 10 = 20 (bevorzugt)</text>
  <text x="160" y="212" text-anchor="middle" fill="#8b949e" font-size="9">niedrigere Gesamtkosten = bevorzugter Pfad</text>
</svg>`;

const bridgeheadIntersiteSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="110" height="100" rx="8" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Site A</text>
  <circle cx="65" cy="75" r="10" fill="#00f0ff" stroke="#c9d1d9" stroke-width="1"/>
  <text x="65" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">BH</text>
  <circle cx="105" cy="75" r="10" fill="#c9d1d9"/>
  <text x="105" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC</text>

  <rect x="180" y="20" width="110" height="100" rx="8" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Site B</text>
  <circle cx="215" cy="75" r="10" fill="#ffcc00" stroke="#c9d1d9" stroke-width="1"/>
  <text x="215" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">BH</text>
  <circle cx="255" cy="75" r="10" fill="#c9d1d9"/>
  <text x="255" y="78" text-anchor="middle" fill="#0d1117" font-size="6" font-weight="bold">DC</text>

  <line x1="140" y1="70" x2="180" y2="70" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="160" y="62" text-anchor="middle" fill="#8b949e" font-size="8">Intersite</text>

  <text x="160" y="145" text-anchor="middle" fill="#c9d1d9" font-size="10">Bridgehead-Server tauschen Intersite-Replikation aus</text>
  <text x="160" y="162" text-anchor="middle" fill="#8b949e" font-size="9">Lokale Verteilung erfolgt innerhalb der Site</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const siteLinkBridgeSvg = `<svg viewBox="0 0 320 160" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="80" r="16" fill="#00f0ff"/>
  <text x="60" y="84" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">A</text>
  <circle cx="160" cy="80" r="16" fill="#ffcc00"/>
  <text x="160" y="84" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">B</text>
  <circle cx="260" cy="80" r="16" fill="#00f0ff"/>
  <text x="260" y="84" text-anchor="middle" fill="#0d1117" font-size="9" font-weight="bold">C</text>

  <line x1="76" y1="80" x2="144" y2="80" stroke="#ffcc00" stroke-width="3" stroke-dasharray="6,3"/>
  <text x="110" y="72" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Link</text>
  <line x1="176" y1="80" x2="244" y2="80" stroke="#ffcc00" stroke-width="3" stroke-dasharray="6,3"/>
  <text x="210" y="72" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Link</text>

  <text x="160" y="125" text-anchor="middle" fill="#c9d1d9" font-size="10">Site Link Bridge: A kann über B nach C replizieren</text>
  <text x="160" y="142" text-anchor="middle" fill="#8b949e" font-size="9">Transitiver logischer Pfad über mehrere Site Links</text>
</svg>`;

export function buildAdReplicationTopologyLesson() {
  const explanations = [
    explanation('ad-repl-topo-intro-classic', 'Das Problem: Viele DCs, viele Verbindungen', 'classic', [
      { type: 'text', content: 'NEXUS betreibt drei Sites: Lechfeld, Pöcking und Feldafing. In jeder Site gibt es mehrere Domain Controller. Wenn jeder DC mit jedem anderen DC direkt replizieren müsste, entstünde ein unübersichtliches Netzwerk aus vielen Verbindungen, unnötigem WAN-Verkehr und hohem Verwaltungsaufwand.' },
      { type: 'diagram', content: nexusProblemSvg },
      { type: 'text', content: 'Active Directory löst das durch eine automatisch berechnete Replikationstopologie. Nicht jeder DC braucht eine direkte Verbindung zu allen anderen.' },
      { type: 'question', question: 'Warum ist eine vollständige Direktverbindung aller DCs untereinander problematisch?', options: ['Sie würde zu viele Verbindungen und unnötigen WAN-Verkehr erzeugen', 'Sie ist technisch unmöglich', 'Sie verhindert jede Replikation', 'Sie ist immer die schnellste Lösung'], correct: 0, explanation: 'Viele DCs führen schnell zu unübersichtlichen, ineffizienten vollvermaschten Topologien.' },
    ]),
    explanation('ad-repl-topo-kcc-classic', 'KCC – Knowledge Consistency Checker', 'classic', [
      { type: 'text', content: 'Der Knowledge Consistency Checker (KCC) ist die Komponente in Active Directory, die die Replikationstopologie automatisch berechnet und pflegt. Er läuft auf den Domain Controllern.' },
      { type: 'diagram', content: kccFlowSvg },
      { type: 'text', content: 'Der Administrator beschreibt Rahmenbedingungen wie Sites, Subnetze, Site Links, Kosten und Zeitpläne. Der KCC erstellt daraus geeignete Replikationsverbindungen.' },
      { type: 'question', question: 'Was ist die Hauptaufgabe des KCC?', options: ['Er repliziert selbst alle AD-Daten', 'Er berechnet und pflegt die Replikationstopologie', 'Er verwaltet DNS-Einträge', 'Er erstellt neue Benutzerkonten'], correct: 1, explanation: 'Der KCC plant die Topologie und erzeugt bzw. aktualisiert Verbindungsobjekte.' },
    ]),
    explanation('ad-repl-topo-kcc-not-engine-classic', 'KCC repliziert nicht selbst', 'classic', [
      { type: 'text', content: 'Wichtig ist die Abgrenzung: Der KCC ist kein Replikationsdienst im Sinne von „er kopiert die eigentlichen AD-Daten“. Er plant die Topologie und erzeugt bzw. aktualisiert die Verbindungsobjekte, über die die DCs später replizieren.' },
      { type: 'text', content: 'Die eigentliche Replikation nutzt diese berechneten Verbindungen, um Daten auszutauschen. Ohne den KCC gäbe es keine sinnvolle Struktur, aber ohne den Replikationsmechanismus würden trotzdem keine Daten übertragen.' },
      { type: 'question', question: 'Welche Aussage zum KCC stimmt?', options: ['Er kopiert selbst alle AD-Daten zwischen DCs', 'Er plant die Topologie und erzeugt Verbindungsobjekte', 'Er ersetzt den DNS-Server', 'Er ist für die Benutzeranmeldung zuständig'], correct: 1, explanation: 'KCC plant die Topologie; die eigentliche Datenreplikation geschieht über die erzeugten Verbindungen.' },
    ]),
    explanation('ad-repl-topo-kcc-reacts-classic', 'KCC reagiert auf Änderungen', 'classic', [
      { type: 'text', content: 'Wenn sich die Infrastruktur ändert – ein neuer DC hinzukommt, ein DC entfernt wird oder Site-Strukturen geändert werden – kann der KCC die Topologie neu bewerten und anpassen. Die Topologie ist also nicht starr.' },
      { type: 'text', content: 'Der KCC prüft die Topologie regelmäßig und bei relevanten Änderungen neu. Konkrete Intervallwerte sind versions- und umgebungsabhängig und kein zentrales Lernziel.' },
      { type: 'question', question: 'Wann passt der KCC die Topologie an?', options: ['Nur einmal während der AD-Installation', 'Bei relevanten Änderungen und regelmäßig', 'Nur wenn ein Admin jeden Link manuell neu erstellt', 'Nie'], correct: 1, explanation: 'KCC reagiert auf Änderungen und wertet die Topologie regelmäßig neu aus.' },
    ]),
    explanation('ad-repl-topo-no-ring-dogma-classic', 'Keine starre Ring-Topologie', 'classic', [
      { type: 'text', content: 'Manche Quellen beschreiben eine bidirektionale Ring-Topologie mit bestimmten Hop-Grenzen. Das ist keine universelle, harte Regel. Der KCC erzeugt eine Topologie, die Erreichbarkeit und Effizienz sicherstellen soll.' },
      { type: 'text', content: 'Wenn nötig, kann der KCC zusätzliche Verbindungen erzeugen. Es geht also nicht darum, eine exakt Ring-Struktur auswendig zu lernen, sondern das Prinzip einer automatisch berechneten, redundanten Topologie zu verstehen.' },
      { type: 'question', question: 'Wie flexibel ist die vom KCC erzeugte Topologie?', options: ['Immer exakt ein Ring mit fester Hop-Anzahl', 'Anpassbar und abhängig von Erreichbarkeit und Effizienz', 'Nur sternförmig erlaubt', 'Es gibt keine Topologie'], correct: 1, explanation: 'KCC wählt Verbindungen situativ, um Erreichbarkeit und Effizienz zu gewährleisten.' },
    ]),
    explanation('ad-repl-topo-topology-classic', 'Replikationstopologie', 'classic', [
      { type: 'text', content: 'Die Replikationstopologie ist die logische Struktur der Replikationsbeziehungen zwischen Domain Controllern. Sie bestimmt, wer mit wem repliziert.' },
      { type: 'text', content: 'Durch diese Topologie kann AD den Store-and-Forward-Gedanken aus Thema 22 umsetzen: Änderungen lassen sich über mehrere DCs weitergeben, ohne dass jeder DC direkt mit jedem anderen kommunizieren muss.' },
      { type: 'question', question: 'Was beschreibt die Replikationstopologie?', options: ['Den physischen Standort der Serverräume', 'Die logische Struktur, wer mit wem repliziert', 'Den DNS-Namensraum', 'Die Gruppenrichtlinien-Vererbung'], correct: 1, explanation: 'Die Replikationstopologie legt die Replikationsbeziehungen zwischen DCs fest.' },
    ]),
    explanation('ad-repl-topo-store-forward-link-classic', 'Store-and-Forward über die Topologie', 'classic', [
      { type: 'text', content: 'In Thema 22 wurde der Store-and-Forward-Gedanke eingeführt: Änderungen können über Replikationspartner weitergegeben werden. Jetzt lässt sich erklären, dass diese Weiterleitung über die vom KCC berechnete Replikationstopologie funktioniert.' },
      { type: 'text', content: 'Ein DC muss also nicht jeden anderen DC direkt erreichen. Es reicht, wenn ein Pfad durch die Topologie existiert, über den Änderungen schrittweise weitergegeben werden können.' },
      { type: 'question', question: 'Warum braucht nicht jeder DC eine Direktverbindung zu allen anderen?', options: ['Weil Store-and-Forward Änderungen über die Topologie weitergeben kann', 'Weil Replikation nur lokal stattfindet', 'Weil es nur einen DC gibt', 'Weil DNS das übernimmt'], correct: 0, explanation: 'Die Topologie ermöglicht Weitergabe über mehrere Hops, nicht jeder DC muss direkt erreichbar sein.' },
    ]),
    explanation('ad-repl-topo-site-link-classic', 'Site Link', 'classic', [
      { type: 'text', content: 'Ein Site Link ist eine logische Verbindung zwischen zwei oder mehr AD Sites. Er beschreibt: „Zwischen diesen Sites existiert ein möglicher Replikationsweg.“' },
      { type: 'text', content: 'Ein Site Link ist nicht die konkrete DC-zu-DC-Verbindung. Er liegt auf der Site-Ebene und bildet einen möglichen WAN- bzw. Netzwerkpfad ab, der administrativ konfiguriert wird.' },
      { type: 'question', question: 'Auf welcher Ebene liegt ein Site Link?', options: ['Auf der DC-Ebene als konkrete Verbindung', 'Auf der Site-Ebene als logische Verbindung', 'Auf der OU-Ebene', 'Auf der DNS-Ebene'], correct: 1, explanation: 'Site Links verbinden Sites logisch, nicht einzelne DCs.' },
    ]),
    explanation('ad-repl-topo-connection-object-classic', 'Connection Object', 'classic', [
      { type: 'text', content: 'Ein Connection Object ist eine konkrete Replikationsverbindung zwischen zwei Domain Controllern. Der KCC erzeugt diese Objekte, nachdem er die Topologie berechnet hat.' },
      { type: 'text', content: 'Wichtige Abgrenzung: Ein Site Link beschreibt einen möglichen Pfad auf Site-Ebene. Ein Connection Object ist die tatsächliche Verbindung zwischen DCs, über die repliziert wird.' },
      { type: 'question', question: 'Was ist ein Connection Object?', options: ['Eine logische Verbindung zwischen Sites', 'Eine konkrete Replikationsverbindung zwischen DCs', 'Ein DNS-Eintrag', 'Eine OU'], correct: 1, explanation: 'Connection Objects verbinden konkret DCs miteinander und werden vom KCC erzeugt.' },
    ]),
    explanation('ad-repl-topo-site-link-vs-connection-classic', 'Site Link vs Connection Object', 'classic', [
      { type: 'text', content: 'Site Link und Connection Object arbeiten auf unterschiedlichen Ebenen zusammen. Der Site Link ist die logische Rahmenvorgabe auf Site-Ebene. Der KCC erzeugt daraus Connection Objects auf DC-Ebene.' },
      { type: 'diagram', content: siteLinkVsConnectionSvg },
      { type: 'text', content: 'Wenn ein Admin also einen Site Link erstellt, entstehen nicht automatisch sofort manuelle DC-zu-DC-Verbindungen. Der KCC berechnet diese aus der Konfiguration.' },
      { type: 'question', question: 'Wie hängen Site Link und Connection Object zusammen?', options: ['Sie sind identisch', 'Site Link ist Site-Ebene / möglicher Pfad; Connection Object ist DC-Ebene / konkrete Verbindung', 'Site Link verbindet DCs direkt', 'Connection Object wird manuell vom Admin pro Site erstellt'], correct: 1, explanation: 'Site Links geben mögliche Pfade vor; Connection Objects sind die konkreten DC-Verbindungen.' },
    ]),
    explanation('ad-repl-topo-cost-classic', 'Site Link Cost', 'classic', [
      { type: 'text', content: 'Site Link Cost ist ein administrativer Gewichtungswert. Er beschreibt, wie „teuer“ ein logischer Replikationspfad ist. Niedrigere Gesamtkosten führen zu einem bevorzugten Weg.' },
      { type: 'text', content: 'Cost ist nicht gleich reale Geldkosten. Es handelt sich um ein Routing- bzw. Designgewicht, das der Administrator setzt. Die Bandbreite kann eine Grundlage für die Wahl sein, aber AD misst nicht automatisch „echte“ Mbps.' },
      { type: 'question', question: 'Was bedeutet Site Link Cost?', options: ['Die tatsächlichen Euro-Kosten pro Monat', 'Ein administrativer Gewichtungswert für bevorzugte Replikationspfade', 'Die automatisch gemessene Bandbreite', 'Die Anzahl der DCs in einer Site'], correct: 1, explanation: 'Cost ist ein Designgewicht; niedrigere Kosten bevorzugen einen Pfad.' },
    ]),
    explanation('ad-repl-topo-cost-path-classic', 'Cost Path Beispiel', 'classic', [
      { type: 'text', content: 'NEXUS hat drei Sites. Der direkte Site Link von Lechfeld nach Feldafing hat Cost 50. Über Pöcking kostet jeder Link nur 10, also 20 insgesamt. Der KCC bevorzugt daher den günstigeren Pfad über Pöcking.' },
      { type: 'diagram', content: costPathSvg },
      { type: 'text', content: 'Diese Logik hilft, teure oder langsame Verbindungen zu vermeiden und den Datenfluss sinnvoll zu steuern.' },
      { type: 'question', question: 'A → C direkt kostet 50, A → B 10 und B → C 10. Welcher Pfad ist bevorzugt?', options: ['Direkt A → C', 'A → B → C', 'Es ist egal', 'A → B → A → C'], correct: 1, explanation: 'Gesamtkosten A → B → C = 20, also günstiger als direkt mit 50.' },
    ]),
    explanation('ad-repl-topo-schedule-classic', 'Schedule / Zeitplan', 'classic', [
      { type: 'text', content: 'Site Links können zeitlich gesteuert werden. Damit kann der Administrator die Intersite-Replikation in günstige Zeitfenster legen, zum Beispiel außerhalb der Geschäftszeiten, um das WAN zu entlasten.' },
      { type: 'text', content: 'Konkrete Zeitwerte sind versions- und umgebungsabhängig. Wichtig ist das Prinzip: Zeitpläne geben dem Administrator eine Möglichkeit, Replikation und Bandbreitennutzung abzuwägen.' },
      { type: 'question', question: 'Wozu dient ein Site-Link-Zeitplan?', options: ['Um Replikation in bestimmte Zeitfenster zu legen und das WAN zu schonen', 'Um DCs automatisch zu installieren', 'Um Benutzerpasswörter zu ändern', 'Um DNS-Zonen zu löschen'], correct: 0, explanation: 'Zeitpläne entlasten das WAN, indem Replikation in günstige Zeiten verschoben wird.' },
    ]),
    explanation('ad-repl-topo-interval-classic', 'Interval', 'classic', [
      { type: 'text', content: 'Replikationsintervalle beeinflussen die Häufigkeit der Intersite-Replikation. Ein kürzeres Intervall führt zu aktuelleren Daten, aber zu mehr Verkehr. Ein längeres Intervall reduziert den Verkehr, verzögert aber die Aktualisierung.' },
      { type: 'text', content: 'Es gibt keine festen Standardwerte, die man auswendig lernen müsste. Entscheidend ist der Trade-off zwischen Aktualität und Bandbreite.' },
      { type: 'question', question: 'Was ist der Trade-off bei Replikationsintervallen?', options: ['Kürzeres Intervall = aktuellere Daten, aber mehr Verkehr', 'Längeres Intervall = mehr Verkehr', 'Intervalle haben keinen Einfluss', 'Nur Schemaänderungen werden beeinflusst'], correct: 0, explanation: 'Kürzer = aktueller, aber mehr Verkehr; länger = weniger Verkehr, aber verzögert.' },
    ]),
    explanation('ad-repl-topo-design-tradeoff-classic', 'Aktualität vs. Bandbreite', 'classic', [
      { type: 'text', content: 'Der Administrator entscheidet über Cost, Schedule und Interval. Der KCC baut daraus die Topologie. Das ist die konsequente Vertiefung des Trade-offs aus Thema 23: Aktualität gegen Bandbreite und Netzwerkkosten.' },
      { type: 'text', content: 'Je nach Anforderung wird also eher Aktualität oder eher Bandbreitenschonung priorisiert. Die Wahl hängt vom Szenario ab.' },
      { type: 'question', question: 'Wer trifft Designentscheidungen wie Cost, Schedule und Interval?', options: ['Der KCC allein', 'Der Administrator; der KCC baut daraus die Topologie', 'Die Clients', 'Der DNS-Server'], correct: 1, explanation: 'Der Admin legt Rahmenbedingungen fest; der KCC berechnet die Topologie.' },
    ]),
    explanation('ad-repl-topo-bridgehead-classic', 'Bridgehead Server vertieft', 'classic', [
      { type: 'text', content: 'Ein Bridgehead Server ist ein Domain Controller, der die Intersite-Replikation für eine Site übernimmt. Er tauscht Änderungen mit Bridgehead-Servern oder DCs anderer Sites aus und sorgt anschließend für die lokale Verteilung innerhalb seiner Site.' },
      { type: 'diagram', content: bridgeheadIntersiteSvg },
      { type: 'text', content: 'Der Bridgehead ist damit ein zentraler Intersite-Replikationsknoten, nicht aber automatisch ein Single Point of Failure.' },
      { type: 'question', question: 'Was ist die vertiefte Rolle eines Bridgehead Servers?', options: ['Er repliziert alle Daten allein', 'Er übernimmt Intersite-Replikation für seine Site und verteilt lokal weiter', 'Er ersetzt den KCC', 'Er konfiguriert Site Links'], correct: 1, explanation: 'Bridgehead Server sind Intersite-Replikationspartner, die Änderungen lokal weitergeben.' },
    ]),
    explanation('ad-repl-topo-bridgehead-auto-classic', 'Automatische Bridgehead-Auswahl', 'classic', [
      { type: 'text', content: 'Der KCC kann Bridgehead-Server automatisch auswählen. Das ist das bevorzugte Standardmodell. Manuelle Auswahl ist möglich, aber nur sinnvoll, wenn es administrative Gründe gibt.' },
      { type: 'text', content: 'Wichtig: Manuelle Festlegungen können die Flexibilität und Redundanz einschränken. Bei automatisch verwalteter Topologie kann AD je nach Situation andere geeignete DCs oder Verbindungen nutzen.' },
      { type: 'question', question: 'Welche Aussage zur Bridgehead-Auswahl stimmt?', options: ['Bridgeheads müssen immer manuell festgelegt werden', 'Automatische Auswahl ist das bevorzugte Standardmodell', 'Der KCC kennt keine Bridgeheads', 'Bridgeheads dürfen nur RODCs sein'], correct: 1, explanation: 'KCC wählt Bridgeheads bevorzugt automatisch aus; manuell ist optional.' },
    ]),
    explanation('ad-repl-topo-site-link-bridge-classic', 'Site Link Bridge', 'classic', [
      { type: 'text', content: 'Eine Site Link Bridge verbindet mehrere Site Links konzeptionell zu einem transitiven Replikationspfad. Wenn Site A mit Site B verbunden ist und Site B mit Site C, kann ein Pfad von A nach C über B existieren.' },
      { type: 'diagram', content: siteLinkBridgeSvg },
      { type: 'text', content: 'Sie ist nicht dasselbe wie ein einzelner Site Link. Eine Site-Link-Transitivität kann standardmäßig breit ermöglicht sein; Details und Edge Cases folgen später.' },
      { type: 'question', question: 'Was ist der Unterschied zwischen Site Link und Site Link Bridge?', options: ['Site Link Bridge ist eine direkte logische Verbindung zwischen zwei Sites', 'Site Link Bridge fasst mehrere Site Links zu transitiven Pfaden zusammen', 'Beides ist identisch', 'Site Link Bridges verbinden DCs direkt'], correct: 1, explanation: 'Site Links sind direkte logische Site-Verbindungen; Bridges ermöglichen transitive Pfade über mehrere Links.' },
    ]),
    explanation('ad-repl-topo-troubleshooting-classic', 'Erste Verdachtsrichtung', 'classic', [
      { type: 'text', content: 'Wenn Site A immer über einen unerwünschten WAN-Pfad repliziert, prüft man zuerst die Site-Link-Costs und die Site-Link-Struktur. Der KCC wählt logische Pfade anhand dieser Werte.' },
      { type: 'text', content: 'Wenn ein Admin einen Site Link erstellt, aber keine sofortige manuelle DC-zu-DC-Verbindung sieht, liegt das daran, dass der KCC typischerweise die Connection Objects erzeugt.' },
      { type: 'question', question: 'Ein Site Link existiert, aber es gibt noch keine sichtbare DC-zu-DC-Verbindung. Was passiert typischerweise als Nächstes?', options: ['Der KCC erzeugt Connection Objects', 'Der Admin muss jeden Link manuell zeichnen', 'Replikation ist unmöglich', 'DNS erledigt das'], correct: 0, explanation: 'Der KCC erzeugt aus der Konfiguration die konkreten Connection Objects.' },
    ]),
    explanation('ad-repl-topo-ordering-classic', 'Zusammenfassung des Ablaufs', 'classic', [
      { type: 'text', content: 'Zusammengefasst: Der Administrator definiert Sites, Subnetze, Site Links, Costs und Schedules. Der KCC bewertet die Topologie und erzeugt Connection Objects. Erst dann replizieren die DCs über diese berechneten Verbindungen.' },
      { type: 'list', title: 'Ablauf', items: ['Admin konfiguriert Rahmenbedingungen', 'KCC bewertet Topologie', 'Connection Objects entstehen', 'DCs replizieren über die Verbindungen'] },
      { type: 'question', question: 'In welcher Reihenfolge arbeiten Admin, KCC und DCs zusammen?', options: ['Admin → KCC → Connection Objects → DC-Replikation', 'DCs → KCC → Admin → Connection Objects', 'Connection Objects → Admin → KCC → DCs', 'Admin → DCs → Connection Objects → KCC'], correct: 0, explanation: 'Der Admin gibt Rahmen vor, KCC erzeugt Verbindungen, DCs replizieren.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-repl-topo-kcc-matching',
      type: 'matching',
      question: 'Ordne jedem Begriff seine Bedeutung zu.',
      pairs: [
        { left: 'KCC', right: 'baut und pflegt die Replikationstopologie' },
        { left: 'Site Link', right: 'logische Verbindung zwischen Sites' },
        { left: 'Connection Object', right: 'konkrete DC-Replikationsverbindung' },
        { left: 'Bridgehead', right: 'Intersite-Replikationspartner einer Site' },
        { left: 'Cost', right: 'Gewichtung eines Replikationspfades' },
      ],
      explanation: 'KCC, Site Link, Connection Object, Bridgehead und Cost haben klar unterschiedliche Rollen.',
    },
    {
      id: 'ad-repl-topo-kcc-definition-select',
      type: 'select-best',
      question: 'Was ist die Hauptaufgabe des Knowledge Consistency Checker (KCC)?',
      options: ['Er repliziert selbst AD-Daten', 'Er berechnet und pflegt die Replikationstopologie', 'Er erstellt Benutzerkonten', 'Er verwaltet DNS-Zonen'],
      correct: 1,
      explanation: 'Der KCC plant die Topologie und erzeugt bzw. aktualisiert Connection Objects.',
    },
    {
      id: 'ad-repl-topo-kcc-not-replication-misconception',
      type: 'select-best',
      question: '„Der KCC kopiert selbst die AD-Daten zwischen DCs." Stimmt das?',
      options: ['Ja, der KCC ist der Replikationsdienst', 'Nein, der KCC plant die Topologie; die eigentliche Replikation nutzt die Verbindungen', 'Ja, aber nur zwischen Bridgeheads', 'Nein, nur der Schema Master repliziert'],
      correct: 1,
      explanation: 'KCC erzeugt Connection Objects; die DCs führen die eigentliche Replikation durch.',
    },
    {
      id: 'ad-repl-topo-kcc-reacts-select',
      type: 'select-best',
      question: 'Wann passt der KCC die Replikationstopologie typischerweise an?',
      options: ['Nur einmalig bei der AD-Installation', 'Bei relevanten Änderungen und regelmäßig', 'Nur auf Anfrage eines Clients', 'Nie'],
      correct: 1,
      explanation: 'KCC reagiert auf Infrastrukturänderungen und wertet die Topologie regelmäßig neu aus.',
    },
    {
      id: 'ad-repl-topo-no-ring-dogma-select',
      type: 'select-best',
      question: 'Wie flexibel ist die vom KCC erzeugte Topologie?',
      options: ['Immer exakt ein Ring mit fester Hop-Anzahl', 'Anpassbar je nach Erreichbarkeit und Effizienz', 'Nur sternförmig', 'Jeder DC muss direkt mit jedem anderen verbunden sein'],
      correct: 1,
      explanation: 'KCC wählt Verbindungen situativ, um Erreichbarkeit und Effizienz zu gewährleisten.',
    },
    {
      id: 'ad-repl-topo-site-link-vs-connection-misconception',
      type: 'select-best',
      question: '„Site Link und Connection Object sind dasselbe." Stimmt das?',
      options: ['Ja, beide verbinden DCs direkt', 'Nein, Site Link ist Site-Ebene / möglicher Pfad; Connection Object ist DC-Ebene / konkrete Verbindung', 'Ja, beide werden vom Admin manuell erstellt', 'Nein, nur Site Links existieren'],
      correct: 1,
      explanation: 'Site Links sind logische Site-Verbindungen; Connection Objects konkrete DC-Verbindungen.',
    },
    {
      id: 'ad-repl-topo-classification',
      type: 'matching',
      question: 'Ordne zu: Was wird typischerweise vom Admin konfiguriert, was vom KCC erzeugt?',
      pairs: [
        { left: 'Site Link', right: 'wird vom Admin konfiguriert' },
        { left: 'Site Link Cost', right: 'wird vom Admin konfiguriert' },
        { left: 'Schedule', right: 'wird vom Admin konfiguriert' },
        { left: 'Connection Object', right: 'wird vom KCC erzeugt' },
      ],
      explanation: 'Admin legt Site Links, Costs und Schedules fest; KCC erzeugt Connection Objects.',
    },
    {
      id: 'ad-repl-topo-cost-calculation',
      type: 'select-best',
      question: 'Gegeben: A → C direkt = Cost 50, A → B = Cost 10, B → C = Cost 10. Welche Route ist bevorzugt und was kostet sie?',
      options: ['Direkt A → C, Kosten 50', 'A → B → C, Kosten 20', 'A → B → C, Kosten 100', 'Die Route ist egal'],
      correct: 1,
      explanation: 'A → B → C kostet 10 + 10 = 20 und ist damit günstiger als direkt mit 50.',
    },
    {
      id: 'ad-repl-topo-cost-bandwidth-misconception',
      type: 'select-best',
      question: 'Wie entsteht Site Link Cost?',
      options: ['AD misst automatisch die echte Bandbreite und berechnet Cost', 'Cost wird administrativ als Designgewicht gesetzt', 'Cost ist der monatliche Preis der Leitung', 'Cost ergibt sich aus der Anzahl der DCs'],
      correct: 1,
      explanation: 'Cost ist ein administrativer Gewichtungswert; Bandbreite kann Grundlage sein, wird aber nicht automatisch gemessen.',
    },
    {
      id: 'ad-repl-topo-cost-preference-misconception',
      type: 'select-best',
      question: '„Je höher die Site-Link-Kosten, desto bevorzugter ist die Verbindung." Stimmt das?',
      options: ['Ja, hohe Costs bedeuten schnelle Leitungen', 'Nein, niedrigere Costs sind bevorzugt', 'Ja, Cost und Bevorzugung sind unabhängig', 'Nein, Kosten haben keine Bedeutung'],
      correct: 1,
      explanation: 'Niedrigere Gesamtkosten führen zu bevorzugten Replikationspfaden.',
    },
    {
      id: 'ad-repl-topo-schedule-purpose-select',
      type: 'select-best',
      question: 'Wozu dient ein Site-Link-Zeitplan (Schedule)?',
      options: ['Um Replikation in günstige Zeitfenster zu legen und das WAN zu entlasten', 'Um DCs automatisch zu installieren', 'Um Benutzer zu löschen', 'Um DNS-Records zu aktualisieren'],
      correct: 0,
      explanation: 'Zeitpläne entlasten das WAN, indem sie Replikation in geeignete Zeiten verschieben.',
    },
    {
      id: 'ad-repl-topo-interval-tradeoff-select',
      type: 'select-best',
      question: 'Was ist der Trade-off beim Replikationsintervall?',
      options: ['Kürzeres Intervall = aktuellere Daten, aber mehr Verkehr', 'Längeres Intervall = aktuellere Daten', 'Intervalle haben keinen Einfluss auf Verkehr', 'Kürzeres Intervall = weniger Verkehr'],
      correct: 0,
      explanation: 'Kürzere Intervalle erhöhen Aktualität, aber auch Verkehr; längere Intervalle senken Verkehr.',
    },
    {
      id: 'ad-repl-topo-bridgehead-select',
      type: 'select-best',
      question: 'Was ist die Aufgabe eines Bridgehead Servers im Intersite-Kontext?',
      options: ['Er ersetzt alle anderen DCs', 'Er übernimmt Intersite-Replikation für seine Site und verteilt lokal weiter', 'Er erstellt Subnetze', 'Er löscht Connection Objects'],
      correct: 1,
      explanation: 'Bridgehead Server sind Intersite-Replikationspartner, die Änderungen lokal weitergeben.',
    },
    {
      id: 'ad-repl-topo-bridgehead-auto-misconception',
      type: 'select-best',
      question: '„Bridgehead Server müssen immer manuell festgelegt werden." Stimmt das?',
      options: ['Ja, ohne manuelle Festlegung funktioniert Replikation nicht', 'Nein, der KCC wählt sie bevorzugt automatisch; manuell ist optional', 'Ja, aber nur in Multi-Domain-Forests', 'Nein, Bridgeheads gibt es nicht'],
      correct: 1,
      explanation: 'Automatische Auswahl ist das bevorzugte Standardmodell; manuelle Eingriffe sind optional.',
    },
    {
      id: 'ad-repl-topo-site-link-bridge-select',
      type: 'select-best',
      question: 'Was beschreibt eine Site Link Bridge?',
      options: ['Eine direkte Verbindung zwischen zwei DCs', 'Eine transitive Verbindung mehrerer Site Links zu einem logischen Pfad', 'Ein Backup-Site-Link', 'Eine physische WAN-Leitung'],
      correct: 1,
      explanation: 'Site Link Bridges ermöglichen transitive Pfade über mehrere Site Links hindurch.',
    },
    {
      id: 'ad-repl-topo-transfer-scenario',
      type: 'select-best',
      question: 'NEXUS hat drei Sites. Der direkte Link ist teuer/langsam, ein alternativer Pfad über eine Mittelsite günstiger. Was beeinflusst die Auswahl des bevorzugten Pfades?',
      options: ['Die kumulierten Site Link Costs', 'Die Uhrzeit des Servers', 'Die Anzahl der Benutzer', 'Der Name des KCC'],
      correct: 0,
      explanation: 'Der KCC wählt logische Pfade anhand der kumulierten Costs aus.',
    },
    {
      id: 'ad-repl-topo-troubleshooting-scenario',
      type: 'select-best',
      question: 'Site A repliziert immer über einen unerwünschten WAN-Pfad. Was prüfst du zuerst?',
      options: ['Site Link Costs und Site Link Struktur', 'Ob der DNS-Server läuft', 'Ob alle DCs neu installiert werden müssen', 'Ob das Schema erweitert werden muss'],
      correct: 0,
      explanation: 'Ungewollte Replikationspfade deuten auf Site-Link-Costs oder -Struktur hin.',
    },
    {
      id: 'ad-repl-topo-ordering',
      type: 'ordering',
      question: 'Bringe den Ablauf vom Admin bis zur DC-Replikation in die richtige Reihenfolge.',
      items: ['Admin definiert Sites, Links, Costs, Schedules', 'KCC bewertet Topologie', 'Connection Objects entstehen', 'DCs replizieren über die Verbindungen'],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Admin → KCC → Connection Objects → DC-Replikation.',
    },
  ];

  const quiz = [
    { question: 'Was ist die Hauptaufgabe des KCC?', options: ['AD-Daten selbst replizieren', 'Replikationstopologie berechnen und pflegen', 'Benutzer anlegen', 'DNS verwalten'], correct: 1, explanation: 'KCC berechnet die Topologie und erzeugt Connection Objects.' },
    { question: 'Repliziert der KCC selbst Daten?', options: ['Ja', 'Nein, er plant nur die Topologie', 'Nur im WAN', 'Nur zwischen Bridgeheads'], correct: 1, explanation: 'KCC erzeugt Verbindungen; die DCs replizieren die Daten.' },
    { question: 'Was ist ein Site Link?', options: ['Konkrete DC-zu-DC-Verbindung', 'Logische Verbindung zwischen Sites', 'Ein DNS-Record', 'Eine OU'], correct: 1, explanation: 'Site Links verbinden Sites logisch.' },
    { question: 'Was ist ein Connection Object?', options: ['Logische Site-Verbindung', 'Konkrete DC-Replikationsverbindung', 'Ein Subnetz', 'Ein Bridgehead-Backup'], correct: 1, explanation: 'Connection Objects verbinden konkrete DCs.' },
    { question: 'Welche Route ist günstiger: direkt A → C (50) oder A → B → C (10 + 10)?', options: ['Direkt A → C', 'A → B → C', 'Gleich teuer', 'Nicht berechenbar'], correct: 1, explanation: 'A → B → C kostet 20 und ist günstiger.' },
    { question: 'Wer wählt Bridgehead Server bevorzugt aus?', options: ['Nur der Administrator manuell', 'Der KCC automatisch', 'Die Clients', 'Der DNS-Server'], correct: 1, explanation: 'Automatische Auswahl durch den KCC ist das Standardmodell.' },
    { question: 'Wozu dient eine Site Link Bridge?', options: ['Direkte DC-Verbindung', 'Transitive Pfade über mehrere Site Links', 'Physische Leitung', 'Subnetzzuordnung'], correct: 1, explanation: 'Site Link Bridges ermöglichen transitive logische Pfade.' },
    { question: 'Was prüfst du zuerst bei unerwünschten Replikationspfaden?', options: ['Site Link Costs / Struktur', 'Schemaänderungen', 'Festplattenplatz', 'Client-IP'], correct: 0, explanation: 'Costs und Struktur bestimmen den logischen Pfad.' },
  ];

  const summary = [
    'Der KCC (Knowledge Consistency Checker) berechnet und pflegt die AD-Replikationstopologie.',
    'Der KCC repliziert nicht selbst die AD-Daten, sondern erzeugt Connection Objects für die Replikation.',
    'Die Replikationstopologie legt fest, wer mit wem repliziert.',
    'Store-and-Forward funktioniert über die berechnete Topologie, sodass nicht jeder DC alle anderen direkt erreichen muss.',
    'Ein Site Link ist eine logische Site-zu-Site-Verbindung; ein Connection Object ist eine konkrete DC-zu-DC-Verbindung.',
    'Site Link Cost ist ein administrativer Gewichtungswert; niedrigere Gesamtkosten ergeben bevorzugte Pfade.',
    'Cost wird administriert, nicht automatisch aus echter Bandbreite berechnet.',
    'Site Links können mit Schedules und Intervallen zeitlich gesteuert werden.',
    'Der Trade-off ist Aktualität gegen Bandbreite; der Admin entscheidet, der KCC baut daraus die Topologie.',
    'Ein Bridgehead Server übernimmt die Intersite-Replikation für eine Site und verteilt Änderungen lokal weiter.',
    'Bridgehead Server werden bevorzugt automatisch ausgewählt; manuelle Festlegung ist optional.',
    'Site Link Bridges ermöglichen transitive Pfade über mehrere Site Links.',
    'Bei unerwünschten Replikationspfaden prüft man zuerst Site Link Costs und Site Link Struktur.',
  ];

  return { title: 'KCC, Replikationstopologie & Site Links', explanations, exercises, quiz, summary };
}
