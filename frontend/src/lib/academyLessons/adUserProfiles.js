import { topicKey } from '../academyTopics.js';

export const AD_USER_PROFILES_TOPIC_KEY = topicKey('active-directory-virtualbox', 'ad-user-profiles');

function explanation(id, title, style, blocks) {
  return { id, title, style, blocks };
}

export function buildAdUserProfilesLesson() {
  const title = 'Benutzerprofile';

  const explanations = [
    explanation('adup-kontoarten', 'Arten von AD-Konten', 'classic', [
      { type: 'text', content: 'Active Directory verwaltet verschiedene Objekte. Besonders relevant sind Benutzerkonten und Computerkonten. Konten können reale Personen oder Geräte repräsentieren, aber auch logische Zwecke erfüllen, zum Beispiel als Dienstkonto, Anwendungskonto, Monitoring-Konto oder Administratorkonto.' },
      { type: 'list', title: 'Kontoarten im Lehrgang', items: [
        'Benutzerkonto – repräsentiert eine reale Person.',
        'Computerkonto – repräsentiert ein Gerät in der Domäne.',
        'Dienstkonto – für Dienste und Hintergrundprozesse.',
        'Anwendungskonto – für bestimmte Anwendungen.',
        'Administratorkonto – für administrative Aufgaben.',
      ] },
      { type: 'question', question: 'Welches AD-Objekt repräsentiert einen Computer in der Domäne?', options: ['Benutzerkonto', 'Computerkonto', 'Sicherheitsgruppe', 'Verteilergruppe'], correct: 1, explanation: 'Ein Computerkonto repräsentiert den Computer in Active Directory.' },
    ]),

    explanation('adup-lokal-roaming', 'Lokale und servergespeicherte Profile', 'classic', [
      { type: 'text', content: 'Bei der Anmeldung wird ein Benutzerprofil erstellt oder geladen. Der Lehrgang unterscheidet zwischen lokal gespeicherten und servergespeicherten Profilen.' },
      { type: 'table', headers: ['Profilart', 'Speicherort', 'Vorteil', 'Nachteil'], rows: [
        ['lokales Profil', 'Client', 'schnelle Anmeldung, Daten lokal', 'keine automatische Übertragung auf andere Clients'],
        ['servergespeichertes Profil', 'Netzwerkfreigabe', 'gleiche Umgebung an mehreren Clients', 'große Profile verlängern Ladezeiten, Netzwerk beeinflusst Anmeldung'],
      ] },
      { type: 'text', content: 'Für den Lehrgang merk dir: Ein servergespeichertes Profil wird beim Anmelden vom Server geladen und beim Abmelden zurückgeschrieben. Technisch genauer: Ein Roamingprofil entsteht nicht automatisch durch die Domänenanmeldung, sondern muss durch einen Profilpfad oder eine entsprechende Richtlinie konfiguriert werden.' },
      { type: 'question', question: 'Was ist ein Vorteil eines servergespeicherten Profils?', options: ['schnellere lokale Anmeldung', 'gleiche Benutzerumgebung an mehreren Clients', 'keine Netzwerkabhängigkeit', 'geringere Serverlast'], correct: 1, explanation: 'Das zentrale Profil ermöglicht die gleiche Benutzerumgebung an verschiedenen Clients.' },
    ]),

    explanation('adup-ordnerumleitung', 'Ordnerumleitung', 'classic', [
      { type: 'text', content: 'Die Ordnerumleitung legt bestimmte Benutzerordner auf einer zentralen Netzwerkfreigabe ab. Dadurch müssen nicht bei jeder Anmeldung alle Benutzerdaten als Teil eines großen Profils übertragen werden.' },
      { type: 'text', content: 'Für den Lehrgang merk dir: Ordnerumleitung reduziert die Datenmenge, die im Profil transportiert werden muss. Technisch genauer: Eine Ordnerumleitung bedeutet nicht, dass kein lokales Profil mehr existiert oder eine Offline-Anmeldung unmöglich wäre. Ordnerumleitung, Roamingprofile, lokale Profilkopien und Offline Files sind unterschiedliche Mechanismen.' },
      { type: 'question', question: 'Was ist das didaktische Ziel der Ordnerumleitung?', options: ['Benutzerprofil komplett abschaffen', 'bestimmte Ordner zentral auslagern', 'Offline-Anmeldung verhindern', 'lokale Festplatte verschlüsseln'], correct: 1, explanation: 'Ordnerumleitung legt bestimmte Benutzerordner auf einem zentralen Speicher ab.' },
    ]),

    explanation('adup-unc-home', 'UNC-Pfade und Home-Verzeichnis', 'classic', [
      { type: 'text', content: 'UNC-Pfade folgen der Form \\\\Servername\\Freigabename. Sie werden verwendet, um Netzwerkressourcen anzusprechen, beispielsweise für Profilpfade oder Home-Verzeichnisse.' },
      { type: 'list', title: 'Unterscheidung', items: [
        'Home-Verzeichnis / Basisordner: zentrale persönliche Ablage für Dateien.',
        'Benutzerprofil: Speicherort für Benutzereinstellungen.',
      ] },
      { type: 'text', content: 'Beispiel: \\\\FILE01\\Profile$\\S1Offz oder \\\\FILE01\\Home$\\S1Offz. Das Dollarzeichen kennzeichnet eine versteckte Freigabe, sofern dieser Aspekt im Lehrgang behandelt wurde.' },
      { type: 'question', question: 'Welche Form hat ein korrekter UNC-Pfad?', options: ['C:\\Server\\Freigabe', 'http://Server/Freigabe', '\\\\Server\\Freigabe', 'Server/Freigabe'], correct: 2, explanation: 'UNC verwendet zwei führende Backslashes: \\\\Server\\Freigabe.' },
    ]),

    explanation('adup-benutzer-anlegen', 'Benutzer und Computer anlegen', 'classic', [
      { type: 'text', content: 'Benutzer werden im Lehrgang über den Server-Manager → Tools → Active Directory-Benutzer und -Computer in der gewünschten OU angelegt. Notwendige Angaben sind vollständiger Name, Benutzeranmeldename und ein eindeutiger Anmeldename innerhalb der Domäne. Anschließend wird das Kennwort vergeben.' },
      { type: 'list', title: 'Mögliche Kontoeinstellungen', items: [
        'Benutzer muss Kennwort bei nächster Anmeldung ändern',
        'Benutzer kann Kennwort nicht ändern',
        'Kennwort läuft nicht ab',
        'Konto deaktivieren',
      ] },
      { type: 'text', content: 'Beim manuellen Anlegen eines Computerkontos muss der eingetragene Hostname mit dem tatsächlichen Hostnamen des Geräts übereinstimmen.' },
      { type: 'question', question: 'Wo wird ein Benutzerkonto im Lehrgang angelegt?', options: ['Direkt im DNS-Manager', 'Server-Manager → Active Directory-Benutzer und -Computer', 'Im lokalen SAM', 'Auf der Netzwerkkarte'], correct: 1, explanation: 'Der Lehrgangsweg führt über Server-Manager → Tools → Active Directory-Benutzer und -Computer.' },
    ]),

    explanation('adup-powershell', 'Benutzer mit PowerShell anlegen', 'classic', [
      { type: 'text', content: 'Der Lehrgang stellt den Befehl New-ADUser vor. Wichtig ist, die Bedeutung der Parameter zu verstehen, bevor man die komplette Syntax auswendig lernt.' },
      { type: 'list', title: 'Parameter im Lehrgangsbeispiel', items: [
        'Name: Anzeigename',
        'SamAccountName: klassischer Anmeldename',
        'UserPrincipalName: Anmeldename in E-Mail-Form',
        'Path: OU-Pfad, in der das Konto angelegt wird',
        'AccountPassword: sicheres Kennwort',
        'Enabled: Konto aktiv ($true) oder deaktiviert',
      ] },
      { type: 'text', content: 'Ziel ist es, fehlende Parameter einsetzen oder eine sinnvolle Reihenfolge zu erkennen, nicht sofort den gesamten Befehl blind zu tippen.' },
      { type: 'question', question: 'Welcher Parameter bestimmt den OU-Pfad in New-ADUser?', options: ['Path', 'Name', 'SamAccountName', 'Enabled'], correct: 0, explanation: 'Der Path-Parameter legt fest, in welcher OU das Konto erstellt wird.' },
    ]),

    explanation('adup-eigenschaften', 'Kontoeigenschaften pflegen', 'classic', [
      { type: 'text', content: 'Über die Eigenschaften eines Benutzers können Attribute und Kontoeinstellungen gepflegt werden. Reiter Konto: Anmeldename, Anmeldezeiten, erlaubte Computer, Sperrstatus, Kennworteinstellungen, Ablaufdatum. Reiter Mitglied von: Gruppenmitgliedschaften, standardmäßig Domänen-Benutzer. Reiter Profil: Profilpfad und Basisordner/Homelaufwerk.' },
      { type: 'question', question: 'In welchem Reiter wird der Profilpfad gepflegt?', options: ['Konto', 'Mitglied von', 'Profil', 'Allgemein'], correct: 2, explanation: 'Der Profilpfad und der Basisordner befinden sich im Reiter Profil.' },
    ]),

    explanation('adup-admin-tier', 'Admin-Tier-Modell', 'classic', [
      { type: 'text', content: 'Das Admin-Tier-Modell trennt hochprivilegierte Administratorkonten nach Einsatzzweck. Hintergrund ist das Risiko, dass Anmeldeinformationen auf weniger geschützten Systemen kompromittiert werden, zum Beispiel durch Pass-the-Hash.' },
      { type: 'table', headers: ['Tier', 'Verwendung', 'Nicht verwenden an'], rows: [
        ['Tier 0', 'Domänenadministration', 'normalen Clients, Servern'],
        ['Tier 1', 'Serveradministration', 'Domänencontrollern, Clients'],
        ['Tier 2', 'Clientadministration / Helpdesk', 'Domänencontrollern, Servern'],
      ] },
      { type: 'text', content: 'Lokale Administratorkonten auf Domänenclients können deaktiviert werden, auf Servern/DCs als Fallback verfügbar bleiben. Beim Heraufstufen eines Servers zum Domänencontroller wird das lokale Administratorkonto Teil der Domänenadministration.' },
      { type: 'question', question: 'An welchem System dürfen Tier-0-Konten im Lehrgang verwendet werden?', options: ['normalen Arbeitsplatz-PCs', 'Domänencontrollern', 'Helpdesk-Notebooks', 'WLAN-Routern'], correct: 1, explanation: 'Tier-0-Konten sind für hochprivilegierte Domäneninfrastruktur vorgesehen.' },
    ]),
  ];

  const quiz = [
    { question: 'Welches Konto repräsentiert ein Gerät in der Domäne?', options: ['Benutzerkonto', 'Computerkonto', 'Dienstkonto', 'Sicherheitsgruppe'], correct: 1, explanation: 'Ein Computerkonto repräsentiert den Computer.' },
    { question: 'Was ist ein Vorteil eines servergespeicherten Profils?', options: ['schnellere lokale Anmeldung', 'gleiche Umgebung an mehreren Clients', 'kein Netzwerk notwendig', 'profilunabhängige Desktops'], correct: 1, explanation: 'Servergespeicherte Profile ermöglichen die gleiche Umgebung an verschiedenen Clients.' },
    { question: 'Welche Form zeigt einen korrekten UNC-Pfad?', options: ['C:\\Client\\Ordner', 'http://Server/Freigabe', '\\\\FILE01\\Befehle', 'Server:Freigabe'], correct: 2, explanation: 'UNC verwendet \\\\Server\\Freigabe.' },
    { question: 'Wer darf laut Lehrgang Benutzer anlegen?', options: ['nur Helpdesk ohne Gruppen', 'Domänen-Admins, Organisations-Admins, Konten-Operatoren', 'jeder normale Benutzer', 'nur das Computerkonto'], correct: 1, explanation: 'Der Lehrgang nennt Domänen-Admins, Organisations-Admins und Konten-Operatoren.' },
    { question: 'Welcher Reiter enthält den Profilpfad?', options: ['Konto', 'Mitglied von', 'Profil', 'Sicherheit'], correct: 2, explanation: 'Der Profilpfad und der Basisordner befinden sich im Reiter Profil.' },
    { question: 'Wofür ist Tier 2 vorgesehen?', options: ['Domänenadministration', 'Serveradministration', 'Clientadministration / Helpdesk', 'Netzwerksicherheit'], correct: 2, explanation: 'Tier 2 ist für Clientadministration und Helpdesk gedacht.' },
  ];

  const summary = [
    'AD verwaltet Benutzer-, Computer-, Dienst-, Anwendungs- und Administratorkonten.',
    'Lokale Profile sind schnell, aber nicht zentral synchronisiert; servergespeicherte Profile ermöglichen ein einheitliches Erlebnis.',
    'Ordnerumleitung lagert bestimmte Benutzerordner aus, ist aber nicht gleichbedeutend mit dem Fehlen eines lokalen Profils.',
    'UNC-Pfade verwenden die Form \\\\Server\\Freigabe.',
    'Benutzerkonten werden über Server-Manager → Active Directory-Benutzer und -Computer in einer OU angelegt.',
    'Das Admin-Tier-Modell trennt Konten nach Einsatzgebiet, um Pass-the-Hash-Risiken zu reduzieren.',
  ];

  return { title, explanations, exercises: [], quiz, summary };
}
