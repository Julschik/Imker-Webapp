# Änderungsprotokoll

## 2025-01-27 14:30 – Initial MVP Setup

**Komponenten:** Gesamte App-Struktur
**Änderung:** Erstelle Next.js 14 App mit modularer Architektur
**Grund:** Neustart basierend auf Dokumentations-Vorgaben
**Umsetzung:** 
- Next.js App Router + TypeScript
- Dexie für IndexedDB (Offline-Speicher)
- shadcn/ui für konsistente UI-Komponenten
- html5-qrcode für QR-Scanner
- Modulare Struktur unter /app/mod/

**Features implementiert:**
- QR-Scanner mit Kamera und manueller Eingabe
- Stockkarten mit Ampel-Status-System
- Durchsicht-Formular mit Offline-Speicherung
- Dashboard mit Modul-Registry
- Mock-Daten für 5 Völker an 2 Standorten

**Debug/Logs:** Logging-System in /src/utils/log.ts implementiert