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