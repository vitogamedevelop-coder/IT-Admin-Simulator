# Active Directory Foundation — Source of Truth Audit

## Quellenhierarchie

1. Microsoft Learn / Microsoft Technical Documentation (AD DS, DNS, Windows Time, Kerberos, LDAP)
2. Microsoft Windows Server / AD DS Produktedokumentation
3. RFCs / IETF: RFC 4511 (LDAP), RFC 4120 (Kerberos), RFC 5905 (NTP)
4. Offizielle Herstellerdokumentation, wo zutreffend

## Kursvereinfachungen / kritische Punkte

| Aussage | Kurslage | Academy-Fassung | Status | Anmerkung |
| --- | --- | --- | --- | --- |
| Verzeichnisdienst = zentrale Verwaltung von Objekten + Attributen | Deckungsgleich | Identisch | verified | Microsoft AD DS Docs |
| Objekt vs. Attribut | Deckungsgleich | Objekt = Element; Attribut = Eigenschaft | verified | Directory-Service-Konzept |
| Lokale Verwaltung: 4 × 3 = 12 Konten | Beispiel aus Kurs | Identisch als Beispiel | course_specific | Didaktisches Zahlenbeispiel |
| Active Directory = zentrale Datenspeicherung aller Unternehmensdaten | Vereinfacht / missverständlich | AD verwaltet Identitäten/Verzeichnis; Dateien liegen auf Dateiservern | verified | Kursaussage präzisiert |
| AD DS vs. Active Directory umgangssprachlich | Deckungsgleich | Technisch: AD DS; umgangssprachlich: AD | verified | Microsoft Docs |
| DNS für DC-/Dienstefund | Deckungsgleich | DNS hilft Clients, DCs/Dienste zu finden | verified | Microsoft Docs |
| Kerberos = Active Directory | Falsch | Kerberos = Authentifizierungsprotokoll; AD DS nutzt es | verified | Kerberos-Doku |
| SNTP / 5-Minuten-Abweichung stoppt Kommunikation | Vereinfacht | Zeitkonsistenz ist für Kerberos wichtig; exaktes Limit nicht pauschal | needs_confirmation | Course-specific Vereinfachung; exaktes Windows-Verhalten von der konkreten Kerberos-Policy abhängig |
| LDAP = Active Directory | Falsch | LDAP = Protokoll; AD DS unterstützt LDAP | verified | RFC 4511 |
| SMB vs. NTFS | Deckungsgleich | SMB = Netzwerkprotokoll; NTFS = lokales Dateisystem | verified | Microsoft Docs |
| Replikation „alle 15 Sekunden“ | Pauschal | Replikationstopologie abhängig von Sites/Verbindungen; keine feste globale Sekundenzahl | needs_confirmation | Course-specific Pauschalisierung |
| Authentifizierung vs. Autorisierung | Deckungsgleich | AuthN = Wer bist du? AuthZ = Was darfst du? | verified | Identity-Fundamentals |
| AD-Fähigkeiten (Skalierbarkeit, Erweiterbarkeit, Richtlinien …) | Deckungsgleich | Als Überblick; tiefe Architektur folgt später | course_specific | Übersicht für Anfänger |

## Nicht implementiert / Roadmap

- Gruppenrichtlinien
- Subdomänen
- Detaillierte Berechtigungsverwaltung (Share + NTFS)
- Patchmanagement
- Tiefe Replikationsarchitektur (Site / Change Notification)
- GPO-/SMB-NTFS-Detailfragen

Diese Bereiche sind in der Academy nur als spätere Themen markiert und werden im Mitarbeitergespräch nicht abgefragt.
