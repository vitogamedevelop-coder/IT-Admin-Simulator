import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory – Logical Components
// Covers: domain, organizational-units, domain-controller
// =============================================================================

export const AD_DOMAIN_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain');
export const AD_OU_TOPIC_KEY = topicKey('active-directory-virtualbox', 'organizational-units');
export const AD_DC_TOPIC_KEY = topicKey('active-directory-virtualbox', 'domain-controller');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

const physicalVsLogicalSvg = `<svg viewBox="0 0 320 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="110" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Physisch</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Server, Räume, Kabel</text>
  <text x="85" y="80" text-anchor="middle" fill="#c9d1d9" font-size="10">Domain Controller</text>
  <text x="85" y="98" text-anchor="middle" fill="#c9d1d9" font-size="10">als phys./virt. Maschine</text>

  <rect x="170" y="20" width="130" height="110" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Logisch</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Domäne, OU, Objekt</text>
  <text x="235" y="80" text-anchor="middle" fill="#c9d1d9" font-size="10">Distinguished Name</text>
  <text x="235" y="98" text-anchor="middle" fill="#c9d1d9" font-size="10">Namensraum</text>

  <line x1="150" y1="75" x2="170" y2="75" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const domainHierarchySvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">nexus.local</text>
  <text x="160" y="44" text-anchor="middle" fill="#8b949e" font-size="9">Domäne</text>

  <line x1="160" y1="50" x2="160" y2="70" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="80" y1="70" x2="240" y2="70" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="20" y="80" width="80" height="45" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="60" y="100" text-anchor="middle" fill="#c9d1d9" font-size="10">OU IT</text>
  <text x="60" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Abteilung</text>

  <rect x="120" y="80" width="80" height="45" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="160" y="100" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="160" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Abteilung</text>

  <rect x="220" y="80" width="80" height="45" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="260" y="100" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Personal</text>
  <text x="260" y="115" text-anchor="middle" fill="#8b949e" font-size="8">Abteilung</text>

  <line x1="60" y1="125" x2="60" y2="145" stroke="#8b949e" stroke-width="1"/>
  <rect x="30" y="150" width="60" height="25" rx="3" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="60" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">Benutzer</text>

  <line x1="160" y1="125" x2="160" y2="145" stroke="#8b949e" stroke-width="1"/>
  <rect x="130" y="150" width="60" height="25" rx="3" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="160" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">Computer</text>

  <line x1="260" y1="125" x2="260" y2="145" stroke="#8b949e" stroke-width="1"/>
  <rect x="230" y="150" width="60" height="25" rx="3" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>
  <text x="260" y="167" text-anchor="middle" fill="#c9d1d9" font-size="9">Drucker</text>

  <text x="160" y="205" text-anchor="middle" fill="#8b949e" font-size="9">Hierarchie: Domäne → OU → Objekt</text>
</svg>`;

const domainVsDcSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Domäne</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">logischer Verwaltungs-</text>
  <text x="85" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">und Namensraum</text>
  <text x="85" y="98" text-anchor="middle" fill="#8b949e" font-size="9">nexus.local</text>
  <text x="85" y="116" text-anchor="middle" fill="#8b949e" font-size="9">enthält OUs und Objekte</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Domain Controller</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Server, der AD DS</text>
  <text x="235" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">bereitstellt</text>
  <text x="235" y="98" text-anchor="middle" fill="#8b949e" font-size="9">hält Verzeichnisdaten</text>
  <text x="235" y="116" text-anchor="middle" fill="#8b949e" font-size="9">verarbeitet Authentifizierung</text>
</svg>`;

const ouVsGroupSvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="85" y="42" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">OU</text>
  <text x="85" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">organisatorische</text>
  <text x="85" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">Struktur</text>
  <text x="85" y="98" text-anchor="middle" fill="#8b949e" font-size="9">IT / Vertrieb / Personal</text>
  <text x="85" y="116" text-anchor="middle" fill="#8b949e" font-size="9">administrativ sortieren</text>

  <rect x="170" y="20" width="130" height="120" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="235" y="42" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Gruppe</text>
  <text x="235" y="62" text-anchor="middle" fill="#c9d1d9" font-size="10">Berechtigungs-/</text>
  <text x="235" y="78" text-anchor="middle" fill="#c9d1d9" font-size="10">Mitgliedschaftslogik</text>
  <text x="235" y="98" text-anchor="middle" fill="#8b949e" font-size="9">Drucker_Vertrieb</text>
  <text x="235" y="116" text-anchor="middle" fill="#8b949e" font-size="9">Rechte vergeben</text>
</svg>`;

const dnTreeSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="36" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="28" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">nexus.local</text>
  <text x="160" y="40" text-anchor="middle" fill="#8b949e" font-size="8">DC=nexus, DC=local</text>

  <line x1="160" y1="46" x2="160" y2="66" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="100" y1="66" x2="220" y2="66" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="40" y="75" width="80" height="34" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="80" y="92" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="80" y="104" text-anchor="middle" fill="#8b949e" font-size="8">Berlin</text>

  <rect x="200" y="75" width="80" height="34" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="240" y="92" text-anchor="middle" fill="#c9d1d9" font-size="10">OU Personal</text>
  <text x="240" y="104" text-anchor="middle" fill="#8b949e" font-size="8">München</text>

  <line x1="80" y1="109" x2="80" y2="130" stroke="#8b949e" stroke-width="1"/>
  <rect x="45" y="135" width="70" height="34" rx="4" fill="#0d1117" stroke="#c9d1d9" stroke-width="1.5"/>
  <text x="80" y="152" text-anchor="middle" fill="#c9d1d9" font-size="10">Max Mustermann</text>
  <text x="80" y="164" text-anchor="middle" fill="#8b949e" font-size="8">CN=Max Mustermann</text>

  <rect x="20" y="185" width="280" height="28" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="160" y="203" text-anchor="middle" fill="#ffcc00" font-size="9">CN=Max Mustermann,OU=Vertrieb,OU=Berlin,DC=nexus,DC=local</text>
</svg>`;

const dcAsServerSvg = `<svg viewBox="0 0 320 150" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="15" width="100" height="60" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="35" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">DC01</text>
  <text x="160" y="52" text-anchor="middle" fill="#c9d1d9" font-size="9">Server mit AD DS</text>
  <text x="160" y="66" text-anchor="middle" fill="#8b949e" font-size="8">physisch / virtuell</text>

  <line x1="160" y1="75" x2="160" y2="95" stroke="#ffcc00" stroke-width="1.5"/>
  <line x1="100" y1="95" x2="220" y2="95" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="50" y="105" width="70" height="32" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="85" y="122" text-anchor="middle" fill="#c9d1d9" font-size="9">Domäne</text>
  <text x="85" y="134" text-anchor="middle" fill="#8b949e" font-size="8">logischer Raum</text>

  <rect x="200" y="105" width="70" height="32" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="235" y="122" text-anchor="middle" fill="#c9d1d9" font-size="9">Authentifizierung</text>
  <text x="235" y="134" text-anchor="middle" fill="#8b949e" font-size="8">Anmeldung</text>
</svg>`;

const dcRedundancySvg = `<svg viewBox="0 0 320 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="40" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="28" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Domäne</text>
  <text x="160" y="42" text-anchor="middle" fill="#8b949e" font-size="9">nexus.local</text>

  <line x1="160" y1="50" x2="160" y2="70" stroke="#00f0ff" stroke-width="1.5"/>
  <line x1="90" y1="70" x2="230" y2="70" stroke="#00f0ff" stroke-width="1.5"/>

  <rect x="50" y="80" width="80" height="40" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="90" y="98" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">DC01</text>
  <text x="90" y="112" text-anchor="middle" fill="#c9d1d9" font-size="8">Domain Controller</text>

  <rect x="190" y="80" width="80" height="40" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="230" y="98" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">DC02</text>
  <text x="230" y="112" text-anchor="middle" fill="#c9d1d9" font-size="8">Domain Controller</text>

  <line x1="90" y1="120" x2="230" y2="120" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="160" y="140" text-anchor="middle" fill="#8b949e" font-size="9">mehrere DCs für Verfügbarkeit und Replikation</text>
  <text x="160" y="155" text-anchor="middle" fill="#8b949e" font-size="9">(Details folgen später)</text>
</svg>`;

const fsmoOverviewSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="15" width="280" height="50" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="32" text-anchor="middle" fill="#00f0ff" font-size="11" font-weight="bold">Forest (Gesamtstruktur)</text>
  <text x="160" y="50" text-anchor="middle" fill="#8b949e" font-size="9">kann eine oder mehrere Domänen enthalten</text>

  <rect x="40" y="78" width="100" height="36" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="90" y="94" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Schema Master</text>
  <text x="90" y="107" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Forest</text>

  <rect x="180" y="78" width="100" height="36" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="230" y="94" text-anchor="middle" fill="#ffcc00" font-size="10" font-weight="bold">Domain Naming</text>
  <text x="230" y="107" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Forest</text>

  <rect x="20" y="135" width="280" height="75" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="1.5"/>
  <text x="160" y="155" text-anchor="middle" fill="#c9d1d9" font-size="11" font-weight="bold">Domäne nexus.local</text>

  <rect x="40" y="168" width="70" height="30" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="75" y="182" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">RID Master</text>
  <text x="75" y="193" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Domäne</text>

  <rect x="125" y="168" width="70" height="30" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="160" y="182" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">PDC Emulator</text>
  <text x="160" y="193" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Domäne</text>

  <rect x="210" y="168" width="70" height="30" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="245" y="182" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Infrastructure</text>
  <text x="245" y="193" text-anchor="middle" fill="#c9d1d9" font-size="8">1× pro Domäne</text>
</svg>`;

const ridPoolSvg = `<svg viewBox="0 0 320 190" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="90" y="10" width="140" height="42" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="28" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">RID Master</text>
  <text x="160" y="43" text-anchor="middle" fill="#8b949e" font-size="9">vergibt RID-Bereiche</text>

  <line x1="160" y1="52" x2="160" y2="75" stroke="#ffcc00" stroke-width="1.5"/>
  <line x1="80" y1="75" x2="240" y2="75" stroke="#ffcc00" stroke-width="1.5"/>

  <rect x="30" y="90" width="110" height="42" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="85" y="107" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">DC01</text>
  <text x="85" y="121" text-anchor="middle" fill="#c9d1d9" font-size="8">RID-Pool 1000–1499</text>

  <rect x="180" y="90" width="110" height="42" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="235" y="107" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">DC02</text>
  <text x="235" y="121" text-anchor="middle" fill="#c9d1d9" font-size="8">RID-Pool 1500–1999</text>

  <rect x="30" y="155" width="260" height="30" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="160" y="168" text-anchor="middle" fill="#c9d1d9" font-size="9">Domänen-SID-Anteil + RID = eindeutige Objekt-SID</text>
  <text x="160" y="180" text-anchor="middle" fill="#8b949e" font-size="8">z. B. S-1-5-21-...-1001</text>
</svg>`;

const pdcSvg = `<svg viewBox="0 0 320 210" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="110" y="10" width="100" height="46" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="30" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">PDC Emulator</text>
  <text x="160" y="46" text-anchor="middle" fill="#8b949e" font-size="9">eine Rolle pro Domäne</text>

  <line x1="160" y1="56" x2="160" y2="80" stroke="#ffcc00" stroke-width="1.5"/>
  <line x1="60" y1="80" x2="260" y2="80" stroke="#ffcc00" stroke-width="1.5"/>

  <rect x="20" y="95" width="85" height="44" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="62" y="112" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Passwort-</text>
  <text x="62" y="124" text-anchor="middle" fill="#00f0ff" font-size="9">änderungen</text>
  <text x="62" y="136" text-anchor="middle" fill="#8b949e" font-size="8">schnelle Replikation</text>

  <rect x="117" y="95" width="85" height="44" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="159" y="112" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Zeit-</text>
  <text x="159" y="124" text-anchor="middle" fill="#00f0ff" font-size="9">Hierarchie</text>
  <text x="159" y="136" text-anchor="middle" fill="#8b949e" font-size="8">Kerberos braucht Zeit</text>

  <rect x="215" y="95" width="85" height="44" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="257" y="112" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">GPO-Editor</text>
  <text x="257" y="124" text-anchor="middle" fill="#00f0ff" font-size="9">/ Legacy</text>
  <text x="257" y="136" text-anchor="middle" fill="#8b949e" font-size="8">bevorzugtes Ziel</text>

  <rect x="20" y="160" width="280" height="38" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="160" y="174" text-anchor="middle" fill="#c9d1d9" font-size="9">PDC = bevorzugter Koordinator,</text>
  <text x="160" y="188" text-anchor="middle" fill="#c9d1d9" font-size="9">nicht exklusiver Alleinherrscher</text>
</svg>`;

const infrastructureSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="10" width="120" height="40" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="80" y="25" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domäne A</text>
  <text x="80" y="40" text-anchor="middle" fill="#8b949e" font-size="8">Benutzer Anna</text>

  <rect x="180" y="10" width="120" height="40" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="240" y="25" text-anchor="middle" fill="#00f0ff" font-size="10" font-weight="bold">Domäne B</text>
  <text x="240" y="40" text-anchor="middle" fill="#8b949e" font-size="8">Gruppe Vertrieb</text>

  <line x1="80" y1="50" x2="80" y2="90" stroke="#00f0ff" stroke-width="1"/>
  <rect x="20" y="90" width="120" height="30" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="80" y="104" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">RID, PDC</text>
  <text x="80" y="115" text-anchor="middle" fill="#c9d1d9" font-size="8">domain-weit</text>

  <line x1="240" y1="50" x2="240" y2="90" stroke="#00f0ff" stroke-width="1"/>
  <rect x="180" y="90" width="120" height="30" rx="4" fill="#0d1117" stroke="#ffcc00" stroke-width="1.5"/>
  <text x="240" y="104" text-anchor="middle" fill="#ffcc00" font-size="9" font-weight="bold">Infrastructure</text>
  <text x="240" y="115" text-anchor="middle" fill="#c9d1d9" font-size="8">domain-weit</text>

  <path d="M140 30 L180 30" stroke="#8b949e" stroke-width="1" stroke-dasharray="4,2" marker-end="url(#arrowInfra)"/>
  <text x="160" y="58" text-anchor="middle" fill="#8b949e" font-size="9">Anna ist Mitglied in</text>
  <text x="160" y="71" text-anchor="middle" fill="#8b949e" font-size="9">Gruppe Vertrieb</text>

  <rect x="20" y="150" width="280" height="55" rx="6" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="160" y="168" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">Infrastructure Master</text>
  <text x="160" y="184" text-anchor="middle" fill="#c9d1d9" font-size="9">hält domänenübergreifende Referenzen aktuell</text>
  <text x="160" y="198" text-anchor="middle" fill="#8b949e" font-size="8">besonders relevant in Multi-Domain-Umgebungen</text>
  <defs><marker id="arrowInfra" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8b949e"/></marker></defs>
</svg>`;

const globalCatalogSvg = `<svg viewBox="0 0 320 220" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="10" width="90" height="36" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="65" y="25" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Domäne A</text>
  <text x="65" y="37" text-anchor="middle" fill="#8b949e" font-size="8">volle Daten</text>

  <rect x="115" y="10" width="90" height="36" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="160" y="25" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Domäne B</text>
  <text x="160" y="37" text-anchor="middle" fill="#8b949e" font-size="8">Teilinformationen</text>

  <rect x="210" y="10" width="90" height="36" rx="4" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="255" y="25" text-anchor="middle" fill="#00f0ff" font-size="9" font-weight="bold">Domäne C</text>
  <text x="255" y="37" text-anchor="middle" fill="#8b949e" font-size="8">Teilinformationen</text>

  <rect x="100" y="80" width="120" height="60" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="102" text-anchor="middle" fill="#ffcc00" font-size="11" font-weight="bold">DC mit Global Catalog</text>
  <text x="160" y="120" text-anchor="middle" fill="#c9d1d9" font-size="9">eigene Domäne: vollständig</text>
  <text x="160" y="135" text-anchor="middle" fill="#c9d1d9" font-size="9">andere Domänen: Partial Attribute Set</text>

  <line x1="65" y1="46" x2="130" y2="80" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>
  <line x1="160" y1="46" x2="160" y2="80" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>
  <line x1="255" y1="46" x2="190" y2="80" stroke="#8b949e" stroke-width="1" stroke-dasharray="3,2"/>

  <rect x="40" y="170" width="240" height="42" rx="4" fill="#0d1117" stroke="#8b949e" stroke-width="1"/>
  <text x="160" y="188" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="bold">Global Catalog ≠ FSMO</text>
  <text x="160" y="204" text-anchor="middle" fill="#8b949e" font-size="9">GC = Dienst auf einem DC, keine Masterrolle</text>
</svg>`;

const ouStandardContainerSvg = `<svg viewBox="0 0 320 260" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="160" y="20" text-anchor="middle" fill="#00f0ff" font-size="14" font-weight="bold">nexus.local</text>
  <rect x="20" y="35" width="280" height="95" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="160" y="55" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Standard-Container</text>
  <text x="40" y="75" fill="#c9d1d9" font-size="10">Builtin</text>
  <text x="40" y="92" fill="#c9d1d9" font-size="10">Computers</text>
  <text x="40" y="109" fill="#c9d1d9" font-size="10">Users</text>
  <rect x="20" y="145" width="280" height="100" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
  <text x="160" y="165" text-anchor="middle" fill="#00f0ff" font-size="12" font-weight="bold">Eigene Organisationseinheiten</text>
  <text x="40" y="185" fill="#c9d1d9" font-size="10">OU IT</text>
  <text x="40" y="202" fill="#c9d1d9" font-size="10">OU Personal</text>
  <text x="40" y="219" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="40" y="236" fill="#c9d1d9" font-size="10">OU Entwicklung</text>
</svg>`;

const ouMoveObjectSvg = `<svg viewBox="0 0 320 180" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="140" height="160" rx="6" fill="#0d1117" stroke="#ffcc00" stroke-width="2"/>
  <text x="80" y="32" text-anchor="middle" fill="#ffcc00" font-size="12" font-weight="bold">Vorher</text>
  <text x="25" y="55" fill="#c9d1d9" font-size="10">nexus.local</text>
  <text x="40" y="75" fill="#c9d1d9" font-size="10">Computers</text>
  <text x="55" y="95" fill="#c9d1d9" font-size="10">SALES-PC01</text>
  <text x="25" y="150" fill="#8b949e" font-size="9">DN enthält Container</text>
  <rect x="170" y="10" width="140" height="160" rx="6" fill="#0d1117" stroke="#00ff66" stroke-width="2"/>
  <text x="240" y="32" text-anchor="middle" fill="#00ff66" font-size="12" font-weight="bold">Nachher</text>
  <text x="185" y="55" fill="#c9d1d9" font-size="10">nexus.local</text>
  <text x="200" y="75" fill="#c9d1d9" font-size="10">OU Vertrieb</text>
  <text x="215" y="95" fill="#c9d1d9" font-size="10">SALES-PC01</text>
  <text x="185" y="150" fill="#8b949e" font-size="9">DN enthält OU</text>
  <path d="M150 75 L170 75" stroke="#c9d1d9" stroke-width="2" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#c9d1d9"/></marker></defs>
</svg>`;

// =============================================================================
// Domain lesson
// =============================================================================
function buildDomainLesson() {
  const explanations = [
    explanation('domain-einstieg-classic', 'NEXUS wächst', 'classic', [
      { type: 'text', content: 'NEXUS hat inzwischen viele Mitarbeiter, Computer und Drucker. Die Abteilungen IT, Vertrieb, Personal und Verwaltung arbeiten mit denselben zentralen Konten – dank Active Directory. Aber die Objekte liegen bisher alle in einer flachen Liste. Wer sucht, findet schnell den Überblick.' },
      { type: 'text', content: 'Das eigentliche Problem ist nicht die Anzahl der Objekte. Das Problem ist die fehlende Struktur: Wo gehört ein Objekt hin? Was ist der übergeordnete Verwaltungsbereich? Wie findet man eindeutig, was man sucht?' },
      { type: 'question', question: 'Was ist hier das zentrale Strukturproblem?', options: ['Zu wenige Benutzer', 'Objekte ohne sinnvolle logische Einordnung', 'Zu langsame Server', 'Fehlende Druckertreiber'], correct: 1, explanation: 'Wenn viele Objekte existieren, aber keine klare logische Struktur, wird die Verwaltung unübersichtlich.' },
    ]),
    explanation('domain-einstieg-intuitive', 'Eine Stadt ohne Stadtteile', 'intuitive', [
      { type: 'text', content: 'Stell dir eine Stadt vor, in der alle Einwohner, Häuser und Behörden in einer einzigen langen Liste geführt werden. Jede Adresse existiert, aber niemand weiß, zu welchem Stadtteil oder Bezirk sie gehört. Post, Feuerwehr und Verwaltung müssen jedes Mal mühsam suchen.' },
      { type: 'text', content: 'Active Directory bietet genau die Struktur, die diese Stadt braucht: Stadtteile (Domänen), Bezirke (OUs) und eindeutige Adressen (Distinguished Names). Der Domain Controller ist vergleichbar mit dem Bürgeramt, das die zentrale Meldedatenbank bereitstellt.' },
    ]),
    explanation('domain-logisch-physikalisch-classic', 'Logisch vs. physisch', 'classic', [
      { type: 'text', content: 'In Active Directory unterscheidet man logische und physische Komponenten. Logische Komponenten beschreiben die organisatorische Struktur, unabhängig davon, auf welchem Server sie gerade gespeichert sind.' },
      { type: 'diagram', content: physicalVsLogicalSvg },
      { type: 'list', title: 'Beispiele', items: [
        'Physisch: Domain Controller als Server, Netzwerkkabel, Rechenzentrum, Standort',
        'Logisch: Domäne, OU, Objekt, Distinguished Name, DNS-Namensraum',
      ] },
      { type: 'question', question: 'Welche Komponente ist logisch?', options: ['Domain Controller als Server', 'Domäne als Verwaltungs- und Namensraum', 'Netzwerkkabel', 'Rechenzentrum'], correct: 1, explanation: 'Eine Domäne ist eine logische Struktur. Der Domain Controller ist die physische oder virtuelle Maschine, die den Dienst bereitstellt.' },
    ]),
    explanation('domain-rueckblick-classic', 'Rückblick: Objekt, Attribut, Schema', 'classic', [
      { type: 'text', content: 'Aus dem Grundlagen-Block ist bekannt: Ein Objekt ist eine verwaltete Einheit wie ein Benutzer, Computer oder Drucker. Attribute beschreiben Eigenschaften eines Objekts, und das Schema legt fest, welche Objektarten und Attribute erlaubt sind.' },
      { type: 'text', content: 'In diesem Block geht es darum, wie diese Objekte in einer Hierarchie angeordnet werden: Domäne → OU → Objekt.' },
    ]),
    explanation('domain-definition-classic', 'Was ist eine Domäne?', 'classic', [
      { type: 'text', content: 'Eine Domäne ist eine grundlegende logische Struktur in Active Directory. Sie bildet einen Verwaltungsbereich, einen Namensraum und die Umgebung, in der Objekte und OUs organisiert sind.' },
      { type: 'text', content: 'Die Domäne verwendet einen DNS-Namensraum. Ein Beispiel ist nexus.local. Das bedeutet nicht, dass AD-Domäne und DNS-Zone in jeder Hinsicht identisch sind, aber beide Namensräume hängen eng zusammen.' },
      { type: 'list', title: 'Eigenschaften einer Domäne', items: [
        'Verwaltungsbereich für Objekte',
        'Logischer Namensraum, typisch mit DNS-Bezug',
        'Grenze für bestimmte Verwaltungs- und Sicherheitsaspekte',
        'Enthält OUs und darin Objekte',
      ] },
      { type: 'question', question: 'Was beschreibt eine Domäne?', options: ['Einen physischen Server im Rechenzentrum', 'Einen logischen Verwaltungs- und Namensraum', 'Eine einzelne OU', 'Eine Sicherheitsgruppe'], correct: 1, explanation: 'Eine Domäne ist ein logischer Verwaltungs- und Namensraum, der OUs und Objekte enthält.' },
    ]),
    explanation('domain-definition-intuitive', 'Domäne = Stadt', 'intuitive', [
      { type: 'text', content: 'Eine Domäne ist wie eine Stadt: Sie hat einen Namen, eine klare Grenze und innerhalb dieser Grenze gibt es Stadtteile, Gebäude und Bewohner. Die Stadt selbst ist keine einzelne Straße und kein einzelnes Gebäude, sondern der übergeordnete Raum.' },
      { type: 'text', content: 'Eine OU ist vergleichbar mit einem Stadtteil, ein Objekt mit einem Bewohner oder Gebäude. Mehrere Städte können später zu einem Land zusammengefasst werden – das ist aber ein späteres Thema.' },
    ]),
    explanation('domain-vs-ou-classic', 'Domäne vs. OU', 'classic', [
      { type: 'text', content: 'Domäne und OU sind beide logische Strukturen, aber auf unterschiedlichen Ebenen. Die Domäne ist der übergeordnete Verwaltungs- und Namensraum. Die OU ist eine organisatorische Einheit innerhalb der Domäne.' },
      { type: 'diagram', content: domainHierarchySvg },
      { type: 'question', question: 'NEXUS bekommt eine neue Abteilung „Vertrieb“. Braucht sie deshalb zwingend eine neue Domäne?', options: ['Ja, jede Abteilung braucht eine eigene Domäne', 'Nein, für organisatorische Trennung reicht meist eine OU', 'Ja, weil die Domäne die Abteilungen abbildet', 'Nein, man muss stattdessen einen neuen Domain Controller kaufen'], correct: 1, explanation: 'Wenn nur eine organisatorische Trennung nötig ist, reicht typischerweise eine OU innerhalb der bestehenden Domäne. Neue Domänen sind ein größerer Architekturschritt.' },
    ]),
    explanation('domain-vs-dc-classic', 'Domäne ≠ Domain Controller', 'classic', [
      { type: 'text', content: 'Eine häufige Verwechslung: Domäne und Domain Controller sind nicht dasselbe. Die Domäne ist der logische Verwaltungsraum. Der Domain Controller ist ein physischer oder virtueller Server, der Active Directory Domain Services bereitstellt.' },
      { type: 'diagram', content: domainVsDcSvg },
      { type: 'question', question: 'Was ist ein Domain Controller?', options: ['Die gesamte Domäne', 'Ein Server, der AD DS bereitstellt und Verzeichnisdaten hält', 'Eine OU', 'Eine Sicherheitsgruppe'], correct: 1, explanation: 'Der Domain Controller ist ein Server, der AD DS hostet, Verzeichnisdaten hält und Authentifizierung ermöglicht.' },
    ]),
    explanation('domain-zusammenfassung-classic', 'Zusammenfassung Domäne', 'classic', [
      { type: 'text', content: 'Eine Domäne ist der logische Verwaltungs- und Namensraum in Active Directory. Innerhalb der Domäne werden Objekte über Organisationseinheiten strukturiert. Der Domain Controller ist der Server, der diese logische Struktur technisch bereitstellt.' },
      { type: 'question', question: 'Welche Aussage ist richtig?', options: ['Domäne und Domain Controller sind dasselbe', 'Eine Domäne ist logisch, ein Domain Controller ist ein physischer/virtueller Server', 'Eine OU ist größer als eine Domäne', 'Eine Domäne enthält keine OUs'], correct: 1, explanation: 'Domäne = logischer Raum. Domain Controller = Server, der AD DS bereitstellt.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-logisch-physikalisch-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff der passenden Ebene zu: physisch oder logisch.',
      pairs: [
        { left: 'Domain Controller als Server', right: 'physisch' },
        { left: 'Domäne als Namensraum', right: 'logisch' },
        { left: 'Netzwerkkabel', right: 'physisch' },
        { left: 'OU als organisatorische Einheit', right: 'logisch' },
        { left: 'Rechenzentrum', right: 'physisch' },
        { left: 'Distinguished Name', right: 'logisch' },
      ],
      explanation: 'Logische Komponenten beschreiben Strukturen im Verzeichnis. Physische Komponenten sind Geräte, Server und Infrastruktur.',
    },
    {
      id: 'ad-domain-vs-ou-select',
      type: 'select-best',
      question: 'Eine neue Abteilung soll organisatorisch getrennt verwaltet werden. Was ist typischerweise der einfachste Weg innerhalb einer bestehenden Domäne?',
      options: ['Sofort eine neue Domäne erstellen', 'Eine OU für die Abteilung anlegen', 'Einen neuen Domain Controller kaufen', 'Alle Benutzer in eine Sicherheitsgruppe packen'],
      correct: 1,
      explanation: 'Eine OU strukturiert Objekte innerhalb einer Domäne. Eine neue Domäne ist ein größerer Schritt und meist nicht nötig.',
    },
    {
      id: 'ad-domain-vs-dc-select',
      type: 'select-best',
      question: 'Was ist der entscheidende Unterschied zwischen Domäne und Domain Controller?',
      options: ['Beides ist dasselbe', 'Domäne ist logisch, Domain Controller ist ein Server mit AD DS', 'Domain Controller ist logisch, Domäne ist physisch', 'Eine Domäne ist ein spezieller Domain Controller'],
      correct: 1,
      explanation: 'Die Domäne ist der logische Verwaltungsraum. Der Domain Controller ist die technische Infrastruktur, die AD DS bereitstellt.',
    },
  ];

  const quiz = [
    { question: 'Was ist eine Domäne in Active Directory?', options: ['Ein physischer Server', 'Ein logischer Verwaltungs- und Namensraum', 'Eine OU', 'Eine Sicherheitsgruppe'], correct: 1, explanation: 'Eine Domäne ist ein logischer Verwaltungs- und Namensraum.' },
    { question: 'Welche Aussage zu OUs und Domänen ist richtig?', options: ['Eine OU ist größer als eine Domäne', 'Eine OU liegt innerhalb einer Domäne', 'Eine OU ersetzt eine Domäne', 'Domänen dürfen keine OUs enthalten'], correct: 1, explanation: 'Eine OU ist eine organisatorische Einheit innerhalb einer Domäne.' },
    { question: 'Was ist ein Domain Controller?', options: ['Ein logischer Namensraum', 'Ein Server, der AD DS bereitstellt', 'Eine Art OU', 'Ein Client-Betriebssystem'], correct: 1, explanation: 'Ein Domain Controller hostet AD DS und stellt Verzeichnisdienste bereit.' },
    { question: 'Welches Element ist logisch?', options: ['Domain Controller als Server', 'Rechenzentrum', 'Domäne als Namensraum', 'Netzwerkkabel'], correct: 2, explanation: 'Eine Domäne ist eine logische Struktur. Server, Kabel und Rechenzentrum sind physisch.' },
    { question: 'Warum reicht für eine neue Abteilung oft eine OU?', options: ['Weil OUs die gleichen Rechte wie Domänen haben', 'Weil OUs organisatorische Trennung innerhalb einer Domäne ermöglichen', 'Weil Domänen nicht mehr verwendet werden', 'Weil OUs keine Objekte enthalten dürfen'], correct: 1, explanation: 'Eine OU ermöglicht organisatorische Strukturierung innerhalb einer Domäne.' },
    { question: 'Welche Beziehung beschreibt die Hierarchie korrekt?', options: ['Objekt → Domäne → OU', 'Domäne → OU → Objekt', 'OU → Domäne → Objekt', 'Domäne → Objekt → OU'], correct: 1, explanation: 'Domäne ist die oberste logische Ebene, gefolgt von OU, gefolgt vom Objekt.' },
  ];

  const summary = [
    'Eine Domäne ist ein logischer Verwaltungs- und Namensraum in AD.',
    'OUs liegen innerhalb einer Domäne und strukturieren Objekte.',
    'Ein Domain Controller ist ein Server, der AD DS bereitstellt.',
    'Domäne und Domain Controller sind nicht dasselbe.',
    'Logische Komponenten (Domäne, OU, DN) sind von physischen Komponenten (Server, Kabel) zu unterscheiden.',
  ];

  return { title: 'Domäne', explanations, exercises, quiz, summary };
}

// =============================================================================
// Organizational Units lesson
// =============================================================================
function buildOrganizationalUnitsLesson() {
  const explanations = [
    explanation('ou-einstieg-classic', 'Ordnung schaffen', 'classic', [
      { type: 'text', content: 'NEXUS hat jetzt viele Benutzer, Computer und Drucker in der Domäne. Wenn alle Objekte in einer einzigen flachen Liste liegen, ist das unübersichtlich. Die Lösung ist eine zusätzliche Strukturebene: die Organisationseinheit (OU).' },
      { type: 'question', question: 'Welches Strukturelement hilft, Objekte innerhalb einer Domäne zu organisieren?', options: ['Ein neuer Domain Controller', 'Eine Organisationseinheit (OU)', 'Ein neues Netzwerkkabel', 'Ein neuer DNS-Server'], correct: 1, explanation: 'Eine OU dient dazu, Objekte innerhalb einer Domäne logisch und administrativ zu organisieren.' },
    ]),
    explanation('ou-einstieg-intuitive', 'Stadtteile in der Stadt', 'intuitive', [
      { type: 'text', content: 'Stell dir die Domäne als Stadt vor. Die Stadt hat viele Bewohner und Gebäude, aber ohne Stadtteile wäre die Verwaltung chaotisch. Eine OU ist vergleichbar mit einem Stadtteil: Er gruppiert Bewohner und Gebäude nach geografischer oder organisatorischer Nähe.' },
      { type: 'text', content: 'Ein Stadtteil sagt aber nicht automatisch, wer wohin darf. Das regelt man über Berechtigungen – in AD typischerweise über Gruppen. OU und Gruppe haben also unterschiedliche Zwecke.' },
    ]),
    explanation('ou-definition-classic', 'Was ist eine OU?', 'classic', [
      { type: 'text', content: 'Eine Organisationseinheit (OU) ist ein Container in Active Directory, der Objekte innerhalb einer Domäne gruppiert. OUs spiegeln oft Abteilungen, Standorte oder Verwaltungsbereiche wider.' },
      { type: 'list', title: 'Zwecke einer OU', items: [
        'Gruppierung von Objekten',
        'Abbildung organisatorischer Strukturen',
        'Bessere Auffindbarkeit',
        'Vereinfachte Verwaltung',
      ] },
      { type: 'text', content: 'Wichtig: Eine OU ist keine Sicherheitsgruppe. Die OU strukturiert, die Gruppe steuert typischerweise Berechtigungen und Mitgliedschaften.' },
      { type: 'question', question: 'Wozu dient eine OU primär?', options: ['Zur Vergabe von Dateiberechtigungen', 'Zur organisatorischen Gruppierung von Objekten', 'Zur Absicherung von Firewalls', 'Zur DNS-Auflösung'], correct: 1, explanation: 'Eine OU gruppiert Objekte organisatorisch. Berechtigungen werden typischerweise über Gruppen gesteuert.' },
    ]),
    explanation('ou-definition-intuitive', 'Regal vs. Mitgliedschaft', 'intuitive', [
      { type: 'text', content: 'Eine OU ist wie ein Regal in einem Archiv: Es sagt, wo ein Ordner liegt. Eine Gruppe ist wie eine Mailingliste: Sie sagt, wer zu einem Projekt gehört und welche Rechte diese Personen haben. Ein Ordner kann in einem Regal stehen und gleichzeitig in mehreren Themenlisten auftauchen – beides ist sinnvoll, aber es ist nicht dasselbe.' },
    ]),
    explanation('ou-vs-gruppe-classic', 'OU vs. Gruppe', 'classic', [
      { type: 'diagram', content: ouVsGroupSvg },
      { type: 'list', title: 'Unterschied', items: [
        'OU: organisatorische/administrative Struktur',
        'Gruppe: Mitgliedschaft und Berechtigungslogik',
      ] },
      { type: 'question', question: 'Was ist der Hauptunterschied zwischen OU und Gruppe?', options: ['Beides ist dasselbe', 'OU strukturiert organisatorisch, Gruppe verwaltet Berechtigungen/Mitgliedschaften', 'OU erteilt Berechtigungen, Gruppe strukturiert die Domäne', 'Gruppen können keine Benutzer enthalten'], correct: 1, explanation: 'OUs dienen der Struktur, Gruppen der Berechtigungs- und Mitgliedschaftslogik.' },
    ]),
    explanation('ou-hierarchie-classic', 'Domäne → OU → Objekt', 'classic', [
      { type: 'text', content: 'Die zentrale Hierarchie in diesem Block ist: Domäne → OU → Objekt. Die Domäne ist der übergeordnete Raum, die OU strukturiert ihn, und das Objekt ist die eigentliche verwaltete Einheit.' },
      { type: 'diagram', content: domainHierarchySvg },
      { type: 'question', question: 'Welche Reihenfolge beschreibt die Hierarchie korrekt?', options: ['Objekt → OU → Domäne', 'Domäne → OU → Objekt', 'OU → Domäne → Objekt', 'Objekt → Domäne → OU'], correct: 1, explanation: 'Domäne ist die oberste Ebene, gefolgt von OU, gefolgt vom Objekt.' },
    ]),
    explanation('dn-einfuehrung-classic', 'Distinguished Name', 'classic', [
      { type: 'text', content: 'Ein Distinguished Name (DN) beschreibt die eindeutige Position eines Objekts innerhalb der AD-Namensstruktur. Er zeigt, wo ein Objekt in der Hierarchie steht.' },
      { type: 'text', content: 'Die Bestandteile eines DN verwenden Abkürzungen: CN = Common Name (Name des Objekts), OU = Organizational Unit, DC = Domain Component (Bestandteil des Domänennamens).' },
      { type: 'diagram', content: dnTreeSvg },
      { type: 'list', title: 'Beispiel', items: [
        'CN=Max Mustermann',
        'OU=Vertrieb',
        'OU=Berlin',
        'DC=nexus',
        'DC=local',
      ] },
      { type: 'question', question: 'Was beschreibt ein Distinguished Name?', options: ['Den physischen Server', 'Die eindeutige Position eines Objekts in der Verzeichnisstruktur', 'Die Gruppenmitgliedschaft eines Benutzers', 'Das Betriebssystem des Clients'], correct: 1, explanation: 'Der DN gibt an, wo ein Objekt in der Hierarchie steht.' },
    ]),
    explanation('dn-dc-missverstaendnis-classic', 'DC-Zweideutigkeit', 'classic', [
      { type: 'text', content: 'Der Buchstabe DC hat in Active Directory zwei Bedeutungen, die sauber getrennt werden müssen. Als Serverrolle bedeutet DC „Domain Controller“. Im Distinguished Name bedeutet DC „Domain Component“.' },
      { type: 'list', title: 'Beispiele', items: [
        'DC01 ist ein Servername / ein Domain Controller.',
        'DC=nexus,DC=local sind Domain Components im DN.',
      ] },
      { type: 'question', question: 'Was bedeutet DC in einem Distinguished Name?', options: ['Domain Controller', 'Domain Component', 'Data Center', 'Disk Controller'], correct: 1, explanation: 'Im DN steht DC für Domain Component, also einen Bestandteil des Domänennamens.' },
    ]),
    explanation('ou-zusammenfassung-classic', 'Zusammenfassung OU & DN', 'classic', [
      { type: 'text', content: 'OUs strukturieren Objekte innerhalb einer Domäne, sind aber keine Berechtigungsgruppen. Der Distinguished Name beschreibt die eindeutige Position eines Objekts in der Hierarchie. DC bedeutet im DN „Domain Component“, als Serverrolle „Domain Controller“.' },
      { type: 'question', question: 'Welche Aussage ist richtig?', options: ['Eine OU ist eine Sicherheitsgruppe', 'Ein DN zeigt die Position eines Objekts in der Struktur', 'DC im DN bedeutet immer Domain Controller', 'Objekte liegen über der Domäne'], correct: 1, explanation: 'Der DN beschreibt die Position in der Verzeichnisstruktur. OU und Gruppe sind unterschiedlich, und DC hat je nach Kontext zwei Bedeutungen.' },
    ]),
    explanation('ou-standardcontainer-classic', 'Standard-Container vs. OU', 'classic', [
      { type: 'text', content: 'Nach der Installation von Active Directory gibt es bereits vordefinierte Container wie Users, Computers und Builtin. Diese Standard-Container erfüllen Systemzwecke und eignen sich nicht, um die eigene Unternehmensstruktur sauber abzubilden.' },
      { type: 'diagram', content: ouStandardContainerSvg },
      { type: 'text', content: 'Eine Organisationseinheit ist zwar auch ein containerartiges Objekt, unterscheidet sich aber von diesen Standard-Containern. Für die Strukturierung von Abteilungen oder Standorten legt man eigene OUs an.' },
      { type: 'text', content: 'Ein weiterer praktischer Unterschied ist, dass Gruppenrichtlinien später typischerweise an OUs verknüpft werden können, nicht an die eingebauten Container.' },
      { type: 'question', question: 'Was ist der wichtigste Unterschied zwischen einer eigenen OU und dem Standard-Container Users?', options: ['Users ist für die zentrale Authentifizierung reserviert', 'Eine OU ist ein selbst angelegter organisatorischer Container; Users ist ein vordefinierter Systemcontainer', 'Eine OU darf keine Benutzer enthalten', 'Der Container Users ist eine Sicherheitsgruppe'], correct: 1, explanation: 'Users ist ein Standard-Container, während OUs selbst angelegt und für die Unternehmensstruktur genutzt werden.' },
    ]),
    explanation('ou-management-einstieg-classic', 'OUs praktisch verwalten', 'classic', [
      { type: 'text', content: 'NEXUS wächst: Es gibt jetzt die Abteilungen IT, Personal, Vertrieb und Entwicklung. Bisher liegen viele Benutzer und Computer noch unsortiert in den Standard-Containern. Der nächste Schritt ist, eine saubere OU-Struktur aufzubauen und Objekte richtig zuzuordnen.' },
      { type: 'text', content: 'Für die Verwaltung von Objekten und OUs verwendet man in diesem Szenario Active Directory Users and Computers. Es ist kein pixelgenauer Windows-Desktop, sondern eine didaktisch reduzierte Darstellung der relevanten Controls: Baum, Menü, Kontextmenü und Dialog.' },
      { type: 'question', question: 'Welches Werkzeug dient typischerweise der Verwaltung von Benutzern, Computern und OUs in Active Directory?', options: ['DNS-Manager', 'Group Policy Management', 'Active Directory Users and Computers', 'Lokaler Datei-Explorer'], correct: 2, explanation: 'Active Directory Users and Computers ist das gängige Verwaltungswerkzeug für AD-Objekte und OUs.' },
    ]),
    explanation('ou-erstellen-classic', 'Eine OU anlegen', 'classic', [
      { type: 'text', content: 'Um unter nexus.local die OU Vertrieb anzulegen, wählt man in der Baumansicht die Domäne, öffnet über das Kontextmenü New → Organizational Unit und gibt einen Namen ein. Dabei kann man den Schutz vor versehentlichem Löschen aktivieren.' },
      { type: 'list', title: 'Wichtige Schritte', items: [
        'Richtigen Parent wählen (hier nexus.local)',
        'New → Organizational Unit',
        'Namen vergeben',
        'Schutz vor versehentlichem Löschen aktivieren',
      ] },
      { type: 'text', content: 'Der Schutz ist eine Sicherheitsmaßnahme gegen Bedienfehler: Er verhindert normale versehentliche Löschvorgänge, bis die Schutzoption mit ausreichenden Rechten entfernt wird.' },
      { type: 'question', question: 'Warum ist der Schutz vor versehentlichem Löschen bei einer neuen OU sinnvoll?', options: ['Er verhindert jede Änderung', 'Er schützt vor unbeabsichtigtem Löschen durch Bedienfehler', 'Er erteilt Berechtigungen', 'Er ersetzt ein Backup'], correct: 1, explanation: 'Der Schutz verhindert nicht alle Löschvorgänge, sondern schützt vor normalen versehentlichen Bedienfehlern.' },
    ]),
    explanation('ou-verschieben-classic', 'Objekte zwischen OUs verschieben', 'classic', [
      { type: 'text', content: 'Wenn der Computer SALES-PC01 bisher im Standard-Container Computers liegt, aber zur Vertriebsabteilung gehört, wird er in die OU Vertrieb verschoben. Dabei ändert sich seine Position im Verzeichnisbaum und sein Distinguished Name.' },
      { type: 'diagram', content: ouMoveObjectSvg },
      { type: 'text', content: 'Das Verschieben ist keine Neuanlage: Das Objekt behält seine Identität, aber sein DN enthält danach statt Computers die OU Vertrieb.' },
      { type: 'question', question: 'Ein Benutzer wird von der OU Personal in die OU Vertrieb verschoben. Was ändert sich?', options: ['Der Benutzer bekommt ein neues Objekt', 'Der Distinguished Name spiegelt die neue Position wider', 'Der Benutzer verliert sein Kennwort', 'Die Domäne wird geändert'], correct: 1, explanation: 'Das Objekt bleibt dasselbe; sein DN zeigt die neue Position in der Hierarchie.' },
    ]),
    explanation('ou-design-classic', 'OU-Strukturen planen', 'classic', [
      { type: 'text', content: 'Es gibt keine universelle Regel, dass OUs eins zu eins einem Organigramm folgen müssen. OUs werden nach administrativen Anforderungen geplant; die Organisationsstruktur kann dabei helfen, ist aber nicht der einzige mögliche Entwurfsgrund.' },
      { type: 'text', content: 'OUs können auch verschachtelt werden, etwa nexus.local → Standorte → Berlin → Vertrieb. Dabei sollte die Struktur überschaubar bleiben, besonders auf mobilen Geräten.' },
      { type: 'question', question: 'Was ist ein sinnvoller Grundsatz beim Entwurf von OUs?', options: ['OUs müssen immer exakt dem Organigramm entsprechen', 'OUs werden nach administrativen Anforderungen geplant, nicht nur nach der Hierarchie auf dem Papier', 'Eine OU darf nie weitere OUs enthalten', 'Jede OU erteigt automatisch Berechtigungen'], correct: 1, explanation: 'OUs sind administrative Strukturen; die Organisationsstruktur ist ein Orientierungspunkt, aber nicht zwingend der einzige Maßstab.' },
    ]),
    explanation('ou-neu-zusammenfassung-classic', 'Zusammenfassung OU-Verwaltung', 'classic', [
      { type: 'text', content: 'Eine OU ist ein selbst angelegter organisatorischer Container in einer Domäne. Sie unterscheidet sich von den Standard-Containern Users, Computers und Builtin. OUs werden mit Active Directory Users and Computers angelegt, Objekte werden per Verschieben zugeordnet, und der Schutz vor versehentlichem Löschen verhindert Bedienfehler.' },
      { type: 'question', question: 'Welche Aussage trifft auf OUs und Standard-Container zu?', options: ['OUs und Standard-Container sind identisch', 'Eigene OUs dienen der Strukturierung der Unternehmensorganisation; Standard-Container erfüllen Systemzwecke', 'Standard-Container können durch OUs ersetzt werden', 'OUs sind keine Container'], correct: 1, explanation: 'OUs sind selbst angelegte Struktur-Container; Standard-Container sind vordefiniert und erfüllen spezifische Systemaufgaben.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-hierarchie-ordering',
      type: 'ordering',
      question: 'Bringe die logischen Ebenen von groß nach klein in die richtige Reihenfolge.',
      items: [
        { id: 'domaene', label: 'Domäne' },
        { id: 'ou', label: 'OU' },
        { id: 'objekt', label: 'Objekt' },
      ],
      correctOrder: ['domaene', 'ou', 'objekt'],
      explanation: 'Die korrekte Hierarchie ist Domäne → OU → Objekt.',
    },
    {
      id: 'ad-ou-vs-gruppe-select',
      type: 'select-best',
      question: 'Eine OU soll dazu genutzt werden, allen Mitgliedern einer Abteilung Berechtigungen zu geben. Was ist hierfür typischerweise das passendere Instrument?',
      options: ['Die OU selbst', 'Eine Sicherheitsgruppe', 'Der Distinguished Name', 'Der Domain Controller'],
      correct: 1,
      explanation: 'OUs strukturieren Objekte. Berechtigungen werden typischerweise über Sicherheitsgruppen vergeben.',
    },
    {
      id: 'ad-dn-komponenten-matching',
      type: 'matching',
      question: 'Ordne jede DN-Komponente ihrer Bedeutung zu.',
      pairs: [
        { left: 'CN', right: 'Common Name – Name des Objekts' },
        { left: 'OU', right: 'Organizational Unit – OU in der Struktur' },
        { left: 'DC', right: 'Domain Component – Bestandteil des Domänennamens' },
      ],
      explanation: 'CN steht für das Objekt, OU für die Organisationseinheit, DC für die Domain Component.',
    },
    {
      id: 'ad-dn-interpretieren-select',
      type: 'select-best',
      question: 'Welche Position beschreibt der DN CN=Lisa Meyer,OU=Personal,DC=nexus,DC=local?',
      options: ['Lisa Meyer ist ein Domain Controller', 'Lisa Meyer befindet sich in der OU Personal innerhalb der Domäne nexus.local', 'Lisa Meyer ist eine Domäne', 'nexus.local ist in der OU Personal'],
      correct: 1,
      explanation: 'Der DN liest sich von klein nach groß: Objekt → OU → Domain Components.',
    },
    {
      id: 'ad-ou-vs-standardcontainer-select',
      type: 'select-best',
      question: 'Du möchtest die Benutzer der Abteilung Vertrieb strukturell organisieren und später gezielt verwalten. Was ist am passendsten?',
      options: ['Den Standard-Container Users verwenden', 'Eine OU Vertrieb anlegen', 'Eine neue Domäne erstellen', 'Einen neuen Domain Controller installieren'],
      correct: 1,
      explanation: 'Eine OU ist ein selbst angelegter organisatorischer Container. Users ist ein vordefinierter Standard-Container.',
    },
    {
      id: 'ad-ou-create-guided-ui',
      type: 'guided-ui',
      title: 'OU Vertrieb erstellen',
      question: 'Erstelle unter nexus.local die Organisationseinheit Vertrieb.',
      explanation: 'Im Server Manager öffnet man Active Directory Users and Computers, wählt die Domäne, legt eine neue OU an und aktiviert den Schutz vor versehentlichem Löschen.',
      intro: 'NEXUS braucht eine OU Vertrieb unter nexus.local. Folge dem reduzierten ADUC-Ablauf.',
      steps: [
        {
          id: 'ou-create-server-manager',
          kind: 'navigation',
          screen: { title: 'Server Manager', subtitle: 'Übersicht des Verwaltungsservers' },
          instruction: 'Öffne das Verwaltungswerkzeug für Active-Directory-Objekte.',
          targets: [
            { id: 'dashboard', label: 'Dashboard', description: 'Zeigt nur Zusammenfassungen an' },
            { id: 'local-server', label: 'Local Server' },
            { id: 'all-servers', label: 'All Servers' },
            { id: 'tools', label: 'Tools', description: 'Öffnet die Liste der Verwaltungsprogramme' },
          ],
          correctTarget: 'tools',
          feedbackWrong: 'Das Dashboard zeigt nur Zusammenfassungen. Für Objektverwaltung brauchst du Tools.',
          feedbackCorrect: 'Richtig: Tools öffnet die Verwaltungsprogramme.',
        },
        {
          id: 'ou-create-tools-menu',
          kind: 'navigation',
          screen: { title: 'Tools', subtitle: 'Verfügbare Verwaltungsprogramme' },
          instruction: 'Wähle das richtige Werkzeug für Benutzer, Computer und OUs.',
          targets: [
            { id: 'dns', label: 'DNS', description: 'Verwaltet Namensauflösung' },
            { id: 'group-policy-management', label: 'Group Policy Management', description: 'Konfiguriert Gruppenrichtlinien' },
            { id: 'aduc', label: 'Active Directory Users and Computers', description: 'Verwaltet AD-Objekte und OUs' },
            { id: 'computer-management', label: 'Computer Management', description: 'Lokale Verwaltung eines Rechners' },
          ],
          correctTarget: 'aduc',
          feedbackWrong: 'DNS verwaltet Namensauflösung. Für Benutzer, Computer und OUs brauchst du Active Directory Users and Computers.',
          feedbackCorrect: 'Richtig: Active Directory Users and Computers verwaltet AD-Objekte und OUs.',
        },
        {
          id: 'ou-create-parent',
          kind: 'decision',
          screen: { title: 'Active Directory Users and Computers', subtitle: 'nexus.local' },
          instruction: 'Unter welchem Knoten soll die neue OU angelegt werden?',
          targets: [
            { id: 'builtin', label: 'Builtin' },
            { id: 'computers', label: 'Computers' },
            { id: 'domain-controllers', label: 'Domain Controllers' },
            { id: 'users', label: 'Users' },
            { id: 'nexus-local', label: 'nexus.local' },
          ],
          correctTarget: 'nexus-local',
          feedbackWrong: 'Users ist ein vorhandener Standard-Container. Eine eigene Unternehmens-OU soll direkt unter der Domäne erstellt werden.',
          feedbackCorrect: 'Richtig: Die OU wird direkt unter nexus.local angelegt.',
        },
        {
          id: 'ou-create-context-new',
          kind: 'navigation',
          screen: { title: 'Kontextmenü', subtitle: 'nexus.local' },
          instruction: 'Welche Kontextaktion startet das Anlegen eines neuen Objekts?',
          targets: [
            { id: 'new', label: 'New', description: 'Legt ein neues Objekt an' },
            { id: 'find', label: 'Find', description: 'Sucht nach Objekten' },
            { id: 'properties', label: 'Properties', description: 'Zeigt Eigenschaften an' },
            { id: 'refresh', label: 'Refresh', description: 'Aktualisiert die Ansicht' },
          ],
          correctTarget: 'new',
          feedbackWrong: 'Properties zeigt Eigenschaften; Find sucht; Refresh aktualisiert. Zum Erstellen brauchst du New.',
          feedbackCorrect: 'Richtig: New öffnet das Untermenü zum Anlegen neuer Objekte.',
        },
        {
          id: 'ou-create-object-type',
          kind: 'navigation',
          screen: { title: 'New', subtitle: 'Objekttyp wählen' },
          instruction: 'Welcher Objekttyp entspricht einer Organisationseinheit?',
          targets: [
            { id: 'computer', label: 'Computer' },
            { id: 'group', label: 'Group' },
            { id: 'organizational-unit', label: 'Organizational Unit' },
            { id: 'user', label: 'User' },
          ],
          correctTarget: 'organizational-unit',
          feedbackWrong: 'Computer, Group und User sind Objekttypen, aber keine OU.',
          feedbackCorrect: 'Richtig: Für eine Organisationseinheit wählst du Organizational Unit.',
        },
        {
          id: 'ou-create-name',
          kind: 'decision',
          screen: { title: 'Neue OU', subtitle: 'Name eingeben' },
          instruction: 'Vergib den Namen für die neue OU.',
          targets: [
            { id: 'vertrieb', label: 'Vertrieb' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'it', label: 'IT' },
            { id: 'personal', label: 'Personal' },
          ],
          correctTarget: 'vertrieb',
          feedbackWrong: 'Der Auftrag lautet, eine OU für die Vertriebsabteilung anzulegen.',
          feedbackCorrect: 'Richtig: Der Name Vertrieb passt zur Abteilung.',
        },
        {
          id: 'ou-create-protection',
          kind: 'decision',
          screen: { title: 'Neue OU', subtitle: 'Schutzoption' },
          instruction: 'Soll der Schutz vor versehentlichem Löschen aktiviert bleiben?',
          targets: [
            { id: 'protect-active', label: 'Schutz aktiviert', description: 'Verhindert normale versehentliche Löschvorgänge' },
            { id: 'protect-inactive', label: 'Schutz deaktiviert', description: 'Erhöht das Risiko eines Bedienfehlers' },
          ],
          correctTarget: 'protect-active',
          feedbackWrong: 'Bei einer produktiven OU ist der Schutz vor versehentlichem Löschen die sicherere Standardeinstellung.',
          feedbackCorrect: 'Richtig: Der Schutz verhindert normale versehentliche Löschvorgänge. Die OU Vertrieb wird unter nexus.local angelegt.',
        },
      ],
    },
    {
      id: 'ad-ou-move-object-guided-ui',
      type: 'guided-ui',
      title: 'SALES-PC01 der OU Vertrieb zuordnen',
      question: 'Der Computer SALES-PC01 liegt im Standard-Container Computers. Ordne ihn der OU Vertrieb zu.',
      explanation: 'Objekte werden per Rechtsklick → Verschieben in die gewünschte OU verschoben. Dabei ändert sich ihre Position im Verzeichnisbaum und ihr Distinguished Name.',
      intro: 'SALES-PC01 gehört zur Vertriebsabteilung. Verschiebe ihn in die passende OU.',
      steps: [
        {
          id: 'ou-move-select-object',
          kind: 'decision',
          screen: { title: 'Active Directory Users and Computers', subtitle: 'Objekt wählen' },
          instruction: 'Welches Objekt soll verschoben werden?',
          targets: [
            { id: 'it-pc', label: 'IT-PC01' },
            { id: 'finance-pc', label: 'FINANCE-PC01' },
            { id: 'sales-pc', label: 'SALES-PC01' },
            { id: 'dev-pc', label: 'DEV-PC02' },
          ],
          correctTarget: 'sales-pc',
          feedbackWrong: 'Der Auftrag bezieht sich auf den SALES-PC01.',
          feedbackCorrect: 'Richtig: SALES-PC01 soll verschoben werden.',
        },
        {
          id: 'ou-move-context-action',
          kind: 'navigation',
          screen: { title: 'Kontextmenü', subtitle: 'Aktion wählen' },
          instruction: 'Welche Kontextaktion startet das Verschieben?',
          targets: [
            { id: 'delete', label: 'Löschen', description: 'Entfernt das Objekt' },
            { id: 'properties', label: 'Eigenschaften', description: 'Zeigt Details an' },
            { id: 'move', label: 'Verschieben', description: 'Ändert die Position im Verzeichnisbaum' },
            { id: 'disable', label: 'Deaktivieren', description: 'Sperrt das Konto' },
          ],
          correctTarget: 'move',
          feedbackWrong: 'Löschen entfernt das Objekt; Eigenschaften zeigt nur Details. Zum Umsortieren nutzt man Verschieben.',
          feedbackCorrect: 'Richtig: Verschieben öffnet die Zielauswahl.',
        },
        {
          id: 'ou-move-target',
          kind: 'decision',
          screen: { title: 'Ziel-OU wählen', subtitle: 'nexus.local' },
          instruction: 'Wähle die Ziel-OU für SALES-PC01.',
          targets: [
            { id: 'it', label: 'OU IT' },
            { id: 'personal', label: 'OU Personal' },
            { id: 'vertrieb', label: 'OU Vertrieb' },
            { id: 'entwicklung', label: 'OU Entwicklung' },
            { id: 'computers', label: 'Computers', description: 'Standard-Container, keine OU' },
          ],
          correctTarget: 'vertrieb',
          feedbackWrong: 'Der Computer gehört laut Auftrag zur Vertriebsabteilung. Der Standard-Container Computers ist keine Ziel-OU.',
          feedbackCorrect: 'Richtig: SALES-PC01 wird in die OU Vertrieb verschoben.',
        },
        {
          id: 'ou-move-confirm',
          kind: 'navigation',
          screen: { title: 'Verschieben bestätigen', subtitle: 'Aktion abschließen' },
          instruction: 'Bestätige die Verschiebung.',
          targets: [
            { id: 'cancel', label: 'Abbrechen', description: 'Aktion wird nicht ausgeführt' },
            { id: 'confirm', label: 'Bestätigen', description: 'Objekt wird verschoben' },
          ],
          correctTarget: 'confirm',
          feedbackWrong: 'Mit Abbrechen wird die Aktion nicht ausgeführt.',
          feedbackCorrect: 'SALES-PC01 ist jetzt in der OU Vertrieb. Seine Position im Verzeichnisbaum und der Distinguished Name haben sich geändert.',
        },
      ],
    },
    {
      id: 'ad-ou-structure-matching',
      type: 'matching',
      question: 'Ordne die Mitarbeiter und Computer der passenden OU zu.',
      pairs: [
        { left: 'Anna', right: 'Personal' },
        { left: 'Max', right: 'Vertrieb' },
        { left: 'IT-PC01', right: 'IT' },
        { left: 'DEV-PC02', right: 'Entwicklung' },
      ],
      explanation: 'Objekte werden nach Abteilung oder Verwendungszweck in die passende OU einsortiert.',
    },
  ];

  const quiz = [
    { question: 'Wozu dient eine OU?', options: ['Zur Vergabe aller Berechtigungen', 'Zur organisatorischen Gruppierung von Objekten in einer Domäne', 'Zum Ersetzen einer Domäne', 'Zur physischen Verkabelung'], correct: 1, explanation: 'Eine OU gruppiert Objekte organisatorisch.' },
    { question: 'Was ist der Hauptunterschied zwischen OU und Gruppe?', options: ['Keiner', 'OU strukturiert, Gruppe steuert Berechtigungen/Mitgliedschaften', 'OU erteilt Berechtigungen, Gruppe strukturiert', 'Gruppen können keine Benutzer enthalten'], correct: 1, explanation: 'OUs dienen der Struktur, Gruppen der Berechtigungslogik.' },
    { question: 'Welche Hierarchie ist korrekt?', options: ['Objekt → Domäne → OU', 'Domäne → OU → Objekt', 'OU → Objekt → Domäne', 'Domäne → Objekt → OU'], correct: 1, explanation: 'Domäne ist die oberste Ebene, gefolgt von OU, gefolgt vom Objekt.' },
    { question: 'Was beschreibt ein Distinguished Name?', options: ['Den physischen Server', 'Die Position eines Objekts in der Verzeichnisstruktur', 'Eine Sicherheitsgruppe', 'Ein Betriebssystem'], correct: 1, explanation: 'Der DN zeigt die eindeutige Position in der Hierarchie.' },
    { question: 'Was bedeutet DC im DN CN=Max,OU=IT,DC=nexus,DC=local?', options: ['Domain Controller als Server', 'Domain Component als Bestandteil der Domäne', 'Data Center', 'Disk Controller'], correct: 1, explanation: 'Im DN steht DC für Domain Component.' },
    { question: 'Wie lautet der Objektname im DN CN=Lisa Meyer,OU=Personal,DC=nexus,DC=local?', options: ['Personal', 'nexus.local', 'Lisa Meyer', 'OU=Personal'], correct: 2, explanation: 'CN steht für Common Name und benennt das Objekt selbst.' },
    { question: 'Warum ist eine OU keine Sicherheitsgruppe?', options: ['Weil sie keine Objekte enthalten darf', 'Weil ihre primäre Aufgabe die Strukturierung ist, nicht die Berechtigungsvergabe', 'Weil sie größer als eine Domäne ist', 'Weil sie nur Computer enthalten darf'], correct: 1, explanation: 'OUs strukturieren. Berechtigungen werden über Gruppen vergeben.' },
    { question: 'Warum sollte man eigene OUs statt des Standard-Containers Users verwenden?', options: ['Weil Users keine Objekte enthalten darf', 'Weil eigene OUs die Unternehmensstruktur abbilden und später gezielt administriert werden können', 'Weil OUs automatisch Berechtigungen vergeben', 'Weil der Container Users kein AD-Objekt ist'], correct: 1, explanation: 'Users ist ein Standard-Container; eigene OUs dienen der strukturierten Verwaltung.' },
  ];

  const summary = [
    'Eine OU organisiert Objekte innerhalb einer Domäne.',
    'OUs spiegeln oft Abteilungen oder Standorte wider.',
    'OUs sind keine Sicherheitsgruppen.',
    'OUs unterscheiden sich von Standard-Containern wie Users oder Computers.',
    'OUs werden mit Active Directory Users and Computers verwaltet.',
    'Objekte werden zwischen OUs verschoben; ihr Distinguished Name ändert sich.',
    'Der Schutz vor versehentlichem Löschen schützt vor Bedienfehlern.',
    'Die Hierarchie lautet Domäne → OU → Objekt.',
    'Ein Distinguished Name beschreibt die Position eines Objekts.',
    'DC im DN bedeutet Domain Component, als Serverrolle Domain Controller.',
  ];

  return { title: 'Organisationseinheiten verwalten', explanations, exercises, quiz, summary };
}

// =============================================================================
// Domain Controller lesson
// =============================================================================
function buildDomainControllerLesson() {
  const explanations = [
    explanation('dc-einstieg-classic', 'Wer stellt AD bereit?', 'classic', [
      { type: 'text', content: 'Die Domäne, die OUs und die Objekte in NEXUS müssen irgendwo verwaltet werden. Ein Benutzer muss sich anmelden können, ein Computer muss seine Identität bestätigen, und Verzeichnisabfragen müssen beantwortet werden. Diese Aufgaben übernimmt der Domain Controller.' },
      { type: 'question', question: 'Welche Rolle stellt Active Directory Domain Services in einer Domäne bereit?', options: ['Der Client-PC', 'Der Domain Controller', 'Der DNS-Root-Server im Internet', 'Der Router'], correct: 1, explanation: 'Der Domain Controller hostet AD DS und stellt Verzeichnisdienste bereit.' },
    ]),
    explanation('dc-einstieg-intuitive', 'Das Bürgeramt der Domäne', 'intuitive', [
      { type: 'text', content: 'Stell dir die Domäne als Stadt vor. Damit die Stadt funktioniert, braucht sie ein Bürgeramt, das weiß, wer wohnt, wo er wohnt und wer welche Berechtigungen hat. Der Domain Controller ist dieses Bürgeramt: Er führt die zentrale Datenbank und bestätigt die Identität der Einwohner.' },
      { type: 'text', content: 'Größere Städte haben mehrere Bürgerämter, damit Ausfälle und lange Wege kein Problem sind. Ebenso kann eine Domäne mehrere Domain Controller haben.' },
    ]),
    explanation('dc-definition-classic', 'Was macht ein Domain Controller?', 'classic', [
      { type: 'text', content: 'Ein Domain Controller (DC) ist ein Server, auf dem Active Directory Domain Services (AD DS) installiert ist. Er hält eine Kopie der AD-Verzeichnisdatenbank und stellt zentrale Dienste bereit.' },
      { type: 'diagram', content: dcAsServerSvg },
      { type: 'list', title: 'Aufgaben eines Domain Controllers', items: [
        'Hosten von AD DS',
        'Halten einer Kopie der Verzeichnisdatenbank',
        'Verarbeiten von Verzeichnisanfragen',
        'Unterstützen der Authentifizierung',
        'Bereitstellen zentraler AD-Dienste',
      ] },
      { type: 'text', content: 'Wichtig: Der DC ist ein Server, der AD DS bereitstellt. Er ist nicht die Domäne selbst und auch nicht einzelne darin enthaltene Objekte.' },
      { type: 'question', question: 'Was ist ein Domain Controller?', options: ['Die gesamte Domäne', 'Ein Server, der AD DS hostet und Verzeichnisdienste bereitstellt', 'Eine OU innerhalb der Domäne', 'Ein spezieller Client-PC'], correct: 1, explanation: 'Ein DC ist ein Server, der AD DS hostet und Authentifizierung sowie Verzeichnisdienste bereitstellt.' },
    ]),
    explanation('dc-mehrere-classic', 'Mehrere Domain Controller', 'classic', [
      { type: 'text', content: 'In einer Domäne können mehrere Domain Controller betrieben werden. Das erhöht Verfügbarkeit und Redundanz. Die Verzeichnisdaten werden zwischen den DCs abgeglichen, damit alle dieselben Informationen sehen.' },
      { type: 'diagram', content: dcRedundancySvg },
      { type: 'text', content: 'Der genaue Replikationsmechanismus und spezielle spätere Rollen gehören zu anderen Themen. Hier reicht das Verständnis: Mehrere DCs sind möglich und sinnvoll.' },
      { type: 'question', question: 'Warum kann eine Domäne mehrere Domain Controller haben?', options: ['Um Redundanz und Verfügbarkeit zu erhöhen', 'Um mehrere Domänen zu ersetzen', 'Weil jeder DC eine eigene Domäne braucht', 'Damit keine OUs mehr nötig sind'], correct: 0, explanation: 'Mehrere DCs erhöhen Verfügbarkeit und Redundanz innerhalb derselben Domäne.' },
    ]),
    explanation('dc-physisch-logisch-classic', 'Physisch vs. logisch am DC', 'classic', [
      { type: 'text', content: 'Ein Domain Controller ist physisch oder virtuell ein Server. Die Domäne, die OUs und die Objekte sind logische Strukturen, die dieser Server bereitstellt. Domäne und DC gehören zusammen, sind aber nicht identisch.' },
      { type: 'question', question: 'Welche Aussage trifft zu?', options: ['Eine Domäne ist ein Server', 'Ein Domain Controller ist ein Server, der logische AD-Strukturen bereitstellt', 'Eine OU ist ein physischer Server', 'Objekte sind physische Server'], correct: 1, explanation: 'Der DC ist der Server, Domäne, OU und Objekte sind logische Strukturen.' },
    ]),
    explanation('dc-vs-domain-component-classic', 'DC = Domain Controller oder Domain Component?', 'classic', [
      { type: 'text', content: 'Das Kürzel DC hat in Active Directory zwei Bedeutungen, die im Kontext klar unterschieden werden müssen: DC als Serverrolle bedeutet Domain Controller. DC im Distinguished Name bedeutet Domain Component.' },
      { type: 'list', title: 'Unterscheidung', items: [
        'DC01 oder „der DC“ → Domain Controller (Serverrolle)',
        'DC=nexus,DC=local → Domain Component (Bestandteil des DN)',
      ] },
      { type: 'question', question: 'Was bedeutet DC in „DC=nexus,DC=local“?', options: ['Domain Controller', 'Domain Component', 'Data Center', 'Direct Connect'], correct: 1, explanation: 'Im Distinguished Name steht DC für Domain Component.' },
    ]),
    explanation('dc-zusammenfassung-classic', 'Zusammenfassung Domain Controller', 'classic', [
      { type: 'text', content: 'Ein Domain Controller ist ein Server, der AD DS hostet, Verzeichnisdaten hält und Authentifizierung ermöglicht. Mehrere DCs in einer Domäne erhöhen Verfügbarkeit. DC bedeutet als Serverrolle Domain Controller, im DN Domain Component.' },
      { type: 'question', question: 'Welche Aussage ist richtig?', options: ['Ein DC ist die Domäne', 'Ein DC ist ein Server, der AD DS bereitstellt; DC im DN heißt Domain Component', 'Ein DC ist eine OU', 'Ein DC ist ein Client'], correct: 1, explanation: 'Der Domain Controller ist die Serverrolle, im DN bedeutet DC etwas anderes.' },
    ]),
    explanation('fsmo-einstieg-classic', 'NEXUS bekommt einen zweiten DC', 'classic', [
      { type: 'text', content: 'NEXUS hat nun zwei Domain Controller: DC01 und DC02. Beide können Verzeichnisdaten halten, Benutzer authentifizieren und Änderungen verarbeiten. Mehrere DCs erhöhen Verfügbarkeit – aber jetzt entstehen spezielle Probleme: neue Sicherheitskennungen müssen eindeutig bleiben, ein soeben geändertes Passwort muss überall akzeptiert werden, und die Domänenzeit braucht eine verlässliche Hierarchie.' },
      { type: 'question', question: 'Wenn mehrere DCs gleichzeitig arbeiten: Was fehlt dann trotzdem manchmal?', options: ['Ein eindeutig zuständiger DC für bestimmte Aufgaben', 'Schnellere CPU auf jedem DC', 'Mehr Festplattenplatz', 'Zusätzliche Domänen'], correct: 0, explanation: 'Bei einigen kritischen Aufgaben braucht AD eine eindeutige Zuständigkeit, damit Konflikte vermieden werden.' },
    ]),
    explanation('fsmo-einstieg-intuitive', 'Viele Kassen, aber ein Hauptbuch', 'intuitive', [
      { type: 'text', content: 'Stell dir ein Restaurant vor, das an zwei Kassen gleichzeitig verkauft. Beide Kassen buchen Umsatz und drucken Quittungen. Das funktioniert, weil die meisten Abläufe unabhängig sind. Aber wenn es um fortlaufende Rechnungsnummern oder die zentrale Tagesabrechnung geht, braucht es einen eindeutigen Zuständigen.' },
      { type: 'text', content: 'Active Directory arbeitet grundsätzlich verteilt über mehrere DCs. FSMO-Rollen sind gezielte Ausnahmen: Sie vergeben Aufgaben, bei denen eine eindeutige Instanz sinnvoll ist.' },
    ]),
    explanation('fsmo-ueberblick-classic', 'FSMO: Flexible Single Master Operations', 'classic', [
      { type: 'text', content: 'AD DS verwendet normalerweise Multi-Master-Replikation: Viele Änderungen können auf jedem DC durchgeführt und später abgeglichen werden. FSMO-Rollen sind Ausnahmen für Aufgaben, bei denen ein eindeutiger Rolleninhaber Konflikte verhindert.' },
      { type: 'list', title: 'Fünf FSMO-Rollen', items: [
        'Forest-weit: Schema Master, Domain Naming Master',
        'Domänen-weit: RID Master, PDC Emulator, Infrastructure Master',
      ] },
      { type: 'diagram', content: fsmoOverviewSvg },
      { type: 'question', question: 'Was ist die Grundidee von FSMO-Rollen?', options: ['Alle DCs dürfen nur lesen', 'Bestimmte Aufgaben haben einen eindeutigen Zuständigen', 'FSMO ersetzt die Multi-Master-Replikation vollständig', 'Jeder DC muss jede Rolle halten'], correct: 1, explanation: 'FSMO-Rollen sind Ausnahmen von der verteilten Multi-Master-Replikation, nicht deren Ersatz.' },
    ]),
    explanation('rid-master-classic', 'RID Master: Eindeutige Sicherheitskennungen', 'classic', [
      { type: 'text', content: 'Sicherheitsprinzipale in AD erhalten eine SID. Sie setzt sich vereinfacht aus einem domänenspezifischen Anteil und einem Relativen Identifikator (RID) zusammen. Damit zwei DCs nicht versehentlich denselben RID vergeben, verteilt der RID Master RID-Bereiche an die DCs.' },
      { type: 'diagram', content: ridPoolSvg },
      { type: 'text', content: 'Jeder DC verwendet RIDs aus seinem Pool, um eindeutige SIDs für neue Objekte zu erzeugen. Wenn der Pool knapp wird, fordert er einen neuen Bereich beim RID Master an.' },
      { type: 'question', question: 'Welche FSMO-Rolle stellt sicher, dass neue Objekte in der Domäne eindeutige RIDs erhalten?', options: ['PDC Emulator', 'Infrastructure Master', 'RID Master', 'Schema Master'], correct: 2, explanation: 'Der RID Master verteilt RID-Bereiche an DCs, damit jede Objekt-SID eindeutig bleibt.' },
    ]),
    explanation('pdc-emulator-classic', 'PDC Emulator: Koordinationsaufgaben', 'classic', [
      { type: 'text', content: 'Der PDC Emulator ist eine domänen-weite FSMO-Rolle mit mehreren besonderen Aufgaben. Er ist wichtig für kürzlich geänderte Kennwörter, die Zeit-Hierarchie in der Domäne und bestimmte administrative Vorgänge.' },
      { type: 'diagram', content: pdcSvg },
      { type: 'list', title: 'Wichtige Aufgaben des PDC Emulator', items: [
        'Kennwortänderungen werden bevorzugt/schnell zum PDC repliziert; er kann bei Anmeldeproblemen nach einer frischen Änderung helfen.',
        'Er spielt in der Domänenzeit-Hierarchie eine zentrale Rolle; große Zeitabweichungen können Kerberos-Authentifizierung verhindern.',
        'Bestimmte Verwaltungstools verwenden den PDC bevorzugt, um Konflikte zu reduzieren.',
      ] },
      { type: 'question', question: 'Welche FSMO-Rolle ist besonders relevant, wenn ein Benutzer sein Passwort kurz vor der Anmeldung an einem anderen DC geändert hat?', options: ['RID Master', 'Infrastructure Master', 'PDC Emulator', 'Schema Master'], correct: 2, explanation: 'Der PDC Emulator ist für kürzliche Kennwortänderungen und Zeit-Hierarchie besonders wichtig.' },
    ]),
    explanation('infrastructure-master-classic', 'Infrastructure Master: Domänenübergreifende Referenzen', 'classic', [
      { type: 'text', content: 'Der Infrastructure Master ist in einer Domäne zuständig für Referenzen auf Objekte anderer Domänen. Wenn sich ein referenziertes Objekt in einer anderen Domäne ändert, hilft der Infrastructure Master, diese Referenz aktuell zu halten.' },
      { type: 'diagram', content: infrastructureSvg },
      { type: 'text', content: 'In einer Single-Domain-Umgebung hat diese Rolle wenig domänenübergreifende Arbeit. In Multi-Domain-Umgebungen wird sie relevant.' },
      { type: 'question', question: 'Wann ist der Infrastructure Master besonders wichtig?', options: ['Bei der Vergabe von RID-Bereichen', 'Wenn Objekte einer Domäne von Gruppen oder OUs einer anderen Domäne referenziert werden', 'Wenn die Domänenzeit synchronisiert werden muss', 'Wenn das AD-Schema erweitert wird'], correct: 1, explanation: 'Der Infrastructure Master hält domänenübergreifende Referenzen aktuell.' },
    ]),
    explanation('forest-roles-classic', 'Forest-weite FSMO-Rollen', 'classic', [
      { type: 'text', content: 'Neben den drei domänen-weiten FSMO-Rollen gibt es zwei forest-weite Rollen. Eine Gesamtstruktur kann eine oder mehrere Domänen enthalten.' },
      { type: 'list', title: 'Forest-weite Rollen', items: [
        'Schema Master – kontrolliert Schemaänderungen für den gesamten Forest.',
        'Domain Naming Master – besondere Verantwortung beim Hinzufügen oder Entfernen von Domänen im Forest.',
      ] },
      { type: 'text', content: 'Für diesen Block genügt der Überblick; Details zum Schema-Editor oder zur Domain-Naming-Prozedur folgen später.' },
      { type: 'question', question: 'Welche FSMO-Rollen gelten für den gesamten Forest?', options: ['RID Master und PDC Emulator', 'Schema Master und Domain Naming Master', 'Infrastructure Master und RID Master', 'PDC Emulator und Infrastructure Master'], correct: 1, explanation: 'Schema Master und Domain Naming Master sind forest-weit; die anderen drei sind domänen-weit.' },
    ]),
    explanation('global-catalog-classic', 'Global Catalog: Forestweite Suche', 'classic', [
      { type: 'text', content: 'Ein Global Catalog ist kein einzelner zentraler Server für den gesamten Forest. Ein oder mehrere Domain Controller können die Global-Catalog-Funktion bereitstellen. Sie halten ihre eigene Domäne vollständig und andere Domänen als Partial Attribute Set.' },
      { type: 'diagram', content: globalCatalogSvg },
      { type: 'list', title: 'Wichtige GC-Funktionen', items: [
        'Forestweite Suche nach Objekten, ohne jede Domäne vollständig abfragen zu müssen.',
        'Unterstützung bestimmter Anmeldeszenarien.',
        'Kein Backup-Server, sondern gezielter Verzeichnisschnittstelle für Suche und Anmeldekontext.',
      ] },
      { type: 'text', content: 'Der Global Catalog ist keine FSMO-Rolle. Ein DC kann FSMO-Rollen halten, GC sein, beides oder keines von beidem.' },
      { type: 'question', question: 'Was enthält ein Global Catalog?', options: ['Nur Objekte der eigenen Domäne', 'Alle Objekte aller Domänen vollständig', 'Eigene Domäne vollständig und andere Domänen als Partial Attribute Set', 'Nichts, er ist nur ein Backup'], correct: 2, explanation: 'Ein GC hält die eigene Domäne vollständig und andere Domänen als Teilattribute.' },
    ]),
    explanation('global-catalog-intuitive', 'Das Branchenverzeichnis', 'intuitive', [
      { type: 'text', content: 'Stell dir einen Konzern mit mehreren Standorten. Jede Niederlassung hat ein eigenes, vollständiges Mitarbeiterverzeichnis. Damit man aber firmenweit nach einer Person suchen kann, ohne in jedem Standort extra nachzuschauen, gibt es ein zentrales Branchenverzeichnis mit den wichtigsten Daten aller Standorte.' },
      { type: 'text', content: 'Der Global Catalog funktioniert ähnlich: Er speichert für den eigenen Standort alles und für andere Standorte ausgewählte Daten, damit forestweite Suchen schnell gehen.' },
    ]),
    explanation('fsmo-gc-zusammenfassung-classic', 'FSMO und Global Catalog im Vergleich', 'classic', [
      { type: 'text', content: 'AD arbeitet grundsätzlich verteilt über mehrere DCs. FSMO-Rollen sind gezielte Ausnahmen mit eindeutigem Rolleninhaber für bestimmte Aufgaben. Der Global Catalog ist dagegen keine FSMO-Rolle, sondern eine Funktion auf einem DC, die forestweite Suche und Anmeldeszenarien ermöglicht.' },
      { type: 'list', title: 'Wichtige Unterscheidungen', items: [
        'FSMO = eindeutige Rolleninhaber für spezielle Aufgaben.',
        'GC = Dienst auf einem DC für forestweite Verzeichnisinformationen.',
        'Ein DC kann FSMO-Rollen halten, GC sein oder beides.',
      ] },
      { type: 'question', question: 'Welche Aussage trifft zu?', options: ['Global Catalog ist eine FSMO-Rolle', 'FSMO-Rollen ersetzen die Multi-Master-Replikation vollständig', 'Global Catalog ist ein Dienst auf einem DC, FSMO sind besondere Rollen', 'Es gibt genau einen GC pro Forest'], correct: 2, explanation: 'FSMO-Rollen und Global Catalog sind unterschiedliche Konzepte: FSMO = Rollen, GC = Dienst.' },
    ]),
  ];

  const exercises = [
    {
      id: 'ad-dc-rolle-select',
      type: 'select-best',
      question: 'Was ist die Hauptaufgabe eines Domain Controllers?',
      options: ['Er ersetzt die Domäne', 'Er hostet AD DS und stellt Verzeichnisdienste bereit', 'Er verwaltet nur lokale Benutzer', 'Er ist ein Client-Betriebssystem'],
      correct: 1,
      explanation: 'Ein DC hostet AD DS, hält Verzeichnisdaten und ermöglicht Authentifizierung.',
    },
    {
      id: 'ad-mehrere-dcs-select',
      type: 'select-best',
      question: 'Warum kann eine Domäne mehrere Domain Controller haben?',
      options: ['Weil jeder DC eine eigene Domäne braucht', 'Um Redundanz und Verfügbarkeit zu erhöhen', 'Damit keine OUs mehr benötigt werden', 'Weil DNS sonst nicht funktioniert'],
      correct: 1,
      explanation: 'Mehrere DCs innerhalb derselben Domäne erhöhen Verfügbarkeit und Redundanz.',
    },
    {
      id: 'ad-dc-vs-domain-select',
      type: 'select-best',
      question: 'Was ist der Unterschied zwischen Domäne und Domain Controller?',
      options: ['Beides ist dasselbe', 'Domäne ist logisch, DC ist ein Server mit AD DS', 'DC ist logisch, Domäne ist physisch', 'Eine Domäne ist ein spezieller DC'],
      correct: 1,
      explanation: 'Domäne = logischer Verwaltungsraum. DC = Server, der AD DS bereitstellt.',
    },
    {
      id: 'ad-dc-komponente-select',
      type: 'select-best',
      question: 'Was bedeutet DC im Distinguished Name CN=Server,OU=IT,DC=nexus,DC=local?',
      options: ['Domain Controller', 'Domain Component', 'Data Center', 'Direct Connect'],
      correct: 1,
      explanation: 'Im DN steht DC für Domain Component, also einen Bestandteil des Domänennamens.',
    },
    {
      id: 'ad-dc-terms-matching',
      type: 'matching',
      question: 'Ordne jeden Begriff der passenden Beschreibung zu.',
      pairs: [
        { left: 'Domäne', right: 'logischer Verwaltungs- und Namensraum' },
        { left: 'Domain Controller', right: 'Server, der AD DS bereitstellt' },
        { left: 'OU', right: 'organisatorische Einheit innerhalb einer Domäne' },
        { left: 'Objekt', right: 'verwaltete Einheit wie Benutzer oder Computer' },
      ],
      explanation: 'Domäne, OU und Objekt sind logische Strukturen. Der Domain Controller ist der Server, der AD DS bereitstellt.',
    },
    {
      id: 'ad-fsmo-scope-matching',
      type: 'matching',
      question: 'Ordne die FSMO-Rolle dem passenden Geltungsbereich zu.',
      pairs: [
        { left: 'Schema Master', right: 'gilt für den gesamten Forest' },
        { left: 'Domain Naming Master', right: 'gilt für den gesamten Forest' },
        { left: 'RID Master', right: 'gilt pro Domäne' },
        { left: 'PDC Emulator', right: 'gilt pro Domäne' },
        { left: 'Infrastructure Master', right: 'gilt pro Domäne' },
      ],
      explanation: 'Schema Master und Domain Naming Master sind forest-weit; RID Master, PDC Emulator und Infrastructure Master sind domänen-weit.',
    },
    {
      id: 'ad-fsmo-szenarien-matching',
      type: 'matching',
      question: 'Ordne jedem Szenario die passende domänen-weite FSMO-Rolle zu.',
      pairs: [
        { left: 'DC02 braucht neue RIDs', right: 'RID Master' },
        { left: 'Passwort gerade geändert, andere DC kennt es noch nicht', right: 'PDC Emulator' },
        { left: 'Objekt aus anderer Domäne wird umbenannt', right: 'Infrastructure Master' },
      ],
      explanation: 'RID Master verteilt RIDs, PDC Emulator ist für Passwort-/Zeit-/Koordinationskontext wichtig, Infrastructure Master hält domänenübergreifende Referenzen aktuell.',
    },
    {
      id: 'ad-gc-select',
      type: 'select-best',
      question: 'Welche Aufgabe erfüllt ein Global Catalog?',
      options: ['Er ersetzt den PDC Emulator', 'Er ermöglicht forestweite Suche und bereitstellt Teildaten anderer Domänen', 'Er ist die einzige Quelle für FSMO-Rollen', 'Er dient ausschließlich als Backup aller DCs'],
      correct: 1,
      explanation: 'Ein Global Catalog enthält die eigene Domäne vollständig und andere Domänen als Partial Attribute Set, um forestweite Suchen und bestimmte Anmeldungen zu ermöglichen.',
    },
  ];

  const quiz = [
    { question: 'Was ist ein Domain Controller?', options: ['Eine OU', 'Ein Server, der AD DS hostet', 'Eine Domäne', 'Ein Client'], correct: 1, explanation: 'Ein DC ist ein Server mit AD DS.' },
    { question: 'Welche Aufgabe hat ein DC?', options: ['Er ersetzt DNS', 'Er stellt Verzeichnisdienste und Authentifizierung bereit', 'Er verwaltet nur lokale Profile', 'Er ist ein Druckserver'], correct: 1, explanation: 'Der DC stellt AD-Dienste und Authentifizierung bereit.' },
    { question: 'Warum kann eine Domäne mehrere DCs haben?', options: ['Damit jeder DC eine eigene Domäne bildet', 'Für Redundanz und Verfügbarkeit', 'Damit keine OUs mehr nötig sind', 'Weil sonst keine Benutzer angelegt werden können'], correct: 1, explanation: 'Mehrere DCs erhöhen Verfügbarkeit und Redundanz.' },
    { question: 'Welche Aussage zu Domäne und DC ist richtig?', options: ['Domäne und DC sind identisch', 'Domäne ist logisch, DC ist ein physischer/virtueller Server', 'Eine Domäne ist ein physischer Server', 'Ein DC ist logisch, die Domäne physisch'], correct: 1, explanation: 'Domäne = logisch, DC = Server, der AD DS bereitstellt.' },
    { question: 'Was bedeutet DC im DN?', options: ['Domain Controller', 'Domain Component', 'Data Center', 'Direct Connect'], correct: 1, explanation: 'Im DN bedeutet DC Domain Component.' },
    { question: 'Wofür steht DC als Serverrolle?', options: ['Domain Component', 'Domain Controller', 'Data Center', 'Direct Connect'], correct: 1, explanation: 'Als Serverrolle ist DC der Domain Controller.' },
    { question: 'Was ist die Hauptaufgabe des RID Master?', options: ['Zeit-Synchronisation', 'Vergabe von RID-Bereichen an DCs', 'Verwaltung von Gruppenrichtlinien', 'Forestweite Suche'], correct: 1, explanation: 'Der RID Master verteilt RIDs, damit jede Objekt-SID eindeutig bleibt.' },
    { question: 'Welche Aussage zu Global Catalog ist richtig?', options: ['Er ist eine FSMO-Rolle', 'Er enthält die eigene Domäne vollständig und andere Domänen als Partial Attribute Set', 'Er ist ein zentraler Backup-Server für alle DCs', 'Es gibt maximal einen GC pro Forest'], correct: 1, explanation: 'Ein GC ist keine FSMO-Rolle. Er stellt vollständige Daten der eigenen und Teildaten anderer Domänen bereit.' },
  ];

  const summary = [
    'Ein Domain Controller hostet AD DS.',
    'Eine Domäne kann mehrere DCs für Redundanz haben.',
    'AD arbeitet grundsätzlich Multi-Master; FSMO-Rollen sind gezielte Ausnahmen.',
    'Forest-weit: Schema Master, Domain Naming Master.',
    'Domänen-weit: RID Master, PDC Emulator, Infrastructure Master.',
    'Global Catalog ist keine FSMO-Rolle, sondern ein Dienst für forestweite Verzeichnisinformationen.',
    'DC als Serverrolle ≠ DC im Distinguished Name.',
  ];

  return { title: 'Domain Controller, FSMO & Global Catalog', explanations, exercises, quiz, summary };
}

export function buildAdDomainLesson() { return buildDomainLesson(); }
export function buildAdOrganizationalUnitsLesson() { return buildOrganizationalUnitsLesson(); }
export function buildAdDomainControllerLesson() { return buildDomainControllerLesson(); }
