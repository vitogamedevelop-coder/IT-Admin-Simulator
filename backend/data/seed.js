module.exports = {
  "modules": [
    {
      "faculty_id": "it",
      "order_index": 1,
      "title": "Modul 1: Das 7-Schichten-OSI-Modell",
      "description": "Die fundamentale Landkarte der Netzwerkkommunikation. Lerne jede Schicht von physikalischen Bits bis zu Anwendungsprotokollen, mit Beispielen und aktivem Abruf.",
      "icon": "Layers",
      "content": {
        "sections": [
          {
            "title": "Warum das OSI-Modell wichtig ist",
            "body": [
              "Netzwerke sind komplex. Das OSI-Modell teilt die Kommunikation in 7 Schichten auf, damit Administratoren Probleme eingrenzen können: Ist es ein Kabel, eine IP-Adresse, ein Port oder ein App-Fehler?"
            ]
          },
          {
            "title": "Schicht 1 — Physikalisch",
            "body": [
              "Überträgt rohe Bits als elektrische, optische oder Funk-Signale. Beispiele: Ethernet-Kabel, Glasfaser, Hubs, LEDs der Netzwerkkarte, Spannungspegel. Fehlersuche: Kabel, Stecker und Verbindungs-LEDs prüfen."
            ]
          },
          {
            "title": "Schicht 2 — Sicherung",
            "body": [
              "Verpackt Bits in Frames und verwendet MAC-Adressen für lokale Zustellung. Beispiele: Switches, ARP, MAC-Tabellen, Ethernet-Frames. VLANs gehören ebenfalls hierher."
            ]
          },
          {
            "title": "Schicht 3 — Vermittlung / Netzwerk",
            "body": [
              "Leitet Pakete zwischen Netzwerken anhand logischer IP-Adressen. Beispiele: Router, IP, ICMP, OSPF, Subnetzmasken. Das Internet lebt in Schicht 3."
            ]
          },
          {
            "title": "Schicht 4 — Transport",
            "body": [
              "Bietet zuverlässige oder schnelle Ende-zu-Ende-Zustellung. TCP (zuverlässig, verbindungsorientiert) und UDP (schnell, verbindungslos) verwenden Port-Nummern. Beispiele: TCP-Handshake, Windowing, Port 80/443."
            ]
          },
          {
            "title": "Schicht 5 — Sitzung",
            "body": [
              "Verwaltet Dialogsteuerung zwischen Anwendungen. Beispiele: NetBIOS, RPC, Auf- und Abbau von Sitzungen. Hält Gespräche synchronisiert."
            ]
          },
          {
            "title": "Schicht 6 — Darstellung",
            "body": [
              "Übersetzt, verschlüsselt und komprimiert Daten. Beispiele: SSL/TLS, JPEG, ASCII/EBCDIC-Konvertierung, MIME. Diese Schicht macht Daten für die Anwendung lesbar."
            ]
          },
          {
            "title": "Schicht 7 — Anwendung",
            "body": [
              "Die Schnittstelle, mit der Benutzer und Apps interagieren. Beispiele: HTTP, HTTPS, FTP, DNS, SMTP, SSH. Hier leben Browser und E-Mail-Clients."
            ]
          },
          {
            "title": "Merksätze",
            "body": [
              "Englisch von unten nach oben: Please Do Not Throw Sausage Pizza Away (Physical, Data, Network, Transport, Session, Presentation, Application). Von oben nach unten: All People Seem To Need Data Processing."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welche OSI-Schicht ist für die Übertragung roher Bits über ein Kabel zuständig?",
          "options": [
            "Physikalisch",
            "Sicherung",
            "Vermittlung",
            "Transport"
          ],
          "answer": "Physikalisch",
          "explanation": "Schicht 1 Physikalisch sendet rohe Bits als Signale.",
          "diagnostic": "Du hast Übertragung mit Zustellung verwechselt. Physikalisch ist die Kabel-/Funk-Ebene; Sicherung verwendet MAC-Adressen.",
          "difficulty": 1
        },
        {
          "question": "Ein Switch arbeitet hauptsächlich in welcher Schicht?",
          "options": [
            "Schicht 1",
            "Schicht 2",
            "Schicht 3",
            "Schicht 4"
          ],
          "answer": "Schicht 2",
          "explanation": "Switches nutzen MAC-Adressen, um Frames weiterzuleiten (Schicht 2).",
          "diagnostic": "Switches leiten Frames anhand von MAC-Adressen weiter, nicht anhand von IP (Schicht 3) oder rohen Bits (Schicht 1).",
          "difficulty": 1
        },
        {
          "question": "Welche Schicht kümmert sich um logische Adressierung und Routing?",
          "options": [
            "Transport",
            "Vermittlung",
            "Sicherung",
            "Sitzung"
          ],
          "answer": "Vermittlung",
          "explanation": "Schicht 3 Vermittlung verwendet IP-Adressen und leitet Pakete weiter.",
          "diagnostic": "Routing ist eine Aufgabe der Vermittlungsschicht. Transport (Schicht 4) verwendet Ports, nicht IP-Routing.",
          "difficulty": 2
        },
        {
          "question": "TCP und UDP gehören zu welcher OSI-Schicht?",
          "options": [
            "Vermittlung",
            "Transport",
            "Anwendung",
            "Darstellung"
          ],
          "answer": "Transport",
          "explanation": "Schicht 4 Transport umfasst TCP und UDP sowie Port-Nummern.",
          "diagnostic": "Ports und zuverlässige Zustellung gehören zum Transport. Die Vermittlungsschicht kümmert sich um IP, nicht Ports.",
          "difficulty": 2
        },
        {
          "question": "Verschlüsselung wie TLS ist am ehesten welcher Schicht zuzuordnen?",
          "options": [
            "Anwendung",
            "Darstellung",
            "Sitzung",
            "Transport"
          ],
          "answer": "Darstellung",
          "explanation": "Schicht 6 Darstellung kümmert sich um Übersetzung, Verschlüsselung und Komprimierung.",
          "diagnostic": "TLS wird oft zum Transport gezählt, weil es nah an TCP arbeitet, aber im OSI-Modell gehört Verschlüsselung zur Darstellungsschicht (Schicht 6).",
          "difficulty": 3
        },
        {
          "question": "In welcher Schicht leben HTTP und HTTPS?",
          "options": [
            "Darstellung",
            "Sitzung",
            "Anwendung",
            "Transport"
          ],
          "answer": "Anwendung",
          "explanation": "Schicht 7 Anwendung ist die Heimat von HTTP, FTP, DNS und SMTP.",
          "diagnostic": "HTTP ist ein Anwendungsprotokoll. Es nutzt den Transport (TCP), ist aber selbst nicht der Transport.",
          "difficulty": 2
        },
        {
          "question": "Das Merkschema \"All People Seem To Need Data Processing\" stellt die Schichten in welcher Reihenfolge dar?",
          "options": [
            "7 nach 1",
            "1 nach 7",
            "4 nach 7",
            "zufällig"
          ],
          "answer": "7 nach 1",
          "explanation": "All (7 Anwendung), People (6 Darstellung), Seem (5 Sitzung), To (4 Transport), Need (3 Vermittlung), Data (2 Sicherung), Processing (1 Physikalisch).",
          "diagnostic": "Das Merkschema beginnt mit Anwendung (A = 7) und endet mit Physikalisch (P = 1).",
          "difficulty": 3
        },
        {
          "question": "Bei welcher Schicht würdest du ein defektes Ethernet-Kabel beheben?",
          "options": [
            "Physikalisch",
            "Sicherung",
            "Vermittlung",
            "Anwendung"
          ],
          "answer": "Physikalisch",
          "explanation": "Kabel, Stecker und Signale gehören zu Schicht 1 Physikalisch.",
          "diagnostic": "Ein Kabeldefekt ist ein Problem der Schicht 1. Schicht 2 würde Switching- oder MAC-Probleme betreffen.",
          "difficulty": 1
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 2,
      "title": "Modul 2: Kerndienste & Ports",
      "description": "IP-Konfiguration, Subnetting, DNS, DHCP und die Standardports, die jeder Admin und Hacker kennen muss.",
      "icon": "Network",
      "content": {
        "sections": [
          {
            "title": "IP-Konfiguration",
            "body": [
              "Jeder Host braucht eine IP-Adresse, Subnetzmaske, Standard-Gateway und DNS-Server. Statische IPs werden manuell vergeben, dynamische über DHCP."
            ]
          },
          {
            "title": "Subnetting-Grundlagen",
            "body": [
              "Eine Subnetzmaske trennt den Netzwerk- vom Hostanteil einer IP. /24 bedeutet 255.255.255.0 mit 256 Adressen. CIDR-Notation macht das kompakt: 192.168.1.0/24."
            ]
          },
          {
            "title": "DNS & DHCP",
            "body": [
              "DNS übersetzt Namen in IPs. DHCP vergibt IP-Adressen automatisch. Beides sind Kerndienste, auf die jedes Netzwerk angewiesen ist."
            ]
          },
          {
            "title": "Wichtige Ports",
            "body": [
              "22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 21 FTP, 25 SMTP, 110 POP3, 143 IMAP, 3389 RDP, 445 SMB. Ports auswendig zu kennen beschleunigt Fehlersuche und Sicherheitsanalysen."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welcher Dienst nutzt standardmäßig Port 22?",
          "options": [
            "HTTP",
            "SSH",
            "DNS",
            "HTTPS"
          ],
          "answer": "SSH",
          "explanation": "SSH (Secure Shell) nutzt TCP-Port 22 für verschlüsselten Remote-Zugriff.",
          "diagnostic": "HTTP ist 80, HTTPS ist 443, DNS ist 53. SSH ist 22.",
          "difficulty": 1
        },
        {
          "question": "Welcher ist der Standardport für DNS?",
          "options": [
            "53",
            "80",
            "443",
            "22"
          ],
          "answer": "53",
          "explanation": "DNS verwendet UDP/TCP-Port 53.",
          "diagnostic": "DNS ist 53. 80/443 sind Web, 22 ist SSH.",
          "difficulty": 1
        },
        {
          "question": "Welcher Port wird üblicherweise für HTTPS-Verkehr genutzt?",
          "options": [
            "80",
            "443",
            "8080",
            "22"
          ],
          "answer": "443",
          "explanation": "HTTPS nutzt TCP-Port 443 mit TLS-Verschlüsselung.",
          "diagnostic": "HTTP ist 80; HTTPS ist 443.",
          "difficulty": 1
        },
        {
          "question": "Eine /24-Subnetzmaske entspricht?",
          "options": [
            "255.0.0.0",
            "255.255.255.0",
            "255.255.0.0",
            "255.255.255.255"
          ],
          "answer": "255.255.255.0",
          "explanation": "/24 bedeutet 24 Netzwerkbits: 255.255.255.0.",
          "diagnostic": "/24 hat die ersten 24 Bits gesetzt, was 255.255.255.0 ergibt.",
          "difficulty": 2
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 3,
      "title": "Modul 3: Infrastruktur & Active Directory",
      "description": "Cisco-Routing-Grundlagen, Active Directory-Struktur, AGDLP-Gruppen und Gruppenrichtlinienobjekte.",
      "icon": "Server",
      "content": {
        "sections": [
          {
            "title": "Cisco-Routing-Grundlagen",
            "body": [
              "Router leiten Pakete zwischen Netzwerken weiter. show ip route zeigt die Routing-Tabelle. Statische Routen sind manuell; dynamische nutzen OSPF oder EIGRP."
            ]
          },
          {
            "title": "Active Directory-Struktur",
            "body": [
              "AD verwendet Forests, Domänen, Organisationseinheiten (OUs) und Objekte. Domänen teilen einen Namespace; OUs gruppieren Objekte für Richtlinien und Delegation."
            ]
          },
          {
            "title": "AGDLP-Prinzip",
            "body": [
              "Accounts kommen in globale Gruppen; globale Gruppen in domänenlokale Gruppen; domänenlokale Gruppen erhalten Berechtigungen. So bleibt der Zugriff sauber und nachvollziehbar."
            ]
          },
          {
            "title": "Gruppenrichtlinienobjekte (GPO)",
            "body": [
              "GPOs erzwingen Einstellungen für Benutzer und Computer. Sie werden an Standorte, Domänen oder OUs verknüpft. gpupdate /force aktualisiert Richtlinien sofort."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welcher Befehl zeigt die Cisco-Routing-Tabelle an?",
          "options": [
            "show run",
            "show ip route",
            "show interfaces",
            "show vlan"
          ],
          "answer": "show ip route",
          "explanation": "show ip route listet bekannte Netzwerke und Wege zu ihnen.",
          "diagnostic": "show run zeigt die Konfiguration; show ip route zeigt die Routing-Tabelle.",
          "difficulty": 2
        },
        {
          "question": "Was bedeutet das P in AGDLP?",
          "options": [
            "Policy",
            "Permissions",
            "Principal",
            "Process"
          ],
          "answer": "Permissions",
          "explanation": "AGDLP = Accounts -> Global Groups -> Domain Local Groups -> Permissions.",
          "diagnostic": "AGDLP endet mit Permissions, die domänenlokalen Gruppen zugewiesen werden.",
          "difficulty": 3
        },
        {
          "question": "Welcher AD-Container organisiert Objekte und ermöglicht delegierte Richtlinien?",
          "options": [
            "Domäne",
            "Forest",
            "Organisationseinheit",
            "Standort"
          ],
          "answer": "Organisationseinheit",
          "explanation": "OUs gruppieren Benutzer, Computer und Gruppen und können GPOs verknüpft werden.",
          "diagnostic": "Domänen und Forests sind größere Grenzen; OUs sind die Organisationseinheiten für Delegation und Richtlinien.",
          "difficulty": 2
        },
        {
          "question": "Welches Tool erzwingt eine sofortige Gruppenrichtlinien-Aktualisierung auf einem Windows-Client?",
          "options": [
            "gpedit.msc",
            "gpupdate /force",
            "gpmc.msc",
            "netdom"
          ],
          "answer": "gpupdate /force",
          "explanation": "gpupdate /force wendet GPOs sofort erneut an.",
          "diagnostic": "gpedit bearbeitet lokale Richtlinien; gpupdate wendet sie an. GPMC ist die Management-Konsole.",
          "difficulty": 3
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 4,
      "title": "Modul 4: Systemadministration",
      "description": "SSH, MMC-Layouts, Dateifreigaben und Git-Repository-Integration für Systemadministratoren.",
      "icon": "Terminal",
      "content": {
        "sections": [
          {
            "title": "SSH-Remote-Management",
            "body": [
              "SSH verschlüsselt Remote-Shell-Zugriff auf Port 22. Schlüssel sind sicherer als Passwörter: ssh-keygen, ssh-copy-id, ssh benutzer@host."
            ]
          },
          {
            "title": "Microsoft Management Console",
            "body": [
              "Die MMC hostet Snap-ins für Ereignisanzeige, Geräte-Manager, Dienste und Active Directory-Verwaltung. Passe Layouts an spezifische Admin-Aufgaben an."
            ]
          },
          {
            "title": "Dateifreigaben",
            "body": [
              "SMB/CIFS stellt Windows-Dateifreigaben über Port 445 bereit. Ein UNC-Pfad beginnt mit zwei Backslashes, gefolgt von Servername, einem Backslash und dem Freigabenamen. NTFS-Berechtigungen ergänzen Freigabeberechtigungen."
            ]
          },
          {
            "title": "Git-Grundlagen",
            "body": [
              "Git verfolgt Code-Änderungen. Kernbefehle: clone, add, commit, push, pull, branch, merge. Repositories können lokal oder bei GitHub/GitLab gehostet werden."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welcher Befehl erzeugt ein SSH-Schlüsselpaar?",
          "options": [
            "ssh",
            "ssh-keygen",
            "ssh-copy-id",
            "scp"
          ],
          "answer": "ssh-keygen",
          "explanation": "ssh-keygen erzeugt öffentliche/private Schlüsselpaare für SSH.",
          "diagnostic": "ssh verbindet; ssh-keygen erzeugt Schlüssel; ssh-copy-id installiert sie.",
          "difficulty": 2
        },
        {
          "question": "Welcher Port wird standardmäßig für SSH genutzt?",
          "options": [
            "22",
            "23",
            "3389",
            "445"
          ],
          "answer": "22",
          "explanation": "SSH nutzt standardmäßig TCP-Port 22.",
          "diagnostic": "Telnet ist 23, RDP 3389, SMB 445. SSH ist 22.",
          "difficulty": 1
        },
        {
          "question": "Welcher Git-Befehl staged Änderungen für den nächsten Commit?",
          "options": [
            "git commit",
            "git add",
            "git push",
            "git pull"
          ],
          "answer": "git add",
          "explanation": "git add verschiebt Änderungen in den Staging-Bereich.",
          "diagnostic": "git commit speichert gestagte Änderungen; git add staged sie.",
          "difficulty": 2
        },
        {
          "question": "Wie lautet das UNC-Pfad-Format für eine Windows-Freigabe?",
          "options": [
            "//server/freigabe",
            "\\\\server\\freigabe",
            "http://server/freigabe",
            "smb://server/freigabe"
          ],
          "answer": "\\\\server\\freigabe",
          "explanation": "UNC-Pfade unter Windows beginnen mit zwei Backslashes, gefolgt von Servername, einem Backslash und dem Freigabenamen.",
          "diagnostic": "UNC unter Windows nutzt zwei Backslashes am Anfang und einen Backslash vor der Freigabe. smb:// wird unter Linux/macOS genutzt.",
          "difficulty": 3
        }
      ]
    },
    {
      "faculty_id": "coding",
      "order_index": 1,
      "title": "Modul 1: Variablen & Debugging",
      "description": "Start mit C# für Unity: Variablen, Typen, Debug.Log und das Lesen der Konsole.",
      "icon": "Code",
      "content": {
        "sections": [
          {
            "title": "Variablen in C#",
            "body": [
              "Variablen speichern Daten. int für ganze Zahlen, float für Dezimalzahlen, string für Text, bool für true/false. C# ist stark typisiert: int health = 100;"
            ]
          },
          {
            "title": "Debugging",
            "body": [
              "Debug.Log(Nachricht) schreibt in die Unity-Konsole. Der Inspector zeigt public-Felder zur Laufzeit. Breakpoints in Visual Studio halten die Ausführung an."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welches C# Schlüsselwort deklariert eine Dezimalzahl in Unity?",
          "options": [
            "int",
            "float",
            "string",
            "bool"
          ],
          "answer": "float",
          "explanation": "float speichert Dezimalwerte wie 3.14f.",
          "diagnostic": "int ist für ganze Zahlen; float ist für Dezimalzahlen.",
          "difficulty": 1
        },
        {
          "question": "Wie gibst du eine Nachricht in die Unity-Konsole aus?",
          "options": [
            "print()",
            "Debug.Log()",
            "Console.Write()",
            "Log.Debug()"
          ],
          "answer": "Debug.Log()",
          "explanation": "Unity verwendet Debug.Log() für die Konsole.",
          "diagnostic": "Debug.Log ist die Unity-Methode; Console.Write ist .NET-Konsole und wird in Unity nicht angezeigt.",
          "difficulty": 1
        }
      ]
    },
    {
      "faculty_id": "coding",
      "order_index": 2,
      "title": "Modul 2: Kontrollfluss & Schleifen",
      "description": "if/else, switch, for, foreach und while-Schleifen in C#.",
      "icon": "Repeat",
      "content": {
        "sections": [
          {
            "title": "Verzweigungen",
            "body": [
              "if/else führt Code bedingt aus. switch behandelt viele exakte Werte übersichtlich."
            ]
          },
          {
            "title": "Schleifen",
            "body": [
              "for-Schleifen laufen eine feste Anzahl. foreach iteriert Sammlungen. while-Schleifen laufen, solange eine Bedingung wahr ist."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welche Schleife eignet sich am besten, um eine List<T> ohne Index zu durchlaufen?",
          "options": [
            "for",
            "while",
            "foreach",
            "do-while"
          ],
          "answer": "foreach",
          "explanation": "foreach vereinfacht das Iterieren über jedes Element einer Sammlung.",
          "diagnostic": "for verwendet einen Index; foreach greift direkt auf jedes Element zu.",
          "difficulty": 1
        },
        {
          "question": "Welches Schlüsselwort beendet eine Schleife sofort?",
          "options": [
            "continue",
            "break",
            "return",
            "exit"
          ],
          "answer": "break",
          "explanation": "break stoppt die aktuelle Schleife.",
          "diagnostic": "continue überspringt den Rest der Iteration; break verlässt die Schleife.",
          "difficulty": 1
        }
      ]
    },
    {
      "faculty_id": "coding",
      "order_index": 3,
      "title": "Modul 3: Unity-Lebenszyklus",
      "description": "Awake, Start, Update, FixedUpdate und wann jeder aufgerufen wird.",
      "icon": "RefreshCw",
      "content": {
        "sections": [
          {
            "title": "Reihenfolge des Lebenszyklus",
            "body": [
              "Awake läuft einmal beim Laden des Objekts. Start läuft einmal vor dem ersten Update. Update läuft jeden Frame. FixedUpdate läuft mit festem Zeittakt für Physik."
            ]
          },
          {
            "title": "Aktivieren/Deaktivieren",
            "body": [
              "OnEnable läuft, wenn das Objekt aktiv wird; OnDisable, wenn es inaktiv wird. Verwende diese für Event-Abonnements."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welche Methode läuft vor Start, wenn eine Szene geladen wird?",
          "options": [
            "Update",
            "Awake",
            "FixedUpdate",
            "OnEnable"
          ],
          "answer": "Awake",
          "explanation": "Awake wird vor Start bei der Initialisierung aufgerufen.",
          "diagnostic": "Awake kommt zuerst, dann OnEnable, dann Start.",
          "difficulty": 2
        },
        {
          "question": "Welche Methode wird jeden Frame für Nicht-Physik-Logik aufgerufen?",
          "options": [
            "FixedUpdate",
            "Update",
            "LateUpdate",
            "Awake"
          ],
          "answer": "Update",
          "explanation": "Update läuft einmal pro Frame.",
          "diagnostic": "FixedUpdate ist für Physik in festen Intervallen; Update ist pro Frame.",
          "difficulty": 1
        }
      ]
    },
    {
      "faculty_id": "coding",
      "order_index": 4,
      "title": "Modul 4: Objektorientierte Logik",
      "description": "Klassen, Vererbung, MonoBehaviour und Kapselung in Unity C#.",
      "icon": "Box",
      "content": {
        "sections": [
          {
            "title": "Klassen und Objekte",
            "body": [
              "Eine Klasse ist ein Bauplan; ein Objekt ist eine Instanz. Unity-Scripts erben von MonoBehaviour, um an GameObjects angehängt zu werden."
            ]
          },
          {
            "title": "Vererbung",
            "body": [
              "Eine abgeleitete Klasse erbt Felder und Methoden der Basisklasse. Nutze protected und override, um Verhalten zu erweitern."
            ]
          },
          {
            "title": "Kapselung",
            "body": [
              "Halte Felder privat und gib sie über Properties oder Methoden frei, um Zugriff zu steuern. public-Variablen erscheinen im Unity Inspector."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Von welcher Basisklasse leiten Unity-Scripts normalerweise ab?",
          "options": [
            "Component",
            "MonoBehaviour",
            "GameObject",
            "Object"
          ],
          "answer": "MonoBehaviour",
          "explanation": "Unity-Scripts leiten von MonoBehaviour ab, um an GameObjects angehängt zu werden.",
          "diagnostic": "MonoBehaviour ist die Script-Basisklasse; GameObject ist das Szenenobjekt.",
          "difficulty": 2
        },
        {
          "question": "Kapselung bedeutet, Implementierungsdetails zu verbergen und sie über welche Wege freizugeben?",
          "options": [
            "Variablen",
            "Properties oder Methoden",
            "Kommentare",
            "Dateien"
          ],
          "answer": "Properties oder Methoden",
          "explanation": "Kapselung nutzt Zugriffsmethoden, um kontrollierten Zugriff auf Daten zu ermöglichen.",
          "diagnostic": "Kapselung geht um kontrollierten Zugriff über Properties oder Methoden.",
          "difficulty": 3
        }
      ]
    },
    {
      "faculty_id": "coding",
      "order_index": 5,
      "title": "Modul 5: Vektormathematik & Framerate-unabhängige Bewegung",
      "description": "Bewege Objekte mit Vector3 und Time.deltaTime für flüssige, framerate-unabhängige Bewegung.",
      "icon": "Move3d",
      "content": {
        "sections": [
          {
            "title": "Vector3",
            "body": [
              "Vector3 speichert x, y, z. Häufige Richtungen: Vector3.forward, Vector3.up, Vector3.right. Nutze Vector3.Normalize für eine Richtung ohne Länge."
            ]
          },
          {
            "title": "Time.deltaTime",
            "body": [
              "Time.deltaTime ist die Dauer des letzten Frames in Sekunden. Multipliziere die Bewegungsgeschwindigkeit mit deltaTime, damit die Bewegung unabhängig von der FPS konstant bleibt."
            ]
          },
          {
            "title": "Framerate-Unabhängigkeit",
            "body": [
              "transform.Translate(Vector3.forward * speed * Time.deltaTime); Das macht die Geschwindigkeit pro Sekunde, nicht pro Frame."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welcher Wert repräsentiert die Dauer des letzten Frames in Sekunden?",
          "options": [
            "Time.time",
            "Time.deltaTime",
            "Time.fixedTime",
            "Time.frameCount"
          ],
          "answer": "Time.deltaTime",
          "explanation": "Time.deltaTime ist die Framedauer und macht Bewegungen framerate-unabhängig.",
          "diagnostic": "Time.time ist die gesamte verstrichene Zeit; deltaTime ist die Länge des letzten Frames.",
          "difficulty": 2
        },
        {
          "question": "Um ein GameObject jeden Frame mit konstanter Weltgeschwindigkeit vorwärts zu bewegen, verwendet man?",
          "options": [
            "Vector3.forward * speed",
            "Vector3.forward * speed * Time.deltaTime",
            "Vector3.up * speed",
            "transform.position = speed"
          ],
          "answer": "Vector3.forward * speed * Time.deltaTime",
          "explanation": "Mit Time.deltaTime ist die Bewegung pro Sekunde statt pro Frame.",
          "diagnostic": "Ohne deltaTime bewegen sich schnellere Rechner das Objekt schneller.",
          "difficulty": 3
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 5,
      "title": "Modul 5: Linux & PowerShell Befehle",
      "description": "Die wichtigsten Kommandos für Linux- und Windows-Terminals: ls, grep, chmod, Get-Process, Select-String und Pipes.",
      "icon": "Terminal",
      "content": {
        "sections": [
          {
            "title": "Linux-Grundbefehle",
            "body": [
              "ls listet Dateien, pwd zeigt das aktuelle Verzeichnis, cd wechselt Verzeichnisse. grep durchsucht Text, chmod ändert Berechtigungen."
            ]
          },
          {
            "title": "PowerShell-Cmdlets",
            "body": [
              "PowerShell verwendet Verb-Nomen-Cmdlets: Get-Process zeigt Prozesse, Select-String sucht in Text, Test-NetConnection testet Erreichbarkeit."
            ]
          },
          {
            "title": "Pipes und Filter",
            "body": [
              "Mit | leitest du Ausgabe in den nächsten Befehl: Get-Process | Where-Object {$_.CPU -gt 100} filtert Prozesse nach CPU-Verbrauch."
            ]
          },
          {
            "title": "Berechtigungen",
            "body": [
              "chmod 755 datei.exe gibt Ausführ- und Leserechte. rwx steht für read, write, execute, jeweils für Besitzer, Gruppe, Andere."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Welcher Linux-Befehl listet Dateien im aktuellen Verzeichnis?",
          "options": [
            "dir",
            "ls",
            "cat",
            "ps"
          ],
          "answer": "ls",
          "explanation": "ls listet Dateien und Verzeichnisse.",
          "diagnostic": "dir ist Windows, cat zeigt Inhalte, ps zeigt Prozesse.",
          "difficulty": 1
        },
        {
          "question": "Welcher Befehl zeigt das aktuelle Verzeichnis in Linux an?",
          "options": [
            "pwd",
            "cd",
            "ls",
            "path"
          ],
          "answer": "pwd",
          "explanation": "pwd steht für print working directory.",
          "diagnostic": "cd wechselt das Verzeichnis, ls listet, path ist kein Standard-Linux-Befehl.",
          "difficulty": 1
        },
        {
          "question": "Mit welchem PowerShell-Cmdlet kann man Prozesse anzeigen?",
          "options": [
            "tasklist",
            "ps",
            "Get-Process",
            "Show-Process"
          ],
          "answer": "Get-Process",
          "explanation": "Get-Process ist das Standard-Cmdlet für laufende Prozesse.",
          "diagnostic": "tasklist ist cmd, ps ist Linux, Show-Process existiert nicht.",
          "difficulty": 2
        },
        {
          "question": "Welcher Befehl sucht in Dateien nach einem bestimmten Text?",
          "options": [
            "find",
            "grep",
            "sort",
            "cat"
          ],
          "answer": "grep",
          "explanation": "grep durchsucht Dateien nach regulären Ausdrücken.",
          "diagnostic": "find sucht Dateien, sort sortiert, cat zeigt Inhalte.",
          "difficulty": 1
        },
        {
          "question": "Welches Cmdlet filtert in PowerShell Objekte nach Bedingungen?",
          "options": [
            "Select-String",
            "Where-Object",
            "Sort-Object",
            "ForEach-Object"
          ],
          "answer": "Where-Object",
          "explanation": "Where-Object filtert Pipeline-Objekte.",
          "diagnostic": "Select-String sucht Text, Sort-Object sortiert, ForEach-Object iteriert.",
          "difficulty": 3
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 6,
      "title": "Modul 6: SQL-Grundlagen",
      "description": "Daten lesen, filtern, verknüpfen und ändern mit SELECT, WHERE, JOIN, INSERT und UPDATE.",
      "icon": "Database",
      "content": {
        "sections": [
          {
            "title": "Daten abfragen",
            "body": [
              "SELECT spalte FROM tabelle; holt Daten. WHERE filtert Ergebnisse: SELECT * FROM users WHERE active = 1."
            ]
          },
          {
            "title": "Tabellen verknüpfen",
            "body": [
              "JOIN verbindet Tabellen über gemeinsame Spalten: SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id."
            ]
          },
          {
            "title": "Daten ändern",
            "body": [
              "INSERT fügt neue Zeilen hinzu, UPDATE ändert bestehende. DELETE entfernt Zeilen – immer mit WHERE, sonst werden alle Daten gelöscht."
            ]
          },
          {
            "title": "Primärschlüssel",
            "body": [
              "Ein Primärschlüssel (PRIMARY KEY) identifiziert jede Zeile eindeutig, meist als ID-Spalte."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Mit welcher Anweisung werden Daten aus einer Tabelle gelesen?",
          "options": [
            "INSERT",
            "SELECT",
            "UPDATE",
            "DELETE"
          ],
          "answer": "SELECT",
          "explanation": "SELECT liest Datensätze aus Tabellen.",
          "diagnostic": "INSERT fügt hinzu, UPDATE ändert, DELETE löscht.",
          "difficulty": 1
        },
        {
          "question": "Welche Klausel filtert Zeilen in einer SQL-Abfrage?",
          "options": [
            "ORDER BY",
            "WHERE",
            "GROUP BY",
            "JOIN"
          ],
          "answer": "WHERE",
          "explanation": "WHERE schränkt Ergebnisse vor der Gruppierung ein.",
          "diagnostic": "ORDER BY sortiert, GROUP BY gruppiert, JOIN verknüpft Tabellen.",
          "difficulty": 1
        },
        {
          "question": "Womit verknüpft man zwei Tabellen in SQL?",
          "options": [
            "UNION",
            "JOIN",
            "MERGE",
            "LINK"
          ],
          "answer": "JOIN",
          "explanation": "JOIN verbindet Tabellen anhand gemeinsamer Spalten.",
          "diagnostic": "UNION fügt Ergebnisse zusammen, MERGE ist spezieller, LINK gibt es nicht.",
          "difficulty": 2
        },
        {
          "question": "Welche Anweisung fügt neue Datensätze hinzu?",
          "options": [
            "UPDATE",
            "INSERT",
            "CREATE",
            "ALTER"
          ],
          "answer": "INSERT",
          "explanation": "INSERT INTO fügt Zeilen in eine Tabelle ein.",
          "diagnostic": "UPDATE ändert bestehende, CREATE/ALTER ändern das Schema.",
          "difficulty": 1
        },
        {
          "question": "Wozu dient ein Primärschlüssel?",
          "options": [
            "Sortieren",
            "Einmalige Identifikation",
            "Verschlüsseln",
            "Indexieren"
          ],
          "answer": "Einmalige Identifikation",
          "explanation": "Ein Primärschlüssel identifiziert jede Zeile eindeutig.",
          "diagnostic": "Er identifiziert Zeilen eindeutig, sortiert oder verschlüsselt nicht.",
          "difficulty": 2
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 7,
      "title": "Modul 7: IT-Sicherheit & Phishing",
      "description": "Phishing-Erkennung, E-Mail-Header, Anhänge, Multi-Faktor-Authentifizierung und Social Engineering.",
      "icon": "ShieldAlert",
      "content": {
        "sections": [
          {
            "title": "Phishing-Merkmale",
            "body": [
              "Drohende Fristen, unerwartete Anhänge, seltsame Absender, Rechtschreibfehler und Links, die nicht zum angezeigten Ziel führen, sind typische Phishing-Hinweise."
            ]
          },
          {
            "title": "Absender prüfen",
            "body": [
              "Vergleiche die tatsächliche E-Mail-Domain. support@bank.de ist etwas anderes als support@bank-secure.xyz."
            ]
          },
          {
            "title": "Anhänge",
            "body": [
              "Unerwartete .exe, .zip, .scr oder Makro-Office-Dateien sind verdächtig. Nie öffnen, wenn Absender und Kontext unklar sind."
            ]
          },
          {
            "title": "MFA",
            "body": [
              "Multi-Faktor-Authentifizierung schützt auch dann, wenn ein Passwort gestohlen wurde. Ohne zweiten Faktor kein Login."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Was ist das wichtigste Merkmal eines Phishing-Mails?",
          "options": [
            "Fehlende Signatur",
            "Dringend handeln",
            "Absender-Domain",
            "Lange E-Mail"
          ],
          "answer": "Absender-Domain",
          "explanation": "Die tatsächliche Absender-Domain verrät oft gefälschte Absender.",
          "diagnostic": "Dringend handeln kann verdächtig sein, aber die Domain ist das sicherste Indiz.",
          "difficulty": 2
        },
        {
          "question": "Wogegen schützt Multi-Faktor-Authentifizierung (MFA) primär?",
          "options": [
            "Viren",
            "Gestohlene Passwörter",
            "Datenverlust",
            "Phishing generell"
          ],
          "answer": "Gestohlene Passwörter",
          "explanation": "MFA verlangt einen zweiten Faktor, auch wenn das Passwort bekannt ist.",
          "diagnostic": "Sie stoppt Passwort-Missbrauch, aber nicht alle Phishing-Arten.",
          "difficulty": 1
        },
        {
          "question": "Wie solltest du einen unerwarteten .zip-Anhang behandeln?",
          "options": [
            "Sofort öffnen",
            "Absender kontaktieren und prüfen",
            "Antivirus ignorieren",
            "Weiterleiten"
          ],
          "answer": "Absender kontaktieren und prüfen",
          "explanation": "Unerwartete Anhänge können Schadsoftware enthalten.",
          "diagnostic": "Öffnen oder weiterleiten ist riskant; prüfen ist richtig.",
          "difficulty": 1
        },
        {
          "question": "Was bedeutet ein Schloss-Symbol im Browser?",
          "options": [
            "Seite ist vertrauenswürdig",
            "Verbindung ist verschlüsselt",
            "Kein Phishing",
            "Webseite geprüft"
          ],
          "answer": "Verbindung ist verschlüsselt",
          "explanation": "HTTPS verschlüsselt die Verbindung, garantiert aber keine Seriosität.",
          "diagnostic": "Ein Schloss bedeutet Verschlüsselung, keine Vertrauenswürdigkeit.",
          "difficulty": 2
        },
        {
          "question": "Was ist Social Engineering?",
          "options": [
            "Firewalls konfigurieren",
            "Menschen manipulieren",
            "Netzwerk scannen",
            "E-Mails verschlüsseln"
          ],
          "answer": "Menschen manipulieren",
          "explanation": "Social Engineering zielt darauf ab, Menschen zur Herausgabe von Informationen zu bewegen.",
          "diagnostic": "Es ist ein Angriff auf Menschen, nicht auf Technik.",
          "difficulty": 1
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 8,
      "title": "Modul 8: Subnetting",
      "description": "Von CIDR über Subnetzmasken zu Netzadresse, Broadcast und Hostanzahl. Das ist Prüfungsstoff für jeden Fachinformatiker.",
      "icon": "Network",
      "content": {
        "sections": [
          {
            "title": "CIDR und Subnetzmaske",
            "body": [
              "/24 bedeutet 24 Netzwerkbits = 255.255.255.0. /16 = 255.255.0.0, /8 = 255.0.0.0."
            ]
          },
          {
            "title": "Netzadresse",
            "body": [
              "Die Netzadresse entsteht, indem alle Hostbits auf 0 gesetzt werden. 192.168.1.10/24 → 192.168.1.0."
            ]
          },
          {
            "title": "Broadcast",
            "body": [
              "Die Broadcast-Adresse entsteht, indem alle Hostbits auf 1 gesetzt werden. 192.168.1.255/24."
            ]
          },
          {
            "title": "Hosts berechnen",
            "body": [
              "Hostanzahl = 2^(32 - CIDR) - 2. /24 = 254 nutzbare Hosts. /30 = 2 nutzbare Hosts."
            ]
          }
        ]
      },
      "questions": [
        {
          "question": "Wie viele nutzbare Host-Adressen hat ein /24-Netz?",
          "options": [
            "254",
            "256",
            "128",
            "512"
          ],
          "answer": "254",
          "explanation": "32-24=8 Hostbits → 2^8-2 = 254.",
          "diagnostic": "256 sind alle Adressen, abzüglich Netz- und Broadcast bleiben 254.",
          "difficulty": 2
        },
        {
          "question": "Was ist die Subnetzmaske von /30?",
          "options": [
            "255.255.255.252",
            "255.255.255.248",
            "255.255.255.240",
            "255.255.255.255"
          ],
          "answer": "255.255.255.252",
          "explanation": "/30 hat 30 Bits gesetzt, das ergibt 255.255.255.252.",
          "diagnostic": "/29 wäre 248, /28 wäre 240.",
          "difficulty": 3
        },
        {
          "question": "Welche Adresse ist die Netzadresse von 10.1.2.3/8?",
          "options": [
            "10.0.0.0",
            "10.1.0.0",
            "10.1.2.0",
            "10.255.255.255"
          ],
          "answer": "10.0.0.0",
          "explanation": "Bei /8 sind die ersten 8 Bits das Netz, also 10.0.0.0.",
          "diagnostic": "10.1.0.0 wäre /16, 10.1.2.0 wäre /24.",
          "difficulty": 3
        },
        {
          "question": "Welche Adresse ist die Broadcast-Adresse von 172.16.0.0/16?",
          "options": [
            "172.16.255.255",
            "172.16.0.255",
            "172.255.255.255",
            "172.16.0.1"
          ],
          "answer": "172.16.255.255",
          "explanation": "Bei /16 werden die unteren 16 Bits auf 1 gesetzt.",
          "diagnostic": "172.16.0.255 wäre /24-Broadcast.",
          "difficulty": 3
        },
        {
          "question": "Wie viele Hostbits bleiben bei /26?",
          "options": [
            "6",
            "26",
            "8",
            "32"
          ],
          "answer": "6",
          "explanation": "32-26 = 6 Hostbits.",
          "diagnostic": "/26 hat 26 Netzbits, also 6 Hostbits.",
          "difficulty": 2
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 9,
      "title": "Modul 9: Windows-Administration",
      "description": "Ereignisanzeige, Dienste, NTFS, Freigaben, AD-DNS, Kerberos und WinRM.",
      "icon": "MonitorCog",
      "content": {
        "sections": [
          {
            "title": "Diagnose statt Neustart",
            "body": [
              "Prüfe Ereignisanzeige, Dienste, Netzwerk und Änderungen, bevor du Systeme neu startest. Dokumentiere Ursache und Lösung."
            ]
          },
          {
            "title": "Rechte kombinieren",
            "body": [
              "Beim Netzwerkzugriff gilt die restriktivere Kombination aus Freigabe- und NTFS-Berechtigung. Gruppen sind besser wartbar als Einzelberechtigungen."
            ]
          },
          {
            "title": "AD und DNS",
            "body": [
              "Domänenclients verwenden AD-integriertes DNS, damit sie Domain Controller und Dienste über SRV-Records finden. Kerberos benötigt zusätzlich synchronisierte Zeit."
            ]
          }
        ]
      },
      "questions": [
        {
          "topic": "Windows",
          "difficulty": 2,
          "question": "Ein Windows-Dienst startet nicht. Welche Informationsquelle prüfst du zuerst?",
          "options": [
            "Bildschirmauflösung",
            "Ereignisanzeige und Dienststatus",
            "Browser-Verlauf",
            "Papierkorb"
          ],
          "answer": "Ereignisanzeige und Dienststatus",
          "explanation": "Dienststatus und Ereignisprotokoll liefern Fehlercode und Ursache.",
          "diagnostic": "Ein Neustart ohne Diagnose verwischt möglicherweise wichtige Hinweise.",
          "misconception": "Diagnosereihenfolge"
        },
        {
          "topic": "Berechtigungen",
          "difficulty": 3,
          "type": "scenario",
          "question": "Ein Benutzer hat auf der Freigabe „Ändern“, über NTFS aber nur „Lesen“. Was gilt beim Netzwerkzugriff?",
          "options": [
            "Ändern",
            "Lesen",
            "Vollzugriff",
            "Keine Berechtigung"
          ],
          "answer": "Lesen",
          "explanation": "Die restriktivere effektive Berechtigung setzt sich durch.",
          "diagnostic": "Freigabe- und NTFS-Rechte werden kombiniert; hier ist NTFS Lesen restriktiver.",
          "misconception": "Effektive Rechte"
        },
        {
          "topic": "Active Directory",
          "difficulty": 3,
          "type": "scenario",
          "question": "Warum sollten Domänenclients normalerweise den Domain Controller als DNS-Server verwenden?",
          "options": [
            "Schnelleres WLAN",
            "AD-Dienste über DNS finden",
            "SMB verschlüsseln",
            "DHCP ersetzen"
          ],
          "answer": "AD-Dienste über DNS finden",
          "explanation": "Clients finden LDAP, Kerberos und Domain Controller über DNS-SRV-Records.",
          "diagnostic": "AD ist eng an DNS gebunden; öffentliche DNS-Server kennen interne SRV-Records nicht.",
          "misconception": "AD-DNS"
        },
        {
          "topic": "Active Directory",
          "difficulty": 4,
          "question": "Kerberos-Anmeldungen schlagen trotz korrektem Passwort sporadisch fehl. Was sollte geprüft werden?",
          "options": [
            "Zeitsynchronisation",
            "Bildschirmhelligkeit",
            "Druckerwarteschlange",
            "Dateiendung"
          ],
          "answer": "Zeitsynchronisation",
          "explanation": "Kerberos toleriert nur eine begrenzte Zeitabweichung.",
          "diagnostic": "Kerberos-Tickets sind zeitabhängig.",
          "misconception": "Kerberos"
        },
        {
          "topic": "PowerShell",
          "difficulty": 3,
          "type": "free",
          "question": "Welches PowerShell-Cmdlet testet einen TCP-Port zu einem Ziel?",
          "options": [],
          "answer": "Test-NetConnection",
          "acceptedAnswers": [
            "test-netconnection"
          ],
          "explanation": "Test-NetConnection prüft Erreichbarkeit und mit -Port auch TCP-Ports.",
          "diagnostic": "Gesucht ist Test-NetConnection.",
          "hint": "Das Cmdlet folgt dem Verb-Nomen-Muster Test-Net…",
          "misconception": "Cmdlet-Syntax"
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 10,
      "title": "Modul 10: Linux-Administration",
      "description": "systemd, Journald, Benutzer, sudo, Prozesse, Signale, Speicher und Mounts.",
      "icon": "TerminalSquare",
      "content": {
        "sections": [
          {
            "title": "Dienste und Logs",
            "body": [
              "systemctl status zeigt Dienstzustand, journalctl -u den zugehörigen Journal-Log. Logs werden vor Änderungen geprüft."
            ]
          },
          {
            "title": "Benutzer und Rechte",
            "body": [
              "sudo vergibt gezielte administrative Rechte. chmod, chown und Gruppen steuern Dateizugriff nach dem Least-Privilege-Prinzip."
            ]
          },
          {
            "title": "Ressourcen",
            "body": [
              "df -h zeigt Dateisystembelegung, du -sh Verzeichnisgrößen, free -h Arbeitsspeicher und Swap."
            ]
          }
        ]
      },
      "questions": [
        {
          "topic": "Linux",
          "difficulty": 2,
          "type": "free",
          "question": "Welcher Befehl zeigt unter systemd den Status des Dienstes nginx?",
          "options": [],
          "answer": "systemctl status nginx",
          "explanation": "systemctl status nginx zeigt Zustand und letzte Logzeilen.",
          "diagnostic": "Verwende systemctl status gefolgt vom Dienstnamen.",
          "hint": "systemctl status …",
          "misconception": "systemd"
        },
        {
          "topic": "Linux",
          "difficulty": 3,
          "type": "free",
          "question": "Welcher Befehl zeigt die Logs des Dienstes ssh?",
          "options": [],
          "answer": "journalctl -u ssh",
          "acceptedAnswers": [
            "journalctl -u sshd"
          ],
          "explanation": "journalctl -u filtert nach einer systemd-Unit.",
          "diagnostic": "Gesucht ist journalctl mit dem Unit-Filter -u.",
          "hint": "journalctl -u …",
          "misconception": "Logs"
        },
        {
          "topic": "Linux",
          "difficulty": 3,
          "question": "Was bedeutet chmod 750 script.sh?",
          "options": [
            "Besitzer rwx, Gruppe r-x, andere keine Rechte",
            "Alle Vollzugriff",
            "Besitzer nur Lesen",
            "Gruppe darf Schreiben"
          ],
          "answer": "Besitzer rwx, Gruppe r-x, andere keine Rechte",
          "explanation": "7=rwx, 5=r-x, 0=---.",
          "diagnostic": "Wandle jede Oktalziffer einzeln in rwx um.",
          "misconception": "Dateirechte"
        },
        {
          "topic": "Linux",
          "difficulty": 2,
          "type": "scenario",
          "question": "Das Root-Dateisystem ist fast voll. Welche Kombination hilft bei der Ursachenanalyse?",
          "options": [
            "df -h und du -sh",
            "ping und traceroute",
            "chmod und chown",
            "ps und kill"
          ],
          "answer": "df -h und du -sh",
          "explanation": "df zeigt Dateisysteme, du den Platzverbrauch von Verzeichnissen.",
          "diagnostic": "Für Speicherplatz brauchst du df und du.",
          "misconception": "Speicherdiagnose"
        },
        {
          "topic": "Linux",
          "difficulty": 4,
          "question": "Welches Signal bittet einen Prozess regulär um Beendigung?",
          "options": [
            "SIGTERM",
            "SIGKILL",
            "SIGHUP",
            "SIGSTOP"
          ],
          "answer": "SIGTERM",
          "explanation": "SIGTERM erlaubt geordnetes Aufräumen; SIGKILL erzwingt sofortiges Ende.",
          "diagnostic": "SIGKILL ist nur die letzte Eskalationsstufe.",
          "misconception": "Prozesssignale"
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 11,
      "title": "Modul 11: Backup & Infrastruktur",
      "description": "3-2-1-Regel, Restore-Tests, RAID, Virtualisierung, USV, RPO und RTO.",
      "icon": "HardDriveDownload",
      "content": {
        "sections": [
          {
            "title": "Backup-Strategie",
            "body": [
              "3-2-1 bedeutet drei Kopien, zwei Medientypen, eine Kopie extern oder offline. Ein Backup ist erst verlässlich, wenn der Restore getestet wurde."
            ]
          },
          {
            "title": "RPO und RTO",
            "body": [
              "RPO beschreibt maximal tolerierbaren Datenverlust in Zeit, RTO die maximal tolerierbare Wiederherstellungsdauer."
            ]
          },
          {
            "title": "RAID und Verfügbarkeit",
            "body": [
              "RAID kann Hardwareausfälle abfedern, schützt aber nicht vor Löschen, Ransomware, Fehlkonfiguration oder Standortverlust."
            ]
          }
        ]
      },
      "questions": [
        {
          "topic": "Backup",
          "difficulty": 2,
          "question": "Warum ist RAID kein Backup?",
          "options": [
            "RAID ist langsam",
            "Es schützt nicht vor Löschen, Ransomware oder logischen Fehlern",
            "Es funktioniert nur unter Linux",
            "Es speichert keine Dateien"
          ],
          "answer": "Es schützt nicht vor Löschen, Ransomware oder logischen Fehlern",
          "explanation": "RAID erhöht Verfügbarkeit, ersetzt aber keine getrennte Kopie.",
          "diagnostic": "Hardware-Redundanz schützt nicht vor logischem Datenverlust.",
          "misconception": "RAID"
        },
        {
          "topic": "Backup",
          "difficulty": 2,
          "question": "Was bedeutet die 3-2-1-Regel?",
          "options": [
            "3 Kopien, 2 Medientypen, 1 extern",
            "3 Server, 2 Switches, 1 Router",
            "3 Nutzer, 2 Admins, 1 Passwort",
            "3 Tage, 2 Tests, 1 Restore"
          ],
          "answer": "3 Kopien, 2 Medientypen, 1 extern",
          "explanation": "Die Regel reduziert gemeinsame Ausfallursachen.",
          "diagnostic": "Es geht um Kopien, unterschiedliche Medien und einen externen Standort.",
          "misconception": "Backup-Strategie"
        },
        {
          "topic": "Backup",
          "difficulty": 3,
          "question": "Wofür steht RPO?",
          "options": [
            "Maximal tolerierbarer Datenverlust in Zeit",
            "Wiederherstellungsdauer",
            "Anzahl der Backups",
            "Netzwerkgeschwindigkeit"
          ],
          "answer": "Maximal tolerierbarer Datenverlust in Zeit",
          "explanation": "RPO bestimmt, wie viel Datenverlust zeitlich akzeptabel ist.",
          "diagnostic": "RTO ist die Dauer; RPO ist der Datenverlust-Zeitraum.",
          "misconception": "RPO-RTO"
        },
        {
          "topic": "Backup",
          "difficulty": 3,
          "type": "scenario",
          "question": "Ein Backupjob ist täglich grün. Welche Maßnahme beweist am besten, dass das Backup nutzbar ist?",
          "options": [
            "Restore regelmäßig testen",
            "Mehr Speicher kaufen",
            "Logdatei löschen",
            "RAID-Level erhöhen"
          ],
          "answer": "Restore regelmäßig testen",
          "explanation": "Nur ein erfolgreicher Wiederherstellungstest validiert Backup und Verfahren.",
          "diagnostic": "Ein erfolgreicher Job garantiert keinen funktionierenden Restore.",
          "misconception": "Restore-Test"
        },
        {
          "topic": "Infrastruktur",
          "difficulty": 3,
          "question": "Welche Aufgabe hat eine USV?",
          "options": [
            "Kurzzeitige Stromversorgung und geordnetes Herunterfahren",
            "Backups ersetzen",
            "DNS beschleunigen",
            "Viren entfernen"
          ],
          "answer": "Kurzzeitige Stromversorgung und geordnetes Herunterfahren",
          "explanation": "Eine USV überbrückt Ausfälle und schützt vor abruptem Stromverlust.",
          "diagnostic": "Eine USV dient Stromversorgung und Schutz, nicht Datensicherung.",
          "misconception": "USV"
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 12,
      "title": "Modul 12: Monitoring & Incident Response",
      "description": "Metriken, Logs, Baselines, Alerts, Triage und nachvollziehbare Reaktion auf Vorfälle.",
      "icon": "Activity",
      "content": {
        "sections": [
          {
            "title": "Metriken im Kontext",
            "body": [
              "Ein einzelner hoher Wert ist selten genug. Trend, Baseline, Paging, Prozesse, Nutzerlast und Änderungen liefern Kontext."
            ]
          },
          {
            "title": "Gute Alerts",
            "body": [
              "Alerts müssen handlungsfähig sein: betroffenes System, Schwellenwert, Zeitraum, Auswirkung und Runbook."
            ]
          },
          {
            "title": "Incident Response",
            "body": [
              "Erkennen, eindämmen, Beweise sichern, Ursache beseitigen, wiederherstellen und nachbereiten. Änderungen werden dokumentiert."
            ]
          }
        ]
      },
      "questions": [
        {
          "topic": "Monitoring",
          "difficulty": 3,
          "type": "scenario",
          "question": "Ein Server zeigt 95 % RAM-Auslastung. Welche Zusatzinformation ist am wichtigsten?",
          "options": [
            "Paging/Swap, Prozesse und zeitlicher Verlauf",
            "Bildschirmauflösung",
            "Hostname allein",
            "Anzahl der Drucker"
          ],
          "answer": "Paging/Swap, Prozesse und zeitlicher Verlauf",
          "explanation": "Hohe Cache-Nutzung kann normal sein; Kontext zeigt tatsächlichen Druck.",
          "diagnostic": "Ein Prozentwert ohne Trend und Prozessdaten reicht nicht.",
          "misconception": "Metrik-Kontext"
        },
        {
          "topic": "Monitoring",
          "difficulty": 3,
          "question": "Was macht einen Alert handlungsfähig?",
          "options": [
            "Kontext, Auswirkung und Runbook",
            "Viele Großbuchstaben",
            "Sehr niedriger Schwellenwert",
            "Keine Dokumentation"
          ],
          "answer": "Kontext, Auswirkung und Runbook",
          "explanation": "Ein guter Alert hilft direkt bei Priorisierung und Diagnose.",
          "diagnostic": "Lärm ohne Kontext führt zu Alert Fatigue.",
          "misconception": "Alerting"
        },
        {
          "topic": "IT-Sicherheit",
          "difficulty": 4,
          "type": "scenario",
          "question": "Du findest einen unbekannten lokalen Admin-Account. Was ist der erste sinnvolle Schritt?",
          "options": [
            "Account eindämmen und Vorfall nachvollziehbar untersuchen",
            "Alle Logs löschen",
            "Ignorieren",
            "Passwort öffentlich teilen"
          ],
          "answer": "Account eindämmen und Vorfall nachvollziehbar untersuchen",
          "explanation": "Eindämmung begrenzt Schaden; Logs und Beweise bleiben erhalten.",
          "diagnostic": "Beweise dürfen nicht gelöscht und der Vorfall nicht ignoriert werden.",
          "misconception": "Incident Response"
        },
        {
          "topic": "Monitoring",
          "difficulty": 2,
          "question": "Was ist eine Baseline?",
          "options": [
            "Normalzustand eines Systems über Zeit",
            "Ein einzelner Höchstwert",
            "Backup-Datei",
            "Administratorpasswort"
          ],
          "answer": "Normalzustand eines Systems über Zeit",
          "explanation": "Baselines machen Abweichungen erkennbar.",
          "diagnostic": "Eine Baseline beschreibt typisches Verhalten, nicht einen Einzelwert.",
          "misconception": "Baseline"
        },
        {
          "topic": "IT-Sicherheit",
          "difficulty": 3,
          "question": "Welche Reihenfolge ist für einen Vorfall sinnvoll?",
          "options": [
            "Erkennen, eindämmen, beseitigen, wiederherstellen, nachbereiten",
            "Löschen, ignorieren, neu starten",
            "Wiederherstellen, erkennen, eindämmen",
            "Nachbereiten, erkennen, löschen"
          ],
          "answer": "Erkennen, eindämmen, beseitigen, wiederherstellen, nachbereiten",
          "explanation": "Diese Reihenfolge schützt Betrieb und Beweislage.",
          "diagnostic": "Zuerst erkennen und eindämmen, dann Ursache beseitigen und sauber wiederherstellen.",
          "misconception": "Incident-Phasen"
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 13,
      "title": "Modul 13: Admin-Automatisierung",
      "description": "PowerShell, Bash, JSON, APIs, Idempotenz, Logging und robuste Fehlerbehandlung.",
      "icon": "Workflow",
      "content": {
        "sections": [
          {
            "title": "Idempotenz",
            "body": [
              "Ein idempotentes Script erzeugt bei wiederholter Ausführung denselben gewünschten Zustand, ohne Daten doppelt anzulegen."
            ]
          },
          {
            "title": "Strukturierte Daten",
            "body": [
              "CSV eignet sich für Tabellen, JSON für verschachtelte Daten und APIs. PowerShell arbeitet in Pipelines mit Objekten statt nur Text."
            ]
          },
          {
            "title": "Sichere Automatisierung",
            "body": [
              "Secrets gehören nicht in Quellcode oder Logs. Eingaben validieren, Fehlergrenzen definieren und Änderungen nachvollziehbar protokollieren."
            ]
          }
        ]
      },
      "questions": [
        {
          "topic": "Automatisierung",
          "difficulty": 3,
          "question": "Was bedeutet idempotente Automatisierung?",
          "options": [
            "Wiederholte Ausführung führt zum selben Zielzustand",
            "Script läuft nur einmal",
            "Script braucht kein Logging",
            "Jeder Lauf erzeugt neue Benutzer"
          ],
          "answer": "Wiederholte Ausführung führt zum selben Zielzustand",
          "explanation": "Idempotenz macht Wiederholungen sicher und vorhersehbar.",
          "diagnostic": "Ein idempotenter Lauf dupliziert keine Ressourcen.",
          "misconception": "Idempotenz"
        },
        {
          "topic": "PowerShell",
          "difficulty": 3,
          "question": "Was fließt in einer PowerShell-Pipeline hauptsächlich zwischen Cmdlets?",
          "options": [
            "Objekte",
            "Nur Textzeilen",
            "Dateien",
            "Passwörter"
          ],
          "answer": "Objekte",
          "explanation": "PowerShell-Pipelines übertragen typisierte Objekte.",
          "diagnostic": "Anders als klassische Shells ist PowerShell objektorientiert.",
          "misconception": "Pipeline"
        },
        {
          "topic": "Automatisierung",
          "difficulty": 2,
          "question": "Welches Format eignet sich gut für verschachtelte API-Daten?",
          "options": [
            "JSON",
            "BMP",
            "TXT ohne Struktur",
            "EXE"
          ],
          "answer": "JSON",
          "explanation": "JSON bildet Objekte und Arrays ab und ist API-Standard.",
          "diagnostic": "CSV ist eher tabellarisch; JSON kann verschachteln.",
          "misconception": "Datenformat"
        },
        {
          "topic": "IT-Sicherheit",
          "difficulty": 3,
          "type": "scenario",
          "question": "Wo sollte ein API-Schlüssel für ein Admin-Script gespeichert werden?",
          "options": [
            "Secret Store oder geschützte Umgebungsvariable",
            "Direkt im Git-Repository",
            "Im öffentlichen Log",
            "Als Kommentar"
          ],
          "answer": "Secret Store oder geschützte Umgebungsvariable",
          "explanation": "Secrets werden getrennt vom Code und zugriffsgeschützt verwaltet.",
          "diagnostic": "Secrets dürfen nicht im Repository oder Log landen.",
          "misconception": "Secrets"
        },
        {
          "topic": "Automatisierung",
          "difficulty": 4,
          "question": "Warum sollte ein Script strukturierte Logs mit Zeit, Aktion und Ergebnis schreiben?",
          "options": [
            "Für Diagnose, Audit und Wiederholbarkeit",
            "Damit es langsamer läuft",
            "Als Passwortspeicher",
            "Um Backups zu ersetzen"
          ],
          "answer": "Für Diagnose, Audit und Wiederholbarkeit",
          "explanation": "Strukturierte Logs zeigen, was wann mit welchem Ergebnis geschah.",
          "diagnostic": "Logging unterstützt Betrieb und Nachvollziehbarkeit.",
          "misconception": "Logging"
        }
      ]
    },
    {
      "faculty_id": "it",
      "order_index": 14,
      "title": "Modul 14: Datenbank-Administration",
      "description": "Indizes, Transaktionen, Constraints, Rechte, Backups, SQL-Injection und Abfragepläne.",
      "icon": "DatabaseZap",
      "content": {
        "sections": [
          {
            "title": "Konsistenz",
            "body": [
              "Transaktionen fassen Änderungen atomar zusammen. Constraints wie PRIMARY KEY, FOREIGN KEY und UNIQUE sichern Regeln in der Datenbank."
            ]
          },
          {
            "title": "Performance",
            "body": [
              "Indizes beschleunigen passende Lesezugriffe, kosten aber Speicher und Schreibaufwand. Abfragepläne zeigen, ob Indizes genutzt werden."
            ]
          },
          {
            "title": "Sicherheit",
            "body": [
              "Parametrisierte Abfragen verhindern SQL-Injection. Datenbanknutzer erhalten nur benötigte Rechte. Backups müssen wiederhergestellt getestet werden."
            ]
          }
        ]
      },
      "questions": [
        {
          "topic": "Datenbanken",
          "difficulty": 3,
          "question": "Welchen Zweck hat eine Transaktion?",
          "options": [
            "Änderungen atomar zusammenfassen",
            "Passwörter verschlüsseln",
            "DNS auflösen",
            "Dateien komprimieren"
          ],
          "answer": "Änderungen atomar zusammenfassen",
          "explanation": "Entweder werden alle Änderungen übernommen oder keine.",
          "diagnostic": "Transaktionen schützen Konsistenz bei mehreren zusammengehörigen Änderungen.",
          "misconception": "Transaktion"
        },
        {
          "topic": "Datenbanken",
          "difficulty": 3,
          "question": "Was ist ein typischer Nachteil zusätzlicher Indizes?",
          "options": [
            "Mehr Speicher und langsamere Schreibvorgänge",
            "SELECT funktioniert nicht",
            "Tabellen verlieren Zeilen",
            "Backups werden unmöglich"
          ],
          "answer": "Mehr Speicher und langsamere Schreibvorgänge",
          "explanation": "Indizes müssen bei INSERT, UPDATE und DELETE gepflegt werden.",
          "diagnostic": "Indizes beschleunigen Lesen, haben aber Kosten beim Schreiben.",
          "misconception": "Index"
        },
        {
          "topic": "Datenbanken",
          "difficulty": 3,
          "question": "Wie verhindert Anwendungscode SQL-Injection am zuverlässigsten?",
          "options": [
            "Parametrisierte Abfragen",
            "SQL per String zusammensetzen",
            "Fehler verstecken",
            "Tabellennamen kürzen"
          ],
          "answer": "Parametrisierte Abfragen",
          "explanation": "Parameter trennen Daten von SQL-Code.",
          "diagnostic": "Stringverkettung ermöglicht eingeschleusten SQL-Code.",
          "misconception": "SQL-Injection"
        },
        {
          "topic": "Datenbanken",
          "difficulty": 3,
          "type": "scenario",
          "question": "Eine Abfrage wird bei wachsender Tabelle langsam. Was prüfst du zuerst?",
          "options": [
            "Abfrageplan und passende Indizes",
            "Bildschirmauflösung",
            "DNS-Cache",
            "Mausgeschwindigkeit"
          ],
          "answer": "Abfrageplan und passende Indizes",
          "explanation": "Der Plan zeigt Scans, Joins und Indexnutzung.",
          "diagnostic": "Performance wird mit Ausführungsplan und Datenverteilung untersucht.",
          "misconception": "Query-Plan"
        },
        {
          "topic": "Datenbanken",
          "difficulty": 4,
          "question": "Welches Prinzip gilt für Datenbankkonten von Anwendungen?",
          "options": [
            "Nur minimal benötigte Rechte",
            "Immer DBA-Rechte",
            "Keine Passwörter",
            "Gemeinsamer Root-Account"
          ],
          "answer": "Nur minimal benötigte Rechte",
          "explanation": "Least Privilege begrenzt Schäden bei Fehlern oder Kompromittierung.",
          "diagnostic": "Anwendungen brauchen selten administrative Datenbankrechte.",
          "misconception": "Least Privilege"
        }
      ]
    }
  ],
  "cheats": [
    {
      "category": "git",
      "title": "Repository klonen",
      "syntax": "git clone <url>",
      "tags": [
        "clone",
        "repo"
      ]
    },
    {
      "category": "git",
      "title": "Stagen und committen",
      "syntax": "git add . && git commit -m \"nachricht\"",
      "tags": [
        "add",
        "commit"
      ]
    },
    {
      "category": "git",
      "title": "Auf Remote pushen",
      "syntax": "git push origin main",
      "tags": [
        "push",
        "remote"
      ]
    },
    {
      "category": "git",
      "title": "Neueste Änderungen ziehen",
      "syntax": "git pull origin main",
      "tags": [
        "pull"
      ]
    },
    {
      "category": "git",
      "title": "Status anzeigen",
      "syntax": "git status",
      "tags": [
        "status"
      ]
    },
    {
      "category": "git",
      "title": "Branch erstellen und wechseln",
      "syntax": "git checkout -b feature-x",
      "tags": [
        "branch"
      ]
    },
    {
      "category": "cisco",
      "title": "Running-Config anzeigen",
      "syntax": "show running-config",
      "tags": [
        "show",
        "config"
      ]
    },
    {
      "category": "cisco",
      "title": "Interfaces anzeigen",
      "syntax": "show ip interface brief",
      "tags": [
        "interface"
      ]
    },
    {
      "category": "cisco",
      "title": "Globalen Konfigurationsmodus betreten",
      "syntax": "configure terminal",
      "tags": [
        "config"
      ]
    },
    {
      "category": "cisco",
      "title": "Hostname setzen",
      "syntax": "hostname R1",
      "tags": [
        "hostname"
      ]
    },
    {
      "category": "unity",
      "title": "Component holen",
      "syntax": "GetComponent<Rigidbody>()",
      "tags": [
        "component",
        "get"
      ]
    },
    {
      "category": "unity",
      "title": "Objekt per Tag finden",
      "syntax": "GameObject.FindWithTag(\"Player\")",
      "tags": [
        "find",
        "tag"
      ]
    },
    {
      "category": "unity",
      "title": "Objekt zerstören",
      "syntax": "Destroy(gameObject)",
      "tags": [
        "destroy"
      ]
    },
    {
      "category": "unity",
      "title": "Prefab instanziieren",
      "syntax": "Instantiate(prefab, position, rotation)",
      "tags": [
        "instantiate"
      ]
    },
    {
      "category": "bash",
      "title": "Dateien auflisten",
      "syntax": "ls -la",
      "tags": [
        "list"
      ]
    },
    {
      "category": "bash",
      "title": "Verzeichnis wechseln",
      "syntax": "cd /pfad",
      "tags": [
        "cd"
      ]
    },
    {
      "category": "bash",
      "title": "Aktuelles Verzeichnis anzeigen",
      "syntax": "pwd",
      "tags": [
        "pwd"
      ]
    },
    {
      "category": "bash",
      "title": "Per SSH auf Server verbinden",
      "syntax": "ssh user@host",
      "tags": [
        "ssh"
      ]
    },
    {
      "category": "windows",
      "title": "IP-Konfiguration",
      "syntax": "ipconfig /all",
      "tags": [
        "ip",
        "network"
      ]
    },
    {
      "category": "windows",
      "title": "Konnektivität testen",
      "syntax": "ping 8.8.8.8",
      "tags": [
        "ping"
      ]
    },
    {
      "category": "windows",
      "title": "DNS-Abfrage",
      "syntax": "nslookup example.com",
      "tags": [
        "dns"
      ]
    },
    {
      "category": "windows",
      "title": "Gruppenrichtlinie aktualisieren",
      "syntax": "gpupdate /force",
      "tags": [
        "gpo"
      ]
    },
    {
      "category": "bash",
      "title": "Dateien finden",
      "syntax": "find /pfad -name \"*.log\"",
      "tags": [
        "find"
      ]
    },
    {
      "category": "bash",
      "title": "Prozesse anzeigen",
      "syntax": "ps aux | grep apache",
      "tags": [
        "ps",
        "process"
      ]
    },
    {
      "category": "bash",
      "title": "Berechtigungen ändern",
      "syntax": "chmod 755 script.sh",
      "tags": [
        "chmod",
        "permissions"
      ]
    },
    {
      "category": "powershell",
      "title": "Prozesse filtern",
      "syntax": "Get-Process | Where-Object {$_.CPU -gt 100}",
      "tags": [
        "process",
        "filter"
      ]
    },
    {
      "category": "powershell",
      "title": "Netzwerk-Test",
      "syntax": "Test-NetConnection -ComputerName google.de -Port 443",
      "tags": [
        "network",
        "test"
      ]
    },
    {
      "category": "powershell",
      "title": "In Dateien suchen",
      "syntax": "Select-String -Path \"*.log\" -Pattern \"Fehler\"",
      "tags": [
        "search",
        "text"
      ]
    },
    {
      "category": "sql",
      "title": "Daten abfragen",
      "syntax": "SELECT * FROM users WHERE active = 1;",
      "tags": [
        "select"
      ]
    },
    {
      "category": "sql",
      "title": "Tabellen verknüpfen",
      "syntax": "SELECT * FROM orders JOIN customers ON orders.cid = customers.id;",
      "tags": [
        "join"
      ]
    },
    {
      "category": "sql",
      "title": "Zeile einfügen",
      "syntax": "INSERT INTO users (name, email) VALUES (\"Max\", \"max@example.de\");",
      "tags": [
        "insert"
      ]
    }
  ]
};
