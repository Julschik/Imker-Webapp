# Projektbeschreibung

## Produktvision

Eine **Offline-first Webapp** für die rechtssichere Betriebsführung von Hobby- und Berufsimkern. Der Fokus liegt auf **minimalen Klicks am Bienenstand** und **verlässlichen Daten** für Compliance-Anforderungen.

## Zielgruppe

**Semi- bis professionelle Imker** mit folgenden Eigenschaften:
- Nutzenorientiert und zeitgetrieben
- Technologie-kritisch, aber offen für bewährte Tools
- Compliance-bewusst (TAMG, TSK-Meldungen)
- Arbeiten oft offline am Bienenstand

## Kernnutzen

**Zeitersparnis durch Struktur**:
- QR-Code scannen → Stockkarte → Aktion in ≤2 Klicks
- Offline-Erfassung mit späterer Synchronisation
- Automatische Berechnung von Fristen und Sperren

**Rechtssicherheit**:
- TAMG-Bestandsbuch mit Wartezeit-Sperren
- TSK-Meldungen (Stichtag 01.01., Frist 14.01.)
- Gesundheitszeugnisse mit Ablaufwarnungen

**Transparenz**:
- Nachvollziehbare Datenhistorie
- Klare Exportfunktionen (CSV, PDF)
- Ampel-System für Volkszustände

## Kernfunktionen (MVP)

### 1. Stockkarten-Management
- **QR-first Workflow**: Scannen führt direkt zur Stockkarte
- **Ampel-Status**: Brut/Futter/Varroa/Platz auf einen Blick
- **Schnelle Durchsichten**: Checkboxen/Slider statt Freitext

### 2. TAMG-Bestandsbuch
- **Behandlungserfassung**: Präparat, Dosis, Wartezeit
- **Automatische Sperren**: Honig-Ernte blockiert bis Wartezeit-Ende
- **Katalog-basiert**: Deutsche Zulassungsliste als Datengrundlage

### 3. Offline-Betrieb
- **Vollständig offline nutzbar** für Kernvorgänge
- **Transparente Synchronisation** bei Internetverbindung
- **Konfliktlösung** mit klaren Merge-Dialogen

### 4. Kalender & Erinnerungen
- **ICS-Feeds** für externe Kalender
- **Fristen-Management**: TSK-Stichtage, Zeugnis-Abläufe
- **Folgeaufgaben** aus Durchsichten

## Erweiterte Funktionen (Phase 2+)

### Ernte & Vermarktung
- **Lose-Bildung** über Zeiträume und Standorte
- **Etikettendaten** nach HonigV
- **Gläser-Mapping** für Nachverfolgung

### Betriebsanalyse
- **Jahresberichte**: Ertrag, Behandlungen, Verluste
- **Standortvergleiche**: Performance-Kennzahlen
- **Varroa-Monitoring**: Kurven und Wirksamkeit

### Kollaboration
- **Kommentare** an Durchsichten
- **Gast-Links** für read-only Zugriff
- **Öffentliche Steckbriefe** (opt-in)

## Fachbegriffe & Workflows

### Durchsicht-Workflow
1. **QR scannen** am Bienenstock
2. **Stockkarte öffnet** sich automatisch
3. **Schnellformular** mit vordefinierten Optionen
4. **Audio-Memo** für Details (optional)
5. **Folgeaufgaben** werden vorgeschlagen

### TAMG-Workflow
1. **Behandlung erfassen** mit Pflichtfeldern
2. **Wartezeit berechnet** sich automatisch
3. **Sperre aktiviert** sich für Honig-Ernte
4. **Export** als signaturfähiges PDF

### Wanderung-Workflow
1. **Multi-Scan** mehrerer Völker
2. **Zielstandort** auswählen
3. **Genehmigungen** verknüpfen
4. **Sperrbezirk-Check** (falls konfiguriert)

## Compliance-Anforderungen (Deutschland/Baden-Württemberg)

- **TAMG-Bestandsbuch**: Vollständige Dokumentation aller Behandlungen
- **TSK-Meldungen**: Stichtag 01.01., Änderungen >20% bei ≥10 Völkern
- **Gesundheitszeugnisse**: Upload und Ablaufüberwachung
- **Wartezeiten**: Automatische Sperrung von Ernte/Vermarktung

## Erfolgskriterien

- **Zeitersparnis**: Durchsicht in 30-60 Sekunden erfassbar
- **Compliance**: 100% korrekte Exporte für Behörden
- **Offline-Tauglichkeit**: Alle Kernfunktionen ohne Internet nutzbar
- **Benutzerakzeptanz**: Intuitive Bedienung auch für weniger technikaffine Imker

Die App soll **Werkzeug, nicht Spielzeug** sein - fokussiert auf praktischen Nutzen im Imkeralltag.