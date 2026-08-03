# CyberLearn – Ideale Player Journey: Die ersten 2 Stunden

**Ziel:** Der Spieler soll nach zwei Stunden denken: „Ich verstehe, wie ein Administrator Probleme angeht. Ich kann das."

**Kernprinzipien für diese Journey:**

- Keine Überforderung. Nie.
- Ein Konzept pro Hauptmission.
- Mentor führt den Denkprozess, nicht die Lösung.
- Sofortiges Feedback nach jeder Aktion.
- Sichtbarer Fortschritt in Kompetenzen, nicht in XP.
- Jede Minute ein kleiner Erfolg.

---

## Minute 0–2: „Das ist mein Arbeitsplatz"

**Was passiert:**

- App startet. Kurzer Einblendtext: „Willkommen bei NEXUS Systems. Du beginnst heute als IT-Trainee."
- Der Spieler sieht sofort seinen Arbeitsplatz (Mitte). Kein Dashboard, kein Menü, keine Zahlen.
- Ein freundlicher Senior-Administrator namens **Sam** erscheint als Dialog:
  > „Guten Morgen. Ich bin Sam, dein Mentor. Bevor wir anfangen: Schau dich einmal um. Dein PC, dein Telefon, dein Notizheft und das Terminal sind deine wichtigsten Werkzeuge. Tippe drauf, wenn du neugierig bist."

**Emotion:**

- Neugier, keine Angst.
- Der Spieler fühlt sich willkommen, nicht getestet.

**Konzept:**

- Kein Fachwissen.
- Er lernt nur die vier Werkzeuge kennen.

**Flow:**

- Keine Entscheidung nötig.
- Er kann frei herumtippen und bekommt überall kurze, nette Erklärungen.
- Kein Fehler möglich.

**Kernvision:**

- Arbeitsplatz als sicherer, vertrauter Ort.
- Lernen durch Entdecken statt Erklären.

---

## Minute 2–5: „Sam stellt die erste Frage"

**Was passiert:**

- Sam kommt zurück:
  > „Gut. Jetzt weißt du, wo deine Werkzeuge sind. Bevor wir ein echtes Ticket lösen, üben wir einmal den wichtigsten Satz eines Administrators: **Was wissen wir?**"
- Ein Mini-Dialog startet. Sam stellt Fragen:
  - „Ein Benutzer sagt: Ich habe kein Internet. Was fragst du zuerst?"
  - Optionen:
    - „Wer ist der Benutzer?"
    - „Welchen PC hat er?"
    - „Was genau geht nicht?"
    - „Hast du schon alles probiert?" (humorvoll falsch)
- Jede richtige Option wird von Sam bestätigt:
  > „Genau. Bevor ich irgendetwas ändere, muss ich wissen, wen und was ich betreue. Das ist der erste Schritt in jedem Ticket."

**Emotion:**

- Stolz, weil man etwas Richtiges getan hat.
- Sicherheit durch positives Feedback.

**Konzept:**

- **Strukturierte Diagnose:** Symptom → Information sammeln → Hypothese.
- Noch kein technisches Detail.

**Flow:**

- Kurze Antworten, sofortiges Feedback.
- Keine Zeitdruck.
- Man kann nicht wirklich falsch liegen.

**Kernvision:**

- Mentor trainiert Denkprozess, nicht Lösung.
- Spieler merkt: Ich muss Fragen stellen, bevor ich handle.

---

## Minute 5–8: „Das erste echte Ticket"

**Was passiert:**

- Eine E-Mail poppt auf:
  > **Von:** Greta Müller (Buchhaltung)  
  > **Betreff:** Kein Internet  
  > „Hallo IT, ich komme seit heute Morgen nicht ins Internet. Ich sitze an PC-BUCH-01. Grüße, Greta"
- Sam erscheint:
  > „Okay, das ist dein erstes Ticket. Lass uns zusammen denken. Was wissen wir jetzt?"
- Der Spieler bekommt drei Optionen:
  - „Wir wissen den Namen und den PC." (richtig)
  - „Wir wissen, dass das Internet kaputt ist." (zu vage)
  - „Wir wissen, dass Greta nichts versteht." (humorvoll falsch)
- Nach der richtigen Antwort:
  > „Richtig. Name, Abteilung, PC-Name. Das sind die ersten drei Dinge, die wir brauchen. Jetzt öffnen wir das Verzeichnis."

**Emotion:**

- Leichte Spannung, aber durch Sam beruhigt.
- Motivation, weil ein echtes Problem da ist.

**Konzept:**

- Ein Ticket hat mindestens drei Bestandteile: **Wer, Was, Wo.**
- Verzeichnis als erste Informationsquelle.

**Flow:**

- Klares Ziel: Ticket verstehen.
- Sofortige Bestätigung.
- Kein Rätsel, weil alle Infos in der E-Mail stehen.

**Kernvision:**

- Echte Tickets, aber klar strukturiert.
- Spieler lernt, Informationen zu sammeln, bevor er handelt.

---

## Minute 8–12: „Das Verzeichnis und die IP"

**Was passiert:**

- Der Spieler öffnet das Verzeichnis (linker Bereich).
- Er sieht Greta Müller und PC-BUCH-01 mit IP 192.168.10.47.
- Sam:
  > „Jeder PC in unserem Netzwerk hat eine IP-Adresse. Stell dir das wie eine Adresse vor. Wenn wir wissen, wo der PC ist, können wir ihn gezielt erreichen."
- Der Spieler tippt auf PC-BUCH-01.
- Es erscheint ein kurzer Info-Text:
  > „IP-Adresse: 192.168.10.47  
  Gateway: 192.168.10.1  
  DNS: 192.168.10.10"
- Sam:
  > „Gut. Bevor wir Greta helfen, müssen wir herausfinden, ob ihr PC überhaupt eine richtige Adresse hat. Dafür nutzen wir das Terminal."

**Emotion:**

- Interesse.
- Man versteht langsam, worum es geht.

**Konzept:**

- IP-Adresse, Gateway, DNS als grundlegende Netzwerkbegriffe.
- Verzeichnis als Quelle für gezielte Informationen.

**Flow:**

- Kein Überflutung mit Begriffen.
- Jeder Begriff wird erst eingeführt, wenn er gebraucht wird.
- Visueller Anker: Verzeichnis zeigt konkrete Daten.

**Kernvision:**

- Wissen wird im Moment des Bedarfs vermittelt (Just-in-Time-Learning).
- Kein Wiki-Frontalunterricht.

---

## Minute 12–20: „Erste Hauptmission: DHCP/APIPA"

**Was passiert:**

- Der Spieler öffnet die Mission „Der erste Arbeitstag".
- Oben sieht er eine **Diagnose-Checkliste**:
  1. Kabel und Link-LED prüfen
  2. IP-Konfiguration mit ipconfig prüfen
  3. Problem erkennen (APIPA = kein DHCP-Lease)
  4. Neuen Lease anfordern
  5. Verbindung testen
- Sam steht neben der Checkliste:
  > „Wir gehen das Schritt für Schritt durch. Du musst nicht alles wissen. Du musst nur bereit sein, die nächste Frage zu stellen."

### Schritt 1: Kabel prüfen

- Dialog mit Greta:
  > „Ich habe nichts angefasst, aber die kleine Lampe am Netzwerkkabel ist aus."
- Sam:
  > „Die Lampe nennt man **Link-LED**. Wenn sie aus ist, haben wir kein Kabel oder keinen Link zum Switch. Was ist also die Hypothese?"
- Optionen:
  - „Kein Netzwerk-Link." (richtig)
  - „Der PC ist kaputt." (zu früh)
  - „Das Internet ist ausgefallen." (zu groß)

### Schritt 2: ipconfig ausführen

- Das Terminal öffnet sich mit einem vorausgefüllten Befehl: `ipconfig /all`
- Der Spieler tippt auf „Ausführen".
- Ausgabe:
  ```
  IPv4-Adresse: 169.254.31.8
  Subnetzmaske: 255.255.0.0
  Standardgateway:
  DHCP aktiviert: Ja
  ```
- Sam:
  > „Schau mal: Die IP fängt mit 169.254 an. Das ist keine normale Firmen-IP. Das nennt man **APIPA**. Es bedeutet: Der PC hat keinen DHCP-Server erreicht und hat sich selbst eine Adresse gegeben."
- Frage:
  > „Was ist also das Problem?"
  - „Kein DHCP-Lease." (richtig)
  - „DNS funktioniert nicht." (noch nicht relevant)
  - „Virus." (falsch)

### Schritt 3: Lösung anwenden

- Der Spieler wählt `ipconfig /renew` im Terminal.
- Das Spiel zeigt:
  > „Neue IP: 192.168.10.47 – zurück im richtigen Netzwerk."

### Schritt 4: Testen

- Spieler pingt Gateway und DNS.
- Alles grün.
- Mission abgeschlossen.

**Emotion:**

- Erleichterung, Stolz.
- „Ich habe das verstanden."

**Konzept:**

- DHCP, APIPA, IP-Konfiguration, Link-LED, ipconfig /all, ipconfig /renew, ping.
- Aber nicht als trockene Liste, sondern als Geschichte.

**Flow:**

- Jeder Schritt ist klar abgegrenzt.
- Checkliste zeigt Fortschritt.
- Sam gibt Sicherheit.
- Kein Ratlosigkeit, weil jeder Schritt logisch auf den vorherigen folgt.

**Kernvision:**

- Ein Konzept pro Mission.
- Denkprozess: Symptom → Info → Hypothese → Lösung → Test.
- Mentor unterstützt, nicht belehrt.

---

## Minute 20–22: „Wissensbibliothek wächst"

**Was passiert:**

- Nach der Mission öffnet sich automatisch ein neuer Eintrag im Notizheft:
  > **DHCP & APIPA**
  > - DHCP vergibt IP, Gateway und DNS automatisch.
  > - Wenn DHCP fehlschlägt, bekommt der PC eine APIPA-Adresse (169.254.x.x).
  > - Befehle: `ipconfig /all` zeigt die Konfiguration. `ipconfig /renew` fordert einen neuen Lease an.
- Sam:
  > „Schön. Diese Seite bleibt hier. Wenn du das nächste Mal eine APIPA-Adresse siehst, weißt du sofort, was los ist."

**Emotion:**

- Zufriedenheit.
- Man hat etwas Greifbares erreicht.

**Konzept:**

- Gelerntes Wissen wird persönlich gespeichert.

**Flow:**

- Kurze Pause nach der Mission.
- Keine Entscheidung nötig.

**Kernvision:**

- Wissensbibliothek als langfristiger Lernort.
- Spieler sieht, dass er wächst.

---

## Minute 22–25: „Schwierigkeitsfrage"

**Was passiert:**

- Nach der Mission erscheint die Frage:
  > „Wie war das für dich?"
  - Zu leicht
  - Genau richtig
  - Ich habe geraten
  - Zu schwer
- Der Spieler tippt „Genau richtig" oder „Ich habe geraten".
- Intern wird der Schwierigkeitswert angepasst.

**Emotion:**

- Das Gefühl, gehört zu werden.
- Keine Strafe für „Ich habe geraten".

**Konzept:**

- Kein.
- Es geht um psychologische Sicherheit.

**Flow:**

- Kurz, unkompliziert.

**Kernvision:**

- Adaptive Schwierigkeit.
- Kein starrer Schwierigkeitsgrad.

---

## Minute 25–40: „Erste Nebenmission: Kabel wieder eingesteckt"

**Was passiert:**

- Der Spieler geht in den Flur (rechter Bereich).
- Er trifft Tom aus dem Vertrieb.
- Tom:
  > „Hey, hast du kurz Zeit? Lisa aus dem Einkauf hat auch kein Internet. Klingt genau wie Gretas Problem."
- Der Spieler kann annehmen oder ablehnen.
- Wenn er annimmt, startet eine kurze Nebenmission:
  - Symptom: Kein Internet.
  - Schritt 1: Verzeichnis öffnen → PC-EIN-05, IP 192.168.10.52.
  - Schritt 2: ipconfig /all → 169.254.x.x.
  - Schritt 3: ipconfig /renew → funktioniert nicht.
  - Schritt 4: Lisa sagt: „Ach, ich habe eben das Kabel ausgesteckt, weil ich mein Handy laden wollte."
  - Schritt 5: Kabel wieder einstecken → Problem gelöst.

**Emotion:**

- Freude, weil man das Gelernte anwenden kann.
- Leichte Wiederholung statt neuer Überforderung.

**Konzept:**

- Wiederholung von DHCP/APIPA.
- Zusätzlich: Physische Verbindung (Layer 1) zählt.

**Flow:**

- Kürzer als Hauptmission.
- Sicher, weil es nur bekanntes Wissen nutzt.
- Erster Erfolg durch Anwendung.

**Kernvision:**

- Nebenmissionen festigen gelerntes Wissen.
- Flur macht die Firma lebendig.

---

## Minute 40–55: „Zweite Hauptmission: DNS"

**Was passiert:**

- E-Mail von Tom Schmid:
  > „Wir können \\FS01\\Vertrieb nicht mehr öffnen. Der Server lässt sich aber anpingen."
- Sam:
  > „Interessant. Per IP geht es, per Name nicht. Das erzählt uns etwas über DNS. Was wissen wir schon?"
- Checkliste:
  1. Erreichbarkeit per IP testen
  2. DNS-Namensauflösung prüfen
  3. Fehlerquelle eingrenzen
  4. Korrekten DNS-Eintrag prüfen
  5. Zugriff testen

### Schritt 1: ping FS01

- Spieler öffnet Terminal, tippt `ping 192.168.10.10`.
- Antwort kommt.
- Sam:
  > „Server ist also erreichbar. Das Netzwerk ist okay. Das Problem liegt woanders."

### Schritt 2: nslookup

- Spieler tippt `nslookup fs01.nexus.local`.
- Ausgabe: „Nicht existierende Domäne".
- Sam:
  > „Aha. Der Name wird nicht aufgelöst. Das heißt: DNS hat keinen Eintrag für fs01.nexus.local."

### Schritt 3: Lösung

- Spieler wählt im Dialog:
  - „DNS-Eintrag prüfen" (richtig)
  - „Server neu starten" (falsch)
  - „Kabel tauschen" (falsch)
- Lösung: Der DNS-Eintrag wurde bei einem Update gelöscht. Spieler trägt ihn korrekt ein (oder wählt die richtige Option).
- Test: `nslookup fs01.nexus.local` zeigt jetzt 192.168.10.10.
- Mission abgeschlossen.

**Emotion:**

- Stolz, weil man ein echtes Netzwerkproblem gelöst hat.
- Vertrauen in den eigenen Denkprozess.

**Konzept:**

- DNS, Namensauflösung, nslookup, Unterscheidung IP vs. Name.

**Flow:**

- Klare Abfolge.
- Jeder Schritt baut auf dem vorherigen auf.
- Sam stellt die richtigen Fragen.

**Kernvision:**

- Zweites Konzept (DNS) wird eingeführt.
- Spieler lernt: „Per IP geht, per Name nicht → DNS-Problem."

---

## Minute 55–65: „Pause, Wissensbibliothek, Flur"

**Was passiert:**

- Neuer Notizhefteintrag: **DNS und Namensauflösung**.
- Spieler kann im Flur rumgehen.
- Ein Kollege erzählt eine kleine Geschichte:
  > „Wusstest du, dass wir letztes Jahr einen ganzen Tag lang ohne DNS gearbeitet haben? Jeder musste IPs auswendig lernen. Seitdem dokumentieren wir alle Servernamen doppelt."
- Ein anderer Kollege gibt einen Tipp:
  > „Wenn du nicht weißt, ob es DNS oder Netzwerk ist: ping die IP zuerst. Wenn die IP geht, ist es meist DNS."

**Emotion:**

- Erholung.
- Lebendige Firma.
- Wissen wird durch Geschichten verankert.

**Konzept:**

- Kein neues Konzept.
- Festigung durch Kontext.

**Flow:**

- Kein Druck.
- Spieler entscheidet selbst, ob er weitermacht oder erkundet.

**Kernvision:**

- Welt ist lebendig.
- Nebenmissionen und Dialoge erzählen Geschichten, die Wissen verankern.

---

## Minute 65–90: „Freies Üben im Terminal"

**Was passiert:**

- Der Spieler kann im Terminal üben.
- Es gibt einen Übungsmodus mit zwei einfachen Aufgaben:
  - „Zeige die IP-Konfiguration dieses PCs an."
  - „Prüfe, ob FS01 per Name und per IP erreichbar ist."
- Bei richtigen Befehlen gibt es sofort grünes Feedback.
- Bei falschen Befehlen sagt Sam:
  > „Das funktioniert so nicht. Was wolltest du damit herausfinden?"

**Emotion:**

- Sicherheit.
- Spieler darf Fehler machen, ohne Konsequenzen.

**Konzept:**

- Wiederholung von ipconfig, ping, nslookup.

**Flow:**

- Keine Mission, kein Druck.
- Sofortiges Feedback.

**Kernvision:**

- Sandbox erlaubt fehlerfreies Ausprobieren.
- Kompetenz wächst durch Übung, nicht durch Stress.

---

## Minute 90–110: „Dritte Hauptmission: Passwort / Active Directory"

**Was passiert:**

- E-Mail von Sabine aus dem Personal:
  > „Neuer Mitarbeiter Max Mustermann kann sich nicht einloggen. Ich habe sein Passwort bereits dreimal falsch eingegeben."
- Sam:
  > „Okay, das ist jetzt kein Netzwerkproblem mehr. Das ist ein Account-Problem. Was wissen wir?"
- Checkliste:
  1. Account-Status prüfen (gesperrt?)
  2. Passwort-Richtlinien prüfen
  3. Account entsperren oder Passwort zurücksetzen
  4. Login testen

### Schritt 1: Active Directory öffnen

- Spieler öffnet das AD-Tool (neues Werkzeug, freigeschaltet nach Mission 2).
- Sucht nach Max Mustermann.
- Sieht: „Account gesperrt".

### Schritt 2: Entscheidung

- Optionen:
  - „Account entsperren und neues Passwort setzen." (richtig)
  - „Neuen PC bestellen." (falsch)
  - „Firewall deaktivieren." (falsch)
- Sam:
  > „Richtig. Bei zu vielen falschen Login-Versuchen sperrt Active Directory den Account. Das ist ein Sicherheitsfeature."

### Schritt 3: Abschluss

- Spieler setzt neues Passwort.
- Max kann sich einloggen.
- Mission erfolgreich.

**Emotion:**

- Stolz, weil man jetzt ein drittes Konzept beherrscht.
- Sicherheit: „Ich bin nicht mehr ganz neu."

**Konzept:**

- Active Directory, Accounts, Passwort-Sperre, Sicherheitsfeature.

**Flow:**

- Neues Konzept, aber vertrautes Schema.
- Checkliste führt durch.
- Sam ist da.

**Kernvision:**

- Langsamer Ausbau der Kompetenzen.
- Keine Überraschungen, nur neue Konzepte.

---

## Minute 110–120: „Erste Kompetenzübersicht"

**Was passiert:**

- Der Spieler geht in den Serverraum.
- Dort sieht er keine XP-Zahlen, sondern Fortschrittsbalken:
  - Netzwerk: ████████░░ 80 %
  - Windows/AD: ██░░░░░░░░ 20 %
  - Linux: ░░░░░░░░░░ 0 %
  - Security: ░░░░░░░░░░ 0 %
  - Virtualisierung: ░░░░░░░░░░ 0 %
- Sam:
  > „Schau mal. Du hast in zwei Stunden Netzwerkgrundlagen gelernt und deinen ersten Windows-Account bearbeitet. Nicht schlecht für den ersten Tag."
- Ein Hinweis:
  > „Morgen lernen wir, was passiert, wenn mehrere Benutzer gleichzeitig auf den Fileserver zugreifen."

**Emotion:**

- Zufriedenheit.
- Motivation für den nächsten Tag.
- Keine Angst, sondern Vorfreude.

**Konzept:**

- Kompetenzen sichtbar machen.
- Langfristige Perspektive.

**Flow:**

- Positives Ende.
- Kein Cliffhanger, sondern ein „Bis morgen."

**Kernvision:**

- Kompetenz statt XP.
- Sichtbarer, motivierender Fortschritt.
- Spieler fühlt sich wie ein werdender Admin.

---

## Zusammenfassung der ersten 2 Stunden

| Zeit | Was passiert | Emotion | Konzept | Vision |
|---|---|---|---|---|
| 0–2 min | Arbeitsplatz erkunden | Neugier, Sicherheit | Werkzeuge kennenlernen | Arbeitsplatz als Herzstück |
| 2–5 min | Sam fragt: Was wissen wir? | Stolz | Strukturierte Diagnose | Mentor trainiert Denken |
| 5–8 min | Erstes Ticket | Spannung, Motivation | Wer, Was, Wo | Echte, klare Tickets |
| 8–12 min | Verzeichnis und IP | Interesse | IP, Gateway, DNS | Just-in-Time-Lernen |
| 12–20 min | Hauptmission DHCP/APIPA | Erleichterung, Stolz | DHCP, APIPA, ipconfig | Ein Konzept pro Mission |
| 20–22 min | Wissensbibliothek | Zufriedenheit | — | Persönliches Wissen |
| 22–25 min | Schwierigkeitsfrage | Gehört werden | — | Adaptivem Schwierigkeit |
| 25–40 min | Nebenmission | Freude, Anwendung | Wiederholung | Nebenmissionen festigen |
| 40–55 min | Hauptmission DNS | Stolz, Vertrauen | DNS, nslookup | Ein Konzept pro Mission |
| 55–65 min | Flur, Geschichten, Tipps | Erholung | — | Lebendige Firma |
| 65–90 min | Freies Üben im Terminal | Sicherheit | Wiederholung | Fehlerfreie Sandbox |
| 90–110 min | Hauptmission Active Directory | Stolz | AD, Accounts | Ein Konzept pro Mission |
| 110–120 min | Kompetenzübersicht | Zufriedenheit, Vorfreude | — | Kompetenz statt XP |

---

## Was bewusst weggelassen wird

- Kein Dashboard.
- Keine XP-Zahlen.
- Keine Reputation-Punkte.
- Keine Lehrgangsimport-Pipeline in den ersten zwei Stunden.
- Keine IHK-Vorbereitung, SpeedRun, Flashcards oder SubnetTrainer.
- Keine Boss-Missionen.
- Keine langen Tutorials.

## Was später hinzukommt

- Nach den ersten 2 Stunden: weiter Hauptmissionen zu Firewall, Backup, Linux, VPN, Virtualisierung.
- Nach 4–5 Stunden: Lehrgangsimport und tiefere Trainingsmodule.
- Nach 8–10 Stunden: komplexere kombinierte Incidents.

---

## Offene Fragen an dich

1. Soll die erste Nebenmission wirklich ein „Kabel ausgesteckt"-Szenario sein, oder lieber eine reine Wiederholung von DHCP?
2. Soll der Übungsmodus im Terminal direkt nach Mission 1 freigeschaltet werden oder erst nach Mission 2?
3. Soll es nach zwei Stunden eine klare „Spezialisierung" geben oder sollen wir die ersten 4–5 Hauptmissionen alle als Pfad sehen?
4. Soll Sam immer sichtbar sein oder nur erscheinen, wenn der Spieler ihn braucht?
