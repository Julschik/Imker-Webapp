# Initial Prompt für Bolt.new

```
TITLE: Imker-Webapp MVP — Offline-first, QR-Scanner, modulare Basis

GOAL
Erstelle eine stabile, erweiterbare Next.js 14 App für Imker-Betriebsführung. Fokus: QR→Stockkarte→Aktion ≤2 Klicks, offline-first mit IndexedDB, modulare Architektur für spätere Erweiterungen.

TECH STACK
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Dexie (IndexedDB) für Offline-Speicher
- html5-qrcode für QR-Scanner
- Zustand für State Management

CORE FEATURES (MVP)
1. QR-Scanner mit Kamera (bevorzugt) + manuelle Eingabe
2. Stockkarten mit Ampel-Status (Brut/Futter/Varroa/Platz)
3. Schnelle Durchsichten (Checkboxen/Slider, 30-60 Sek)
4. Offline-first: Alle Daten in IndexedDB, später Sync
5. Modulare Struktur: /app/mod/<name> für Erweiterungen

DATENMODELL (vereinfacht)
```typescript
// Kern-Entitäten
Volk { id, stocknr, standortId, beute, status{brut,futter,varroa,platz}, qrKey }
Durchsicht { id, volkId, datum, checks{königin,stifte,larven,verdeckelte}, volksstaerke, notizen }
Standort { id, name, adresse, geo?, qrKey? }

// Status-Ampeln
type Ampel = 'grün' | 'gelb' | 'rot'
```

ORDNERSTRUKTUR
```
/src
  /app
    /mod                 # Module (erweiterbar)
      /scan             # QR-Scanner
      /volk/[id]        # Stockkarte
      /durchsicht       # Durchsichten
    page.tsx            # Dashboard
    layout.tsx
  /components           # UI-Komponenten
  /lib
    /db.ts             # Dexie Schema
    /registry.ts       # Modul-Registry
  /utils
    /log.ts            # Logging
```

WORKFLOWS
1. **Scan-Flow**: QR-Code → Deep-Link zu /mod/volk/[id] → Stockkarte öffnet
2. **Durchsicht**: Von Stockkarte → Schnellformular → Offline speichern
3. **Navigation**: Dashboard zeigt Module aus Registry

UX PRINCIPLES
- Mobile-first Design
- Große Touch-Targets
- Ampel-Farben für Status (grün/gelb/rot)
- Offline-Banner wenn keine Verbindung
- Fehlermeldungen kurz und handlungsleitend

TECHNICAL REQUIREMENTS
- Alle Browser-APIs nur client-side ('use client')
- IndexedDB als primärer Speicher
- Service Worker für PWA (später)
- Responsive Design (Mobile zuerst)
- TypeScript strict mode

ACCEPTANCE CRITERIA
- QR-Scanner öffnet Kamera und erkennt Codes
- Scan führt zu Stockkarte mit Mock-Daten
- Durchsicht-Formular speichert offline in IndexedDB
- Dashboard zeigt verfügbare Module
- App funktioniert komplett offline
- Build erfolgreich ohne Fehler

MOCK DATA
Erstelle 3-5 Beispiel-Völker mit verschiedenen Ampel-Status für Demo.

CONSTRAINTS
- Keine externen APIs oder Backends
- Keine komplexen Animationen
- Fokus auf Funktionalität über Optik
- Modulare Erweiterbarkeit wichtiger als Feature-Vollständigkeit

START SIMPLE
Beginne mit funktionierendem QR-Scanner und Stockkarten-Anzeige. Weitere Features kommen als separate Module dazu.
```