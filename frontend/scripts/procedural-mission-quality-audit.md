# Procedural Mission Quality Audit

## Ausgangslage

- Gemeldetes Problem: Mission 002 / prozedurale Cisco-Mission wurde als nicht erfüllt angezeigt, obwohl der finale Gerätezustand korrekt war.
- Ziel: systemische Ursachen finden und verhindern, nicht einzelne Mission hart patchen.

## Kategorien von Requirements

| Kategorie | Bedeutung | Wird geprüft durch | Beispiel |
|-----------|-----------|-------------------|----------|
| **state** | Zielzustand muss am Gerät vorhanden sein. | `device.runningConfig` | Access-Port im richtigen VLAN |
| **action** | Ein konkreter Befehl/Aktion muss ausgeführt werden. | Befehlshistorie oder Aktionsspur | (derzeit keine Cisco-Procedural-Mission) |
| **verification** | Ein Show-/Prüfbefehl muss ausgeführt werden. | `showCommandsUsed` | Mission 002: Konfiguration geprüft |
| **persistence** | Konfiguration muss dauerhaft gespeichert werden. | `device.startupConfig` | Mission 002: gespeichert |

Regel: State-basierte Requirements dürfen nie verlangen, dass der Spieler einen bestimmten Befehl eingegeben hat. Nur der Endzustand zählt.

## Root Cause Mission 002: Falsche Anzeige des Switchport-Modus

- `show interfaces <if> switchport` zeigte für unkonfigurierte Ports den Modus `access` an, obwohl intern `switchportMode: null` war.
- Das `|| 'access'`-Fallback in `renderInterfaceSwitchport` war irreführend.
- Wenn ein Spieler daraus ableitete, der Access-Modus sei bereits gesetzt, und nur das VLAN setzte, konnte die interne Prüfung dennoch bestehen (Handler setzt Mode automatisch), ABER bei geladenen/seriellen Zuständen mit `switchportMode: null` und gesetztem `accessVlan` schlug `accessPortsOk` fehl.
- Zusätzlich: `accessPortsOk` war streng auf `switchportMode === 'access'`. Für Ports, bei denen nur `accessVlan` vorhanden ist (z. B. aus vorkonfiguriertem/alten Save), wurde der Zustand nicht als Access-Port anerkannt.

## Umgesetzte Fixes

1. `ciscoCliEngine.js` `renderInterfaceSwitchport`:
   - Unkonfigurierte Ports werden jetzt als `dynamic auto` / `not set` angezeigt, nicht mehr als `access`.
   - Verhindert, dass Spieler fälschlich glauben, `switchport mode access` sei bereits gesetzt.

2. `missionV2.js` `effectiveSwitchportMode`:
   - Falls `switchportMode` fehlt, aber `accessVlan` gesetzt ist, wird der Port effektiv als Access-Port behandelt.
   - Robust gegen vorkonfigurierte/alte Zustände, ohne die fachliche Bedeutung von `switchport mode access` aufzuweichen.

3. Requirement-Typen in Mission 002:
   - Jedes `MISSION_002_REQUIREMENTS`-Element hat jetzt `type: 'state' | 'verification' | 'persistence'`.
   - `getMission002Progress` liefert Checks mit Typ mit.

## No-Hidden-Requirement-Rule

Jede Information, die der Evaluator voraussetzt, muss enthalten sein in:

1. `briefing` / `title` der Mission, ODER
2. dem simulierten initialen Gerätezustand (z. B. vorhandene Interfaces, Beschreibungen, Verkabelung), ODER
3. einem ausdrücklichen Action-/Verification-/Persistence-Requirement.

 technische Umsetzung:
- Alle Template-Parameter, die Interfaces/Ports/IDs enthalten, werden im Solvability-Audit gegen Briefing/Title geprüft.
- Zufällig generierte Parameter (VLAN-IDs, IPs, Gateways, Usernamen) werden im Briefing ausgeschrieben.
- Kein Template wertet `device.startupConfig` als Zielzustand aus, außer für Persistence-Requirements.

## Procedural Templates: Requirement-Typen

| Template | Checks | Typen |
|----------|--------|-------|
| cisco-basic-config-hardening | selected tasks | state |
| cisco-basic-config-hardening | save_config | persistence |
| cisco-vlan-access-port | vlan_created, ports_configured | state |
| cisco-vlan-access-range | vlan_created, ports_configured | state |
| cisco-vlan-move | port_moved | state |
| cisco-trunk-uplink | uplink_trunk | state |
| cisco-trunk-allowed-vlan | allowed_vlans | state |
| cisco-router-on-a-stick | vlan_exists, vlan_access, uplink_trunk, router_physical_up, subinterface_* | state |
| cisco-router-fault | (via evaluateRouterOnAStick) | state |
| cisco-ssh-management-access | mgmt_vlan, svi_address, default_gateway | state |
| cisco-ssh-enable | domain_name, rsa_key, ssh_version | state |
| cisco-ssh-vty-access | login_local / transport_ssh / new_user | state |
| cisco-ssh-diagnose | mgmt_vlan, svi_address, default_gateway, domain_name, rsa_key, ssh_version, vty_*, user_exists | state |

Aktuell gibt es in den Procedural-Templates keine Action-basierten Checks. Verification- und Persistence-Checks sind bewusst nur in Hand-Missionen (Mission 002) enthalten.

## Offene Punkte / Empfohlene Ergänzungen

- Wenn zukünftig Action-Requirements eingeführt werden, sollte `missionTemplateEngine.js` ein `REQUIREMENT_TYPE`-Enum und einen `requireAction(device, actionKey)`-Hook bekommen.
- Für Verify-Requirements in Procedural-Missionen sollte ein allgemeiner `showCommandsUsed`-Check im Generator erfolgen.
- Save-Requirements sollten pro Template optional konfigurierbar sein (`requiresSave: boolean`).
