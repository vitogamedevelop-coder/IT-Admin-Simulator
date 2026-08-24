import { topicKey } from '../academyTopics.js';

// =============================================================================
// Active Directory Foundation – academy lesson
// =============================================================================

export const AD_FOUNDATION_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-foundation');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

function buildExplanations() {
  const exps = [];

  exps.push(explanation('verzeichnisdienst-classic', 'Verzeichnisdienste', 'classic', [
    { type: 'text', content: 'Ein Verzeichnisdienst verwaltet Netzwerkobjekte und ihre Eigenschaften zentral. Statt an jedem einzelnen Rechner lokal zu hinterlegen, gibt es eine zentrale Datenbank.' },
    { type: 'list', title: 'Typische Verzeichnisobjekte', items: [
      'Benutzer',
      'Computer',
      'Gruppen',
      'Drucker',
      'Organisationseinheiten',
    ] },
    { type: 'list', title: 'Typische Attribute', items: [
      'Name',
      'E-Mail-Adresse',
      'Abteilung',
      'Telefonnummer',
    ] },
  ]));

  exps.push(explanation('verzeichnisdienst-intuitive', 'Verzeichnisdienste', 'intuitive', [
    { type: 'text', content: 'Stell dir ein digitales Telefonbuch vor: Es hält nicht nur die Namen, sondern auch Adresse, Abteilung und Rolle jedes Mitarbeiters an einem zentralen Ort. Jeder, der danach sucht, bekommt aktuelle Daten – nicht eine eigene Kopie auf dem eigenen Rechner.' },
  ]));

  exps.push(explanation('lokale-verwaltung-classic', 'Das Problem lokaler Konten', 'classic', [
    { type: 'text', content: 'Ohne zentrale Verwaltung benötigt jeder Rechner eigene lokale Benutzerkonten. Mitarbeiter können an einem fremden Arbeitsplatz nicht arbeiten, und Passwörter müssen an vielen Stellen getrennt gepflegt werden.' },
    { type: 'list', title: 'Nachteile', items: [
      'Hoher Verwaltungsaufwand',
      'Keine automatische Anmeldung an einem anderen Rechner',
      'Passwörter an vielen Stellen',
      'Ressourcen sind schwer zentral verfügbar',
    ] },
    { type: 'text', content: 'Ein Beispiel: 4 Computer × 3 Benutzer können bis zu 12 separate lokale Konten erfordern.' },
  ]));

  exps.push(explanation('ad-ds-classic', 'Active Directory Domain Services (AD DS)', 'classic', [
    { type: 'text', content: 'AD DS ist der Windows-Dienst für einen zentralen Verzeichnisdienst in einer Domäne. Es bietet Identitäten, Authentifizierung, Autorisierungsgrundlagen und zentrale Verwaltung.' },
    { type: 'text', content: 'Wichtig: AD DS verwaltet Identitäten und Verzeichnisinformationen, nicht alle Unternehmensdaten. Dateien und Datenbanken liegen auf eigenen Dateiservern.' },
    { type: 'list', title: 'Kernfunktionen', items: [
      'Zentrale Identitäten',
      'Computerobjekte',
      'Gruppen',
      'Authentifizierung',
      'Autorisierung',
      'Richtlinienbezug',
      'Verzeichnisabfragen',
      'Replikation',
    ] },
  ]));

  exps.push(explanation('dns-kerberos-classic', 'DNS und Kerberos', 'classic', [
    { type: 'text', content: 'AD DS ist stark auf DNS angewiesen: Clients finden über DNS passende Domain Controller und Dienste. Kerberos ist das Authentifizierungsprotokoll, das mit Tickets arbeitet und Single-Sign-On ermöglicht.' },
    { type: 'text', content: 'Für Kerberos ist eine konsistente Uhrzeit wichtig. Große Zeitabweichungen können Authentifizierungsvorgänge verhindern.' },
    { type: 'text', content: 'LDAP ist ein Protokoll, mit dem man Verzeichnisinformationen abfragen und ändern kann. AD DS unterstützt LDAP, aber LDAP ist nicht gleich Active Directory.' },
  ]));

  exps.push(explanation('smb-ntfs-classic', 'SMB und NTFS', 'classic', [
    { type: 'text', content: 'SMB ist ein Netzwerkprotokoll für Datei-, Druck- und Ressourcenzugriff über das Netz. NTFS ist ein lokales Dateisystem, das Berechtigungen auf Datei- und Ordnerebene regelt.' },
    { type: 'text', content: 'Beide Ebenen wirken zusammen: SMB transportiert den Netzwerkzugriff, NTFS prüft die Rechte auf dem Datenträger.' },
  ]));

  exps.push(explanation('authn-authz-classic', 'Authentifizierung vs. Autorisierung', 'classic', [
    { type: 'text', content: 'Authentifizierung beantwortet: Wer bist du? Autorisierung beantwortet: Was darfst du? Beides sind getrennte Schritte.' },
    { type: 'text', content: 'Ein Mitarbeiter kann sich erfolgreich anmelden (Authentifizierung), aber trotzdem keinen Ordner öffnen, wenn die Berechtigung fehlt (Autorisierung).' },
  ]));

  exps.push(explanation('replikation-classic', 'Replikation', 'classic', [
    { type: 'text', content: 'Mehrere Domain Controller können Verzeichnisdaten miteinander abgleichen. Dadurch entsteht keine einzelne Fehlerstelle, und Informationen bleiben verfügbar.' },
    { type: 'text', content: 'Die genaue Replikationstopologie hängt von Sites, Verbindungen und Konfiguration ab. Sie ist bewusst skalierbar und ausfallsicher ausgelegt.' },
  ]));

  return exps;
}

export function buildAdFoundationLesson() {
  const explanations = buildExplanations();
  return {
    title: 'Active Directory – Grundlagen',
    explanations,
    summary: [
      'Verzeichnisdienste verwalten Objekte und Attribute zentral.',
      'Lokale Konten skalieren schlecht und vervielfachen den Verwaltungsaufwand.',
      'AD DS ist der Windows-Dienst für Domänenverzeichnisse.',
      'DNS hilft AD-Clients, Dienste zu finden.',
      'Kerberos authentifiziert mit Tickets und braucht Zeitkonsistenz.',
      'LDAP ist ein Protokoll, AD DS ein Verzeichnisdienst.',
      'SMB ist ein Netzwerkprotokoll, NTFS ein lokales Dateisystem.',
      'Authentifizierung ≠ Autorisierung.',
      'Replikation sorgt für Konsistenz zwischen mehreren Domain Controllern.',
    ],
    quiz: [
      { question: 'Was ist ein Verzeichnisdienst?', options: ['Ein zentraler Dienst zur Verwaltung von Objekten und Attributen', 'Ein Programm zur Formatierung von Festplatten', 'Ein Routing-Protokoll für große Netze', 'Ein Antivirus-Tool'], correct: 0, explanation: 'Ein Verzeichnisdienst hält Objekte und Attribute zentral.' },
      { question: 'Welches Problem vermeidet man mit Active Directory?', options: ['Zu viele lokale Konten an einzelnen Rechnern', 'Zu wenige DNS-Root-Server', 'Zu schnelle CPU-Taktraten', 'Zu kurze Netzwerkkabel'], correct: 0, explanation: 'AD ermöglicht zentrale Konten statt dezentraler lokaler Konten.' },
      { question: 'Welche Rolle spielt DNS für AD DS?', options: ['Clients finden Domain Controller und Dienste', 'DNS speichert Passwörter', 'DNS ersetzt die zentrale Benutzerverwaltung', 'DNS ist nur für Webseiten zuständig'], correct: 0, explanation: 'DNS hilft Clients, passende Domain Controller und Dienste aufzufinden.' },
      { question: 'Wozu dient Kerberos?', options: ['Authentifizierung mit Tickets', 'Dateisystemberechtigungen', 'Netzwerkdruck', 'DNS-Auflösung'], correct: 0, explanation: 'Kerberos ist ein Authentifizierungsprotokoll mit Tickets.' },
      { question: 'Was ist der Unterschied zwischen Authentifizierung und Autorisierung?', options: ['Wer bist du? vs. Was darfst du?', 'Was darfst du? vs. Wer bist du?', 'IP-Adresse vs. MAC-Adresse', 'Router vs. Switch'], correct: 0, explanation: 'Authentifizierung prüft die Identität, Autorisierung die Berechtigung.' },
    ],
  };
}
