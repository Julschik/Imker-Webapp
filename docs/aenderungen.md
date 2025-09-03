# Änderungsprotokoll

Dieses Dokument protokolliert alle Änderungen am Imker-Webapp Projekt zur Nachvollziehbarkeit und Token-Effizienz.

### 2025-01-27 15:30 – Projekt-Skeleton und M0 Setup

**Datei/Komponente:** Gesamtes Projekt-Setup
**Änderung:** 
- Next.js App Router Projekt initialisiert mit TypeScript, Tailwind, ESLint
- Abhängigkeiten installiert: zustand, react-hook-form, zod, dexie, radix-ui, lucide-react
- Dev-Dependencies: vitest, testing-library, jsdom
- Grundlegende Projektstruktur erstellt: /src/{components,routes,services,utils,config}
- Konfiguration in src/config/env.ts mit allen Feature-Flags
- Logging-Utility in src/utils/log.ts mit konsistenten Präfixen
- Dexie-Datenbank Setup mit Kern-Entitäten (User, Workspace, Standort, Volk, Durchsicht, Behandlung)
- Auth-Service mit Mock-Implementation für Development
- Session-Management mit Zustand und Persistierung
- Login-Page mit E-Mail/Passwort + TOTP-Unterstützung
- Dashboard-Placeholder mit Logout-Funktionalität
- PWA Manifest für mobile Installation
- Vitest-Konfiguration und Basis-Tests für Auth und Dexie

**Grund:** 
Umsetzung von M0 aus der Roadmap: "Projekt-Skeleton mit Routen und State anlegen, App startet, leere Screens vorhanden, Dexie DB initialisiert"

**Umsetzung:** 
- Next.js App Router für moderne React-Architektur
- Zustand für Client-State mit Persistierung
- Dexie für IndexedDB-Offline-Speicherung
- Mock-Auth für Development, vorbereitet für Keycloak/Ory/Supabase
- Konsistente Fehlerbehandlung und Logging
- Mobile-first Design mit Tailwind

**Debug/Logs:** 
- Logging-Utility mit Scopes: [AuthService], [Session], [Dexie], [App]
- Try/catch an allen IO-Grenzen (Auth-API, Dexie-Operations)
- Einheitlicher Error-Typ vorbereitet
- Console-Logs für alle wichtigen Aktionen (Login, Logout, DB-Init, Routing)
- Tests für Happy Path und Fehlerpfade in Auth und Dexie

### 2025-01-27 16:15 – Task 1: package.json Skripte absichern

**Datei/Komponente:** package.json
**Änderung:** 
- Script "start" erweitert um expliziten Port `-p 3000`
- Script "test" geändert von `vitest` auf `vitest run` für CI-Kompatibilität

**Grund:** 
Absicherung der npm-Skripte gemäß Hotfix Batch 1. Expliziter Port verhindert Konflikte, `vitest run` ist deterministischer für automatisierte Tests.

**Umsetzung:** 
Minimale Änderung nur der betroffenen Script-Zeilen, bestehende Abhängigkeiten unverändert

**Debug/Logs:** 
Keine neuen Logs in diesem Schritt, Vorbereitung für nachfolgende Tasks

### 2025-01-27 16:45 – Task 2.1: SSR-sichere Dexie-Nutzung mit expliziten Logs

**Datei/Komponente:** src/utils/dexie.ts
**Änderung:** 
- Vollständige Überarbeitung für SSR-Sicherheit
- `isBrowser` Check mit `typeof window !== 'undefined'`
- Lazy `require('dexie')` nur im Browser-Kontext
- `createBroadcastChannel` Hilfsfunktion mit SSR-Fallback
- Explizite Warn-Logs bei Serveraufrufen für bessere Debugging-Erfahrung
- Try/catch um BroadcastChannel-Erstellung mit Fehlerprotokollierung

**Grund:** 
Behebung des SSR-Crashes durch Browser-APIs (BroadcastChannel, Dexie) während Server-Side Rendering. Explizite Logs verbessern Debugging bei unerwarteten Serveraufrufen.

**Umsetzung:** 
- Synchroner require() statt import für Dexie (verhindert SSR-Evaluation)
- Null-Rückgabe auf Server mit aussagekräftigen Warn-Logs
- Fehlerbehandlung für BroadcastChannel mit Logging-Utility
- Bestehende initDatabase() Funktion beibehalten und SSR-sicher gemacht

**Debug/Logs:** 
- [Dexie] Warn-Logs bei Serveraufrufen: "getDB() auf Server aufgerufen – return null (SSR)"
- [Dexie] Warn-Logs bei BroadcastChannel-Serveraufrufen
- [Dexie] Error-Logs bei BroadcastChannel-Fehlern mit Fehlermeldung
- [Dexie] Info-Logs bei erfolgreicher DB-Initialisierung

## Task 1 — package.json Skripte und Basics (✓)
- **Datum:** 2025-01-27
- **Änderungen:** 
  - `start` Script auf `next start -p 3000` angepasst
  - `test` Script auf `vitest run` für CI-Kompatibilität geändert
- **Grund:** Explizite Port-Angabe und bessere CI-Integration
- **Status:** Abgeschlossen

## Task 1.1 — next.config.js Fehler beheben (✓)
- **Datum:** 2025-01-27
- **Änderungen:**
  - Entfernt: `experimental.appDir` (deprecated in Next.js 14)
  - Hinzugefügt: `optimizeFonts: false` (verhindert Google Fonts Netzwerkfehler)
- **Grund:** Build-Fehler durch veraltete Config und Netzwerkprobleme beim Font-Download
- **Status:** Abgeschlossen