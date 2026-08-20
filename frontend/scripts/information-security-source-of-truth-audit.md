# Phase 8 – Informationssicherheit: Source-of-Truth Audit

## Ausgangslage

- Repository-Version vor Phase 8: **1.31.4**
- Ziel: Academy-Hauptbereich „Informationssicherheit" fachlich ausgebaut, eng am realen Bundeswehr-Lehrgang orientiert.
- Quellen-Hierarchie:
  1. allgemein fachlich verifizierbar
  2. Bundeswehr-öffentlich verifizierbar
  3. lehrgangsspezifisch / COURSE_SPECIFIC

## Kennzeichnungen in den Knowledge Items

Jedes Item hat `sourceType` und `verificationStatus`:

- `verified` – allgemein fachlich als korrekt angesehen.
- `course_specific` – aus Unterrichts-/Lehrgangsmaterial übernommen, öffentlich nicht eindeutig verifizierbar.
- `needs_confirmation` – unvollständige oder nicht öffentlich verifizierbare Angaben; darf nicht als Fakt geprüft werden.

## Bestätigte Inhalte (verified)

| Thema | Item-IDs | Begründung |
|-------|----------|------------|
| CIA-Grundwerte | `security.cia.*` | Vertraulichkeit, Integrität, Verfügbarkeit sind etablierte Schutzziele. |
| PIMO/OPTI Struktur | `security.pimo.*`, `security.opti.*` | Merkworte aus den Nutzerunterlagen; inhaltlich konsistent. |
| ISMS/PDCA | `security.isms.*`, `security.pdca.*` | PDCA ist etabliertes Verbesserungsmodell; ISMS-Definition fachlich allgemein. |
| Art. 9 DSGVO | `security.art9.*` | EU-Primärquelle, Kategorien korrekt wiedergegeben. |
| Malware-Taxonomie | `security.malware.*` | Virus/Wurm/Trojaner/Ransomware/Spyware/Keylogger/Rootkit/Backdoor/Payload – fachlich etabliert. |
| Angriffsmethoden | `security.attacks.*` | DoS/DDoS, Identitätsdiebstahl, Social Engineering, Phishing. |
| Firewall-Grundlagen | `security.firewall.*` | Paketfilter, Stateful Inspection, ALG – fachlich etabliert. |
| IDS/IPS | `security.idsips.*` | Erkennen vs. Erkennen+Blocken – fachlich etabliert. |
| Allowlist/Denylist | `security.allowlist.*` | Moderne Terminologie, fachlich etabliert. |
| Defense in Depth | `security.prevention.*` | Etabliertes Sicherheitsprinzip. |

## COURSE_SPECIFIC / zur Prüfung hinterlegte Inhalte

| Thema | Item-IDs | Hinweis |
|-------|----------|---------|
| Schutzbereiche personenbezogener Daten | `security.schutzbereiche.*` | Bundeswehr-interne Einteilung; Beispiele aus Unterrichtsnotizen. |
| Informationssicherheitsverstoß | `security.breach.*` | Definition aus Lehrgangsgegenstand; muss gegen A-960/1 geprüft werden. |
| Sicherheitsvorkommnis | `security.incident.*` | Definition aus Lehrgangsgegenstand; muss gegen A-960/1 geprüft werden. |
| DMZ-Topologien | `security.dmz.*` | Allgemeine DMZ-Definition; einstufig/mehrstufig/kombiniert nicht aus Unterrichtsnotizen ergänzt. |

## Offene Punkte (needs_confirmation) – NICHT als Frage verwendet

| Notizlücke | Konsequenz |
|------------|-----------|
| Systemfarbe **Rot** in den Nutzernotizen nicht ausgefüllt | Keine Bedeutung erfunden; nicht als Knowledge Item aufgenommen. |
| Systemfarbe **Schwarz** in den Nutzernotizen nicht ausgefüllt | Keine Bedeutung erfunden; nicht als Knowledge Item aufgenommen. |
| Systemfarbe **Grün = Militär, Weiß = BWI** | Nicht öffentlich belastbar bestätigt; nicht als prüfbares Knowledge Item aufgenommen. |
| Genaues Verhältnis „Schutzbereich 3" zu Art. 9 DSGVO | In der Academy-Lektion getrennt dargestellt; keine Gleichsetzung in Fragen. |
| Exakte Definition „gefordertes Maß" aus A-960/1 | Wording allgemein gehalten („angemessen zum Schutzbedarf"). |
| Exakte DMZ-Topologie (einstufig/mehrstufig/kombiniert) | Nur allgemeine DMZ-Definition; konkrete Topologien müssen gegen Lehrgang nachgereicht werden. |
| Informationskategorien „öffentlich / offen / Verschlusssachen" | Hinterlegt, aber als `needs_confirmation`, weil öffentlich/öffentlich-Synonymie unsicher. |

## Verwechslungs-Risiken, die bewusst vermieden wurden

1. **Malware ≠ Oberbegriff neben Virus** – Malware ist der Oberbegriff.
2. **Payload ≠ Malware-Typ** – Payload ist die eigentliche Schadfunktion.
3. **Datenschutz ≠ Informationssicherheit** – Getrennt modelliert.
4. **Schutzbereich 3 ≠ Art. 9 DSGVO** – Getrennt modelliert.
5. **PIMO vs OPTI** – Explizites Compare-Item `security.pimoVsOpti`.
6. **IDS vs IPS** – Explizites Compare-Item.
7. **Allowlist vs Denylist** – Allowlist restriktiver.

## Empfohlene Nacharbeit nach Prüfung der Quellen

- A-960/1 öffentlich zugängliche Abschnitte heranziehen.
- Offene Notizen „Rot / Schwarz / Grün / Weiß" vom Lehrgang beantworten lassen.
- DMZ-Topologie-Vorlagen vom Lehrgang ergänzen.
- „Gefordertes Maß" exakt zitieren und Item `security.requiredLevel.definition` auf `verified` heben.
- Schutzbereichs-Definitionen und Informationskategorien verifizieren.
