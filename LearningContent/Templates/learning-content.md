# Lerninhalt: IP-Konfiguration und APIPA

## Thema
Netzwerkdiagnose

## Lernziel
Der Spieler erkennt eine fehlende DHCP-Zuweisung anhand einer APIPA-Adresse und verwendet `ipconfig` zur Diagnose.

## Erklärung
Wenn ein Windows-Client keinen DHCP-Lease erhält, vergibt er sich selbst eine Adresse aus dem `169.254.0.0/16`-Netz (APIPA). Mit `ipconfig /all` lassen sich IPv4-Adresse, Subnetzmaske, Gateway und DNS-Server prüfen.

## Begriffe
- DHCP
- APIPA
- Lease
- Gateway
- Subnetzmaske

## Befehle
```
ipconfig /all
```

## Beispiel
```
C:\> ipconfig /all

Ethernet-Adapter Büro:
   IPv4-Adresse  . . . . . . . . . : 192.168.10.47
   Subnetzmaske  . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.10.1
   DNS-Server  . . . . . . . . . . : 192.168.10.10
```

## Typische Fehler
- `169.254.x.x` als normale Firmen-IP interpretieren
- `ipconfig` ohne `/all` verwenden und Gateway/DNS übersehen

## Hauptmission
ID: `first-day`  
Titel: Der erste Arbeitstag  
Kanal: E-Mail  
Stichwort: Ein neuer Mitarbeiter meldet, dass er das Netzwerk nicht erreicht. Seine IP-Adresse beginnt mit 169.254.

## Notizhefteinträge
- note-ipconfig

## Schwierigkeitsgrad
1
